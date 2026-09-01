import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Download,
  HeartPulse,
  Info,
  Printer,
  RotateCcw,
  Stethoscope,
  Waves,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AGE_GROUPS,
  LabOverrides,
  QSART_SITES,
  QsartSite,
  Sex,
  SUDOSCAN_GUIDE,
  applyOverride,
  classifyAgainst,
  getAgeGroup,
  getQsartRange,
  sudoscanBand,
} from "@/lib/autonomicNorms";
import {
  computeAdrenergic,
  computeCanStage,
  computeCardiovagal,
  computeMcassTotal,
  computeOrtho,
  computePattern,
  computePots,
  computeSudomotor,
} from "@/lib/mcassScoring";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

type Num = number | "";

interface Reading {
  t: number; // minutes; 0 = supine
  sbp: Num;
  dbp: Num;
  hr: Num;
  symptoms: string[];
}

interface State {
  name: string;
  age: Num;
  sex: Sex | "";
  date: string;
  indication: string;
  medications: string;
  confounders: Record<string, boolean>;

  // cardiovagal
  hrdb: Num;
  ei: Num;
  vr: Num;
  ratio3015: Num;
  ratio3015LLN: Num;

  // adrenergic
  latePhaseII: string;
  phaseIV: string;
  prt100: Num;
  prt50: Num;

  // orthostatic
  readings: Reading[];
  baselineHypertensive: boolean;
  potsSymptomsReproduced: boolean;
  competingCauses: string;

  // sudomotor
  sudoMode: "sudoscan" | "qsart";
  sudoscan: { rHand: Num; lHand: Num; rFoot: Num; lFoot: Num };
  /** Merged from the CAN Mini App: optional patient/device-specific LLN override (default 60 µS). */
  sudoscanLln: { hand: Num; foot: Num };
  qsart: Record<QsartSite, Num>;

  notes: string;
  /** Optional laboratory-specific LLN/ULN overrides; take precedence over the Indian dataset. */
  labOverrides: LabOverrides;
}

const CONFOUNDERS: { key: string; label: string }[] = [
  { key: "beta_blocker", label: "Beta-blocker" },
  { key: "non_dhp_ccb", label: "Non-dihydropyridine CCB" },
  { key: "ivabradine", label: "Ivabradine" },
  { key: "digoxin", label: "Digoxin" },
  { key: "atrial_fibrillation", label: "Atrial fibrillation" },
  { key: "pacemaker", label: "Pacemaker" },
  { key: "dehydration", label: "Dehydration" },
  { key: "acute_illness", label: "Acute illness" },
];

/** Merged from the CAN Mini App: generic age-only (non-sex-specific) lower limit for
 *  deep-breathing HR variation, retained as a supplementary reference alongside the
 *  age- and sex-adjusted Indian dataset (HRDB_NORMS) used above. */
const genericDeepBreathingLln = (age: number | null) => {
  if (age === null) return 10;
  if (age < 20) return 18;
  if (age < 30) return 15;
  if (age < 40) return 13;
  if (age < 50) return 11;
  if (age < 60) return 9;
  if (age < 70) return 7;
  return 5;
};

/** Merged from the CAN Mini App: protocol/performance notes shown on hover. */
const TEST_REQS: Record<string, string> = {
  hrdb:
    "Deep-breathing ΔHR: 6 breaths/min (5 s in, 5 s out) for ~1 min; supine or seated, continuous ECG; avoid talking/coughing/straining; use age- and sex-adjusted norms (LLN declines with age).",
  ei:
    "E:I ratio: mean longest expiratory NN interval ÷ mean shortest inspiratory NN interval across ≥6 paced cycles at 6 breaths/min; sinus rhythm preferred; chronotropic/anticholinergic drugs confound the result.",
  vr:
    "Valsalva ratio: strain at ~40 mmHg for ~15 s (blow into manometer), usually ×2–3 trials; ratio = longest post-strain RR ÷ shortest strain RR; beat-to-beat BP (late phase II, phase IV overshoot) informs adrenergic scoring.",
  ratio3015:
    "30:15 ratio: after active standing, longest RR near the 30th beat ÷ shortest RR near the 15th beat; requires continuous ECG and prompt upright transition; use laboratory age-adjusted norms.",
  orthostatic:
    "Stand/tilt: supine rest ≥5 min (10–15 min preferred), then active stand or head-up tilt; record BP/HR at 1, 3, 5 min (continue to 10 min if POTS suspected). OH = sustained SBP fall ≥20 or DBP fall ≥10 mmHg within 3 min. Use fall precautions; supervised; terminate for syncope, presyncope, chest pain, or arrhythmia.",
  sudomotor:
    "Sudoscan ESC: electrochemical skin conductance of palms and soles in µS; standard generalized LLN = 60 µS. Not equivalent to QSART/thermoregulatory sweat testing. Interpret with device/age/sex-specific norms; poor contact, callus, edema, or skin disease limit validity.",
};

