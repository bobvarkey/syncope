import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, ChevronDown, Calculator, HeartPulse, ShieldAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import diagram from "@/assets/anti-arrhythmic-classes.png.asset.json";

type Dosing = {
  route: "PO" | "IV" | "PO/IV";
  perKg?: { mg: number; frequencyHrs: number };
  fixed?: { mgMin: number; mgMax: number; frequencyHrs: number };
  maxDailyMg?: number;
  notes?: string;
};

type Drug = {
  id: string;
  name: string;
  mechanism: string;
  ecgEffects: string[];
  contraindications: string[];
  cautions?: string[];
  adverseEffects?: string[];
  dosing: Dosing;
};

type DrugClass = {
  id: string;
  label: string;
  title: string;
  mnemonicWord: string;
  target: string;
  accent: string; // tailwind class
  notes?: string;
  drugs: Drug[];
  subGroups?: { label: string; mnemonic?: string; drugIds: string[] }[];
};

const drugList: Drug[] = [
  // Class Ia
  {
    id: "quinidine",
    name: "Quinidine",
    mechanism: "Blocks Na⁺ channels (intermediate kinetics) and K⁺ channels — prolongs action potential.",
    ecgEffects: ["↑ QRS width", "↑ QT interval", "Possible U-waves"],
    contraindications: ["Long QT syndrome", "Complete heart block", "Digoxin toxicity", "Thrombocytopenia to quinidine"],
    dosing: { route: "PO", fixed: { mgMin: 200, mgMax: 400, frequencyHrs: 6 }, maxDailyMg: 2400, notes: "Sulfate salt; monitor QTc." },
  },
  {
    id: "procainamide",
    name: "Procainamide",
    mechanism: "Na⁺ + K⁺ channel blockade; slows conduction and prolongs repolarisation.",
    ecgEffects: ["↑ QRS width", "↑ QT interval"],
    contraindications: ["Complete heart block", "SLE / lupus-like syndrome", "Torsades history"],
    dosing: { route: "IV", perKg: { mg: 15, frequencyHrs: 0 }, notes: "Loading 15 mg/kg IV over 30 min; maintenance 1–4 mg/min infusion." },
  },
  {
    id: "disopyramide",
    name: "Disopyramide",
    mechanism: "Na⁺/K⁺ blockade with strong anticholinergic effect.",
    ecgEffects: ["↑ QRS", "↑ QT"],
    contraindications: ["Heart failure (negative inotrope)", "Glaucoma", "Urinary retention", "Prostatic hypertrophy"],
    dosing: { route: "PO", fixed: { mgMin: 100, mgMax: 200, frequencyHrs: 6 }, maxDailyMg: 800 },
  },
  // Class Ib
  {
    id: "lidocaine",
    name: "Lidocaine",
    mechanism: "Fast Na⁺ channel block, preferentially in ischaemic/depolarised tissue.",
    ecgEffects: ["Minimal ECG change", "May ↓ QT slightly"],
    contraindications: ["Severe SA/AV block without pacing", "Hypersensitivity to amide anaesthetics"],
    dosing: { route: "IV", perKg: { mg: 1, frequencyHrs: 0 }, notes: "Bolus 1–1.5 mg/kg IV; repeat 0.5–0.75 mg/kg q5–10 min (max 3 mg/kg). Infusion 1–4 mg/min." },
  },
  {
    id: "mexiletine",
    name: "Mexiletine",
    mechanism: "Oral lidocaine analogue — Na⁺ channel block.",
    ecgEffects: ["Minimal QRS change", "Shortens QT"],
    contraindications: ["2°/3° AV block", "Cardiogenic shock"],
    dosing: { route: "PO", fixed: { mgMin: 150, mgMax: 300, frequencyHrs: 8 }, maxDailyMg: 1200 },
  },
  // Class Ic
  {
    id: "flecainide",
    name: "Flecainide",
    mechanism: "Potent Na⁺ channel block with slow dissociation — marked slowing of phase 0.",
    ecgEffects: ["Marked ↑ QRS", "Slight ↑ PR", "Little QT change"],
    contraindications: ["Structural heart disease", "Prior MI / ischaemia (CAST trial)", "2°/3° AV block"],
    dosing: { route: "PO", fixed: { mgMin: 50, mgMax: 150, frequencyHrs: 12 }, maxDailyMg: 300, notes: "Pill-in-pocket: 200–300 mg once for AF cardioversion." },
  },
  {
    id: "propafenone",
    name: "Propafenone",
    mechanism: "Na⁺ block + weak β-blockade.",
    ecgEffects: ["↑ QRS", "↑ PR"],
    contraindications: ["Structural heart disease", "Heart failure", "Severe COPD/asthma"],
    dosing: { route: "PO", fixed: { mgMin: 150, mgMax: 300, frequencyHrs: 8 }, maxDailyMg: 900 },
  },
  // Class II
  {
    id: "metoprolol",
    name: "Metoprolol",
    mechanism: "β1-selective adrenergic blockade — ↓ SA/AV node automaticity.",
    ecgEffects: ["↓ HR (sinus brady)", "↑ PR", "No QRS/QT change"],
    contraindications: ["Severe bradycardia", "2°/3° AV block", "Decompensated HF", "Severe asthma"],
    dosing: { route: "PO/IV", fixed: { mgMin: 25, mgMax: 100, frequencyHrs: 12 }, maxDailyMg: 400, notes: "IV: 2.5–5 mg every 5 min up to 15 mg." },
  },
  {
    id: "propranolol",
    name: "Propranolol",
    mechanism: "Non-selective β-blockade.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["Asthma", "Severe bradycardia", "AV block", "Cocaine-induced ischaemia"],
    dosing: { route: "PO", fixed: { mgMin: 10, mgMax: 40, frequencyHrs: 6 }, maxDailyMg: 320 },
  },
  {
    id: "esmolol",
    name: "Esmolol",
    mechanism: "Ultra-short-acting β1-selective blocker.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["Severe bradycardia", "AV block", "Cardiogenic shock"],
    dosing: { route: "IV", perKg: { mg: 0.5, frequencyHrs: 0 }, notes: "Load 500 mcg/kg over 1 min; infusion 50–200 mcg/kg/min." },
  },
  {
    id: "bisoprolol",
    name: "Bisoprolol",
    mechanism: "Highly β1-selective blockade.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["Severe bradycardia", "AV block", "Decompensated HF"],
    dosing: { route: "PO", fixed: { mgMin: 2.5, mgMax: 10, frequencyHrs: 24 }, maxDailyMg: 20 },
  },
  {
    id: "carvedilol",
    name: "Carvedilol",
    mechanism: "Non-selective β + α1 blockade.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["Severe HF decompensation", "AV block", "Severe asthma"],
    dosing: { route: "PO", fixed: { mgMin: 3.125, mgMax: 25, frequencyHrs: 12 }, maxDailyMg: 50 },
  },
  {
    id: "atenolol",
    name: "Atenolol",
    mechanism: "β1-selective blockade.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["Severe bradycardia", "AV block", "Severe renal impairment"],
    dosing: { route: "PO", fixed: { mgMin: 25, mgMax: 100, frequencyHrs: 24 }, maxDailyMg: 100 },
  },
  // Class III
  {
    id: "amiodarone",
    name: "Amiodarone",
    mechanism: "Predominantly K⁺ block with Na⁺, Ca²⁺, and β-blocking properties.",
    ecgEffects: ["↑ QT (usually low torsades risk)", "↓ HR", "↑ PR"],
    contraindications: ["Sinus node dysfunction", "2°/3° AV block", "Thyroid disease", "Severe lung disease"],
    dosing: { route: "PO/IV", fixed: { mgMin: 200, mgMax: 400, frequencyHrs: 24 }, maxDailyMg: 400, notes: "Load 10 g PO over 1–2 wks OR 150 mg IV over 10 min then 1 mg/min ×6h then 0.5 mg/min." },
  },
  {
    id: "sotalol",
    name: "Sotalol",
    mechanism: "K⁺ block + non-selective β-blockade.",
    ecgEffects: ["↑ QT (torsades risk)", "↓ HR"],
    contraindications: ["Long QT", "CrCl < 40 mL/min", "Severe HF", "Asthma"],
    dosing: { route: "PO", fixed: { mgMin: 80, mgMax: 160, frequencyHrs: 12 }, maxDailyMg: 320 },
  },
  {
    id: "dofetilide",
    name: "Dofetilide",
    mechanism: "Selective Ikr K⁺ channel block.",
    ecgEffects: ["↑ QT (torsades risk)"],
    contraindications: ["QTc > 440 ms", "CrCl < 20 mL/min", "Hypokalaemia / hypomagnesaemia"],
    dosing: { route: "PO", fixed: { mgMin: 0.125, mgMax: 0.5, frequencyHrs: 12 }, maxDailyMg: 1, notes: "In-hospital initiation only; dose by CrCl." },
  },
  {
    id: "ibutilide",
    name: "Ibutilide",
    mechanism: "Selective Ikr block; activates slow inward Na⁺ current.",
    ecgEffects: ["↑ QT (torsades risk)"],
    contraindications: ["Long QT", "Hypokalaemia", "Hypomagnesaemia"],
    dosing: { route: "IV", fixed: { mgMin: 1, mgMax: 1, frequencyHrs: 0 }, notes: "1 mg IV over 10 min (0.01 mg/kg if <60 kg); may repeat once." },
  },
  {
    id: "dronedarone",
    name: "Dronedarone",
    mechanism: "Non-iodinated amiodarone analogue — multichannel block.",
    ecgEffects: ["↑ QT (mild)", "↓ HR"],
    contraindications: ["NYHA III–IV HF", "Permanent AF", "Severe liver disease"],
    dosing: { route: "PO", fixed: { mgMin: 400, mgMax: 400, frequencyHrs: 12 }, maxDailyMg: 800 },
  },
  // Class IV
  {
    id: "verapamil",
    name: "Verapamil",
    mechanism: "Non-DHP L-type Ca²⁺ channel block — slows AV nodal conduction.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["WPW with AF", "Severe HF", "AV block", "β-blocker co-administration (relative)"],
    dosing: { route: "PO/IV", fixed: { mgMin: 40, mgMax: 120, frequencyHrs: 8 }, maxDailyMg: 480, notes: "IV: 2.5–5 mg over 2 min; repeat 5–10 mg after 15–30 min." },
  },
  {
    id: "diltiazem",
    name: "Diltiazem",
    mechanism: "Non-DHP L-type Ca²⁺ channel block.",
    ecgEffects: ["↓ HR", "↑ PR"],
    contraindications: ["WPW with AF", "Severe HF", "AV block", "Sick sinus without pacing"],
    dosing: { route: "PO/IV", perKg: { mg: 0.25, frequencyHrs: 0 }, notes: "IV bolus 0.25 mg/kg over 2 min; infusion 5–15 mg/hr. PO 120–360 mg/day." },
  },
  // Class V
  {
    id: "digoxin",
    name: "Digoxin",
    mechanism: "Inhibits Na⁺/K⁺-ATPase; ↑ vagal tone at AV node.",
    ecgEffects: ["↓ HR", "Scooped ST depression", "Shortens QT"],
    contraindications: ["AV block", "WPW", "Hypokalaemia", "Renal failure (dose reduce)"],
    dosing: { route: "PO/IV", fixed: { mgMin: 0.125, mgMax: 0.25, frequencyHrs: 24 }, maxDailyMg: 0.25, notes: "Load 0.5 mg then 0.25 mg q6h ×2 doses (max 1 mg)." },
  },
  {
    id: "adenosine",
    name: "Adenosine",
    mechanism: "Activates A1 receptors — transient AV block.",
    ecgEffects: ["Transient asystole", "AV block"],
    contraindications: ["2°/3° AV block without pacing", "Severe asthma", "Long QT"],
    dosing: { route: "IV", fixed: { mgMin: 6, mgMax: 12, frequencyHrs: 0 }, notes: "6 mg rapid IV push; may repeat 12 mg ×2." },
  },
  {
    id: "magnesium",
    name: "Magnesium sulfate",
    mechanism: "Blocks Ca²⁺ channels; stabilises myocardial membrane.",
    ecgEffects: ["Suppresses torsades"],
    contraindications: ["Severe renal failure", "Heart block"],
    dosing: { route: "IV", fixed: { mgMin: 1000, mgMax: 2000, frequencyHrs: 0 }, notes: "1–2 g IV over 5–15 min for torsades." },
  },
  {
    id: "ivabradine",
    name: "Ivabradine",
    mechanism:
      "Selective HCN (If, 'funny') channel blocker in the SA node — pure heart-rate reduction without inotropy, lusitropy, or BP effect.",
    ecgEffects: ["↓ HR only", "No change in PR/QRS/QT", "May unmask latent AF"],
    contraindications: [
      "Resting HR < 70 bpm before treatment (per SmPC)",
      "Sick sinus / SA block / 2°–3° AV block without a functioning pacemaker",
      "Atrial fibrillation or any non-sinus rhythm dependent on SA node",
      "Acute decompensated HF, cardiogenic shock, unstable angina, acute MI",
      "Severe hypotension (< 90/50 mmHg)",
      "Severe hepatic impairment (Child-Pugh C)",
      "Congenital long QT syndrome",
      "Pregnancy, breastfeeding, women of child-bearing potential without contraception",
      "Strong CYP3A4 inhibitors (ketoconazole, itraconazole, clarithromycin, ritonavir, nefazodone)",
      "Non-DHP calcium-channel blockers (verapamil, diltiazem)",
    ],
    cautions: [
      "Risk of new-onset atrial fibrillation — monitor rhythm; discontinue if AF develops",
      "Bradycardia — hold or reduce dose if HR persistently < 50 bpm or symptomatic",
      "Moderate CYP3A4 inhibitors/inducers, grapefruit juice, St John's wort — avoid or halve dose",
      "Retinal disease / retinitis pigmentosa — luminous phenomena may worsen",
      "Recent stroke, chronic bradyarrhythmias, moderate hepatic impairment",
      "QT-prolonging drug combinations (indirect risk via bradycardia)",
    ],
    adverseEffects: [
      "Luminous phenomena / phosphenes (transient bright spots) — up to ~15%",
      "Symptomatic or asymptomatic bradycardia",
      "New-onset atrial fibrillation",
      "Headache, dizziness",
      "Blurred vision",
      "First-degree AV block / PR prolongation",
      "Nausea, constipation, diarrhoea",
    ],
    dosing: {
      route: "PO",
      fixed: { mgMin: 2.5, mgMax: 7.5, frequencyHrs: 12 },
      maxDailyMg: 15,
      notes:
        "Adults: start 5 mg BD with food. Review resting HR at 2 weeks — titrate to 7.5 mg BD if HR > 60 bpm, keep 5 mg BD if 50–60 bpm, reduce to 2.5 mg BD or stop if HR < 50 bpm or symptomatic bradycardia. Start 2.5 mg BD if ≥ 75 y, frail, or moderate hepatic impairment. Take morning and evening with meals. Do NOT combine with verapamil/diltiazem or strong CYP3A4 inhibitors; avoid grapefruit juice.",
    },
  },
];

