import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      throw new Error("Search query is required");
    }

    const KANOON_API_KEY = Deno.env.get("KANOON_API_KEY");
    if (!KANOON_API_KEY) {
      throw new Error("Kanoon API key not configured");
    }

    console.log("Searching Kanoon API for:", query);

    // Call Kanoon API search endpoint using POST
    const searchUrl = `https://api.indiankanoon.org/search/`;
    
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Authorization": `Token ${KANOON_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `formInput=${encodeURIComponent(query)}&pagenum=0`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kanoon API error:", response.status, errorText);
      throw new Error(`Kanoon API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract and format case results
    const cases = data.docs?.map((doc: any) => ({
      id: doc.tid,
      title: doc.title || "Untitled Case",
      court: doc.court || "Unknown Court",
      date: doc.docdates?.[0] || "Unknown Date",
      snippet: doc.headline || "",
    })) || [];

    console.log(`Found ${cases.length} cases`);

    return new Response(
      JSON.stringify({ cases }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in search-cases function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to search cases" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
