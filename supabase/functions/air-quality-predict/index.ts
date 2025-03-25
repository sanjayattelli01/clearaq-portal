
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = "https://air-anlalysis-models.onrender.com/predict";
    
    // Get the request body
    const requestData = await req.json();
    console.log("Sending data to external API:", requestData);
    
    // Forward the request to the external API
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Get the API response
    const apiData = await response.json();
    console.log("Received response from external API:", apiData);
    
    // Return the response with CORS headers
    return new Response(JSON.stringify(apiData), { headers: corsHeaders });
  } catch (error) {
    console.error("Error in air-quality-predict function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
