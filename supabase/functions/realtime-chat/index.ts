
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // WebSocket bağlantısını kontrol et
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    
    // OpenAI WebSocket bağlantısı
    const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01");
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
      
      // Session başlat
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

      openAISocket.send(JSON.stringify({
        type: "authorization",
        authorization: `Bearer ${OPENAI_API_KEY}`
      }));

      openAISocket.send(JSON.stringify(sessionConfig));
    };

    // Kullanıcıdan gelen mesajları OpenAI'a ilet
    clientSocket.onmessage = (event) => {
      console.log("Received from client:", event.data);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    // OpenAI'dan gelen yanıtları kullanıcıya ilet
    openAISocket.onmessage = (event) => {
      console.log("Received from OpenAI:", event.data);
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

    openAISocket.onclose = () => {
      console.log("OpenAI connection closed");
      clientSocket.close();
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
