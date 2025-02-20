
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log("WebSocket bağlantısı başlatılıyor...");
    
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // OpenAI WebSocket bağlantısı
    const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01");
    let sessionStarted = false;

    openAISocket.onopen = () => {
      console.log("OpenAI'ya bağlandı");
      
      // Yetkilendirme gönder
      openAISocket.send(JSON.stringify({
        type: "authorization",
        authorization: `Bearer ${OPENAI_API_KEY}`
      }));
    };

    // OpenAI mesaj işleme
    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("OpenAI'dan gelen mesaj:", data);

        // Session oluşturulduktan sonra yapılandırma gönder
        if (data.type === "session.created" && !sessionStarted) {
          sessionStarted = true;
          console.log("Session oluşturuldu, yapılandırma gönderiliyor...");
          
          const sessionConfig = {
            event_id: "event_123",
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: `Sen bir İngilizce öğretmenisin. Her cevabında öğrencinin bildiği kelimelerden en az birini kullanmaya çalış.
                           Öğrenci yeni öğrendiği kelimeleri pratik etmek istiyor. Onunla günlük konular hakkında sohbet et.
                           Cevaplarını kısa ve anlaşılır tut. Öğrencinin hata yapması durumunda nazikçe düzelt.`,
              voice: "alloy",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1",
                word_timestamps: true
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              }
            }
          };

          openAISocket.send(JSON.stringify(sessionConfig));
        }

        // Yanıtı istemciye ilet
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(event.data);
        }
      } catch (error) {
        console.error("Mesaj işleme hatası:", error);
      }
    };

    // İstemciden gelen mesajları işle
    clientSocket.onmessage = (event) => {
      console.log("İstemciden gelen mesaj:", event.data);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    // Bağlantı hata yönetimi
    clientSocket.onerror = (error) => {
      console.error("İstemci WebSocket hatası:", error);
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket hatası:", error);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
          type: 'error',
          message: 'OpenAI bağlantı hatası'
        }));
      }
    };

    // Bağlantı kapatma yönetimi
    clientSocket.onclose = () => {
      console.log("İstemci bağlantısı kapandı");
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    openAISocket.onclose = () => {
      console.log("OpenAI bağlantısı kapandı");
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };

    // CORS başlıklarını ekleyerek yanıt döndür
    return new Response(null, {
      ...response,
      headers: { ...response.headers, ...corsHeaders }
    });

  } catch (error) {
    console.error("Edge Function hatası:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