/** Merged from the CAN Mini App: tooltip-wrapped field label. */
const ReqTip = ({ id, title }: { id: string; title: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help">
        {title}
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm text-xs leading-relaxed">{TEST_REQS[id]}</TooltipContent>
  </Tooltip>
);

const SYMPTOMS = [
  "Light-headedness",
  "Weakness",
  "Faintness",
  "Presyncope",
  "Syncope",
];

const TIMEPOINTS = [0, 1, 3, 5, 10];

const STORAGE_KEY = "syncdx-mcass-analyzer";

const initialState = (): State => ({
  name: "",
  age: "",
  sex: "",
  date: new Date().toISOString().slice(0, 10),
  indication: "",
  medications: "",
  confounders: {},
  hrdb: "",
  ei: "",
  vr: "",
  ratio3015: "",
  ratio3015LLN: "",
  latePhaseII: "",
  phaseIV: "",
  prt100: "",
  prt50: "",
  readings: TIMEPOINTS.map((t) => ({ t, sbp: "", dbp: "", hr: "", symptoms: [] })),
  baselineHypertensive: false,
  potsSymptomsReproduced: false,
  competingCauses: "",
  sudoMode: "sudoscan",
  sudoscan: { rHand: "", lHand: "", rFoot: "", lFoot: "" },
  sudoscanLln: { hand: "", foot: "" },
  qsart: { forearm: "", proximal_leg: "", distal_leg: "", foot: "" },
  notes: "",
  labOverrides: {},
});

const num = (v: string): Num => (v === "" ? "" : Number(v));
const isNum = (v: Num): v is number => v !== "" && !Number.isNaN(Number(v));

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "unknown") return <Badge variant="outline">—</Badge>;
  if (status === "normal") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Normal</Badge>;
  if (status === "high") return <Badge className="bg-amber-500 hover:bg-amber-500">Borderline / high</Badge>;
  return <Badge variant="destructive">Abnormal (below LLN)</Badge>;
};

