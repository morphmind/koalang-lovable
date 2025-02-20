
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    
    // OpenAI WebSocket bağlantısı
    const openAISocket = new WebSocket("wss://api.openai.com/v1/chat/completions");
    
    // Kullanıcının öğrendiği kelimeleri al
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: userProgress } = await supabaseClient
      .from('user_progress')
      .select('word')
      .eq('learned', true);

    const learnedWords = userProgress?.map(p => p.word) || [];

    clientSocket.onopen = () => {
      console.log("Client connected");
      
      // Başlangıç ayarlarını gönder
      const sessionConfig = {
        event_id: "event_123",
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `Sen bir İngilizce öğretmenisin. Kullanıcının öğrendiği kelimeler: ${learnedWords.join(', ')}. 
                       Bu kelimeleri kullanarak konuşma pratiği yap. Her cümlende en az bir öğrenilmiş kelime kullan.
                       Cevapların kısa ve anlaşılır olsun.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          }
        }
      };

      clientSocket.send(JSON.stringify(sessionConfig));
    };

    // Kullanıcıdan gelen mesajları OpenAI'a ilet
    clientSocket.onmessage = (event) => {
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    // OpenAI'dan gelen yanıtları kullanıcıya ilet
    openAISocket.onmessage = (event) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };

    // Hata yönetimi
    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
    };

    // Bağlantı kapandığında temizlik
    clientSocket.onclose = () => {
      console.log("Client disconnected");
      openAISocket.close();
    };

    return response;
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
