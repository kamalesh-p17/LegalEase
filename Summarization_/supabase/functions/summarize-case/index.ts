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
    const { caseId, userRole } = await req.json();

    if (!caseId) {
      throw new Error("Case ID is required");
    }

    const KANOON_API_KEY = Deno.env.get("KANOON_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!KANOON_API_KEY || !LOVABLE_API_KEY) {
      throw new Error("API keys not configured");
    }

    console.log("Fetching case from Kanoon API:", caseId);

    // Fetch full case document from Kanoon using POST
    const docUrl = `https://api.indiankanoon.org/doc/${caseId}/`;
    const docResponse = await fetch(docUrl, {
      method: "POST",
      headers: {
        "Authorization": `Token ${KANOON_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!docResponse.ok) {
      throw new Error(`Failed to fetch case: ${docResponse.status}`);
    }

    const docData = await docResponse.json();
    
    // Extract text content (HTML format from Kanoon API)
    let caseText = "";
    if (docData.doc) {
      // Strip HTML tags for text extraction
      caseText = docData.doc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    if (!caseText) {
      throw new Error("No case text available");
    }

    console.log(`Extracted ${caseText.length} characters from case`);

    // Chunk text if too long (max ~40000 chars per chunk to reduce API calls)
    const chunks = chunkText(caseText, 40000);
    console.log(`Split into ${chunks.length} chunks`);

    // Define role-specific prompts
    const rolePrompts = {
      general: "Explain this legal text in very simple, everyday language that anyone can understand. Avoid legal jargon.",
      student: "Summarize this legal text like law student notes. Include constitutional provisions, case laws (if any), and legal doctrines.",
      lawyer: "Summarize this as a professional case brief for a lawyer. Use structured sections: Facts, Issues, Arguments, Court Reasoning, Judgment, and Key Takeaways."
    };

    const basePrompt = rolePrompts[userRole as keyof typeof rolePrompts] || rolePrompts.general;

    // Summarize each chunk with retry logic and rate limit delays
    const summaries = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Summarizing chunk ${i + 1}/${chunks.length}`);

      // Add delay between chunks to avoid rate limits (except for first chunk)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 second delay
      }

      const prompt = `${basePrompt}\n\nLegal Text:\n${chunks[i]}`;

      // Retry logic for rate limits
      let retries = 3;
      let chunkSummary = null;
      
      while (retries > 0 && !chunkSummary) {
        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: "You are a legal expert helping people understand court cases and legal documents. Provide clear, structured summaries."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
            }),
          });

          if (aiResponse.status === 429) {
            console.log(`Rate limited on chunk ${i + 1}, retries left: ${retries - 1}`);
            retries--;
            if (retries > 0) {
              // Wait before retry (exponential backoff: 3s, 6s, 12s)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, 4 - retries) * 1500));
              continue;
            }
            throw new Error("Rate limit exceeded. Please try again in a few moments.");
          }

          if (aiResponse.status === 402) {
            throw new Error("AI credits exhausted. Please add credits to continue.");
          }

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("AI API error:", errorText);
            throw new Error(`AI service error: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          chunkSummary = aiData.choices?.[0]?.message?.content;

          if (chunkSummary) {
            summaries.push(chunkSummary);
          }
          break;
        } catch (error) {
          if (retries === 1) {
            throw error;
          }
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        }
      }
    }

    // Combine all summaries
    const finalSummary = summaries.join("\n\n");

    // If multiple chunks, create a final consolidated summary
    let consolidatedSummary = finalSummary;
    if (chunks.length > 1) {
      console.log("Creating consolidated summary");

      const consolidatePrompt = `${basePrompt}\n\nHere are summaries of different parts of a legal case. Create one cohesive, well-structured summary:\n\n${finalSummary}`;

      const consolidateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a legal expert helping consolidate case summaries."
            },
            {
              role: "user",
              content: consolidatePrompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (consolidateResponse.ok) {
        const consolidateData = await consolidateResponse.json();
        consolidatedSummary = consolidateData.choices?.[0]?.message?.content || finalSummary;
      }
    }

    console.log("Summary generated successfully");

    return new Response(
      JSON.stringify({ 
        summary: consolidatedSummary,
        caseTitle: docData.title || "Legal Case"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in summarize-case function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate summary" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    
    // Try to break at sentence boundaries for better context
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + maxChars * 0.8) { // Only break if we're at least 80% through the chunk
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end));
    start = end;
  }
  
  return chunks;
}
