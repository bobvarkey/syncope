import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientFindings } = await req.json();
    console.log("Received patient findings:", patientFindings);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct detailed prompt for medical differential diagnosis
    const systemPrompt = `You are an expert medical AI assistant specializing in syncope, seizure, and loss of consciousness evaluation. 
Your role is to analyze patient findings and provide differential diagnoses with confidence scores and supporting evidence.

IMPORTANT INSTRUCTIONS:
1. Provide 3-5 most likely differential diagnoses based on the provided findings
2. For each diagnosis, assign a confidence score (0-100%)
3. Provide specific supporting evidence from the patient's findings
4. Include red flags or critical features that support or contradict each diagnosis
5. Be specific about which clinical features point to each diagnosis
6. Consider both common and serious causes
7. Base your analysis on established medical guidelines and evidence-based medicine

Format your response as a structured analysis with clear confidence levels and evidence.`;

    const userPrompt = `Please analyze the following patient findings and provide differential diagnoses:

PATIENT FINDINGS:
${patientFindings}

Please provide:
1. Top 3-5 differential diagnoses ranked by likelihood
2. Confidence score (0-100%) for each diagnosis
3. Specific supporting evidence from the patient's findings
4. Key features that support or contradict each diagnosis
5. Recommended next steps for confirmation`;

    console.log("Calling Lovable AI Gateway...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-diagnosis function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
