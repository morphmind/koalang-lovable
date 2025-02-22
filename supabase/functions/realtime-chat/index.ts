import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface UserContext {
  knownWords: string[];
  currentTopic: string;
  lastMessageTimestamp: number;
}

const wsConnections = new Map<string, { socket: WebSocket; context: UserContext }>();

// Yapay zeka yanıtı oluştur
async function generateAIResponse(message: string, context: UserContext): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Sen Türkçe öğretmenisin. Kullanıcının bildiği kelimeler: ${context.knownWords.join(', ')}. 
            Sadece bu kelimeleri kullanarak doğal bir sohbet yapmalısın. 
            Cevapların kısa ve anlaşılır olmalı. Bilinmeyen kelime kullanma.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI yanıtı alınamadı:', error);
    return 'Üzgünüm, şu anda yanıt veremiyorum.';
  }
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin') || '*';

  try {
    // OPTIONS isteğini işle
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    // WebSocket yükseltme isteğini kontrol et
    const upgrade = req.headers.get('upgrade');
    if (!upgrade || upgrade.toLowerCase() !== 'websocket') {
      return new Response('WebSocket bağlantısı gerekli', { status: 426 });
    }

    // WebSocket bağlantısını yükselt
    const { socket, response } = Deno.upgradeWebSocket(req);
    const clientId = crypto.randomUUID();
    wsConnections.set(clientId, {
      socket,
      context: {
        knownWords: [],
        currentTopic: '',
        lastMessageTimestamp: Date.now()
      }
    });

    // Bağlantı açıldığında
    socket.onopen = () => {
      console.log(`Bağlantı açıldı: ${clientId}`);
      try {
        socket.send(JSON.stringify({
          type: 'connection.established',
          clientId,
          message: 'Bağlantı başarıyla kuruldu',
        }));
      } catch (err) {
        console.error(`Bağlantı mesajı gönderme hatası: ${clientId}`, err);
      }
    };

    // Mesaj alındığında
    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`Mesaj alındı (${clientId}):`, data);

        if (data.type === 'init.user.context') {
          // Kullanıcı bağlamını güncelle
          const context = wsConnections.get(clientId);
          if (context) {
            context.context = {
              knownWords: data.knownWords || [],
              currentTopic: data.currentTopic || '',
              lastMessageTimestamp: Date.now()
            };
          }
          return;
        }

        if (data.type === 'conversation.item.create' && data.item?.content?.[0]?.text) {
          const userMessage = data.item.content[0].text;
          console.log(`Kullanıcı mesajı (${clientId}):`, userMessage);

          const context = wsConnections.get(clientId);
          if (!context) return;

          // AI yanıtı al
          const aiResponse = await generateAIResponse(userMessage, context.context);
          
          // Yanıtı gönder
          socket.send(JSON.stringify({
            type: 'response.audio_transcript.delta',
            delta: aiResponse,
          }));

          // Text-to-Speech için yanıtı gönder
          socket.send(JSON.stringify({
            type: 'response.audio.generate',
            text: aiResponse
          }));
        }
      } catch (err) {
        console.error(`Mesaj işleme hatası (${clientId}):`, err);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Mesaj işlenemedi',
        }));
      }
    };

    // Hata durumunda
    socket.onerror = (event) => {
      console.error(`WebSocket hatası (${clientId}):`, event);
    };

    // Bağlantı kapandığında
    socket.onclose = () => {
      console.log(`Bağlantı kapandı: ${clientId}`);
      wsConnections.delete(clientId);
    };

    // WebSocket yanıtını döndür
    return response;

  } catch (err) {
    console.error('Sunucu hatası:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);

