import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  ThermometerSun,
  ClipboardList,
  Download,
  Printer,
  ChevronDown,
} from "lucide-react";

type Input = {
  trueSyncope: boolean;
  ecg: {
    abnormal: boolean;
    ischemia: boolean;
    bradycardia: boolean;
    tachycardia: boolean;
    qtProlonged: boolean;
    preexcitation: boolean;
    brugadaPattern: boolean;
    afib: boolean;
    avBlock: boolean;
  };
  redFlags: {
    exertional: boolean;
    familyHistorySuddenDeath: boolean;
    structuralHeartDisease: boolean;
    palpitationsBeforeSyncope: boolean;
    syncopeSupine: boolean;
    chestPain: boolean;
    dyspnea: boolean;
  };
  orthostatic: {
    supineSBP: number;
    standingSBP: number;
    supineDBP: number;
    standingDBP: number;
  };
  trigger: {
    pain: boolean;
    emotion: boolean;
    prolongedStanding: boolean;
    heatExposure: boolean;
    nauseaSweating: boolean;
    postMicturition: boolean;
  };
};

type Result = {
  category: "cardiac" | "orthostatic" | "vasovagal" | "unexplained" | "not_syncope";
  badge: string;
  reason: string;
  advice: string[];
};

const initial: Input = {
  trueSyncope: true,
  ecg: {
    abnormal: false,
    ischemia: false,
    bradycardia: false,
    tachycardia: false,
    qtProlonged: false,
    preexcitation: false,
    brugadaPattern: false,
    afib: false,
    avBlock: false,
  },
  redFlags: {
    exertional: false,
    familyHistorySuddenDeath: false,
    structuralHeartDisease: false,
    palpitationsBeforeSyncope: false,
    syncopeSupine: false,
    chestPain: false,
    dyspnea: false,
  },
  orthostatic: { supineSBP: 120, standingSBP: 118, supineDBP: 80, standingDBP: 78 },
  trigger: {
    pain: false,
    emotion: false,
    prolongedStanding: false,
    heatExposure: false,
    nauseaSweating: false,
    postMicturition: false,
  },
};

function classify(i: Input): Result {
  if (!i.trueSyncope) {
    return {
      category: "not_syncope",
      badge: "Not syncope",
      reason: "Event does not fit true syncope.",
      advice: ["Consider seizure, hypoglycemia, TIA, psychogenic TLOC, or intoxication."],
    };
  }
  const ecgRed = Object.values(i.ecg).some(Boolean);
  const rf = Object.values(i.redFlags).some(Boolean);
  if (ecgRed || rf) {
    return {
      category: "cardiac",
      badge: "High risk",
      reason: "Cardiac red flag or abnormal ECG present.",
      advice: [
        "Urgent cardiology/ED evaluation.",
        "12-lead ECG review and monitoring.",
        "Echo / telemetry / troponin as indicated.",
      ],
    };
  }
  const sbp = i.orthostatic.supineSBP - i.orthostatic.standingSBP;
  const dbp = i.orthostatic.supineDBP - i.orthostatic.standingDBP;
  if (sbp >= 20 || dbp >= 10) {
    return {
      category: "orthostatic",
      badge: "Orthostatic",
      reason: `BP drop meets criteria (${sbp}/${dbp} mmHg).`,
      advice: [
        "Check hydration, bleeding, and medications.",
        "Repeat standing BP within 3 minutes.",
        "Consider autonomic dysfunction if recurrent.",
      ],
    };
  }
  const trig = Object.values(i.trigger).some(Boolean);
  if (trig) {
    return {
      category: "vasovagal",
      badge: "Reflex",
      reason: "Trigger/prodrome pattern suggests vasovagal syncope.",
      advice: [
        "Education and trigger avoidance.",
        "Counterpressure maneuvers.",
        "Hydration and salt if appropriate.",
      ],
    };
  }
  return {
    category: "unexplained",
    badge: "Indeterminate",
    reason: "No red flags, orthostasis, or clear reflex trigger.",
    advice: ["Targeted follow-up with history, ECG, and selective tests."],
  };
}

function get(obj: any, path: string) {
  return path.split(".").reduce((a, k) => a?.[k], obj);
}

