
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    console.log("Initializing WebSocket connection");
    
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Create WebSocket connection to OpenAI
    const openAISocket = new WebSocket("wss://api.openai.com/v1/audio/stream");
    
    // Handle connection to OpenAI
    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
      
      // Send authorization
      openAISocket.send(JSON.stringify({
        type: "authorization",
        authorization: `Bearer ${OPENAI_API_KEY}`
      }));

      // Configure session
      openAISocket.send(JSON.stringify({
        type: "session.config",
        config: {
          voice: "alloy",
          model: "gpt-4",
          system_prompt: "You are Koaly, a friendly English teacher helping students practice English. Use simple words and speak clearly. Only use words from the user's learned words list when possible. Encourage them and help them improve their pronunciation.",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_settings: {
            sample_rate: 24000,
            channels: 1
          }
        }
      }));
    };

    // Forward messages between client and OpenAI
    openAISocket.onmessage = (event) => {
      console.log("Received message from OpenAI:", event.data);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
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

    // Handle messages from client
    clientSocket.onmessage = (event) => {
      console.log("Received message from client:", event.data);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    // Handle client disconnection
    clientSocket.onclose = () => {
      console.log("Client disconnected");
      openAISocket.close();
    };

    // Handle OpenAI disconnection
    openAISocket.onclose = () => {
      console.log("OpenAI connection closed");
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };

    // Handle client errors
    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    response.headers = new Headers({
      ...corsHeaders,
      ...response.headers,
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
