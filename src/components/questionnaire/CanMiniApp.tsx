import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, HeartPulse, RotateCcw, Stethoscope, Droplets, ChevronDown, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils";

type Num = number | "";

interface CanState {
  ageYears: Num;
  // cardiovagal
  deepBreathingDeltaHr: Num;
  eiRatio: Num;
  valsalvaRatio: Num;
  ratio3015: Num;
  // orthostatic
  supineSbp: Num;
  supineDbp: Num;
  supineHr: Num;
  uprightSbp3: Num;
  uprightDbp3: Num;
  uprightHrMax: Num;
  uprightSbpLate: Num;
  uprightDbpLate: Num;
  // sudomotor (Sudoscan)
  handEsc: Num;
  handLln: Num;
  footEsc: Num;
  footLln: Num;
  // confounders
  chronotropicMeds: boolean;
  nonSinusRhythm: boolean;
}

const EMPTY: CanState = {
  ageYears: "",
  deepBreathingDeltaHr: "",
  eiRatio: "",
  valsalvaRatio: "",
  ratio3015: "",
  supineSbp: "",
  supineDbp: "",
  supineHr: "",
  uprightSbp3: "",
  uprightDbp3: "",
  uprightHrMax: "",
  uprightSbpLate: "",
  uprightDbpLate: "",
  handEsc: "",
  handLln: "",
  footEsc: "",
  footLln: "",
  chronotropicMeds: false,
  nonSinusRhythm: false,
};

const STORAGE_KEY = "syncdx-can-mini-app";

const n = (v: Num) => (v === "" || Number.isNaN(Number(v)) ? null : Number(v));

/** Age-dependent lower limits for deep-breathing heart-rate variation (bpm). */
const deepBreathingLln = (age: number | null) => {
  if (age === null) return 10;
  if (age < 20) return 18;
  if (age < 30) return 15;
  if (age < 40) return 13;
  if (age < 50) return 11;
  if (age < 60) return 9;
  if (age < 70) return 7;
  return 5;
};

/** Standard generalized Sudoscan lower limit of normal (µS). */
const SUDOSCAN_LLN_60_US = 60;

/** Performance requirements / protocol for each test subtype, shown on tooltip hover. */
const TEST_REQS: Record<string, string> = {
  deepBreathing:
    "Deep-breathing ΔHR: 6 breaths/min (5 s in, 5 s out) for ~1 min; supine or seated, continuous ECG; avoid talking/coughing/straining; use age- and sex-adjusted norms (LLN declines with age).",
  eiRatio:
    "E:I ratio: mean longest expiratory NN interval ÷ mean shortest inspiratory NN interval across ≥6 paced cycles at 6 breaths/min; sinus rhythm preferred; chronotropic/anticholinergic drugs confound the result.",
  valsalva:
    "Valsalva ratio: strain at ~40 mmHg for ~15 s (blow into manometer), usually ×2–3 trials; ratio = longest post-strain RR ÷ shortest strain RR; beat-to-beat BP (late phase II, phase IV overshoot) informs adrenergic scoring.",
  ratio3015:
    "30:15 ratio: after active standing, longest RR near the 30th beat ÷ shortest RR near the 15th beat; requires continuous ECG and prompt upright transition; use laboratory age-adjusted norms.",
  orthostatic:
    "Stand/tilt: supine rest ≥5 min (10–15 min preferred), then active stand or head-up tilt; record BP/HR at 1, 3, 5 min (continue to 10 min if POTS suspected). OH = sustained SBP fall ≥20 or DBP fall ≥10 mmHg within 3 min. Use fall precautions; supervised; terminate for syncope, presyncope, chest pain, or arrhythmia.",
  sudomotor:
    "Sudoscan ESC: electrochemical skin conductance of palms and soles in µS; standard generalized LLN = 60 µS. Not equivalent to QSART/thermoregulatory sweat testing. Interpret with device/age/sex-specific norms; poor contact, callus, edema, or skin disease limit validity.",
};

