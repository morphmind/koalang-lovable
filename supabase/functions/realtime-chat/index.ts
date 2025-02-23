
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS için OPTIONS request'i
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // WebSocket upgrade header'ı kontrolü
  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('WebSocket bağlantısı gerekli', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // WebSocket bağlantısını kur
  const { socket, response } = Deno.upgradeWebSocket(req);

  // OpenAI WebSocket bağlantısı
  const openAISocket = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01'
  );

  // OpenAI bağlantısı açıldığında
  openAISocket.onopen = async () => {
    try {
      // Authorization header'dan user id'yi al
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];
      
      if (!token) {
        socket.close(4000, 'Authentication required');
        return;
      }

      // Kullanıcı bilgilerini al
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error('User yüklenirken hata:', userError);
        socket.close(4001, 'Invalid user');
        return;
      }

      // Kullanıcının öğrendiği kelimeleri al
      const { data: learnedWords, error: wordsError } = await supabase
        .from('user_progress')
        .select('word')
        .eq('user_id', user.id)
        .eq('learned', true);

      if (wordsError) {
        console.error('Kelimeler yüklenirken hata:', wordsError);
        socket.close(4002, 'Failed to load words');
        return;
      }

      // Kullanıcı profili bilgilerini al
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profil yüklenirken hata:', profileError);
        socket.close(4003, 'Failed to load profile');
        return;
      }

      const userName = profile.first_name || 'öğrenci';
      const words = learnedWords.map(w => w.word);
      console.log('Öğrenilen kelimeler:', words);

      // Session ayarlarını gönder
      openAISocket.send(JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `Sen İngilizce öğrenmeme yardımcı olan Koaly'sin. Konuşmaya başladığımızda önce bana "${userName}" diyerek selam ver ve hal hatır sor. Daha sonra bir İngilizce pratik yapmayı öner. Benim öğrenmiş olduğum kelimeler: ${words.join(', ')}. 
          
          Bu kelimeleri kullanarak pratik yapalım. Kelimelerle ilgili örnek cümleler kur ve benim tekrar etmemi iste. Telaffuzumla ilgili geri bildirim ver. Aynı zamanda yeni cümleler kurmamı iste ve benim cümlelerimi düzelt. İngilizce konuş ama gerektiğinde Türkçe açıklamalar da yap.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
            suppress_tokens: []
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tool_choice: "auto",
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }   
      }));

      console.log('Session ayarları gönderildi');
    } catch (error) {
      console.error('Başlangıç hatası:', error);
      socket.close(4004, 'Initialization failed');
      return;
    }
  };

  // Client'dan gelen mesajları OpenAI'a ilet
  socket.onmessage = (event) => {
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  // OpenAI'dan gelen mesajları client'a ilet
  openAISocket.onmessage = (event) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };

  // Hata yönetimi
  socket.onerror = (error) => {
    console.error('WebSocket hatası:', error);
  };

  openAISocket.onerror = (error) => {
    console.error('OpenAI WebSocket hatası:', error);
  };

  // Bağlantı kapandığında temizlik
  socket.onclose = () => {
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  openAISocket.onclose = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };

  return response;
});
