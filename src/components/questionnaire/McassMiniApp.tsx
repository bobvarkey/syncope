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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AGE_GROUPS,
  EI_NORMS,
  HRDB_NORMS,
  MCASS_SEVERITY,
  PRT100_NORMS,
  PRT50_NORMS,
  QSART_SITES,
  QsartSite,
  Sex,
  SUDOSCAN_GUIDE,
  VALSALVA_RATIO_NORMS,
  classifyAgainst,
  classifyPrt,
  getAgeGroup,
  getQsartRange,
  getRange,
  sudoscanBand,
} from "@/lib/autonomicNorms";

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
  qsart: Record<QsartSite, Num>;

  notes: string;
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
  qsart: { forearm: "", proximal_leg: "", distal_leg: "", foot: "" },
  notes: "",
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
}: {
  label: string;
  unit?: string;
  value: Num;
  onChange: (v: Num) => void;
  range: { LLN: number; ULN: number } | null;
  status: string;
  hint?: string;
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

  const ageGroup = getAgeGroup(s.age);
  const sex = s.sex || "";

  /* --------------------------- Cardiovagal ------------------------- */
  const hrdbRange = getRange(HRDB_NORMS, s.age, sex);
  const eiRange = getRange(EI_NORMS, s.age, sex);
  const vrRange = getRange(VALSALVA_RATIO_NORMS, s.age, sex);
  const prt100Range = getRange(PRT100_NORMS, s.age, sex);
  const prt50Range = getRange(PRT50_NORMS, s.age, sex);

  const hrdbStatus = classifyAgainst(s.hrdb, hrdbRange);
  const eiStatus = classifyAgainst(s.ei, eiRange);
  const vrStatus = classifyAgainst(s.vr, vrRange);
  const prt100Status = classifyPrt(s.prt100, prt100Range);
  const prt50Status = classifyPrt(s.prt50, prt50Range);

  const r3015Status: string = useMemo(() => {
    if (!isNum(s.ratio3015) || !isNum(s.ratio3015LLN)) return "unknown";
    return Number(s.ratio3015) >= Number(s.ratio3015LLN) ? "normal" : "low";
  }, [s.ratio3015, s.ratio3015LLN]);

  const cardiovagal = useMemo(() => {
    // severity per test: 0 normal, 1 mild (within 10% below LLN), 2 clearly abnormal
    const grade = (v: Num, lln: number | null): 0 | 1 | 2 | null => {
      if (!isNum(v) || lln === null) return null;
      const val = Number(v);
      if (val >= lln) return 0;
      return val >= lln * 0.9 ? 1 : 2;
    };
    const grades = [
      grade(s.hrdb, hrdbRange?.LLN ?? null),
      grade(s.ei, eiRange?.LLN ?? null),
      grade(s.vr, vrRange?.LLN ?? null),
      grade(s.ratio3015, isNum(s.ratio3015LLN) ? Number(s.ratio3015LLN) : null),
    ].filter((g): g is 0 | 1 | 2 => g !== null);

    const mild = grades.filter((g) => g === 1).length;
    const severe = grades.filter((g) => g === 2).length;
    let score = 0;
    if (severe >= 2 || (severe >= 1 && mild >= 1)) score = 3;
    else if (severe === 1 || mild >= 2) score = 2;
    else if (mild === 1) score = 1;
    return { score, mild, severe, tested: grades.length };
  }, [s.hrdb, s.ei, s.vr, s.ratio3015, s.ratio3015LLN, hrdbRange, eiRange, vrRange]);

  /* --------------------------- Orthostatic ------------------------- */
  const ortho = useMemo(() => {
    const supine = s.readings.find((x) => x.t === 0);
    const upright = s.readings.filter((x) => x.t > 0);
    if (!supine || !isNum(supine.sbp) || !isNum(supine.dbp)) {
      return {
        available: false,
        maxSbpFall: null as number | null,
        maxDbpFall: null as number | null,
        maxHrRise: null as number | null,
        classical: false,
        delayed: false,
        attenuatedHR: false,
        timeToOH: null as number | null,
        maxSustainedHrRise: null as number | null,
        timeToPots: null as number | null,
        symptoms: [] as string[],
      };
    }
    const sbp0 = Number(supine.sbp);
    const dbp0 = Number(supine.dbp);
    const hr0 = isNum(supine.hr) ? Number(supine.hr) : null;

    const sbpThresh = s.baselineHypertensive && sbp0 >= 150 ? 30 : 20;
    const dbpThresh = s.baselineHypertensive && dbp0 >= 90 ? 15 : 10;

    let maxSbpFall = 0;
    let maxDbpFall = 0;
    let maxHrRise: number | null = null;
    let timeToOH: number | null = null;
    let classical = false;
    let delayed = false;
    let timeToPots: number | null = null;

    upright.forEach((rd) => {
      if (isNum(rd.sbp)) maxSbpFall = Math.max(maxSbpFall, sbp0 - Number(rd.sbp));
      if (isNum(rd.dbp)) maxDbpFall = Math.max(maxDbpFall, dbp0 - Number(rd.dbp));
      if (hr0 !== null && isNum(rd.hr)) {
        const rise = Number(rd.hr) - hr0;
        maxHrRise = maxHrRise === null ? rise : Math.max(maxHrRise, rise);
      }
      const meets =
        (isNum(rd.sbp) && sbp0 - Number(rd.sbp) >= sbpThresh) ||
        (isNum(rd.dbp) && dbp0 - Number(rd.dbp) >= dbpThresh);
      if (meets && timeToOH === null) timeToOH = rd.t;
      if (meets && rd.t <= 3) classical = true;
      if (meets && rd.t > 3) delayed = true;
    });

    const potsThreshold = isNum(s.age) && Number(s.age) >= 12 && Number(s.age) <= 19 ? 40 : 30;
    upright
      .filter((rd) => rd.t <= 10)
      .forEach((rd) => {
        if (hr0 !== null && isNum(rd.hr) && Number(rd.hr) - hr0 >= potsThreshold && timeToPots === null) {
          timeToPots = rd.t;
        }
      });

    return {
      available: true,
      maxSbpFall,
      maxDbpFall,
      maxHrRise,
      classical,
      delayed: delayed && !classical,
      attenuatedHR: (classical || delayed) && maxHrRise !== null && maxHrRise < 15,
      timeToOH,
      maxSustainedHrRise: maxHrRise,
      timeToPots,
      potsThreshold,
      symptoms: Array.from(new Set(upright.flatMap((rd) => rd.symptoms))),
    } as any;
  }, [s.readings, s.baselineHypertensive, s.age]);

  /* --------------------------- Adrenergic -------------------------- */
  const adrenergic = useMemo(() => {
    let valsalvaSeverity = 0;
    const flags: string[] = [];
    if (s.latePhaseII === "reduced") {
      valsalvaSeverity = Math.max(valsalvaSeverity, 1);
      flags.push("Reduced late phase II recovery");
    }
    if (s.latePhaseII === "absent") {
      valsalvaSeverity = 2;
      flags.push("Absent late phase II recovery");
    }
    if (s.phaseIV === "reduced") {
      valsalvaSeverity = Math.max(valsalvaSeverity, 1);
      flags.push("Reduced phase IV overshoot");
    }
    if (s.phaseIV === "absent") {
      valsalvaSeverity = 2;
      flags.push("Absent phase IV overshoot");
    }
    if (prt100Status === "high") {
      valsalvaSeverity = Math.max(valsalvaSeverity, 1);
      flags.push("Prolonged PRT100");
    }
    if (prt50Status === "high") {
      valsalvaSeverity = Math.max(valsalvaSeverity, 1);
      flags.push("Prolonged PRT50");
    }
    if (flags.length >= 2) valsalvaSeverity = Math.max(valsalvaSeverity, 2);

    let score = 0;
    if (ortho.classical) score = 2;
    else if (ortho.delayed) score = 1;

    if (ortho.classical && (ortho.attenuatedHR || valsalvaSeverity >= 1)) score = 3;
    if (ortho.classical && ortho.attenuatedHR && valsalvaSeverity >= 2) score = 4;
    if (!ortho.classical && !ortho.delayed) score = valsalvaSeverity >= 2 ? 2 : valsalvaSeverity;
    score = Math.min(4, score);

    return { score, valsalvaSeverity, flags };
  }, [s.latePhaseII, s.phaseIV, prt100Status, prt50Status, ortho]);

  /* --------------------------- Sudomotor --------------------------- */
  const sudomotor = useMemo(() => {
    let handAbn = false;
    let footAbn = false;
    let handSevere = false;
    let footSevere = false;
    let tested = false;
    const detail: string[] = [];

    if (s.sudoMode === "sudoscan") {
      const hands = [s.sudoscan.rHand, s.sudoscan.lHand].filter(isNum) as number[];
      const feet = [s.sudoscan.rFoot, s.sudoscan.lFoot].filter(isNum) as number[];
      tested = hands.length > 0 || feet.length > 0;
      const worstHand = hands.length ? Math.min(...hands) : null;
      const worstFoot = feet.length ? Math.min(...feet) : null;
      if (worstHand !== null) {
        handAbn = worstHand < 60;
        handSevere = worstHand < 40;
        detail.push(`Hands ${worstHand} µS`);
      }
      if (worstFoot !== null) {
        footAbn = worstFoot < 60;
        footSevere = worstFoot < 40;
        detail.push(`Feet ${worstFoot} µS`);
      }
    } else {
      const handSites: QsartSite[] = ["forearm"];
      const footSites: QsartSite[] = ["distal_leg", "foot"];
      const evalSite = (site: QsartSite) => {
        const v = s.qsart[site];
        const range = getQsartRange(s.age, sex, site);
        if (!isNum(v) || !range) return null;
        tested = true;
        detail.push(`${site.replace("_", " ")} ${v} µL (LLN ${range.LLN})`);
        return { abnormal: Number(v) < range.LLN, severe: Number(v) < range.LLN * 0.5 };
      };
      handSites.forEach((site) => {
        const res = evalSite(site);
        if (res) {
          handAbn = handAbn || res.abnormal;
          handSevere = handSevere || res.severe;
        }
      });
      footSites.forEach((site) => {
        const res = evalSite(site);
        if (res) {
          footAbn = footAbn || res.abnormal;
          footSevere = footSevere || res.severe;
        }
      });
      const proximal = evalSite("proximal_leg");
      if (proximal) {
        footAbn = footAbn || proximal.abnormal;
        footSevere = footSevere || proximal.severe;
      }
    }

    let score = 0;
    const anySevere = handSevere || footSevere;
    if (handAbn && footAbn && anySevere) score = 3;
    else if ((handAbn && footAbn) || (anySevere && (handAbn || footAbn))) score = 2;
    else if (handAbn || footAbn || anySevere) score = 1;

    return { score, handAbn, footAbn, handSevere, footSevere, tested, detail };
  }, [s.sudoMode, s.sudoscan, s.qsart, s.age, sex]);

  /* --------------------------- Composite --------------------------- */
  const total = cardiovagal.score + adrenergic.score + sudomotor.score;
  const severity = MCASS_SEVERITY(total);

  const canStage = useMemo(() => {
    const abnormal = [hrdbStatus === "low", vrStatus === "low", r3015Status === "low"].filter(Boolean)
      .length;
    if (abnormal >= 1 && ortho.classical) return { count: abnormal, stage: "Severe / advanced CAN" };
    if (abnormal === 0) return { count: 0, stage: "No evidence of CAN" };
    if (abnormal === 1) return { count: 1, stage: "Possible / early CAN" };
    return { count: abnormal, stage: "Definite / confirmed CAN" };
  }, [hrdbStatus, vrStatus, r3015Status, ortho.classical]);

  const pots = useMemo(() => {
    const met = ortho.timeToPots !== null && !ortho.classical;
    return {
      met,
      threshold: (ortho as any).potsThreshold ?? 30,
      timeToCriterion: ortho.timeToPots,
      note:
        ortho.timeToPots !== null && ortho.classical
          ? "HR rise present but orthostatic hypotension may explain the tachycardia"
          : "",
    };
  }, [ortho]);

  const pattern = useMemo(() => {
    const domains = [
      cardiovagal.score > 0 ? "cardiovagal" : null,
      adrenergic.score > 0 ? "adrenergic" : null,
      sudomotor.score > 0 ? "sudomotor" : null,
    ].filter(Boolean) as string[];
    if (domains.length === 0) return "No significant objective autonomic abnormality";
    if (domains.length >= 2) {
      if (cardiovagal.score > 0 && adrenergic.score > 0 && sudomotor.score === 0)
        return "Generalized autonomic dysfunction — central-predominant pattern (cardiovagal + adrenergic, limited distal sudomotor involvement)";
      if (sudomotor.score >= 2 && (cardiovagal.score > 0 || adrenergic.score > 0))
        return "Generalized autonomic dysfunction — peripheral-predominant pattern (prominent sudomotor with cardiovascular involvement)";
      return "Generalized autonomic dysfunction";
    }
    return `${domains[0].charAt(0).toUpperCase()}${domains[0].slice(1)}-predominant`;
  }, [cardiovagal.score, adrenergic.score, sudomotor.score]);

  const activeConfounders = CONFOUNDERS.filter((c) => s.confounders[c.key]).map((c) => c.label);

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
              Autonomic Function &amp; mCASS Analyzer
            </CardTitle>
            <CardDescription>
              Age- and sex-adjusted normative values with mCASS /10, orthostatic classification, POTS
              screening and CAN staging.
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
          </TabsContent>

          {/* -------------------- Cardiovagal -------------------- */}
          <TabsContent value="cardiovagal" className="space-y-5 pt-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <NormField
                label="HRDB (ΔHR deep breathing)"
                unit="bpm"
                value={s.hrdb}
                onChange={(v) => set("hrdb", v)}
                range={hrdbRange}
                status={hrdbStatus}
              />
              <NormField
                label="E:I ratio"
                value={s.ei}
                onChange={(v) => set("ei", v)}
                range={eiRange}
                status={eiStatus}
              />
              <NormField
                label="Valsalva ratio"
                value={s.vr}
                onChange={(v) => set("vr", v)}
                range={vrRange}
                status={vrStatus}
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">30:15 standing ratio</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={s.ratio3015 === "" ? "" : s.ratio3015}
                  onChange={(e) => set("ratio3015", num(e.target.value))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Laboratory LLN"
                  value={s.ratio3015LLN === "" ? "" : s.ratio3015LLN}
                  onChange={(e) => set("ratio3015LLN", num(e.target.value))}
                />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Custom laboratory norm required</span>
                  <StatusBadge status={r3015Status} />
                </div>
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
              <Label>Test used</Label>
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
                  const range = getQsartRange(s.age, sex, site.key);
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
