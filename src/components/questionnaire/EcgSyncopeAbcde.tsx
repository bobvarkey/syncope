import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Activity, Copy, RotateCcw, CheckCircle2, AlertTriangle, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import brugadaImage from "@/assets/brugada-types.jpeg.asset.json";
import epsilonImage from "@/assets/epsilon-wave-arvd.png.asset.json";
import wellensImage from "@/assets/wellens-syndrome-ecg.png.asset.json";
import wobblerImage from "@/assets/wobbler-mnemonic.png.asset.json";
import {
  computeEcgRisk,
  ecgPatterns,
  ecgTestCases,
  type EcgPattern as SharedEcgPattern,
  type RiskLevel as EcgRiskLevel,
} from "@/lib/ecgRiskScoring";

const patternImages: Record<string, { src: string; caption: string }> = {
  brugada: {
    src: brugadaImage.url,
    caption: "Brugada types 1–3: coved (type 1, diagnostic) and saddleback (types 2/3) ST elevation in V1–V3.",
  },
  "epsilon-arvc": {
    src: epsilonImage.url,
    caption: "Epsilon wave: small terminal deflection at end of QRS in V1 — ARVC/ARVD.",
  },
  wellens: {
    src: wellensImage.url,
    caption: "Wellens' syndrome: pattern A biphasic and pattern B deeply inverted T waves in V2–V3 — critical proximal LAD stenosis.",
  },
};


/**
 * ABCDE-Left-Right mnemonic for high-risk ECG patterns in syncope.
 * A – AV block  |  B – Brugada  |  C – Complete heart block / Chronic ischaemia
 * D – Delta wave (WPW)  |  E – Epsilon wave (ARVC)
 * L – Long QT  |  R – (Short QT, Right ventricular strain / RV overload)
 */
type RiskLevel = EcgRiskLevel;

type EcgPattern = SharedEcgPattern;

const patterns: EcgPattern[] = ecgPatterns;

interface EcgSyncopeAbcdeProps {
  data: any;
  onUpdate: (data: any) => void;
}