const drugMap = Object.fromEntries(drugList.map((d) => [d.id, d]));

const classes: DrugClass[] = [
  {
    id: "0",
    label: "Class 0",
    title: "HCN (funny) channel blockers",
    mnemonicWord: "Funny → HCN / If current",
    target: "SA node HCN channels (If) — slows sinus rate without inotropy or BP change",
    accent: "from-accent/20 via-primary/10 to-primary/5 border-primary/40",
    notes:
      "Added in the 2018 modernised Vaughan-Williams classification (Lei et al.). Only clinically licensed member: Ivabradine. Investigational agents: zatebradine, cilobradine (not in clinical use).",
    drugs: ["ivabradine"].map((id) => drugMap[id]),
  },
  {
    id: "I",
    label: "Class I",
    title: "Na⁺ channel blockers",
    mnemonicWord: "Some → Sodium",
    target: "Fast Na⁺ channels — slow phase 0 depolarisation",
    accent: "from-primary/20 to-primary/5 border-primary/40",
    notes: "Sub-mnemonic: “Quinidine likes fever” (Ia · Ib · Ic)",
    drugs: [],
    subGroups: [
      { label: "Class Ia", mnemonic: "Quinidine", drugIds: ["quinidine", "procainamide", "disopyramide"] },
      { label: "Class Ib", mnemonic: "likes", drugIds: ["lidocaine", "mexiletine"] },
      { label: "Class Ic", mnemonic: "fever", drugIds: ["flecainide", "propafenone"] },
    ],
  },
  {
    id: "II",
    label: "Class II",
    title: "Beta blockers",
    mnemonicWord: "Block → Beta blockers",
    target: "β-adrenergic receptors — ↓ SA/AV node automaticity",
    accent: "from-secondary/25 to-secondary/5 border-secondary/40",
    notes: "Mnemonic: “-LOL” suffix",
    drugs: ["propranolol", "metoprolol", "atenolol", "bisoprolol", "esmolol", "carvedilol"].map((id) => drugMap[id]),
  },
  {
    id: "III",
    label: "Class III",
    title: "K⁺ channel blockers",
    mnemonicWord: "Potassium → Potassium",
    target: "K⁺ efflux — prolong repolarisation & QT",
    accent: "from-accent/25 to-accent/5 border-accent/40",
    notes: "Mnemonic: “AIDS” — Amiodarone, Ibutilide, Dofetilide, Sotalol",
    drugs: ["amiodarone", "ibutilide", "dofetilide", "sotalol", "dronedarone"].map((id) => drugMap[id]),
  },
  {
    id: "IV",
    label: "Class IV",
    title: "Ca²⁺ channel blockers (non-DHP)",
    mnemonicWord: "Channels → Calcium",
    target: "L-type Ca²⁺ channels — slow AV nodal conduction",
    accent: "from-tertiary/25 to-tertiary/5 border-tertiary/40",
    drugs: ["verapamil", "diltiazem"].map((id) => drugMap[id]),
  },
  {
    id: "V",
    label: "Class V",
    title: "Miscellaneous agents",
    mnemonicWord: "Mainly → Miscellaneous",
    target: "Varied — vagal tone, Na/K-ATPase, adenosine receptors",
    accent: "from-primary/20 via-accent/10 to-tertiary/10 border-accent/40",
    drugs: ["digoxin", "adenosine", "magnesium"].map((id) => drugMap[id]),
  },
];