export default function SyncopeMiniApp() {
  const [i, setI] = useState<Input>(initial);
  const [showInterpretation, setShowInterpretation] = useState<boolean>(false);
  const r = useMemo(() => classify(i), [i]);

  const tone =
    r.category === "cardiac"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : r.category === "orthostatic"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : r.category === "vasovagal"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const set = (path: string, v: boolean) =>
    setI((p) => {
      const n = structuredClone(p) as Input;
      const [g, k] = path.split(".");
      (n as any)[g][k] = v;
      return n;
    });

  const setNum = (k: keyof Input["orthostatic"], v: number) =>
    setI((p) => ({ ...p, orthostatic: { ...p.orthostatic, [k]: v } }));

  const copy = async () => {
    const txt = `Syncope: ${r.category}\nReason: ${r.reason}\nAdvice:\n- ${r.advice.join("\n- ")}`;
    await navigator.clipboard.writeText(txt);
  };

  return (
    <div className="text-slate-900">
      <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-lg md:p-8">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">
          SYNCOPE MINI APP
        </div>
        <h2 className="mt-4 text-2xl font-bold md:text-4xl">Fast triage for true syncope</h2>
        <p className="mt-3 max-w-3xl text-slate-300 text-sm md:text-base">
          Use this at the bedside to screen for cardiac risk, orthostatic hypotension, and vasovagal features in a few taps.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Panel title="Presentation" icon={<ClipboardList size={18} />} className="lg:col-span-5">
          <Check
            label="True syncope with spontaneous recovery"
            checked={i.trueSyncope}
            onChange={(v) => setI((p) => ({ ...p, trueSyncope: v }))}
          />
          <Section title="Cardiac red flags" icon={<AlertTriangle size={16} />}>
            {[
              ["redFlags.exertional", "Exertional syncope"],
              ["redFlags.familyHistorySuddenDeath", "Family history sudden death"],
              ["redFlags.structuralHeartDisease", "Known structural heart disease"],
              ["redFlags.palpitationsBeforeSyncope", "Palpitations before syncope"],
              ["redFlags.syncopeSupine", "Syncope while supine"],
              ["redFlags.chestPain", "Chest pain"],
              ["redFlags.dyspnea", "Dyspnea"],
            ].map(([k, l]) => (
              <Check key={k} label={l as string} checked={get(i, k as string)} onChange={(v) => set(k as string, v)} />
            ))}
          </Section>
        </Panel>

        <Panel title="Orthostatic BP" icon={<Activity size={18} />} className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["supineSBP", "Supine SBP"],
              ["standingSBP", "Standing SBP"],
              ["supineDBP", "Supine DBP"],
              ["standingDBP", "Standing DBP"],
            ].map(([k, l]) => (
              <Field
                key={k}
                label={l as string}
                value={i.orthostatic[k as keyof Input["orthostatic"]]}
                onChange={(v) => setNum(k as keyof Input["orthostatic"], v)}
              />
            ))}
          </div>
          <Section title="Triggers / prodrome" icon={<ThermometerSun size={16} />}>
            {[
              ["trigger.pain", "Pain"],
              ["trigger.emotion", "Emotion / fear"],
              ["trigger.prolongedStanding", "Prolonged standing"],
              ["trigger.heatExposure", "Heat exposure"],
              ["trigger.nauseaSweating", "Nausea / sweating"],
              ["trigger.postMicturition", "Post-micturition"],
            ].map(([k, l]) => (
              <Check key={k} label={l as string} checked={get(i, k as string)} onChange={(v) => set(k as string, v)} />
            ))}
          </Section>
        </Panel>

        <Panel title="ECG checklist" icon={<HeartPulse size={18} />} className="lg:col-span-3">
          <div className="space-y-2">
            {[
              ["ecg.abnormal", "Abnormal ECG"],
              ["ecg.ischemia", "Ischemic changes"],
              ["ecg.bradycardia", "Bradycardia"],
              ["ecg.tachycardia", "Tachycardia"],
              ["ecg.qtProlonged", "QT prolongation"],
              ["ecg.preexcitation", "Pre-excitation"],
              ["ecg.brugadaPattern", "Brugada pattern"],
              ["ecg.afib", "Atrial fibrillation"],
              ["ecg.avBlock", "AV block"],
            ].map(([k, l]) => (
              <Check key={k} label={l as string} checked={get(i, k as string)} onChange={(v) => set(k as string, v)} />
            ))}
          </div>
        </Panel>

        <div className="lg:col-span-12 grid gap-5 xl:grid-cols-3">
          <div className={`rounded-3xl border p-5 shadow-lg xl:col-span-1 ${tone}`}>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Disposition</div>
            <div className="mt-2 text-3xl font-bold capitalize">{r.badge}</div>
            <div className="mt-2 text-sm">{r.reason}</div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
              {r.advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                <Download size={16} />
                Copy
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg xl:col-span-2">
            <h3 className="text-lg font-semibold">How to use</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Confirm true syncope with spontaneous recovery.</li>
              <li>Check ECG and red flags first.</li>
              <li>Measure standing BP within 3 minutes.</li>
              <li>Look for classic vasovagal triggers or prodrome.</li>
            </ol>
            <p className="mt-4 text-sm text-slate-500">
              Orthostatic hypotension is flagged when SBP drops by at least 20 mmHg or DBP by at least 10 mmHg on standing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-lg ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm leading-5 text-slate-700">{label}</span>
    </label>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
      />
    </div>
  );
}
