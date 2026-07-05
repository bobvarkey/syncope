import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Activity, Copy, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * ABCDE-Left-Right mnemonic for high-risk ECG patterns in syncope.
 * A – AV block  |  B – Brugada  |  C – Complete heart block / Chronic ischaemia
 * D – Delta wave (WPW)  |  E – Epsilon wave (ARVC)
 * L – Long QT  |  R – (Short QT, Right ventricular strain / RV overload)
 */
type RiskLevel = "high" | "intermediate";

interface EcgPattern {
  id: string;
  key: string; // mnemonic letter
  name: string;
  risk: RiskLevel;
  description: string;
}

const patterns: EcgPattern[] = [
  { id: "av-block",           key: "A", name: "AV block (2°/3°)",           risk: "high",         description: "Mobitz II or complete AV block — pacing pathway." },
  { id: "brugada",            key: "B", name: "Brugada type 1",              risk: "high",         description: "Coved ST-elevation ≥2mm with T inversion in V1–V2." },
  { id: "complete-hb",        key: "C", name: "Chronic ischaemia / Q-waves", risk: "high",         description: "Q waves suggesting prior MI; substrate for VT." },
  { id: "delta-wpw",          key: "D", name: "Delta wave (WPW)",            risk: "high",         description: "Short PR + slurred QRS upstroke; pre-excitation." },
  { id: "epsilon-arvc",       key: "E", name: "Epsilon wave (ARVC)",         risk: "high",         description: "Small deflection at end of QRS in V1–V3; RV cardiomyopathy." },
  { id: "long-qt",            key: "L", name: "Long QT (QTc >480 ms)",       risk: "high",         description: "Torsades risk; check meds and electrolytes." },
  { id: "short-qt",           key: "R", name: "Short QT (QTc <340 ms)",      risk: "high",         description: "Genetic short QT syndrome; VF risk." },
  { id: "rv-strain",          key: "R", name: "RV strain pattern",           risk: "intermediate", description: "S1Q3T3, RBBB, RV strain — consider PE." },
  { id: "bifascicular",       key: "A", name: "Bifascicular block",          risk: "intermediate", description: "LBBB or RBBB + fascicular block; may progress to CHB." },
  { id: "sinus-brady",        key: "A", name: "Sinus bradycardia <40 bpm",   risk: "intermediate", description: "Off rate-lowering meds — sinus node dysfunction." },
  { id: "lvh-hocm",           key: "C", name: "LVH / HOCM pattern",          risk: "intermediate", description: "Prominent LVH with T-wave inversion; consider HOCM/AS." },
  { id: "early-repol",        key: "E", name: "Early repolarisation (inferior)", risk: "intermediate", description: "J-point elevation with slurring in inferior leads." },
];

interface EcgSyncopeAbcdeProps {
  data: any;
  onUpdate: (data: any) => void;
}

const EcgSyncopeAbcde = ({ data, onUpdate }: EcgSyncopeAbcdeProps) => {
  const selected = data.selectedPatterns || {};

  const togglePattern = (id: string) => {
    onUpdate({
      selectedPatterns: { ...selected, [id]: !selected[id] },
    });
  };

  const activePatterns = useMemo(
    () => patterns.filter((p) => selected[p.id]),
    [selected]
  );

  const highCount = activePatterns.filter((p) => p.risk === "high").length;
  const intCount = activePatterns.filter((p) => p.risk === "intermediate").length;

  const overallRisk: "high" | "intermediate" | "low" =
    highCount > 0 ? "high" : intCount > 0 ? "intermediate" : "low";

  const suggestions = useMemo(() => {
    if (activePatterns.length === 0) {
      return ["No high-risk ECG pattern detected. Normal ECG does not exclude cardiac syncope."];
    }
    const out: string[] = [];
    if (highCount > 0) {
      out.push("Consider urgent cardiology referral / admission for monitoring.");
      out.push("Review medications for QT-prolonging or bradycardic agents.");
    }
    if (activePatterns.some((p) => p.id === "long-qt")) {
      out.push("Check K+, Mg2+; family history of sudden cardiac death.");
    }
    if (activePatterns.some((p) => p.id === "brugada")) {
      out.push("Avoid Brugada-triggering drugs; consider EP referral.");
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

  const reset = () => onUpdate({ selectedPatterns: {} });

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
