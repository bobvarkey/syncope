import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Gauge } from "lucide-react";
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
} from "@/lib/autonomicNorms";
import {
  Num,
  Reading,
  computeAdrenergic,
  computeCanStage,
  computeCardiovagal,
  computeMcassTotal,
  computeOrtho,
  computePattern,
  computePots,
  computeSudomotor,
  isNum,
} from "@/lib/mcassScoring";

interface AutonomicTestingSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const num = (v: string): Num => (v === "" ? "" : Number(v));

const TIMEPOINTS = [0, 1, 3, 5, 10];

const emptyMcass = () => ({
  age: "" as Num,
  sex: "" as Sex | "",
  hrdb: "" as Num,
  ei: "" as Num,
  vr: "" as Num,
  ratio3015: "" as Num,
  ratio3015LLN: "" as Num,
  readings: TIMEPOINTS.map((t) => ({ t, sbp: "" as Num, dbp: "" as Num, hr: "" as Num, symptoms: [] as string[] })),
  baselineHypertensive: false,
  latePhaseII: "",
  phaseIV: "",
  prt100: "" as Num,
  prt50: "" as Num,
  sudoMode: "sudoscan" as "sudoscan" | "qsart",
  sudoscan: { rHand: "" as Num, lHand: "" as Num, rFoot: "" as Num, lFoot: "" as Num },
  sudoscanLln: { hand: "" as Num, foot: "" as Num },
  qsart: { forearm: "" as Num, proximal_leg: "" as Num, distal_leg: "" as Num, foot: "" as Num },
  labOverrides: {} as LabOverrides,
});

/** Same badge semantics as the mCASS analyzer (normal / borderline-high / abnormal-low). */
const MiniStatusBadge = ({ status }: { status: string }) => {
  if (status === "unknown") return <Badge variant="outline">—</Badge>;
  if (status === "normal") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Normal</Badge>;
  if (status === "high") return <Badge className="bg-amber-500 hover:bg-amber-500">Borderline / high</Badge>;
  return <Badge variant="destructive">Abnormal (below LLN)</Badge>;
};

