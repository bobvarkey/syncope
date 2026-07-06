import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Pill, AlertTriangle } from "lucide-react";

interface SyncopeMedicationsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

type Mechanism = "brady" | "qt" | "hypotension" | "autonomic" | "idiosyncratic";

interface DrugItem {
  id: string;
  label: string;
  mechanisms: Mechanism[];
}

interface DrugGroup {
  id: string;
  title: string;
  description: string;
  mechanisms: Mechanism[];
  drugs: DrugItem[];
}

const mechanismMeta: Record<Mechanism, { label: string; color: string }> = {
  brady:         { label: "Bradyarrhythmia",   color: "bg-blue-500/15 text-blue-400 border-blue-500/40" },
  qt:            { label: "QT / Tachyarrhythmia", color: "bg-purple-500/15 text-purple-400 border-purple-500/40" },
  hypotension:   { label: "Hypotension / OH", color: "bg-red-500/15 text-red-400 border-red-500/40" },
  autonomic:     { label: "Autonomic impairment", color: "bg-amber-500/15 text-amber-400 border-amber-500/40" },
  idiosyncratic: { label: "Idiosyncratic", color: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
};

const drugGroups: DrugGroup[] = [
  {
    id: "beta-blockers",
    title: "Beta-blockers",
    description: "Negative chronotropes — sinus bradycardia, AV block",
    mechanisms: ["brady"],
    drugs: [
      { id: "metoprolol", label: "Metoprolol", mechanisms: ["brady"] },
      { id: "bisoprolol", label: "Bisoprolol", mechanisms: ["brady"] },
      { id: "atenolol", label: "Atenolol", mechanisms: ["brady"] },
      { id: "propranolol", label: "Propranolol", mechanisms: ["brady"] },
      { id: "carvedilol", label: "Carvedilol", mechanisms: ["brady", "hypotension"] },
      { id: "nadolol", label: "Nadolol", mechanisms: ["brady"] },
    ],
  },
  {
    id: "non-dhp-ccb",
    title: "Non-DHP Calcium Channel Blockers",
    description: "Rate-limiting CCBs — bradycardia/AV block",
    mechanisms: ["brady"],
    drugs: [
      { id: "verapamil", label: "Verapamil", mechanisms: ["brady", "hypotension"] },
      { id: "diltiazem", label: "Diltiazem", mechanisms: ["brady", "hypotension"] },
    ],
  },
  {
    id: "digoxin-antiarrhythmics",
    title: "Cardiac Glycosides & Antiarrhythmics",
    description: "AV block (toxicity), QT prolongation, negative chronotropy",
    mechanisms: ["brady", "qt"],
    drugs: [
      { id: "digoxin", label: "Digoxin (toxicity → high-grade AV block)", mechanisms: ["brady"] },
      { id: "amiodarone", label: "Amiodarone", mechanisms: ["brady", "qt"] },
      { id: "sotalol", label: "Sotalol", mechanisms: ["brady", "qt"] },
      { id: "ivabradine", label: "Ivabradine", mechanisms: ["brady"] },
      { id: "clonidine", label: "Clonidine (central sympatholytic)", mechanisms: ["brady", "hypotension", "autonomic"] },
    ],
  },
  {
    id: "class-i-iii",
    title: "Class I & III Antiarrhythmics (QT)",
    description: "QT prolongation → torsades de pointes",
    mechanisms: ["qt"],
    drugs: [
      { id: "quinidine", label: "Quinidine", mechanisms: ["qt"] },
      { id: "procainamide", label: "Procainamide", mechanisms: ["qt"] },
      { id: "flecainide", label: "Flecainide", mechanisms: ["qt"] },
      { id: "propafenone", label: "Propafenone", mechanisms: ["qt", "brady"] },
      { id: "dofetilide", label: "Dofetilide", mechanisms: ["qt"] },
      { id: "ibutilide", label: "Ibutilide", mechanisms: ["qt"] },
    ],
  },
  {
    id: "psychotropics",
    title: "Antipsychotics",
    description: "QT prolongation and/or orthostatic hypotension",
    mechanisms: ["qt", "hypotension"],
    drugs: [
      { id: "haloperidol", label: "Haloperidol", mechanisms: ["qt"] },
      { id: "chlorpromazine", label: "Chlorpromazine", mechanisms: ["qt", "hypotension"] },
      { id: "fluphenazine", label: "Fluphenazine", mechanisms: ["qt", "hypotension"] },
      { id: "quetiapine", label: "Quetiapine", mechanisms: ["hypotension", "qt"] },
      { id: "risperidone", label: "Risperidone", mechanisms: ["hypotension", "qt"] },
      { id: "olanzapine", label: "Olanzapine", mechanisms: ["hypotension", "qt"] },
    ],
  },
  {
    id: "antidepressants",
    title: "Antidepressants",
    description: "TCAs — QT, orthostatic hypotension; SSRIs — QT in overdose/polypharmacy",
    mechanisms: ["qt", "hypotension"],
    drugs: [
      { id: "amitriptyline", label: "Amitriptyline (TCA)", mechanisms: ["qt", "hypotension"] },
      { id: "imipramine", label: "Imipramine (TCA)", mechanisms: ["qt", "hypotension"] },
      { id: "citalopram", label: "Citalopram (SSRI, QT)", mechanisms: ["qt"] },
      { id: "escitalopram", label: "Escitalopram", mechanisms: ["qt"] },
      { id: "venlafaxine", label: "Venlafaxine (SNRI)", mechanisms: ["qt", "hypotension"] },
    ],
  },
  {
    id: "antimicrobials",
    title: "Antibiotics & Antiemetics (QT)",
    description: "Macrolides, fluoroquinolones, 5-HT3 antagonists — QT prolongation",
    mechanisms: ["qt"],
    drugs: [
      { id: "erythromycin", label: "Erythromycin", mechanisms: ["qt"] },
      { id: "clarithromycin", label: "Clarithromycin", mechanisms: ["qt"] },
      { id: "moxifloxacin", label: "Moxifloxacin", mechanisms: ["qt"] },
      { id: "levofloxacin", label: "Levofloxacin", mechanisms: ["qt"] },
      { id: "ondansetron", label: "Ondansetron (esp. IV)", mechanisms: ["qt"] },
      { id: "domperidone", label: "Domperidone", mechanisms: ["qt"] },
    ],
  },
  {
    id: "vasodilator-antihtn",
    title: "Vasodilator Antihypertensives",
    description: "DHP CCBs, ACEi, ARBs, α-blockers, nitrates — hypotension/OH",
    mechanisms: ["hypotension"],
    drugs: [
      { id: "amlodipine", label: "Amlodipine (DHP CCB)", mechanisms: ["hypotension"] },
      { id: "nifedipine", label: "Nifedipine", mechanisms: ["hypotension"] },
      { id: "felodipine", label: "Felodipine", mechanisms: ["hypotension"] },
      { id: "enalapril", label: "Enalapril (ACEi)", mechanisms: ["hypotension"] },
      { id: "lisinopril", label: "Lisinopril", mechanisms: ["hypotension"] },
      { id: "ramipril", label: "Ramipril", mechanisms: ["hypotension"] },
      { id: "losartan", label: "Losartan (ARB)", mechanisms: ["hypotension"] },
      { id: "valsartan", label: "Valsartan", mechanisms: ["hypotension"] },
      { id: "candesartan", label: "Candesartan", mechanisms: ["hypotension"] },
      { id: "prazosin", label: "Prazosin (α-blocker, first-dose)", mechanisms: ["hypotension", "idiosyncratic"] },
      { id: "doxazosin", label: "Doxazosin", mechanisms: ["hypotension"] },
      { id: "terazosin", label: "Terazosin", mechanisms: ["hypotension"] },
      { id: "tamsulosin", label: "Tamsulosin", mechanisms: ["hypotension"] },
      { id: "nitroglycerin", label: "Nitroglycerin (esp. with PDE-5i)", mechanisms: ["hypotension"] },
      { id: "isosorbide", label: "Isosorbide dinitrate / mononitrate", mechanisms: ["hypotension"] },
    ],
  },
  {
    id: "diuretics",
    title: "Diuretics",
    description: "Volume depletion, electrolyte derangement",
    mechanisms: ["hypotension"],
    drugs: [
      { id: "furosemide", label: "Furosemide", mechanisms: ["hypotension"] },
      { id: "bumetanide", label: "Bumetanide", mechanisms: ["hypotension"] },
      { id: "torsemide", label: "Torsemide", mechanisms: ["hypotension"] },
      { id: "hctz", label: "Hydrochlorothiazide", mechanisms: ["hypotension"] },
      { id: "chlorthalidone", label: "Chlorthalidone", mechanisms: ["hypotension"] },
      { id: "indapamide", label: "Indapamide", mechanisms: ["hypotension"] },
    ],
  },
  {
    id: "cns-sedatives",
    title: "Sedatives, Opioids & Autonomic-Acting Agents",
    description: "Vasodilation, autonomic blunting, blunted prodrome awareness",
    mechanisms: ["hypotension", "autonomic"],
    drugs: [
      { id: "morphine", label: "Morphine", mechanisms: ["hypotension", "autonomic"] },
      { id: "oxycodone", label: "Oxycodone", mechanisms: ["hypotension", "autonomic"] },
      { id: "benzodiazepines", label: "Benzodiazepines", mechanisms: ["autonomic"] },
      { id: "levodopa", label: "Levodopa (PD)", mechanisms: ["hypotension", "autonomic"] },
      { id: "pramipexole", label: "Pramipexole", mechanisms: ["hypotension", "autonomic"] },
      { id: "ropinirole", label: "Ropinirole", mechanisms: ["hypotension", "autonomic"] },
      { id: "bromocriptine", label: "Bromocriptine", mechanisms: ["hypotension", "autonomic"] },
      { id: "methyldopa", label: "Methyldopa", mechanisms: ["hypotension", "autonomic"] },
      { id: "guanfacine", label: "Guanfacine", mechanisms: ["hypotension", "brady"] },
    ],
  },
  {
    id: "other",
    title: "Other Notable Triggers",
    description: "Volume/electrolyte disturbance, anaphylaxis, recreational",
    mechanisms: ["hypotension", "idiosyncratic"],
    drugs: [
      { id: "sglt2", label: "SGLT2 inhibitors (osmotic diuresis)", mechanisms: ["hypotension"] },
      { id: "laxatives", label: "High-dose laxatives", mechanisms: ["hypotension"] },
      { id: "chemo-gi", label: "Chemotherapy with GI losses", mechanisms: ["hypotension"] },
      { id: "penicillins", label: "Penicillins / cephalosporins (anaphylaxis)", mechanisms: ["idiosyncratic", "hypotension"] },
      { id: "nsaids-anaphylaxis", label: "NSAIDs (anaphylactoid)", mechanisms: ["idiosyncratic", "hypotension"] },
      { id: "contrast", label: "Radiocontrast agents", mechanisms: ["idiosyncratic", "hypotension"] },
      { id: "alcohol", label: "Alcohol", mechanisms: ["hypotension", "qt"] },
      { id: "cocaine", label: "Cocaine / stimulants", mechanisms: ["qt", "hypotension"] },
    ],
  },
];

interface InteractionRule {
  id: string;
  title: string;
  severity: "high" | "moderate";
  drugs: string[]; // drug ids that must ALL be active
  message: string;
}

const interactionRules: InteractionRule[] = [
  {
    id: "bb-nondhp",
    title: "Beta-blocker + Non-DHP CCB",
    severity: "high",
    drugs: ["__ANY_BB__", "__ANY_NONDHP__"],
    message:
      "Combined negative chronotropic and dromotropic effect — high risk of severe bradycardia and AV block.",
  },
  {
    id: "bb-nondhp-dig",
    title: "Beta-blocker + Non-DHP CCB + Digoxin",
    severity: "high",
    drugs: ["__ANY_BB__", "__ANY_NONDHP__", "digoxin"],
    message:
      "Triple AV-nodal blockade — very high risk of high-grade AV block, bradyarrhythmia, and syncope. Review urgently.",
  },
  {
    id: "bb-ivabradine",
    title: "Beta-blocker + Ivabradine",
    severity: "moderate",
    drugs: ["__ANY_BB__", "ivabradine"],
    message: "Additive sinus node suppression — monitor for symptomatic bradycardia.",
  },
  {
    id: "amio-sotalol",
    title: "Amiodarone + Sotalol / other QT drugs",
    severity: "high",
    drugs: ["__QT_TWO__"],
    message:
      "Two or more QT-prolonging agents combined — increased torsades de pointes risk. Check QTc and electrolytes.",
  },
  {
    id: "qt-macrolide-antipsych",
    title: "QT drug + Macrolide/Fluoroquinolone",
    severity: "high",
    drugs: ["__QT_ONE__", "__ABX_QT__"],
    message: "Antibiotic-driven QT prolongation on top of baseline QT drug — consider alternative antimicrobial.",
  },
  {
    id: "nitrate-pde5",
    title: "Nitrate + PDE-5 inhibitor",
    severity: "high",
    drugs: ["__ANY_NITRATE__", "amp-pde5"],
    message: "Profound vasodilation and syncope risk — contraindicated combination.",
  },
  {
    id: "diuretic-vasodilator",
    title: "Diuretic + ACEi/ARB or α-blocker",
    severity: "moderate",
    drugs: ["__ANY_DIURETIC__", "__ANY_VASO__"],
    message: "Volume depletion plus vasodilation — orthostatic hypotension likely, especially in the elderly.",
  },
  {
    id: "clonidine-bb",
    title: "Clonidine/Methyldopa + Beta-blocker",
    severity: "moderate",
    drugs: ["__ANY_CENTRAL__", "__ANY_BB__"],
    message: "Additive bradycardia; rebound hypertension risk if clonidine abruptly withdrawn.",
  },
  {
    id: "triple-antihtn",
    title: "≥3 antihypertensive/vasodilator agents",
    severity: "moderate",
    drugs: ["__VASO_THREE__"],
    message: "Polypharmacy hypotension risk — check standing BP and consider deprescribing.",
  },
];

const drugSets = {
  BB: ["metoprolol", "bisoprolol", "atenolol", "propranolol", "carvedilol", "nadolol"],
  NONDHP: ["verapamil", "diltiazem"],
  QT: [
    "amiodarone", "sotalol", "quinidine", "procainamide", "flecainide", "propafenone",
    "dofetilide", "ibutilide", "haloperidol", "chlorpromazine", "fluphenazine",
    "quetiapine", "risperidone", "olanzapine", "amitriptyline", "imipramine",
    "citalopram", "escitalopram", "venlafaxine", "ondansetron", "domperidone",
  ],
  ABX_QT: ["erythromycin", "clarithromycin", "moxifloxacin", "levofloxacin"],
  NITRATE: ["nitroglycerin", "isosorbide"],
  DIURETIC: ["furosemide", "bumetanide", "torsemide", "hctz", "chlorthalidone", "indapamide"],
  VASO: [
    "amlodipine", "nifedipine", "felodipine", "enalapril", "lisinopril", "ramipril",
    "losartan", "valsartan", "candesartan", "prazosin", "doxazosin", "terazosin",
    "tamsulosin", "nitroglycerin", "isosorbide",
  ],
  CENTRAL: ["clonidine", "methyldopa", "guanfacine"],
};

function evaluateRule(rule: InteractionRule, data: any): boolean {
  const activeIn = (ids: string[]) => ids.filter((id) => data[id]).length;
  const anyIn = (ids: string[]) => ids.some((id) => data[id]);

  return rule.drugs.every((token) => {
    switch (token) {
      case "__ANY_BB__": return anyIn(drugSets.BB);
      case "__ANY_NONDHP__": return anyIn(drugSets.NONDHP);
      case "__QT_ONE__": return anyIn(drugSets.QT);
      case "__QT_TWO__": return activeIn(drugSets.QT) >= 2;
      case "__ABX_QT__": return anyIn(drugSets.ABX_QT);
      case "__ANY_NITRATE__": return anyIn(drugSets.NITRATE);
      case "__ANY_DIURETIC__": return anyIn(drugSets.DIURETIC);
      case "__ANY_VASO__": return anyIn(drugSets.VASO);
      case "__ANY_CENTRAL__": return anyIn(drugSets.CENTRAL);
      case "__VASO_THREE__": return activeIn(drugSets.VASO) >= 3;
      default: return !!data[token];
    }
  });
}

const SyncopeMedicationsSection = ({ data, onUpdate }: SyncopeMedicationsSectionProps) => {
  const activeInteractions = useMemo(
    () => interactionRules.filter((r) => evaluateRule(r, data)),
    [data]
  );

  const mechanismCounts = useMemo(() => {
    const counts: Record<Mechanism, number> = { brady: 0, qt: 0, hypotension: 0, autonomic: 0, idiosyncratic: 0 };
    drugGroups.forEach((g) =>
      g.drugs.forEach((d) => {
        if (data[d.id]) d.mechanisms.forEach((m) => counts[m]++);
      })
    );
    return counts;
  }, [data]);

  const totalSelected = Object.values(mechanismCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          Medications Implicated in Syncope
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Mark medications the patient is currently taking. Grouped by mechanism to support clinical decision-making.
        </p>
      </div>

      {/* Mechanism summary */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <Label className="text-sm font-medium mb-3 block">Active Mechanisms</Label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(mechanismMeta) as Mechanism[]).map((m) => (
            <span
              key={m}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${mechanismMeta[m].color} ${
                mechanismCounts[m] === 0 ? "opacity-40" : ""
              }`}
            >
              {mechanismMeta[m].label}
              <span className="ml-1 rounded-full bg-background/40 px-1.5 py-0.5 text-[10px] font-semibold">
                {mechanismCounts[m]}
              </span>
            </span>
          ))}
        </div>
        {totalSelected >= 3 && (
          <Alert className="mt-4 border-destructive/40 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle>High-risk polypharmacy</AlertTitle>
            <AlertDescription>
              Multiple syncope-implicated agents detected. Consider deprescribing / medication review.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Interaction warnings */}
      {activeInteractions.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-destructive/5 border-destructive/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h4 className="font-semibold text-foreground">
              Medication Interaction Warnings ({activeInteractions.length})
            </h4>
          </div>
          <div className="space-y-2">
            {activeInteractions.map((rule) => (
              <Alert
                key={rule.id}
                className={
                  rule.severity === "high"
                    ? "border-destructive/50 bg-destructive/10"
                    : "border-amber-500/50 bg-amber-500/10"
                }
              >
                <AlertTriangle
                  className={`h-4 w-4 ${rule.severity === "high" ? "text-destructive" : "text-amber-500"}`}
                />
                <AlertTitle className="flex items-center gap-2">
                  {rule.title}
                  <Badge
                    variant="outline"
                    className={
                      rule.severity === "high"
                        ? "text-[10px] border-destructive/50 text-destructive"
                        : "text-[10px] border-amber-500/50 text-amber-500"
                    }
                  >
                    {rule.severity === "high" ? "High risk" : "Moderate"}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{rule.message}</AlertDescription>
              </Alert>
            ))}
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-destructive/20">
            <strong>Combined syncope risk:</strong>{" "}
            {activeInteractions.some((r) => r.severity === "high")
              ? "HIGH — multiple interacting agents significantly elevate arrhythmic and/or hypotensive syncope risk. Prioritise medication review."
              : "ELEVATED — overlapping mechanisms may contribute to syncope. Reassess necessity and dosing."}
          </div>
        </div>
      )}

      {/* Drug groups */}
      {drugGroups.map((group) => (
        <div key={group.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground">{group.title}</h4>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {group.mechanisms.map((m) => (
                <Badge key={m} variant="outline" className={`text-[10px] ${mechanismMeta[m].color}`}>
                  {mechanismMeta[m].label}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.drugs.map((drug) => (
              <div key={drug.id} className="flex items-start gap-2">
                <Checkbox
                  id={`med-${drug.id}`}
                  checked={data[drug.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [drug.id]: checked })}
                  className="mt-1"
                />
                <Label htmlFor={`med-${drug.id}`} className="font-normal cursor-pointer text-sm leading-snug">
                  {drug.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Separator />

      {/* Risk amplifiers */}
      <div>
        <Label className="text-base font-medium mb-3 block">Risk Amplifiers</Label>
        <div className="space-y-2">
          {[
            { id: "amp-recent-titration", label: "Recent dose escalation / new medication (<4 weeks)" },
            { id: "amp-polypharmacy", label: "Polypharmacy (≥5 agents)" },
            { id: "amp-elderly-frail", label: "Frail / elderly (>75 years)" },
            { id: "amp-hypokalemia", label: "Hypokalemia / hypomagnesemia" },
            { id: "amp-baseline-qt", label: "Baseline long QT / conduction disease" },
            { id: "amp-renal-hepatic", label: "Renal or hepatic impairment (altered clearance)" },
            { id: "amp-pde5", label: "Concurrent PDE-5 inhibitor with nitrate" },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={data[item.id] || false}
                onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
              />
              <Label htmlFor={item.id} className="font-normal cursor-pointer">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Other meds free text */}
      <div>
        <Label htmlFor="other-meds" className="text-sm mb-1 block">Other medications (free text)</Label>
        <Input
          id="other-meds"
          placeholder="Any additional agents not listed above"
          value={data.otherMeds || ""}
          onChange={(e) => onUpdate({ otherMeds: e.target.value })}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="med-notes" className="text-base font-medium mb-3 block">Notes</Label>
        <Textarea
          id="med-notes"
          placeholder="Deprescribing plan, dose changes, timing of medication and symptoms..."
          value={data.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default SyncopeMedicationsSection;
