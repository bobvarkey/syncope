import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pill, Timer, Footprints, Gauge } from "lucide-react";
import {
  overallRisk,
  chairStandThreshold,
  tugAtRisk,
  balanceAtRisk,
  screenPositive,
  type Assessment,
} from "@/lib/fallsRisk";

const GAIT = [
  "Loss of balance / staggering",
  "Shuffling or short steps",
  "Wide base of support",
  "Uses walls or furniture for support",
  "Slow, hesitant gait",
  "Poor foot clearance",
  "Asymmetric step length",
  "Reduced arm swing",
  "Veers off path",
];

const BALANCE = [
  "Feet side by side",
  "Semi-tandem (instep touching big toe)",
  "Tandem (heel to toe)",
  "Single-leg stand",
];

const initial: Assessment = {
  age: null,
  sex: "female",
  fellPastYear: false,
  feelsUnsteady: false,
  worriesAboutFalling: false,
  tugSeconds: null,
  chairStands: null,
  balanceStage: 0,
  gaitObservations: [],
};

function Stopwatch({ onStop, limit }: { onStop: (s: number) => void; limit?: number }) {
  const [ms, setMs] = useState(0);
  const [run, setRun] = useState(false);
  const start = useRef(0);

  useEffect(() => {
    if (!run) return;
    start.current = performance.now() - ms;
    const id = setInterval(() => {
      const t = performance.now() - start.current;
      if (limit && t >= limit * 1000) {
        setMs(limit * 1000);
        setRun(false);
        onStop(limit);
      } else setMs(t);
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-3xl font-bold tabular-nums text-primary">{(ms / 1000).toFixed(1)}s</span>
      {!run ? (
        <Button
          onClick={() => {
            if (!ms || limit) setMs(0);
            setRun(true);
          }}
        >
          Start
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setRun(false);
            onStop(+(ms / 1000).toFixed(1));
          }}
        >
          Stop
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => {
          setRun(false);
          setMs(0);
        }}
      >
        Reset
      </Button>
    </div>
  );
}

function Section({
  n,
  title,
  hint,
  children,
  flag,
  icon,
}: {
  n: number;
  title: string;
  hint: string;
  children: React.ReactNode;
  flag?: boolean | null;
  icon?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Step {n}
          </p>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            {icon}
            {title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        {flag != null && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              flag ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-600"
            }`}
          >
            {flag ? "At risk" : "Within norms"}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-md px-4 py-1 text-sm font-medium transition ${
              value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

const inputCls =
  "w-28 rounded-md border border-input bg-background px-3 py-2 text-lg tabular-nums outline-none focus:ring-2 focus:ring-ring";

interface SteadiScreeningProps {
  onOpenMfrs: () => void;
}

export default function SteadiScreening({ onOpenMfrs }: SteadiScreeningProps) {
  const [a, setA] = useState<Assessment>(initial);
  const [name, setName] = useState("");
  const set = <K extends keyof Assessment>(k: K, v: Assessment[K]) => setA((p) => ({ ...p, [k]: v }));
  const num = (v: string) => (v === "" ? null : Number(v));
  const risk = overallRisk(a);
  const threshold = a.age != null ? chairStandThreshold(a.age, a.sex) : null;

  const levelStyle = {
    low: "bg-emerald-600 text-white",
    moderate: "bg-amber-500 text-amber-950",
    high: "bg-destructive text-destructive-foreground",
  }[risk.level];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Section n={1} title="Patient" hint="Age and sex set the chair-stand norms.">
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-sm">
              Name
              <br />
              <input className={inputCls + " w-56"} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="text-sm">
              Age
              <br />
              <input
                type="number"
                className={inputCls}
                value={a.age ?? ""}
                onChange={(e) => set("age", num(e.target.value))}
              />
            </label>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["female", "male"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("sex", s)}
                  className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${
                    a.sex === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section
          n={2}
          title="Falls screening"
          hint="Any “yes” is a positive screen (CDC STEADI)."
          flag={screenPositive(a)}
        >
          <YesNo
            label="Fallen in the past year?"
            value={a.fellPastYear}
            onChange={(v) => set("fellPastYear", v)}
          />
          <YesNo
            label="Feels unsteady when standing or walking?"
            value={a.feelsUnsteady}
            onChange={(v) => set("feelsUnsteady", v)}
          />
          <YesNo
            label="Worries about falling?"
            value={a.worriesAboutFalling}
            onChange={(v) => set("worriesAboutFalling", v)}
          />
        </Section>

        <Section
          n={3}
          title="Timed Up & Go"
          hint="Rise from chair, walk 3 m at usual pace, turn, return and sit. ≥ 12 s indicates risk."
          flag={a.tugSeconds != null ? tugAtRisk(a.tugSeconds) : null}
          icon={<Timer className="h-4 w-4 text-primary" />}
        >
          <Stopwatch onStop={(s) => set("tugSeconds", s)} />
          <label className="mt-4 block text-sm">
            Recorded time (s)
            <br />
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={a.tugSeconds ?? ""}
              onChange={(e) => set("tugSeconds", num(e.target.value))}
            />
          </label>
        </Section>

        <Section
          n={4}
          title="30-second chair stand"
          hint={`Arms crossed, count full stands in 30 s.${
            threshold != null
              ? ` Below ${threshold} is at risk for this patient.`
              : " Enter age 60–94 for norms."
          }`}
          flag={threshold != null && a.chairStands != null ? a.chairStands < threshold : null}
          icon={<Gauge className="h-4 w-4 text-primary" />}
        >
          <Stopwatch limit={30} onStop={() => {}} />
          <label className="mt-4 block text-sm">
            Number of stands
            <br />
            <input
              type="number"
              className={inputCls}
              value={a.chairStands ?? ""}
              onChange={(e) => set("chairStands", num(e.target.value))}
            />
          </label>
        </Section>

        <Section
          n={5}
          title="4-stage balance"
          hint="Select the highest stance held for 10 s without support. Failing tandem indicates risk."
          flag={a.balanceStage ? balanceAtRisk(a.balanceStage) : null}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {BALANCE.map((b, i) => (
              <button
                key={b}
                type="button"
                onClick={() => set("balanceStage", i + 1)}
                className={`rounded-xl border p-4 text-left transition ${
                  a.balanceStage === i + 1
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-2xl font-bold text-primary">{i + 1}</span>
                <p className="text-sm">{b}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section
          n={6}
          title="Gait observation"
          hint="Observe during TUG and a 10 m walk."
          flag={a.gaitObservations.length ? true : null}
          icon={<Footprints className="h-4 w-4 text-primary" />}
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {GAIT.map((g) => {
              const on = a.gaitObservations.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    set(
                      "gaitObservations",
                      on ? a.gaitObservations.filter((x) => x !== g) : [...a.gaitObservations, g]
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    on ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
          <div className={`p-5 ${levelStyle}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
              Fall risk{name && ` · ${name}`}
            </p>
            <p className="text-3xl font-bold capitalize">{risk.level}</p>
          </div>
          <div className="space-y-3 p-5 text-sm">
            <p className="font-semibold">Findings</p>
            {risk.flags.length ? (
              <ul className="list-disc space-y-1 pl-5">
                {risk.flags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No objective deficits recorded.</p>
            )}
            <p className="pt-2 font-semibold">Suggested next steps</p>
            <p className="text-muted-foreground">
              {risk.level === "low" && "Educate on fall prevention; reassess annually."}
              {risk.level === "moderate" &&
                "Review medications, vision and footwear; consider a strength & balance exercise program."}
              {risk.level === "high" &&
                "Multifactorial assessment: physiotherapy referral, medication review, orthostatic BP, vision and home safety."}
            </p>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onOpenMfrs}>
              <Pill className="h-4 w-4" />
              Medication fall risk (MFRS)
            </Button>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={() => window.print()}>
                Print
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setA(initial);
                  setName("");
                }}
              >
                New
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Clinical decision support only — not a substitute for professional judgment. Pair physical
          measures with the MFRS, which captures only drug-related risk.
        </p>
      </aside>
    </div>
  );
}