/** Tooltip-wrapped section heading. */
const ReqTip = ({ id, title }: { id: string; title: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help">
        {title}
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm text-xs leading-relaxed">
      {TEST_REQS[id]}
    </TooltipContent>
  </Tooltip>
);

const CanMiniApp: React.FC = () => {
  const [s, setS] = useState<CanState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return EMPTY;
  });
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const set = <K extends keyof CanState>(key: K, value: CanState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const numField = (key: keyof CanState) => ({
    value: s[key] as Num,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, (e.target.value === "" ? "" : Number(e.target.value)) as CanState[typeof key]),
  });

  const result = useMemo(() => {
    const age = n(s.ageYears);
    const dbLln = deepBreathingLln(age);

    // ---- Cardiovagal CARTs ----
    const carts: { label: string; abnormal: boolean | null; detail: string }[] = [];
    const db = n(s.deepBreathingDeltaHr);
    if (db !== null)
      carts.push({
        label: "Deep-breathing ΔHR",
        abnormal: db < dbLln,
        detail: `${db} bpm (age LLN ≈ ${dbLln} bpm)`,
      });
    const ei = n(s.eiRatio);
    if (ei !== null)
      carts.push({ label: "E:I ratio", abnormal: ei < 1.1, detail: `${ei.toFixed(2)} (LLN ≈ 1.10)` });
    const vr = n(s.valsalvaRatio);
    if (vr !== null)
      carts.push({ label: "Valsalva ratio", abnormal: vr < 1.2, detail: `${vr.toFixed(2)} (LLN ≈ 1.20)` });
    const r3015 = n(s.ratio3015);
    if (r3015 !== null)
      carts.push({ label: "30:15 ratio", abnormal: r3015 < 1.04, detail: `${r3015.toFixed(2)} (LLN ≈ 1.04)` });

    const abnormalCount = carts.filter((c) => c.abnormal).length;
    const testedCount = carts.length;

    // ---- Orthostatic hemodynamics ----
    const supSbp = n(s.supineSbp);
    const supDbp = n(s.supineDbp);
    const supHr = n(s.supineHr);
    const sbp3 = n(s.uprightSbp3);
    const dbp3 = n(s.uprightDbp3);
    const sbpLate = n(s.uprightSbpLate);
    const dbpLate = n(s.uprightDbpLate);
    const hrMax = n(s.uprightHrMax);

    const sbpDrop3 = supSbp !== null && sbp3 !== null ? supSbp - sbp3 : null;
    const dbpDrop3 = supDbp !== null && dbp3 !== null ? supDbp - dbp3 : null;
    const sbpDropLate = supSbp !== null && sbpLate !== null ? supSbp - sbpLate : null;
    const dbpDropLate = supDbp !== null && dbpLate !== null ? supDbp - dbpLate : null;
    const hrIncrease = supHr !== null && hrMax !== null ? hrMax - supHr : null;

    const ohPresent = (sbpDrop3 !== null && sbpDrop3 >= 20) || (dbpDrop3 !== null && dbpDrop3 >= 10);
    const delayedOh =
      !ohPresent && ((sbpDropLate !== null && sbpDropLate >= 20) || (dbpDropLate !== null && dbpDropLate >= 10));
    const hypertensiveBaseline = (supSbp !== null && supSbp >= 150) || (supDbp !== null && supDbp >= 90);
    const largeFallHtn =
      hypertensiveBaseline && ((sbpDrop3 !== null && sbpDrop3 >= 30) || (dbpDrop3 !== null && dbpDrop3 >= 15));
    const hrSbpRatio =
      hrIncrease !== null && sbpDrop3 !== null && sbpDrop3 > 0 ? hrIncrease / sbpDrop3 : null;
    const attenuatedHr = hrIncrease !== null && hrIncrease < 15;
    const noConfounder = !s.chronotropicMeds && !s.nonSinusRhythm;
    const neurogenicOh =
      ohPresent && (attenuatedHr || (hrSbpRatio !== null && hrSbpRatio < 0.5)) && noConfounder;

    const potsThreshold = age !== null && age >= 12 && age <= 19 ? 40 : 30;
    const potsPattern = !ohPresent && hrIncrease !== null && hrIncrease >= potsThreshold;

    // ---- CAN stage ----
    let canStage = "Insufficient data";
    let canTone: "neutral" | "ok" | "warn" | "danger" = "neutral";
    if (testedCount > 0) {
      if (abnormalCount >= 1 && ohPresent) {
        canStage = "Severe / advanced CAN";
        canTone = "danger";
      } else if (abnormalCount >= 2) {
        canStage = "Definite (confirmed) CAN";
        canTone = "danger";
      } else if (abnormalCount === 1) {
        canStage = "Possible / early CAN";
        canTone = "warn";
      } else {
        canStage = "No evidence of CAN";
        canTone = "ok";
      }
    }

    // ---- mCASS domains ----
    let cardiovagal: number | null = null;
    if (testedCount > 0) {
      if (abnormalCount === 0) cardiovagal = 0;
      else if (abnormalCount === 1) cardiovagal = 1;
      else if (abnormalCount === 2) cardiovagal = 2;
      else cardiovagal = 3;
    }

    let adrenergic: number | null = null;
    if (sbpDrop3 !== null || dbpDrop3 !== null) {
      if (!ohPresent && !delayedOh) adrenergic = 0;
      else if (delayedOh && !ohPresent) adrenergic = 1;
      else if (sbpDrop3 !== null && sbpDrop3 >= 60) adrenergic = 4;
      else if (sbpDrop3 !== null && sbpDrop3 >= 40) adrenergic = 3;
      else adrenergic = 2;
    }

    const handEsc = n(s.handEsc);
    const handLln = n(s.handLln);
    const footEsc = n(s.footEsc);
    const footLln = n(s.footLln);
    // Default LLN to the standard generalized 60 µS when the field is left blank.
    const effHandLln = handEsc !== null && handLln === null ? SUDOSCAN_LLN_60_US : handLln;
    const effFootLln = footEsc !== null && footLln === null ? SUDOSCAN_LLN_60_US : footLln;
    const handPct = handEsc !== null && effHandLln !== null && effHandLln > 0 ? (100 * handEsc) / effHandLln : null;
    const footPct = footEsc !== null && effFootLln !== null && effFootLln > 0 ? (100 * footEsc) / effFootLln : null;
    const handLlnUsedDefault = handEsc !== null && handLln === null;
    const footLlnUsedDefault = footEsc !== null && footLln === null;
    let sudomotor: number | null = null;
    if (handPct !== null && footPct !== null) {
      const handAbn = handPct < 100;
      const footAbn = footPct < 100;
      const handSevere = handPct < 50;
      const footSevere = footPct < 50;
      if (!handAbn && !footAbn) sudomotor = 0;
      else if (handAbn && footAbn && (handSevere || footSevere)) sudomotor = 3;
      else if (handAbn && footAbn) sudomotor = 2;
      else if (handSevere || footSevere) sudomotor = 1;
      else sudomotor = 1;
    }

    const domains = [cardiovagal, adrenergic, sudomotor];
    const complete = domains.every((d) => d !== null);
    const total = domains.reduce<number>((acc, d) => acc + (d ?? 0), 0);
    let severity = "Normal";
    if (total >= 7) severity = "Severe autonomic dysfunction";
    else if (total >= 4) severity = "Moderate autonomic dysfunction";
    else if (total >= 1) severity = "Mild autonomic dysfunction";

    const warnings: string[] = [];
    if (s.chronotropicMeds)
      warnings.push(
        "Chronotropic medication (beta-blocker, ivabradine, digoxin, non-DHP CCB, antiarrhythmic) may confound HR-based tests.",
      );
    if (s.nonSinusRhythm)
      warnings.push("Non-sinus / paced rhythm or frequent ectopy: HRV and cardiovagal reflex indices may be uninterpretable.");
    if (testedCount > 0 && testedCount < 2)
      warnings.push("Fewer than two cardiovascular autonomic reflex tests entered; CAN staging requires ≥2 interpretable tests.");
    if (handLlnUsedDefault || footLlnUsedDefault)
      warnings.push(
        "Sudoscan LLN field left blank — standard generalized 60 µS default used for sudomotor scoring. Confirm against device/laboratory norms if available.",
      );
    if (largeFallHtn)
      warnings.push("Substantial orthostatic fall on a hypertensive supine baseline (supine hypertension with OH).");

    return {
      carts,
      abnormalCount,
      testedCount,
      canStage,
      canTone,
      ohPresent,
      delayedOh,
      neurogenicOh,
      attenuatedHr,
      potsPattern,
      potsThreshold,
      hrIncrease,
      sbpDrop3,
      dbpDrop3,
      hrSbpRatio,
      handPct,
      footPct,
      handLlnUsedDefault,
      footLlnUsedDefault,
      cardiovagal,
      adrenergic,
      sudomotor,
      total,
      complete,
      severity,
      warnings,
    };
  }, [s]);

  const toneClass = (tone: string) =>
    tone === "danger"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : tone === "warn"
        ? "bg-[hsl(45_100%_55%/0.12)] text-[hsl(28_100%_45%)] border-[hsl(45_100%_55%/0.4)]"
        : tone === "ok"
          ? "bg-[hsl(160_70%_45%/0.12)] text-[hsl(160_70%_32%)] border-[hsl(160_70%_45%/0.35)]"
          : "bg-muted text-muted-foreground border-border";

  const Field = ({ id, label, unit, field }: { id: string; label: React.ReactNode; unit?: string; field: keyof CanState }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label} {unit && <span className="text-muted-foreground font-normal">({unit})</span>}
      </Label>
      <Input id={id} type="number" inputMode="decimal" step="any" className="h-11" {...numField(field)} />
    </div>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
    <Card className="border-2 border-[hsl(280_75%_60%/0.35)] shadow-sm">
      <CardHeader className="bg-gradient-to-r from-[hsl(280_75%_60%/0.14)] via-[hsl(340_85%_60%/0.10)] to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[hsl(280_75%_60%/0.15)]">
              <HeartPulse className="h-5 w-5 text-[hsl(280_75%_60%)]" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">CAN Mini App — Cardiac Autonomic Neuropathy &amp; mCASS</CardTitle>
              <CardDescription>
                Enter cardiovascular autonomic reflex tests, orthostatic hemodynamics and Sudoscan values to stage CAN and
                derive a modified 10-point CASS (mCASS). Decision support only — not the validated Mayo CASS.
              </CardDescription>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")} />
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>

      <CollapsibleContent>
      <CardContent className="space-y-6 pt-6">
        {/* Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field id="can-age" label="Age" unit="years" field="ageYears" />
          <div className="flex items-center gap-3 sm:col-span-2 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer min-h-11">
              <Checkbox
                checked={s.chronotropicMeds}
                onCheckedChange={(v) => set("chronotropicMeds", v === true)}
              />
              Chronotropic medication
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer min-h-11">
              <Checkbox checked={s.nonSinusRhythm} onCheckedChange={(v) => set("nonSinusRhythm", v === true)} />
              Non-sinus / paced / frequent ectopy
            </label>
          </div>
        </div>

        <Separator />

        {/* Cardiovagal */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[hsl(160_70%_35%)]">
            <Activity className="h-4 w-4" />
            <ReqTip id="deepBreathing" title="Cardiovagal reflex tests" />
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field id="can-db" label={<ReqTip id="deepBreathing" title="Deep-breathing ΔHR" />} unit="bpm" field="deepBreathingDeltaHr" />
            <Field id="can-ei" label={<ReqTip id="eiRatio" title="E:I ratio" />} field="eiRatio" />
            <Field id="can-vr" label={<ReqTip id="valsalva" title="Valsalva ratio" />} field="valsalvaRatio" />
            <Field id="can-3015" label={<ReqTip id="ratio3015" title="30:15 ratio" />} field="ratio3015" />
          </div>
          {result.carts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.carts.map((c) => (
                <Badge key={c.label} variant="outline" className={toneClass(c.abnormal ? "danger" : "ok")}>
                  {c.label}: {c.detail} — {c.abnormal ? "abnormal" : "normal"}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* Orthostatic */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[hsl(16_100%_50%)]">
            <Stethoscope className="h-4 w-4" />
            <ReqTip id="orthostatic" title="Orthostatic (stand / tilt)" />
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field id="can-ssbp" label="Supine SBP" unit="mmHg" field="supineSbp" />
            <Field id="can-sdbp" label="Supine DBP" unit="mmHg" field="supineDbp" />
            <Field id="can-shr" label="Supine HR" unit="bpm" field="supineHr" />
            <Field id="can-usbp3" label="Lowest SBP ≤3 min" unit="mmHg" field="uprightSbp3" />
            <Field id="can-udbp3" label="Lowest DBP ≤3 min" unit="mmHg" field="uprightDbp3" />
            <Field id="can-uhr" label="Peak upright HR" unit="bpm" field="uprightHrMax" />
            <Field id="can-usbpl" label="Lowest SBP >3 min" unit="mmHg" field="uprightSbpLate" />
            <Field id="can-udbpl" label="Lowest DBP >3 min" unit="mmHg" field="uprightDbpLate" />
          </div>
          <div className="flex flex-wrap gap-2">
            {result.sbpDrop3 !== null && (
              <Badge variant="outline" className={toneClass(result.ohPresent ? "danger" : "ok")}>
                ΔSBP {result.sbpDrop3} / ΔDBP {result.dbpDrop3 ?? "–"} mmHg at ≤3 min
              </Badge>
            )}
            {result.hrIncrease !== null && (
              <Badge variant="outline" className={toneClass(result.attenuatedHr ? "warn" : "neutral")}>
                ΔHR upright {result.hrIncrease} bpm{result.attenuatedHr ? " (attenuated <15)" : ""}
              </Badge>
            )}
            {result.hrSbpRatio !== null && (
              <Badge variant="outline" className={toneClass(result.hrSbpRatio < 0.5 ? "warn" : "neutral")}>
                ΔHR/ΔSBP {result.hrSbpRatio.toFixed(2)} bpm/mmHg
              </Badge>
            )}
            {result.ohPresent && (
              <Badge variant="outline" className={toneClass("danger")}>
                Orthostatic hypotension present
              </Badge>
            )}
            {result.delayedOh && (
              <Badge variant="outline" className={toneClass("warn")}>
                Delayed OH (&gt;3 min)
              </Badge>
            )}
            {result.neurogenicOh && (
              <Badge variant="outline" className={toneClass("danger")}>
                Neurogenic OH pattern supported (not diagnostic)
              </Badge>
            )}
            {result.potsPattern && (
              <Badge variant="outline" className={toneClass("warn")}>
                POTS physiologic pattern (≥{result.potsThreshold} bpm, no OH)
              </Badge>
            )}
          </div>
        </section>

        <Separator />

        {/* Sudomotor */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[hsl(200_80%_45%)]">
            <Droplets className="h-4 w-4" />
            <ReqTip id="sudomotor" title="Sudomotor (Sudoscan ESC)" />
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field id="can-hesc" label="Hand mean ESC" unit="µS" field="handEsc" />
            <Field id="can-hlln" label="Hand LLN" unit="µS" field="handLln" />
            <Field id="can-fesc" label="Foot mean ESC" unit="µS" field="footEsc" />
            <Field id="can-flln" label="Foot LLN" unit="µS" field="footLln" />
          </div>
          <p className="text-xs text-muted-foreground">
            <Info className="inline h-3.5 w-3.5 mr-1 align-[-2px]" />
            Standard generalized lower limit of normal for Sudoscan is <strong>60 µS</strong> (palms and soles). Where device- or
            laboratory-specific norms are unavailable, 60 µS may be used as the default LLN; interpret with age/sex norms when possible.
          </p>
          {((result.handPct !== null && s.handLln === null) || (result.footPct !== null && s.footLln === null)) && (
            <p className="text-[11px] text-muted-foreground">
              Leave the LLN fields blank to use the 60 µS default automatically.
            </p>
          )}
          {(result.handPct !== null || result.footPct !== null) && (
            <div className="flex flex-wrap gap-2">
              {result.handPct !== null && (
                <Badge variant="outline" className={toneClass(result.handPct < 100 ? "danger" : "ok")}>
                  Hand {result.handPct.toFixed(0)}% of LLN{result.handLlnUsedDefault ? " (60 µS default)" : ""}
                </Badge>
              )}
              {result.footPct !== null && (
                <Badge variant="outline" className={toneClass(result.footPct < 100 ? "danger" : "ok")}>
                  Foot {result.footPct.toFixed(0)}% of LLN{result.footLlnUsedDefault ? " (60 µS default)" : ""}
                </Badge>
              )}
            </div>
          )}
        </section>

        <Separator />

        {/* Results */}
        <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">CAN stage:</span>
            <Badge variant="outline" className={`${toneClass(result.canTone)} text-sm px-3 py-1`}>
              {result.canStage}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {result.abnormalCount} of {result.testedCount} reflex tests abnormal · staged separately, adds no mCASS points
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Cardiovagal /3", value: result.cardiovagal },
              { label: "Adrenergic /4", value: result.adrenergic },
              { label: "Sudomotor /3", value: result.sudomotor },
            ].map((d) => (
              <div key={d.label} className="rounded-lg border bg-background p-3 text-center">
                <div className="text-2xl font-bold">{d.value ?? "–"}</div>
                <div className="text-[11px] text-muted-foreground">{d.label}</div>
              </div>
            ))}
            <div className="rounded-lg border-2 border-[hsl(280_75%_60%/0.4)] bg-background p-3 text-center">
              <div className="text-2xl font-bold text-[hsl(280_75%_60%)]">{result.total}/10</div>
              <div className="text-[11px] text-muted-foreground">
                mCASS {result.complete ? "total" : "(partial)"}
              </div>
            </div>
          </div>
          <p className="text-sm">
            <span className="font-semibold">Severity:</span> {result.severity}
            {!result.complete && " — partial profile, domains with missing data scored as 0"}
          </p>

          {result.warnings.length > 0 && (
            <ul className="space-y-2">
              {result.warnings.map((w) => (
                <li key={w} className="flex gap-2 text-xs text-[hsl(28_100%_40%)]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            mCASS is a local modified CASS-derived framework; the Sudoscan-derived sudomotor component is not
            interchangeable with QSART or thermoregulatory sweat testing, so this output must not be reported as a formal
            Mayo CASS. Suggested domain scores require clinician verification against raw data, quality and age/sex norms.
            Do not change medication based on this tool.
          </p>

          <Button
            variant="outline"
            className="h-11"
            onClick={() => setS(EMPTY)}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset CAN mini app
          </Button>
        </section>
      </CardContent>
      </CollapsibleContent>
    </Card>
    </Collapsible>
  );
};

export default CanMiniApp;
