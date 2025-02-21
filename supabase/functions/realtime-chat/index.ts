
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log("Non-WebSocket request received");
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log("Initializing WebSocket connection");
    
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log("Creating OpenAI WebSocket connection");
    const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01");
    let sessionStarted = false;

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
      
      openAISocket.send(JSON.stringify({
        type: "authorization",
        authorization: `Bearer ${OPENAI_API_KEY}`
      }));
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received from OpenAI:", data.type);

        if (data.type === "session.created" && !sessionStarted) {
          sessionStarted = true;
          console.log("Session created, sending config");
          
          const sessionConfig = {
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: "Sen İngilizce öğretmenisin. Öğrenci yeni öğrendiği kelimeleri pratik etmek istiyor. Her cevabında öğrencinin bildiği kelimelerden en az birini kullanmaya çalış. Cevaplarını kısa ve anlaşılır tut. Öğrencinin hata yapması durumunda nazikçe düzelt.",
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

        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(event.data);
        }
      } catch (error) {
        console.error("Error processing OpenAI message:", error);
      }
    };

    clientSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received from client:", data.type);
        
        if (openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        }
      } catch (error) {
        console.error("Error processing client message:", error);
      }
    };

    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
          type: 'error',
          message: 'OpenAI connection error'
        }));
      }
    };

    clientSocket.onclose = () => {
      console.log("Client disconnected");
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    openAISocket.onclose = () => {
      console.log("OpenAI connection closed");
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };

    response.headers = new Headers({
      ...response.headers,
      ...corsHeaders
    });

    return response;
  } catch (error) {
    console.error("Critical error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
