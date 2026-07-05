import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Pattern IDs must match the client's EcgSyncopeAbcde patterns array
const PATTERN_IDS = [
  "av-block",
  "brugada",
  "complete-hb",
  "delta-wpw",
  "epsilon-arvc",
  "long-qt",
  "short-qt",
  "rv-strain",
  "bifascicular",
  "sinus-brady",
  "lvh-hocm",
  "early-repol",
] as const;

const SYSTEM_PROMPT = `You are an expert cardiologist analyzing ECG images for syncope risk stratification.
You will inspect the ECG and identify which of the following high-risk / intermediate-risk patterns are present.
Only return patterns you are reasonably confident about. Be conservative — false positives are worse than false negatives.

Pattern IDs and their definitions:
- av-block: 2nd or 3rd degree AV block (Mobitz II, complete heart block)
- brugada: Type 1 Brugada pattern (coved ST-elevation ≥2mm with T inversion in V1-V2)
- complete-hb: Q waves suggesting prior MI / chronic ischaemia
- delta-wpw: Delta wave / WPW pre-excitation (short PR + slurred QRS upstroke)
- epsilon-arvc: Epsilon wave in V1-V3 (ARVC)
- long-qt: Prolonged QT interval (QTc >480 ms)
- short-qt: Short QT interval (QTc <340 ms)
- rv-strain: RV strain pattern (S1Q3T3, RBBB with RV strain — consider PE)
- bifascicular: Bifascicular block (LBBB or RBBB + fascicular block)
- sinus-brady: Sinus bradycardia <40 bpm
- lvh-hocm: LVH / HOCM pattern with T-wave inversion
- early-repol: Early repolarisation with J-point elevation in inferior leads

Return STRICT JSON only, no prose:
{
  "detectedPatterns": ["pattern-id", ...],
  "confidence": "low" | "moderate" | "high",
  "rationale": "one-sentence explanation of key findings",
  "isEcg": true | false
}

If the image is not an ECG, set isEcg=false and detectedPatterns=[].`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const imageDataUrl: string | undefined = body?.imageDataUrl;
    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      return new Response(
        JSON.stringify({ error: "imageDataUrl (data:image/...;base64,...) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gatewayResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this ECG and identify any of the listed high-risk patterns. Return strict JSON." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!gatewayResp.ok) {
      const errText = await gatewayResp.text();
      const status = gatewayResp.status;
      let msg = "AI gateway error";
      if (status === 429) msg = "Rate limit exceeded — please retry in a moment.";
      else if (status === 402) msg = "AI credits exhausted — please add credits.";
      return new Response(JSON.stringify({ error: msg, detail: errText }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gwJson = await gatewayResp.json();
    const rawContent: string = gwJson?.choices?.[0]?.message?.content ?? "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { detectedPatterns: [], confidence: "low", rationale: "Could not parse AI response", isEcg: false };
    }

    const detected = Array.isArray(parsed?.detectedPatterns)
      ? parsed.detectedPatterns.filter((id: unknown) => typeof id === "string" && (PATTERN_IDS as readonly string[]).includes(id))
      : [];

    return new Response(
      JSON.stringify({
        detectedPatterns: detected,
        confidence: parsed?.confidence ?? "moderate",
        rationale: parsed?.rationale ?? "",
        isEcg: parsed?.isEcg !== false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
