
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

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Authentication required', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response('Invalid token format', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response('Invalid user', { status: 401 });
    }

    // Get user's learned words
    const { data: learnedWords, error: wordsError } = await supabase
      .from('user_progress')
      .select('word')
      .eq('user_id', user.id)
      .eq('learned', true);

    if (wordsError) {
      console.error('Error fetching learned words:', wordsError);
      return new Response('Failed to load user data', { status: 500 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response('Failed to load profile', { status: 500 });
    }

    // Create WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to OpenAI
    const openAISocket = new WebSocket('wss://api.openai.com/v1/realtime');
    
    // Handle OpenAI connection
    openAISocket.onopen = () => {
      console.log('Connected to OpenAI');
      
      // Send initial session update
      const words = learnedWords?.map(w => w.word) || [];
      const userName = profile?.first_name || 'öğrenci';
      
      socket.send(JSON.stringify({
        type: "connection.established",
        clientId: crypto.randomUUID()
      }));
    };
    
    // Handle messages from client
    socket.onmessage = (event) => {
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };
    
    // Handle messages from OpenAI
    openAISocket.onmessage = (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };
    
    // Handle closures and errors
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      openAISocket.close();
    };
    
    openAISocket.onclose = () => {
      socket.close();
    };

    return response;
  } catch (error) {
    console.error('Server error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