const MiniNormField = ({
  label,
  unit,
  value,
  onChange,
  range,
  status,
}: {
  label: string;
  unit?: string;
  value: Num;
  onChange: (v: Num) => void;
  range: { LLN: number; ULN: number } | null;
  status: string;
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
      <span>{range ? `Reference ${range.LLN} – ${range.ULN}` : "Select age & sex for norms"}</span>
      <MiniStatusBadge status={status} />
    </div>
  </div>
);

/**
 * Structured mCASS scoring block that reuses the same Indian age/sex normative
 * dataset and shared scoring logic (src/lib/mcassScoring.ts) as the CAN / mCASS
 * Autonomic Function Analyzer mini-app, so both surfaces produce identical
 * scores, severity and CAN staging for the same inputs.
 */
const McassScoringPanel = ({ data, onUpdate }: AutonomicTestingSectionProps) => {
  const m = { ...emptyMcass(), ...(data.mcass || {}) };
  const set = (patch: Record<string, unknown>) => onUpdate({ mcass: { ...m, ...patch } });
  const setOverride = (test: "hrdb" | "ei" | "vr" | "prt100" | "prt50", field: "LLN" | "ULN", value: Num) =>
    set({ labOverrides: { ...m.labOverrides, [test]: { ...m.labOverrides[test], [field]: value === "" ? undefined : Number(value) } } });
  const setQsartOverride = (site: QsartSite, field: "LLN" | "ULN", value: Num) =>
    set({
      labOverrides: {
        ...m.labOverrides,
        qsart: { ...m.labOverrides.qsart, [site]: { ...m.labOverrides.qsart?.[site], [field]: value === "" ? undefined : Number(value) } },
      },
    });
  const updateReading = (t: number, patch: Partial<Reading>) =>
    set({ readings: m.readings.map((rd: Reading) => (rd.t === t ? { ...rd, ...patch } : rd)) });

  const sex = m.sex || "";
  const cardiovagal = computeCardiovagal({
    age: m.age,
    sex,
    hrdb: m.hrdb,
    ei: m.ei,
    vr: m.vr,
    ratio3015: m.ratio3015,
    ratio3015LLN: m.ratio3015LLN,
    overrides: m.labOverrides,
  });
  const ortho = computeOrtho(m.readings, m.baselineHypertensive, m.age);
  const adrenergic = computeAdrenergic({
    age: m.age,
    sex,
    latePhaseII: m.latePhaseII,
    phaseIV: m.phaseIV,
    prt100: m.prt100,
    prt50: m.prt50,
    ortho,
    overrides: m.labOverrides,
  });
  const sudomotor = computeSudomotor({
    age: m.age,
    sex,
    sudoMode: m.sudoMode,
    sudoscan: m.sudoscan,
    sudoscanLln: m.sudoscanLln,
    qsart: m.qsart,
    overrides: m.labOverrides,
  });
  const { total, severity } = computeMcassTotal(cardiovagal.score, adrenergic.score, sudomotor.score);
  const canStage = computeCanStage(cardiovagal.hrdbStatus, cardiovagal.vrStatus, cardiovagal.r3015Status, ortho.classical);
  const pots = computePots(ortho);
  const pattern = computePattern(cardiovagal.score, adrenergic.score, sudomotor.score);

  return (
    <div className="border-2 rounded-lg p-4 space-y-6">
      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          Structured mCASS Scoring — Indian age/sex norms
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Uses the same Indian adult reference dataset and scoring logic as the CAN / mCASS
          Autonomic Function Analyzer mini-app, so both give identical numbers for the same inputs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Age (years)</Label>
          <Input type="number" value={m.age === "" ? "" : m.age} onChange={(e) => set({ age: num(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Sex</Label>
          <Select value={m.sex} onValueChange={(v) => set({ sex: v as Sex })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end text-xs text-muted-foreground">
          {getAgeGroup(m.age) && sex
            ? <>Indian dataset age group <strong className="mx-1">{getAgeGroup(m.age)}</strong>, {sex}</>
            : <>Enter age (≥20 y, groups {AGE_GROUPS.join(", ")}) and sex to auto-select norms.</>}
        </div>
      </div>

      <Separator />

      {/* Cardiovagal */}
      <div className="space-y-3">
        <h5 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Cardiovagal</h5>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniNormField label="HRDB (ΔHR deep breathing)" unit="bpm" value={m.hrdb} onChange={(v) => set({ hrdb: v })} range={cardiovagal.hrdbRange} status={cardiovagal.hrdbStatus} />
          <MiniNormField label="E:I ratio" value={m.ei} onChange={(v) => set({ ei: v })} range={cardiovagal.eiRange} status={cardiovagal.eiStatus} />
          <MiniNormField label="Valsalva ratio" value={m.vr} onChange={(v) => set({ vr: v })} range={cardiovagal.vrRange} status={cardiovagal.vrStatus} />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">30:15 standing ratio</Label>
            <Input type="number" step="0.01" value={m.ratio3015 === "" ? "" : m.ratio3015} onChange={(e) => set({ ratio3015: num(e.target.value) })} />
            <Input type="number" step="0.01" placeholder="Laboratory LLN (optional)" value={m.ratio3015LLN === "" ? "" : m.ratio3015LLN} onChange={(e) => set({ ratio3015LLN: num(e.target.value) })} />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {isNum(m.ratio3015LLN)
                  ? "Using laboratory LLN"
                  : cardiovagal.ratio3015Fallback
                  ? `Provisional fallback: normal ≥${cardiovagal.ratio3015Fallback.normalLLN}`
                  : "Enter age or a laboratory LLN"}
              </span>
              <MiniStatusBadge status={cardiovagal.r3015Status} />
            </div>
          </div>
        </div>
        <Badge variant="secondary">Cardiovagal score {cardiovagal.score} / 3</Badge>
      </div>

      <Separator />

      {/* Orthostatic */}
      <div className="space-y-3">
        <h5 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Orthostatic (supine → stand/tilt)</h5>
        <div className="flex items-center space-x-2">
          <Checkbox checked={m.baselineHypertensive} onCheckedChange={(v) => set({ baselineHypertensive: !!v })} id="mcass-htn" />
          <Label htmlFor="mcass-htn" className="cursor-pointer font-normal text-sm">Hypertensive baseline (≥150/90) — substantial-fall thresholds</Label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">SBP</th>
                <th className="py-2 pr-3">DBP</th>
                <th className="py-2">HR</th>
              </tr>
            </thead>
            <tbody>
              {m.readings.map((rd: Reading) => (
                <tr key={rd.t} className="border-b">
                  <td className="py-2 pr-3 font-medium">{rd.t === 0 ? "Supine" : `${rd.t} min`}</td>
                  {(["sbp", "dbp", "hr"] as const).map((f) => (
                    <td key={f} className="py-2 pr-3">
                      <Input type="number" className="w-24" value={rd[f] === "" ? "" : (rd[f] as number)} onChange={(e) => updateReading(rd.t, { [f]: num(e.target.value) } as any)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Max SBP fall {ortho.maxSbpFall ?? "—"} mmHg</Badge>
          <Badge variant="outline">Max HR rise {ortho.maxHrRise ?? "—"} bpm</Badge>
          <Badge variant="outline">{ortho.classical ? "Classical OH" : ortho.delayed ? "Delayed OH" : "No OH"}</Badge>
          <Badge variant="outline">POTS: {pots.met ? `met at ${pots.timeToCriterion} min` : "not met"} (threshold {pots.threshold} bpm)</Badge>
        </div>
      </div>

      <Separator />

      {/* Adrenergic */}
      <div className="space-y-3">
        <h5 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Adrenergic (Valsalva BP)</h5>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Late phase II</Label>
            <Select value={m.latePhaseII} onValueChange={(v) => set({ latePhaseII: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="reduced">Reduced</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Phase IV overshoot</Label>
            <Select value={m.phaseIV} onValueChange={(v) => set({ phaseIV: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="reduced">Reduced</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MiniNormField label="PRT100" unit="s" value={m.prt100} onChange={(v) => set({ prt100: v })} range={adrenergic.prt100Range} status={adrenergic.prt100Status === "high" ? "low" : adrenergic.prt100Status} />
          <MiniNormField label="PRT50" unit="s" value={m.prt50} onChange={(v) => set({ prt50: v })} range={adrenergic.prt50Range} status={adrenergic.prt50Status === "high" ? "low" : adrenergic.prt50Status} />
        </div>
        <Badge variant="secondary">Adrenergic score {adrenergic.score} / 4</Badge>
      </div>

      <Separator />

      {/* Sudomotor */}
      <div className="space-y-3">
        <h5 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Sudomotor</h5>
        <Select value={m.sudoMode} onValueChange={(v) => set({ sudoMode: v })}>
          <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sudoscan">Sudoscan (electrochemical skin conductance)</SelectItem>
            <SelectItem value="qsart">QSART (preferred)</SelectItem>
          </SelectContent>
        </Select>
        {m.sudoMode === "sudoscan" ? (
          <div className="grid gap-4 md:grid-cols-4">
            {([["rHand", "Right palm"], ["lHand", "Left palm"], ["rFoot", "Right sole"], ["lFoot", "Left sole"]] as const).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label} (µS)</Label>
                <Input type="number" value={m.sudoscan[key] === "" ? "" : m.sudoscan[key]} onChange={(e) => set({ sudoscan: { ...m.sudoscan, [key]: num(e.target.value) } })} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {QSART_SITES.map((site) => {
              const range = applyOverride(getQsartRange(m.age, sex, site.key), m.labOverrides.qsart?.[site.key]);
              return (
                <MiniNormField
                  key={site.key}
                  label={site.label}
                  unit="µL"
                  value={m.qsart[site.key]}
                  onChange={(v) => set({ qsart: { ...m.qsart, [site.key]: v } })}
                  range={range}
                  status={classifyAgainst(m.qsart[site.key], range)}
                />
              );
            })}
          </div>
        )}
        {m.sudoMode === "sudoscan" && (
          <p className="text-[11px] text-muted-foreground">
            {SUDOSCAN_GUIDE.map((g) => `${g.band} — ${g.meaning}`).join(" · ")}
          </p>
        )}
        <Badge variant="secondary">Sudomotor score {sudomotor.score} / 3</Badge>
      </div>

      <Separator />

      {/* Lab norms override */}
      <div className="rounded-lg border p-3 space-y-3">
        <Label className="text-sm font-semibold">Laboratory norms override</Label>
        <p className="text-xs text-muted-foreground">
          Enter your own lab-specific LLN/ULN to replace the Indian dataset for a test (same
          override shape as the analyzer). Leave blank to keep using the dataset.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["hrdb", "HRDB (bpm)"],
            ["ei", "E:I ratio"],
            ["vr", "Valsalva ratio"],
            ["prt100", "PRT100 (s)"],
            ["prt50", "PRT50 (s)"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" placeholder="LLN" value={m.labOverrides[key]?.LLN ?? ""} onChange={(e) => setOverride(key, "LLN", num(e.target.value))} />
                <Input type="number" step="0.01" placeholder="ULN" value={m.labOverrides[key]?.ULN ?? ""} onChange={(e) => setOverride(key, "ULN", num(e.target.value))} />
              </div>
            </div>
          ))}
          {QSART_SITES.map((site) => (
            <div key={site.key} className="space-y-1.5">
              <Label className="text-xs">QSART {site.label} (µL)</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.001" placeholder="LLN" value={m.labOverrides.qsart?.[site.key]?.LLN ?? ""} onChange={(e) => setQsartOverride(site.key, "LLN", num(e.target.value))} />
                <Input type="number" step="0.001" placeholder="ULN" value={m.labOverrides.qsart?.[site.key]?.ULN ?? ""} onChange={(e) => setQsartOverride(site.key, "ULN", num(e.target.value))} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Results */}
      <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Cardiovagal /3", value: cardiovagal.score },
            { label: "Adrenergic /4", value: adrenergic.score },
            { label: "Sudomotor /3", value: sudomotor.score },
            { label: "mCASS total /10", value: total },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border bg-background p-3 text-center">
              <div className="text-2xl font-bold">{d.value}</div>
              <div className="text-[11px] text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm"><span className="font-semibold">Severity:</span> {severity}</p>
        <p className="text-sm"><span className="font-semibold">CAN stage:</span> {canStage.stage} ({canStage.count} abnormal cardiovagal test(s))</p>
        <p className="text-sm"><span className="font-semibold">Autonomic pattern:</span> {pattern}</p>
      </div>
    </div>
  );
};

const AutonomicTestingSection = ({ data, onUpdate }: AutonomicTestingSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Autonomic Testing — Finometer / Finapres Beat-to-Beat Recording
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Continuous non-invasive arterial pressure monitoring with beat-to-beat haemodynamic analysis
        </p>
      </div>

      <Alert className="bg-muted/50 border-muted-foreground/20">
        <Activity className="h-4 w-4" />
        <AlertTitle>Equipment</AlertTitle>
        <AlertDescription>
          Finometer / Finapres device with finger cuff for continuous BP, cardiac output (CO), 
          total peripheral resistance (TPR), and stroke volume (SV) measurement.
        </AlertDescription>
      </Alert>

      {/* Test performed */}
      <div>
        <Label className="text-base font-medium mb-3 block">Was Finometer beat-to-beat recording performed?</Label>
        <RadioGroup
          value={data.performed}
          onValueChange={(value) => onUpdate({ performed: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="finometer-yes" />
            <Label htmlFor="finometer-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="finometer-no" />
            <Label htmlFor="finometer-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {data.performed === 'yes' && (
        <>
          {/* Protocol */}
          <div>
            <Label className="text-base font-medium mb-3 block">Protocol Used</Label>
            <Select value={data.protocol || ''} onValueChange={(value) => onUpdate({ protocol: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supine-standing">Supine → Active Standing</SelectItem>
                <SelectItem value="supine-tilt">Supine → Head-up Tilt (60–70°)</SelectItem>
                <SelectItem value="valsalva">Valsalva Manoeuvre</SelectItem>
                <SelectItem value="deep-breathing">Deep Breathing (6 breaths/min)</SelectItem>
                <SelectItem value="isometric-handgrip">Isometric Handgrip</SelectItem>
                <SelectItem value="cold-pressor">Cold Pressor Test</SelectItem>
                <SelectItem value="combined">Combined Protocol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Baseline haemodynamics */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Baseline Haemodynamics (Supine)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">SBP (mmHg)</Label>
                <Input placeholder="e.g., 125" value={data.baselineSBP || ''} onChange={(e) => onUpdate({ baselineSBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">DBP (mmHg)</Label>
                <Input placeholder="e.g., 78" value={data.baselineDBP || ''} onChange={(e) => onUpdate({ baselineDBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Heart Rate (bpm)</Label>
                <Input placeholder="e.g., 72" value={data.baselineHR || ''} onChange={(e) => onUpdate({ baselineHR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Cardiac Output (L/min)</Label>
                <Input placeholder="e.g., 5.2" value={data.baselineCO || ''} onChange={(e) => onUpdate({ baselineCO: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Stroke Volume (mL)</Label>
                <Input placeholder="e.g., 72" value={data.baselineSV || ''} onChange={(e) => onUpdate({ baselineSV: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">TPR (dyn·s/cm⁵)</Label>
                <Input placeholder="e.g., 1200" value={data.baselineTPR || ''} onChange={(e) => onUpdate({ baselineTPR: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Nadir / Stress haemodynamics */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Nadir / Stress Haemodynamics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">Lowest SBP (mmHg)</Label>
                <Input placeholder="e.g., 82" value={data.nadirSBP || ''} onChange={(e) => onUpdate({ nadirSBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Lowest DBP (mmHg)</Label>
                <Input placeholder="e.g., 50" value={data.nadirDBP || ''} onChange={(e) => onUpdate({ nadirDBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Max HR (bpm)</Label>
                <Input placeholder="e.g., 110" value={data.maxHR || ''} onChange={(e) => onUpdate({ maxHR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min CO (L/min)</Label>
                <Input placeholder="e.g., 3.1" value={data.nadirCO || ''} onChange={(e) => onUpdate({ nadirCO: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min SV (mL)</Label>
                <Input placeholder="e.g., 40" value={data.nadirSV || ''} onChange={(e) => onUpdate({ nadirSV: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min TPR (dyn·s/cm⁵)</Label>
                <Input placeholder="e.g., 600" value={data.nadirTPR || ''} onChange={(e) => onUpdate({ nadirTPR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Time to nadir (min)</Label>
                <Input placeholder="e.g., 3" value={data.timeToNadir || ''} onChange={(e) => onUpdate({ timeToNadir: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Baroreflex sensitivity */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Baroreflex Sensitivity (BRS)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">BRS (ms/mmHg)</Label>
                <Input placeholder="e.g., 12" value={data.brs || ''} onChange={(e) => onUpdate({ brs: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">BRS Interpretation</Label>
                <Select value={data.brsInterpretation || ''} onValueChange={(value) => onUpdate({ brsInterpretation: value })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Heart Rate Variability */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Heart Rate Variability (HRV)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">LF Power (ms²)</Label>
                <Input placeholder="e.g., 800" value={data.lfPower || ''} onChange={(e) => onUpdate({ lfPower: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">HF Power (ms²)</Label>
                <Input placeholder="e.g., 400" value={data.hfPower || ''} onChange={(e) => onUpdate({ hfPower: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">LF/HF Ratio</Label>
                <Input placeholder="e.g., 2.0" value={data.lfHfRatio || ''} onChange={(e) => onUpdate({ lfHfRatio: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Autonomic pattern interpretation */}
          <div>
            <Label className="text-base font-medium mb-3 block">Autonomic Response Pattern</Label>
            <RadioGroup
              value={data.responsePattern || ''}
              onValueChange={(value) => onUpdate({ responsePattern: value })}
              className="space-y-3"
            >
              {[
                { value: "normal", label: "Normal autonomic response" },
                { value: "classic-oh", label: "Classic Orthostatic Hypotension (sustained SBP drop ≥20 mmHg within 3 min)" },
                { value: "initial-oh", label: "Initial Orthostatic Hypotension (transient SBP drop >40 mmHg within 15 s)" },
                { value: "delayed-oh", label: "Delayed Orthostatic Hypotension (progressive SBP drop after 3 min)" },
                { value: "vasodepressor", label: "Vasodepressor pattern (TPR drop, maintained CO)" },
                { value: "cardioinhibitory", label: "Cardioinhibitory pattern (HR drop, CO drop)" },
                { value: "mixed", label: "Mixed pattern (both vasodepressor + cardioinhibitory)" },
                { value: "pots", label: "POTS pattern (HR rise ≥30 bpm or >120 bpm within 10 min, no significant BP drop)" },
                { value: "autonomic-failure", label: "Autonomic Failure (progressive BP drop, no compensatory HR rise)" },
              ].map((item) => (
                <div key={item.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={item.value} id={`pattern-${item.value}`} className="mt-1" />
                  <Label htmlFor={`pattern-${item.value}`} className="font-normal cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Valsalva phases */}
          <div>
            <Label className="text-base font-medium mb-3 block">Valsalva Manoeuvre Phases (if performed)</Label>
            <div className="space-y-3">
              {[
                { id: "valsalva-performed", label: "Valsalva manoeuvre performed" },
                { id: "valsalva-phase2-late-absent", label: "Late Phase II recovery absent (sympathetic failure)" },
                { id: "valsalva-phase4-absent", label: "Phase IV overshoot absent (baroreflex failure)" },
                { id: "valsalva-flat-top", label: "Flat-top pattern (adrenergic failure)" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms during test */}
          <div>
            <Label className="text-base font-medium mb-3 block">Symptoms During Testing</Label>
            <div className="space-y-3">
              {[
                { id: "symptom-dizziness", label: "Dizziness / lightheadedness" },
                { id: "symptom-presyncope", label: "Pre-syncope" },
                { id: "symptom-syncope", label: "Syncope during test" },
                { id: "symptom-palpitations", label: "Palpitations" },
                { id: "symptom-visual", label: "Visual disturbances (greying/blacking out)" },
                { id: "symptom-nausea", label: "Nausea" },
                { id: "symptom-diaphoresis", label: "Diaphoresis" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="autonomic-notes" className="text-base font-medium mb-3 block">Clinical Notes</Label>
            <Textarea
              id="autonomic-notes"
              placeholder="Additional observations, beat-to-beat waveform comments, cerebral autoregulation findings..."
              value={data.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </>
      )}

      <Separator />
      <McassScoringPanel data={data} onUpdate={onUpdate} />
    </div>
  );
};

export default AutonomicTestingSection;