function DoseCalculator({ drug }: { drug: Drug }) {
  const [weight, setWeight] = useState<number>(70);
  const [renalAdjust, setRenalAdjust] = useState<boolean>(false);

  const result = useMemo(() => {
    const factor = renalAdjust ? 0.5 : 1;
    if (drug.dosing.perKg) {
      const mg = +(drug.dosing.perKg.mg * weight * factor).toFixed(2);
      return {
        headline: `${mg} mg`,
        detail:
          drug.dosing.perKg.frequencyHrs > 0
            ? `every ${drug.dosing.perKg.frequencyHrs} h`
            : "single dose / loading",
      };
    }
    if (drug.dosing.fixed) {
      const lo = +(drug.dosing.fixed.mgMin * factor).toFixed(3);
      const hi = +(drug.dosing.fixed.mgMax * factor).toFixed(3);
      return {
        headline: lo === hi ? `${lo} mg` : `${lo} – ${hi} mg`,
        detail:
          drug.dosing.fixed.frequencyHrs > 0
            ? `every ${drug.dosing.fixed.frequencyHrs} h${drug.dosing.maxDailyMg ? ` · max ${drug.dosing.maxDailyMg} mg/day` : ""}`
            : "single dose",
      };
    }
    return { headline: "—", detail: "" };
  }, [drug, weight, renalAdjust]);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <Calculator className="h-4 w-4 text-primary" />
        Dosing calculator
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`w-${drug.id}`} className="text-xs">Weight (kg)</Label>
          <Input
            id={`w-${drug.id}`}
            type="number"
            min={1}
            max={250}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer rounded-md border px-3 py-2 bg-background w-full">
            <input
              type="checkbox"
              checked={renalAdjust}
              onChange={(e) => setRenalAdjust(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span>Renal / elderly (½ dose)</span>
          </label>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-background p-3 border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Suggested dose ({drug.dosing.route})</div>
        <div className="text-2xl font-bold text-gradient-sunset">{result.headline}</div>
        <div className="text-xs text-muted-foreground">{result.detail}</div>
        {drug.dosing.notes && (
          <p className="mt-2 text-xs text-foreground border-t pt-2">{drug.dosing.notes}</p>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground italic">
          Reference only — always verify against local formulary and patient factors.
        </p>
      </div>
    </div>
  );
}

function DrugChip({ drug, onOpen }: { drug: Drug; onOpen: (d: Drug) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(drug)}
      className="group inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 hover:shadow-glow transition-all"
    >
      <Pill className="h-3 w-3 text-primary" />
      <span>{drug.name}</span>
      <span className="text-[10px] text-muted-foreground group-hover:text-primary">tap ↗</span>
    </button>
  );
}

const AntiArrhythmicsSection = () => {
  const [openClass, setOpenClass] = useState<string | null>("I");
  const [activeDrug, setActiveDrug] = useState<Drug | null>(null);

  return (
    <Card className="border-primary/30 overflow-hidden">
      <div className="h-1.5 bg-gradient-sunset" />
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-primary" />
              Anti-arrhythmic Drugs — Vaughan-Williams
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Tap a drug for mechanism, ECG effects, contraindications, and a dosing calculator.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/40 text-primary">
            Reference · Pharmacology
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Master mnemonic */}
        <div className="rounded-xl border p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-tertiary/5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Master mnemonic</p>
          <p className="text-base font-semibold text-gradient-sunset">
            “Funny, Some Block Potassium Channels Mainly”
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">Funny</span> → HCN / If current · Class 0</li>
            <li><span className="font-medium text-foreground">Some</span> → Sodium · Class I</li>
            <li><span className="font-medium text-foreground">Block</span> → Beta blockers · Class II</li>
            <li><span className="font-medium text-foreground">Potassium</span> → Potassium · Class III</li>
            <li><span className="font-medium text-foreground">Channels</span> → Calcium · Class IV</li>
            <li><span className="font-medium text-foreground">Mainly</span> → Miscellaneous · Class V</li>
          </ul>
        </div>

        {/* Cellular target diagram */}
        <figure className="rounded-xl border overflow-hidden bg-background">
          <img
            src={diagram.url}
            alt="Cellular targets of anti-arrhythmic classes I–IV"
            loading="lazy"
            className="media-uniform-contain"
          />
          <figcaption className="px-3 py-2 text-[11px] text-muted-foreground border-t bg-muted/30 leading-snug">
            Cellular targets: Class I (Na⁺), Class II (β-receptors), Class III (K⁺), Class IV (Ca²⁺).
          </figcaption>
        </figure>

        {/* Class cards */}
        <div className="space-y-2">
          {classes.map((c) => {
            const open = openClass === c.id;
            return (
              <div key={c.id} className={cn("rounded-xl border bg-gradient-to-br transition-all", c.accent)}>
                <button
                  type="button"
                  onClick={() => setOpenClass(open ? null : c.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono bg-background/60">
                        {c.label}
                      </Badge>
                      <span className="font-semibold text-sm text-foreground">{c.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{c.mnemonicWord}</span> · {c.target}
                    </p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 bg-background/40 backdrop-blur-sm">
                    {c.notes && <p className="text-xs italic text-muted-foreground">{c.notes}</p>}
                    {c.subGroups ? (
                      <div className="grid gap-2 sm:grid-cols-3">
                        {c.subGroups.map((sg) => (
                          <div key={sg.label} className="rounded-lg border bg-background p-3">
                            <div className="flex items-baseline justify-between gap-2 mb-2">
                              <span className="text-xs font-semibold text-foreground">{sg.label}</span>
                              {sg.mnemonic && (
                                <span className="text-[10px] italic text-primary">“{sg.mnemonic}”</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sg.drugIds.map((id) => (
                                <DrugChip key={id} drug={drugMap[id]} onOpen={setActiveDrug} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {c.drugs.map((d) => (
                          <DrugChip key={d.id} drug={d} onOpen={setActiveDrug} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-dashed pt-2">
          Educational reference only — dosing, indications, and contraindications must be verified against local
          formulary and current guidelines.
        </p>
      </CardContent>

      {/* Drug detail drawer */}
      <Sheet open={!!activeDrug} onOpenChange={(o) => !o && setActiveDrug(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {activeDrug && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2 text-primary">
                  <Pill className="h-5 w-5" />
                  <SheetTitle className="text-2xl">{activeDrug.name}</SheetTitle>
                </div>
                <SheetDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Route: {activeDrug.dosing.route}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg border p-3 bg-primary/5">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                    <Info className="h-4 w-4 text-primary" /> Mechanism
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{activeDrug.mechanism}</p>
                </div>

                <div className="rounded-lg border p-3 bg-accent/5">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <HeartPulse className="h-4 w-4 text-accent" /> Key ECG effects
                  </div>
                  <ul className="space-y-1">
                    {activeDrug.ecgEffects.map((e) => (
                      <li key={e} className="text-sm text-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-accent">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border p-3 bg-destructive/5">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" /> Contraindications
                  </div>
                  <ul className="space-y-1">
                    {activeDrug.contraindications.map((c) => (
                      <li key={c} className="text-sm text-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-destructive">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <DoseCalculator drug={activeDrug} />

                <Button variant="outline" onClick={() => setActiveDrug(null)} className="w-full">
                  <X className="h-4 w-4" /> Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default AntiArrhythmicsSection;