const EcgSyncopeAbcde = ({ data, onUpdate }: EcgSyncopeAbcdeProps) => {
  const selected = data.selectedPatterns || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(data.uploadedImage || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRationale, setAiRationale] = useState<string>(data.aiRationale || "");
  const [aiConfidence, setAiConfidence] = useState<string>(data.aiConfidence || "");

  const togglePattern = (id: string) => {
    onUpdate({
      selectedPatterns: { ...selected, [id]: !selected[id] },
    });
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyzeEcg = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please use an image under 8 MB.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadedImage(dataUrl);

      const { data: result, error } = await supabase.functions.invoke("ecg-analyze", {
        body: { imageDataUrl: dataUrl },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      if (result?.isEcg === false) {
        toast({ title: "Not recognised as ECG", description: "The image doesn't look like an ECG trace.", variant: "destructive" });
        setAnalyzing(false);
        return;
      }

      const detected: string[] = Array.isArray(result?.detectedPatterns) ? result.detectedPatterns : [];
      const nextSelected: Record<string, boolean> = { ...selected };
      detected.forEach((id) => { nextSelected[id] = true; });

      onUpdate({
        selectedPatterns: nextSelected,
        uploadedImage: dataUrl,
        aiRationale: result?.rationale || "",
        aiConfidence: result?.confidence || "moderate",
      });
      setAiRationale(result?.rationale || "");
      setAiConfidence(result?.confidence || "moderate");

      toast({
        title: detected.length > 0 ? `Detected ${detected.length} pattern${detected.length === 1 ? "" : "s"}` : "No high-risk patterns detected",
        description: result?.rationale || undefined,
      });
    } catch (err: any) {
      toast({ title: "ECG analysis failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeEcg(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  const activePatterns = useMemo(
    () => patterns.filter((p) => selected[p.id]),
    [selected]
  );

  const highCount = activePatterns.filter((p) => p.risk === "high").length;
  const intCount = activePatterns.filter((p) => p.risk === "intermediate").length;

  const overallRisk: "high" | "intermediate" | "low" =
    highCount > 0 ? "high" : intCount > 0 ? "intermediate" : "low";

  const riskScore = useMemo(() => {
    if (activePatterns.length === 0) return 0;
    return activePatterns.reduce((acc, p) => acc + (p.risk === "high" ? 3 : 1), 0);
  }, [activePatterns]);

  const actionRecommendation = useMemo(() => {
    if (highCount > 0 || riskScore >= 3) {
      return {
        action: "Urgent Cardiology Referral & Admission",
        priority: "Critical",
        color: "text-destructive",
        bg: "bg-destructive/10"
      };
    }
    if (intCount > 0 || riskScore >= 1) {
      return {
        action: "Cardiology Consult & Monitoring",
        priority: "Intermediate",
        color: "text-amber-600",
        bg: "bg-amber-500/10"
      };
    }
    return {
      action: "Routine Follow-up / Observation",
      priority: "Low",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    };
  }, [highCount, intCount, riskScore]);

  const suggestions = useMemo(() => {
    if (activePatterns.length === 0) {
      return ["No high-risk ECG pattern detected. Normal ECG does not exclude cardiac syncope."];
    }
    const out: string[] = [];
    
    // WOBBLER Specific Summary
    const wobblerMatches = activePatterns.map(p => p.key).filter((v, i, a) => a.indexOf(v) === i);
    if (wobblerMatches.length > 0) {
      out.push(`WOBBLER Red Flags: ${wobblerMatches.join(", ")}`);
    }

    if (highCount > 0) {
      out.push("Consider urgent cardiology referral / admission for telemetry monitoring.");
      out.push("Review medications for QT-prolonging or bradycardic agents.");
    }
    if (activePatterns.some((p) => p.id === "long-qt")) {
      out.push("Check K+, Mg2+; family history of sudden cardiac death.");
    }
    if (activePatterns.some((p) => p.id === "brugada")) {
      out.push("Avoid Brugada-triggering drugs; consider EP referral.");
    }
    if (activePatterns.some((p) => p.id === "wellens")) {
      out.push("Wellens' pattern: urgent cardiology referral for coronary angiography — avoid stress testing.");
      out.push("Serial troponins and ECGs; treat as pre-infarction proximal LAD stenosis even if pain-free.");
    }
    if (activePatterns.some((p) => p.id === "delta-wpw")) {
      out.push("Consider EP study / ablation for symptomatic WPW.");
    }
    if (activePatterns.some((p) => p.id === "av-block" || p.id === "bifascicular")) {
      out.push("Consider ambulatory monitoring / ILR / pacing evaluation.");
    }
    return out;
  }, [activePatterns, highCount]);

  const copyJson = async () => {
    const payload = {
      overallRisk,
      selectedPatterns: activePatterns.map((p) => ({ id: p.id, key: p.key, name: p.name, risk: p.risk })),
      suggestions,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast({ title: "Copied to clipboard", description: "ECG risk JSON copied." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const reset = () => {
    onUpdate({ selectedPatterns: {}, uploadedImage: null, aiRationale: "", aiConfidence: "" });
    setUploadedImage(null);
    setAiRationale("");
    setAiConfidence("");
  };

  const riskLabel = {
    high: { text: "High-risk ECG pattern", className: "bg-destructive/15 text-destructive border-destructive/50" },
    intermediate: { text: "Intermediate-risk pattern", className: "bg-amber-500/15 text-amber-500 border-amber-500/50" },
    low: { text: "No high-risk pattern detected", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/50" },
  }[overallRisk];

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Syncope ECG — ABCDE Left/Right
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Quick screen for high-risk ECG patterns in syncope. Decision support only.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
            Clinical decision support • ECG
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* WOBBLER mnemonic reference */}
        <figure className="rounded-lg border overflow-hidden bg-background">
          <img
            src={wobblerImage.url}
            alt="WOBBLER mnemonic for ECG assessment in syncope: Wolff-Parkinson-White, Wellens syndrome, Obstructed AV pathway, Bifascicular block, Brugada, Left ventricular hypertrophy, Epsilon wave, Repolarisation abnormality"
            loading="lazy"
            className="media-uniform-contain"
          />
          <figcaption className="px-3 py-2 text-[11px] text-muted-foreground leading-snug border-t bg-muted/30">
            WOBBLER — structured ECG read in syncope. Exclude obvious ischaemia or dysrhythmia first; apply to
            well-looking patients without immediately obvious ECG abnormalities.
          </figcaption>
        </figure>

        {/* Example Test Cases */}
        <div className="rounded-lg border bg-muted/10 p-3">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Verification Test Cases</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Brugada T1", patterns: ["brugada"], score: 3, action: "Urgent" },
              { label: "WPW + LVH", patterns: ["delta-wpw", "lvh-hocm"], score: 4, action: "Urgent" },
              { label: "RV Strain", patterns: ["rv-strain"], score: 1, action: "Intermediate" },
              { label: "Sinus Brady", patterns: ["sinus-brady"], score: 1, action: "Intermediate" }
            ].map((test, i) => (
              <Button 
                key={i}
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] bg-background"
                onClick={() => {
                  const nextSelected: Record<string, boolean> = {};
                  test.patterns.forEach(id => nextSelected[id] = true);
                  onUpdate({ selectedPatterns: nextSelected });
                  toast({ 
                    title: `Test Case: ${test.label}`, 
                    description: `Expected Score: ${test.score}, Action: ${test.action}` 
                  });
                }}
              >
                {test.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload / AI auto-detect */}
        <div className="rounded-lg border border-dashed p-3 bg-muted/20 space-y-3">

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Auto-detect from ECG image
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a 12-lead ECG photo or scan. AI will pre-select matching patterns for your review.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileChange}
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload ECG</>
                )}
              </Button>
            </div>
          </div>

          {uploadedImage && (
            <div className="grid gap-3 md:grid-cols-[1fr_1fr] items-start">
              <div className="rounded-md border overflow-hidden bg-background">
                <img
                  src={uploadedImage}
                  alt="Uploaded ECG"
                  className="media-uniform-contain"
                />
              </div>
              {(aiRationale || aiConfidence) && (
                <div className="text-xs space-y-1.5">
                  {aiConfidence && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      AI confidence: {aiConfidence}
                    </Badge>
                  )}
                  {aiRationale && (
                    <p className="text-muted-foreground leading-snug">
                      <span className="font-medium text-foreground">AI note: </span>{aiRationale}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    Always verify AI-detected patterns before acting on them.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[2fr_1.5fr]">
          {/* Pattern grid */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Scan the ECG</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select the mnemonic features present. Definitions appear under each item.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {patterns.map((p) => {
                const isSelected = !!selected[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePattern(p.id)}
                    className={cn(
                      "text-left rounded-lg border p-3 transition-all bg-card hover:border-primary/70 hover:-translate-y-px",
                      isSelected && "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_30px_hsl(var(--primary)/0.15)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs font-medium">
                        <span className="font-mono opacity-80">{p.key}</span>
                        <span>{p.name}</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase tracking-wider",
                          p.risk === "high"
                            ? "bg-destructive/15 text-destructive border-destructive/50"
                            : "bg-amber-500/15 text-amber-500 border-amber-500/50"
                        )}
                      >
                        {p.risk}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-snug">{p.description}</p>
                    {patternImages[p.id] && (
                      <figure className="mt-2 rounded-md border overflow-hidden bg-background">
                        <img
                          src={patternImages[p.id].src}
                          alt={`${p.name} representative ECG`}
                          loading="lazy"
                          className="media-uniform-contain"
                        />
                        <figcaption className="px-2 py-1 text-[10px] text-muted-foreground leading-snug border-t bg-muted/30">
                          {patternImages[p.id].caption}
                        </figcaption>
                      </figure>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Checkbox checked={isSelected} tabIndex={-1} aria-hidden />
                      <span className="text-muted-foreground">
                        {isSelected ? "Selected" : "Tap to select"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk output panel */}
          <div className="space-y-3">
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Label className="text-sm font-medium">ECG risk signal</Label>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", riskLabel.className)}>
                  {overallRisk === "high" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : overallRisk === "intermediate" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {riskLabel.text}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {overallRisk === "high" && "High-risk pattern(s) present — expedite cardiac work-up."}
                {overallRisk === "intermediate" && "Intermediate-risk finding(s) — consider ambulatory monitoring."}
                {overallRisk === "low" && "No listed high-risk pattern detected. A normal ECG does not exclude cardiac syncope."}
              </p>

              <div className="mb-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Recommendations
                </Label>
                <ul className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cn("rounded-md p-3 mb-3 border", actionRecommendation.bg)}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Action Recommendation</span>
                  <Badge variant="secondary" className={cn("text-[10px] h-4", actionRecommendation.color)}>
                    {actionRecommendation.priority}
                  </Badge>
                </div>
                <p className={cn("text-xs font-bold leading-tight", actionRecommendation.color)}>
                  {actionRecommendation.action}
                </p>
                {riskScore > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] opacity-80 italic">
                      Calculated Risk Score: {riskScore} (High risk = 3 pts, Intermediate = 1 pt)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activePatterns.map(p => (
                        <Badge 
                          key={p.id} 
                          variant="outline" 
                          className="px-1.5 py-0 h-4 text-[9px] bg-background/50 border-current opacity-70"
                        >
                          {p.key}: {p.name} (+{p.risk === "high" ? "3" : "1"})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={copyJson}>
                  <Copy className="h-3.5 w-3.5" /> Copy JSON
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-dashed pt-2">
              This mini tool highlights ECG patterns associated with higher risk of cardiac syncope
              (AV block, Brugada, long/short QT, WPW, ARVC, LVH/HOCM, RV strain). It does not replace
              guideline-based syncope assessment or formal ECG interpretation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcgSyncopeAbcde;