const NormField = ({
  label,
  unit,
  value,
  onChange,
  range,
  status,
  hint,
  note,
}: {
  label: React.ReactNode;
  unit?: string;
  value: Num;
  onChange: (v: Num) => void;
  range: { LLN: number; ULN: number } | null;
  status: string;
  hint?: string;
  note?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {unit && <span className="text-muted-foreground font-normal">({unit})</span>}
    </Label>
    <Input
      type="number"
      step="0.01"
      inputMode="decimal"
      value={value === "" ? "" : value}
      onChange={(e) => onChange(num(e.target.value))}
      placeholder={range ? `LLN ${range.LLN}` : "—"}
    />
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>
        {range ? `Reference ${range.LLN} – ${range.ULN}` : hint || "Select age & sex for norms"}
      </span>
      <StatusBadge status={status} />
    </div>
    {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const McassMiniApp = () => {
  const [s, setS] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...initialState(), ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return initialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));

  /** Sets/clears a lab-specific LLN/ULN override for a scalar test. */
  const setOverride = (
    test: "hrdb" | "ei" | "vr" | "prt100" | "prt50",
    field: "LLN" | "ULN",
    value: Num
  ) =>
    setS((p) => ({
      ...p,
      labOverrides: {
        ...p.labOverrides,
        [test]: { ...p.labOverrides[test], [field]: value === "" ? undefined : Number(value) },
      },
    }));

  /** Sets/clears a lab-specific LLN/ULN override for a QSART site. */
  const setQsartOverride = (site: QsartSite, field: "LLN" | "ULN", value: Num) =>
    setS((p) => ({
      ...p,
      labOverrides: {
        ...p.labOverrides,
        qsart: {
          ...p.labOverrides.qsart,
          [site]: { ...p.labOverrides.qsart?.[site], [field]: value === "" ? undefined : Number(value) },
        },
      },
    }));

  const ageGroup = getAgeGroup(s.age);
  const sex = s.sex || "";

  /* -------- Shared scoring (identical to Autonomic Testing section) ------- */
  const cardiovagal = computeCardiovagal({
    age: s.age,
    sex,
    hrdb: s.hrdb,
    ei: s.ei,
    vr: s.vr,
    ratio3015: s.ratio3015,
    ratio3015LLN: s.ratio3015LLN,
    overrides: s.labOverrides,
  });
  const { hrdbRange, eiRange, vrRange, hrdbStatus, eiStatus, vrStatus, r3015Status, ratio3015Fallback } =
    cardiovagal;

  const ortho = computeOrtho(s.readings, s.baselineHypertensive, s.age);

  const adrenergic = computeAdrenergic({
    age: s.age,
    sex,
    latePhaseII: s.latePhaseII,
    phaseIV: s.phaseIV,
    prt100: s.prt100,
    prt50: s.prt50,
    ortho,
    overrides: s.labOverrides,
  });
  const { prt100Range, prt50Range, prt100Status, prt50Status } = adrenergic;

  const sudomotor = computeSudomotor({
    age: s.age,
    sex,
    sudoMode: s.sudoMode,
    sudoscan: s.sudoscan,
    sudoscanLln: s.sudoscanLln,
    qsart: s.qsart,
    overrides: s.labOverrides,
  });

  /* --------------------------- Composite --------------------------- */
  const { total, severity } = computeMcassTotal(cardiovagal.score, adrenergic.score, sudomotor.score);
  const canStage = computeCanStage(hrdbStatus, vrStatus, r3015Status, ortho.classical);
  const pots = computePots(ortho);
  const pattern = computePattern(cardiovagal.score, adrenergic.score, sudomotor.score);

  const activeConfounders = CONFOUNDERS.filter((c) => s.confounders[c.key]).map((c) => c.label);

  /** Merged from the CAN Mini App: quick data-quality/confounder warnings. */
  const warnings = useMemo(() => {
    const w: string[] = [];
    const chronotropicKeys = ["beta_blocker", "non_dhp_ccb", "ivabradine", "digoxin"];
    if (chronotropicKeys.some((k) => s.confounders[k]))
      w.push("Chronotropic medication may confound HR-based cardiovagal indices.");
    if (s.confounders.atrial_fibrillation || s.confounders.pacemaker)
      w.push("Non-sinus / paced rhythm: HRV and cardiovagal reflex indices may be uninterpretable.");
    if (cardiovagal.tested > 0 && cardiovagal.tested < 2)
      w.push("Fewer than two cardiovagal tests entered; CAN staging requires \u22652 interpretable tests.");
    if (sudomotor.handLlnUsedDefault || sudomotor.footLlnUsedDefault)
      w.push("Sudoscan LLN left blank \u2014 standard generalized 60 \u00b5S default used. Confirm against device/laboratory norms if available.");
    if (s.baselineHypertensive && ((ortho.maxSbpFall ?? 0) >= 30 || (ortho.maxDbpFall ?? 0) >= 15))
      w.push("Substantial orthostatic fall on a hypertensive supine baseline (supine hypertension with OH).");
    return w;
  }, [s.confounders, cardiovagal.tested, sudomotor.handLlnUsedDefault, sudomotor.footLlnUsedDefault, s.baselineHypertensive, ortho.maxSbpFall, ortho.maxDbpFall]);

  /* --------------------------- Report ------------------------------ */
  const reportLines = useMemo(() => {
    const lines = [
      "MODIFIED COMPOSITE AUTONOMIC SEVERITY SCORE",
      "",
      `Patient: ${s.name || "—"}`,
      `Age/Sex: ${s.age || "—"} / ${s.sex || "—"}${ageGroup ? ` (reference group ${ageGroup})` : ""}`,
      `Date: ${s.date || "—"}`,
      `Indication: ${s.indication || "—"}`,
      "",
      `Cardiovagal score: ${cardiovagal.score} / 3`,
      `Adrenergic score: ${adrenergic.score} / 4`,
      `Sudomotor score: ${sudomotor.score} / 3`,
      `mCASS total: ${total} / 10`,
      `Severity: ${severity}`,
      "",
      `HRDB: ${s.hrdb || "—"} bpm (${hrdbStatus})`,
      `E:I ratio: ${s.ei || "—"} (${eiStatus})`,
      `Valsalva ratio: ${s.vr || "—"} (${vrStatus})`,
      `30:15 ratio: ${s.ratio3015 || "—"} (${r3015Status})`,
      `Valsalva BP: ${adrenergic.flags.length ? adrenergic.flags.join("; ") : "no abnormality recorded"}`,
      "",
      `Orthostatic hypotension: ${
        ortho.classical ? "Classical OH" : ortho.delayed ? "Delayed OH" : "Not demonstrated"
      }`,
      `Maximum BP fall: ${ortho.maxSbpFall ?? "—"} / ${ortho.maxDbpFall ?? "—"} mmHg`,
      `Maximum HR increase: ${ortho.maxHrRise ?? "—"} bpm`,
      `HR compensation: ${ortho.attenuatedHR ? "Attenuated (<15 bpm with OH)" : "Preserved / not applicable"}`,
      `Neurogenic OH phenotype: ${ortho.attenuatedHR ? "Supported" : "Not supported"}`,
      `POTS physiological criterion: ${pots.met ? `Met (threshold ${pots.threshold} bpm, at ${pots.timeToCriterion} min)` : "Not met"}`,
      `CAN stage: ${canStage.stage} (${canStage.count} abnormal cardiovagal test(s))`,
      `Autonomic pattern: ${pattern}`,
      "",
      `Confounders: ${activeConfounders.length ? activeConfounders.join(", ") : "none recorded"}`,
      `Medications: ${s.medications || "—"}`,
      `Notes: ${s.notes || "—"}`,
      "",
      ...(warnings.length ? ["Warnings:", ...warnings.map((w) => `- ${w}`), ""] : []),
      "Disclaimer: This is a modified CASS-derived framework. Sudoscan-derived sudomotor scoring is not",
      "interchangeable with QSART/TST-based original CASS scoring. Normative values are from an Indian adult",
      "reference dataset; laboratory-specific validated norms take precedence.",
    ];
    return lines;
  }, [
    s,
    ageGroup,
    cardiovagal.score,
    adrenergic,
    sudomotor.score,
    total,
    severity,
    hrdbStatus,
    eiStatus,
    vrStatus,
    r3015Status,
    ortho,
    pots,
    canStage,
    pattern,
    activeConfounders,
    warnings,
  ]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text(reportLines[0], 14, 16);
    doc.setFontSize(10);
    let y = 26;
    reportLines.slice(1).forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 16;
      }
      doc.text(line, 14, y);
      y += 6;
    });
    doc.save(`mCASS-report-${s.name || "patient"}.pdf`);
    toast.success("mCASS report exported");
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportLines.join("\n"));
    toast.success("Report copied to clipboard");
  };

  const reset = () => {
    setS(initialState());
    toast.success("Analyzer reset");
  };

  const updateReading = (t: number, patch: Partial<Reading>) =>
    setS((p) => ({
      ...p,
      readings: p.readings.map((rd) => (rd.t === t ? { ...rd, ...patch } : rd)),
    }));

  /* --------------------------- Render ------------------------------ */
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HeartPulse className="h-5 w-5 text-primary" />
              CAN / mCASS Autonomic Function Analyzer
            </CardTitle>
            <CardDescription>
              Combined Cardiac Autonomic Neuropathy (CAN) staging and Autonomic Function / mCASS
              analyzer. Age- and sex-adjusted normative values with mCASS /10, orthostatic
              classification, POTS screening and CAN staging. Decision support only — not the
              validated Mayo CASS.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyReport}>
              <ClipboardList className="mr-1.5 h-4 w-4" /> Copy report
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
            <Button size="sm" onClick={exportPdf}>
              <Download className="mr-1.5 h-4 w-4" /> PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="cardiovagal">Cardiovagal</TabsTrigger>
            <TabsTrigger value="adrenergic">Adrenergic</TabsTrigger>
            <TabsTrigger value="orthostatic">Orthostatic</TabsTrigger>
            <TabsTrigger value="sudomotor">Sudomotor</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          {/* -------------------- Patient -------------------- */}
          <TabsContent value="patient" className="space-y-5 pt-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Name / ID</Label>
                <Input value={s.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  value={s.age === "" ? "" : s.age}
                  onChange={(e) => set("age", num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sex</Label>
                <Select value={s.sex} onValueChange={(v) => set("sex", v as Sex)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={s.date} onChange={(e) => set("date", e.target.value)} />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Reference selection</AlertTitle>
              <AlertDescription className="text-sm">
                {ageGroup && sex ? (
                  <>
                    Using Indian adult normative dataset, age group <strong>{ageGroup}</strong>,{" "}
                    <strong>{sex}</strong>. Laboratory-specific validated norms take precedence where
                    available.
                  </>
                ) : (
                  <>
                    Enter age (≥20 y) and sex to auto-select normative values. Available age groups:{" "}
                    {AGE_GROUPS.join(", ")}.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Indication</Label>
                <Input value={s.indication} onChange={(e) => set("indication", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Medications</Label>
                <Input value={s.medications} onChange={(e) => set("medications", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Confounders</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {CONFOUNDERS.map((c) => (
                  <div key={c.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`conf-${c.key}`}
                      checked={!!s.confounders[c.key]}
                      onCheckedChange={(v) =>
                        set("confounders", { ...s.confounders, [c.key]: !!v })
                      }
                    />
                    <Label htmlFor={`conf-${c.key}`} className="cursor-pointer font-normal">
                      {c.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {activeConfounders.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Interpret with caution</AlertTitle>
                <AlertDescription className="text-sm">
                  {activeConfounders.join(", ")} may invalidate heart-rate–based indices and
                  orthostatic responses.
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl border p-4 space-y-4">
              <div>
                <Label className="text-base font-semibold">Laboratory norms override</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your own lab-specific LLN/ULN to replace the Indian age/sex dataset for a
                  given test. Leave blank to keep using the dataset (or the age-band 30:15
                  fallback). Applies identically in the Autonomic Testing section.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["hrdb", "HRDB (bpm)", hrdbRange],
                    ["ei", "E:I ratio", eiRange],
                    ["vr", "Valsalva ratio", vrRange],
                    ["prt100", "PRT100 (s)", prt100Range],
                    ["prt50", "PRT50 (s)", prt50Range],
                  ] as const
                ).map(([key, label, range]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`LLN${range ? ` (${range.LLN})` : ""}`}
                        value={s.labOverrides[key]?.LLN ?? ""}
                        onChange={(e) => setOverride(key, "LLN", num(e.target.value))}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`ULN${range ? ` (${range.ULN})` : ""}`}
                        value={s.labOverrides[key]?.ULN ?? ""}
                        onChange={(e) => setOverride(key, "ULN", num(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
                {QSART_SITES.map((site) => (
                  <div key={site.key} className="space-y-1.5">
                    <Label className="text-xs">QSART {site.label} (µL)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="LLN"
                        value={s.labOverrides.qsart?.[site.key]?.LLN ?? ""}
                        onChange={(e) => setQsartOverride(site.key, "LLN", num(e.target.value))}
                      />
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="ULN"
                        value={s.labOverrides.qsart?.[site.key]?.ULN ?? ""}
                        onChange={(e) => setQsartOverride(site.key, "ULN", num(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* -------------------- Cardiovagal -------------------- */}
          <TabsContent value="cardiovagal" className="space-y-5 pt-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <NormField
                label={<ReqTip id="hrdb" title="HRDB (ΔHR deep breathing)" />}
                unit="bpm"
                value={s.hrdb}
                onChange={(v) => set("hrdb", v)}
                range={hrdbRange}
                status={hrdbStatus}
                note={`Generic age-only reference (non-Indian, non-sex-specific) LLN ≈ ${genericDeepBreathingLln(
                  isNum(s.age) ? Number(s.age) : null
                )} bpm — prefer the age/sex range above when available.`}
              />
              <NormField
                label={<ReqTip id="ei" title="E:I ratio" />}
                value={s.ei}
                onChange={(v) => set("ei", v)}
                range={eiRange}
                status={eiStatus}
              />
              <NormField
                label={<ReqTip id="vr" title="Valsalva ratio" />}
                value={s.vr}
                onChange={(v) => set("vr", v)}
                range={vrRange}
                status={vrStatus}
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  <ReqTip id="ratio3015" title="30:15 standing ratio" />
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={s.ratio3015 === "" ? "" : s.ratio3015}
                  onChange={(e) => set("ratio3015", num(e.target.value))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Laboratory LLN (preferred, if available)"
                  value={s.ratio3015LLN === "" ? "" : s.ratio3015LLN}
                  onChange={(e) => set("ratio3015LLN", num(e.target.value))}
                />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {isNum(s.ratio3015LLN)
                      ? "Using laboratory LLN"
                      : ratio3015Fallback
                      ? `Provisional fallback: normal ≥${ratio3015Fallback.normalLLN}, borderline ≥${ratio3015Fallback.borderlineLow}, else abnormal`
                      : "Enter age or a laboratory LLN"}
                  </span>
                  <StatusBadge status={r3015Status} />
                </div>
                {!isNum(s.ratio3015LLN) && (
                  <p className="text-[11px] text-muted-foreground">
                    No validated India-specific age-stratified 30:15 reference exists. This
                    age-band cut-off is provisional, derived from published age-adjusted
                    Ewing-test literature (not Indian-specific) — use your lab's own age/sex
                    norms when available.
                  </p>
                )}
              </div>
            </div>

            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Cardiovagal score {cardiovagal.score} / 3
              </Badge>
              <span className="text-sm text-muted-foreground">
                {cardiovagal.tested} interpretable test(s) · {cardiovagal.mild} mild,{" "}
                {cardiovagal.severe} clearly abnormal
              </span>
            </div>
          </TabsContent>

          {/* -------------------- Adrenergic -------------------- */}
          <TabsContent value="adrenergic" className="space-y-5 pt-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Valsalva late phase II</Label>
                <Select value={s.latePhaseII} onValueChange={(v) => set("latePhaseII", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal — recovery toward baseline</SelectItem>
                    <SelectItem value="reduced">Reduced recovery</SelectItem>
                    <SelectItem value="absent">Absent recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valsalva phase IV</Label>
                <Select value={s.phaseIV} onValueChange={(v) => set("phaseIV", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal — overshoot preserved</SelectItem>
                    <SelectItem value="reduced">Reduced overshoot</SelectItem>
                    <SelectItem value="absent">Absent overshoot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <NormField
                label="PRT100 (pressure recovery time)"
                unit="s"
                value={s.prt100}
                onChange={(v) => set("prt100", v)}
                range={prt100Range}
                status={prt100Status === "high" ? "low" : prt100Status}
                hint="Prolonged = abnormal"
              />
              <NormField
                label="PRT50"
                unit="s"
                value={s.prt50}
                onChange={(v) => set("prt50", v)}
                range={prt50Range}
                status={prt50Status === "high" ? "low" : prt50Status}
                hint="Prolonged = abnormal"
              />
            </div>

            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Adrenergic score {adrenergic.score} / 4
              </Badge>
              <span className="text-sm text-muted-foreground">
                {adrenergic.flags.length ? adrenergic.flags.join("; ") : "No Valsalva BP abnormality recorded"}
              </span>
            </div>
          </TabsContent>

          {/* -------------------- Orthostatic -------------------- */}
          <TabsContent value="orthostatic" className="space-y-5 pt-5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="htn-baseline"
                checked={s.baselineHypertensive}
                onCheckedChange={(v) => set("baselineHypertensive", !!v)}
              />
              <Label htmlFor="htn-baseline" className="cursor-pointer font-normal">
                Hypertensive baseline (≥150/90) — apply substantial-fall thresholds (SBP ≥30 / DBP ≥15)
              </Label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">SBP</th>
                    <th className="py-2 pr-3">DBP</th>
                    <th className="py-2 pr-3">HR</th>
                    <th className="py-2">Symptoms</th>
                  </tr>
                </thead>
                <tbody>
                  {s.readings.map((rd) => (
                    <tr key={rd.t} className="border-b align-top">
                      <td className="py-2 pr-3 font-medium">{rd.t === 0 ? "Supine" : `${rd.t} min`}</td>
                      {(["sbp", "dbp", "hr"] as const).map((f) => (
                        <td key={f} className="py-2 pr-3">
                          <Input
                            type="number"
                            className="w-24"
                            value={rd[f] === "" ? "" : (rd[f] as number)}
                            onChange={(e) => updateReading(rd.t, { [f]: num(e.target.value) } as any)}
                          />
                        </td>
                      ))}
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {SYMPTOMS.map((sym) => (
                            <button
                              key={sym}
                              type="button"
                              disabled={rd.t === 0}
                              onClick={() =>
                                updateReading(rd.t, {
                                  symptoms: rd.symptoms.includes(sym)
                                    ? rd.symptoms.filter((x) => x !== sym)
                                    : [...rd.symptoms, sym],
                                })
                              }
                              className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                                rd.symptoms.includes(sym)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-muted"
                              }`}
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5">
              <Label>Competing causes for tachycardia (anaemia, fever, deconditioning, anxiety…)</Label>
              <Input
                value={s.competingCauses}
                onChange={(e) => set("competingCauses", e.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Max SBP fall</p>
                <p className="text-lg font-semibold">{ortho.maxSbpFall ?? "—"} mmHg</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Max DBP fall</p>
                <p className="text-lg font-semibold">{ortho.maxDbpFall ?? "—"} mmHg</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Max HR rise</p>
                <p className="text-lg font-semibold">{ortho.maxHrRise ?? "—"} bpm</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Classification</p>
                <p className="text-lg font-semibold">
                  {ortho.classical ? "Classical OH" : ortho.delayed ? "Delayed OH" : "No OH"}
                </p>
              </div>
            </div>

            {ortho.attenuatedHR && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Neurogenic pattern supported</AlertTitle>
                <AlertDescription className="text-sm">
                  Orthostatic hypotension with attenuated HR compensation (&lt;15 bpm). Interpret with
                  confounders (rate-limiting drugs, pacing, arrhythmia).
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>POTS physiological criterion</AlertTitle>
              <AlertDescription className="text-sm">
                Threshold {pots.threshold} bpm within 10 minutes ·{" "}
                {pots.met
                  ? `Met at ${pots.timeToCriterion} min`
                  : pots.note || "Not met"}{" "}
                · Symptoms reproduced:{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => set("potsSymptomsReproduced", !s.potsSymptomsReproduced)}
                >
                  {s.potsSymptomsReproduced ? "yes" : "no"}
                </button>
                . POTS does not contribute to the mCASS total.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* -------------------- Sudomotor -------------------- */}
          <TabsContent value="sudomotor" className="space-y-5 pt-5">
            <div className="space-y-1.5">
              <Label>
                <ReqTip id="sudomotor" title="Test used" />
              </Label>
              <Select
                value={s.sudoMode}
                onValueChange={(v) => set("sudoMode", v as State["sudoMode"])}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sudoscan">Sudoscan (electrochemical skin conductance)</SelectItem>
                  <SelectItem value="qsart">QSART (preferred)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {s.sudoMode === "sudoscan" ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  {(
                    [
                      ["rHand", "Right palm"],
                      ["lHand", "Left palm"],
                      ["rFoot", "Right sole"],
                      ["lFoot", "Left sole"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <Label>
                        {label} <span className="font-normal text-muted-foreground">(µS)</span>
                      </Label>
                      <Input
                        type="number"
                        value={s.sudoscan[key] === "" ? "" : (s.sudoscan[key] as number)}
                        onChange={(e) =>
                          set("sudoscan", { ...s.sudoscan, [key]: num(e.target.value) })
                        }
                      />
                      <StatusBadge status={sudoscanBand(s.sudoscan[key]) === "high" ? "high" : sudoscanBand(s.sudoscan[key])} />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hand LLN override <span className="font-normal text-muted-foreground">(µS, default 60)</span></Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={s.sudoscanLln.hand === "" ? "" : (s.sudoscanLln.hand as number)}
                      onChange={(e) => set("sudoscanLln", { ...s.sudoscanLln, hand: num(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Foot LLN override <span className="font-normal text-muted-foreground">(µS, default 60)</span></Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={s.sudoscanLln.foot === "" ? "" : (s.sudoscanLln.foot as number)}
                      onChange={(e) => set("sudoscanLln", { ...s.sudoscanLln, foot: num(e.target.value) })}
                    />
                  </div>
                </div>
                {(sudomotor.handPct !== null || sudomotor.footPct !== null) && (
                  <div className="flex flex-wrap gap-2">
                    {sudomotor.handPct !== null && (
                      <Badge variant="outline">
                        Hand {sudomotor.handPct.toFixed(0)}% of LLN
                        {sudomotor.handLlnUsedDefault ? " (60 µS default)" : ""}
                      </Badge>
                    )}
                    {sudomotor.footPct !== null && (
                      <Badge variant="outline">
                        Foot {sudomotor.footPct.toFixed(0)}% of LLN
                        {sudomotor.footLlnUsedDefault ? " (60 µS default)" : ""}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="rounded-lg border p-3 text-sm">
                  <p className="mb-1 font-medium">Practical interpretation guide</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {SUDOSCAN_GUIDE.map((g) => (
                      <li key={g.band}>
                        <strong>{g.band}</strong> — {g.meaning}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {QSART_SITES.map((site) => {
                  const range = applyOverride(getQsartRange(s.age, sex, site.key), s.labOverrides.qsart?.[site.key]);
                  return (
                    <NormField
                      key={site.key}
                      label={site.label}
                      unit="µL"
                      value={s.qsart[site.key]}
                      onChange={(v) => set("qsart", { ...s.qsart, [site.key]: v })}
                      range={range}
                      status={classifyAgainst(s.qsart[site.key], range)}
                    />
                  );
                })}
              </div>
            )}

            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Sudomotor score {sudomotor.score} / 3
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sudomotor.tested ? sudomotor.detail.join(" · ") : "No sudomotor data entered"}
              </span>
            </div>
          </TabsContent>

          {/* -------------------- Report -------------------- */}
          <TabsContent value="report" className="space-y-5 pt-5">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { label: "Cardiovagal", value: `${cardiovagal.score} / 3` },
                { label: "Adrenergic", value: `${adrenergic.score} / 4` },
                { label: "Sudomotor", value: `${sudomotor.score} / 3` },
                { label: "mCASS total", value: `${total} / 10` },
              ].map((b) => (
                <div key={b.label} className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">{b.label}</p>
                  <p className="text-2xl font-bold">{b.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Severity</p>
                <p className="font-semibold">{severity}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">CAN stage</p>
                <p className="font-semibold">{canStage.stage}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Autonomic pattern</p>
                <p className="font-semibold">{pattern}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Clinical notes</Label>
              <Textarea
                value={s.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
              {reportLines.join("\n")}
            </pre>

            {warnings.length > 0 && (
              <ul className="space-y-2">
                {warnings.map((w) => (
                  <li key={w} className="flex gap-2 text-xs text-[hsl(28_100%_40%)]">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}

            <Alert>
              <Stethoscope className="h-4 w-4" />
              <AlertTitle>Clinical status</AlertTitle>
              <AlertDescription className="text-sm">
                Modified clinical/research framework — not equivalent to the validated Mayo CASS.
                Pattern classification is supportive and should not be used alone for anatomical
                localization.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default McassMiniApp;
