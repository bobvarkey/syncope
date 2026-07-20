import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Share2,
  Timer,
  ChevronDown,
  Save,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

type ProtocolType = "standard" | "italian";

type Phase = {
  id: string;
  name: string;
  minSeconds: number;
  maxSeconds: number;
  detail: string;
};

type Observation = {
  id: string;
  timeSeconds: number;
  phase: string;
  hr: number | "";
  sbp: number | "";
  dbp: number | "";
  symptoms: string;
};

type Interpretation =
  | "vasodepressor"
  | "cardioinhibitory"
  | "mixed"
  | "pots"
  | "orthostaticHypotension"
  | "delayedOH"
  | "psychogenic"
  | "nonDiagnostic";

const PROTOCOLS: Record<ProtocolType, { label: string; description: string; phases: Phase[] }> = {
  standard: {
    label: "Standard (Westminster)",
    description:
      "Passive head-up tilt at 60–70° for 20–45 minutes with continuous ECG and beat-to-beat BP.",
    phases: [
      { id: "supine", name: "Supine rest", minSeconds: 300, maxSeconds: 600, detail: "5–10 min supine baseline; record HR & BP." },
      { id: "passive", name: "Passive tilt 60–70°", minSeconds: 1200, maxSeconds: 2700, detail: "20–45 min passive upright observation." },
      { id: "recovery", name: "Recovery supine", minSeconds: 180, maxSeconds: 300, detail: "Return to supine, monitor until stable." },
    ],
  },
  italian: {
    label: "Italian (NTG-potentiated)",
    description:
      "Shortened passive tilt followed by sublingual nitroglycerin potentiation if the passive phase is negative.",
    phases: [
      { id: "supine", name: "Supine rest", minSeconds: 300, maxSeconds: 600, detail: "5–10 min supine baseline." },
      { id: "passive", name: "Passive tilt 60°", minSeconds: 1200, maxSeconds: 1200, detail: "20 min passive upright observation." },
      { id: "ntg", name: "Sublingual NTG 300–400 µg", minSeconds: 900, maxSeconds: 1200, detail: "Continue upright 15–20 min after nitroglycerin." },
      { id: "recovery", name: "Recovery supine", minSeconds: 180, maxSeconds: 300, detail: "Return supine, monitor until stable." },
    ],
  },
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function classify(input: {
  symptomsReproduced: boolean;
  loc: boolean;
  asystoleSec: number | "";
  hrDrop: boolean;
  bpDrop: boolean;
  potsHrRise: boolean;
  delayedDrop: boolean;
  psychogenic: boolean;
}): { key: Interpretation; label: string; tone: string; note: string } {
  const {
    symptomsReproduced,
    loc,
    asystoleSec,
    hrDrop,
    bpDrop,
    potsHrRise,
    delayedDrop,
    psychogenic,
  } = input;

  if (psychogenic)
    return {
      key: "psychogenic",
      label: "Suspected psychogenic pseudosyncope",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
      note: "Apparent LOC with preserved vitals and normal HR/BP — consider PPS.",
    };

  if (typeof asystoleSec === "number" && asystoleSec >= 3)
    return {
      key: "cardioinhibitory",
      label: `Cardioinhibitory (VASIS 2) — asystole ${asystoleSec}s`,
      tone: "bg-rose-50 text-rose-700 border-rose-200",
      note: "Asystole ≥3 s or profound bradycardia during symptoms.",
    };

  if ((symptomsReproduced || loc) && bpDrop && hrDrop)
    return {
      key: "mixed",
      label: "Mixed reflex response (VASIS 1)",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
      note: "HR falls but stays >40 bpm; BP falls before HR.",
    };

  if ((symptomsReproduced || loc) && bpDrop)
    return {
      key: "vasodepressor",
      label: "Vasodepressor reflex (VASIS 3)",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
      note: "BP falls at syncope; HR does not fall >10%.",
    };

  if (potsHrRise)
    return {
      key: "pots",
      label: "POTS pattern",
      tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      note: "Sustained HR rise ≥30 bpm (≥40 in adolescents) within 10 min without orthostatic hypotension.",
    };

  if (delayedDrop)
    return {
      key: "delayedOH",
      label: "Delayed orthostatic hypotension",
      tone: "bg-orange-50 text-orange-700 border-orange-200",
      note: "Sustained SBP drop ≥20 or DBP ≥10 mmHg after 3 min upright.",
    };

  if (bpDrop)
    return {
      key: "orthostaticHypotension",
      label: "Classic orthostatic hypotension",
      tone: "bg-orange-50 text-orange-700 border-orange-200",
      note: "SBP drop ≥20 or DBP ≥10 mmHg within 3 min of tilt.",
    };

  return {
    key: "nonDiagnostic",
    label: "Non-diagnostic",
    tone: "bg-slate-50 text-slate-700 border-slate-200",
    note: "No symptomatic hypotension, bradycardia, or POTS pattern.",
  };
}

const STORAGE_KEY = "hutt-mini-app-draft-v1";

type PersistedState = {
  protocolType: ProtocolType;
  phaseIdx: number;
  seconds: number;
  running: boolean;
  obs: Observation[];
  entry: Omit<Observation, "id" | "timeSeconds" | "phase">;
  flags: {
    symptomsReproduced: boolean;
    loc: boolean;
    hrDrop: boolean;
    bpDrop: boolean;
    potsHrRise: boolean;
    delayedDrop: boolean;
    psychogenic: boolean;
  };
  asystoleSec: number | "";
  savedAt: number;
};

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export default function HuttMiniApp() {
  const persisted = useMemo(() => loadPersisted(), []);

  const [protocolType, setProtocolType] = useState<ProtocolType>(persisted?.protocolType ?? "standard");
  const protocol = PROTOCOLS[protocolType];

  const [phaseIdx, setPhaseIdx] = useState(persisted?.phaseIdx ?? 0);
  const [seconds, setSeconds] = useState(persisted?.seconds ?? 0);
  const [running, setRunning] = useState(persisted?.running ?? false);
  const timerRef = useRef<number | null>(null);
  const isFirstProtocolRun = useRef(true);

  const [obs, setObs] = useState<Observation[]>(persisted?.obs ?? []);
  const [entry, setEntry] = useState<Omit<Observation, "id" | "timeSeconds" | "phase">>(
    persisted?.entry ?? { hr: "", sbp: "", dbp: "", symptoms: "" }
  );

  const [flags, setFlags] = useState(
    persisted?.flags ?? {
      symptomsReproduced: false,
      loc: false,
      hrDrop: false,
      bpDrop: false,
      potsHrRise: false,
      delayedDrop: false,
      psychogenic: false,
    }
  );
  const [asystoleSec, setAsystoleSec] = useState<number | "">(persisted?.asystoleSec ?? "");
  const [showInterpretation, setShowInterpretation] = useState(false);

  useEffect(() => {
    if (running) {
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    }
  }, [running]);

  // reset phases when protocol changes (but not on initial hydration)
  useEffect(() => {
    if (isFirstProtocolRun.current) {
      isFirstProtocolRun.current = false;
      return;
    }
    setPhaseIdx(0);
    setSeconds(0);
    setRunning(false);
    setObs([]);
  }, [protocolType]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const payload: PersistedState = {
          protocolType,
          phaseIdx,
          seconds,
          running,
          obs,
          entry,
          flags,
          asystoleSec,
          savedAt: Date.now(),
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* ignore quota errors */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [protocolType, phaseIdx, seconds, running, obs, entry, flags, asystoleSec]);

  const currentPhase = protocol.phases[phaseIdx];
  const nextPhase = () => {
    if (phaseIdx < protocol.phases.length - 1) {
      setPhaseIdx((i) => i + 1);
      setSeconds(0);
    } else {
      setRunning(false);
    }
  };

  const addObs = () => {
    setObs((o) => [
      ...o,
      {
        id: Math.random().toString(36).slice(2, 9),
        timeSeconds: seconds,
        phase: currentPhase.name,
        ...entry,
      },
    ]);
    setEntry({ hr: "", sbp: "", dbp: "", symptoms: "" });
  };

  const removeObs = (id: string) => setObs((o) => o.filter((x) => x.id !== id));

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setPhaseIdx(0);
    setSeconds(0);
    setRunning(false);
    setObs([]);
    setEntry({ hr: "", sbp: "", dbp: "", symptoms: "" });
    setFlags({
      symptomsReproduced: false,
      loc: false,
      hrDrop: false,
      bpDrop: false,
      potsHrRise: false,
      delayedDrop: false,
      psychogenic: false,
    });
    setAsystoleSec("");
    toast.success("HUTT draft cleared");
  };

  const result = useMemo(() => classify({ ...flags, asystoleSec }), [flags, asystoleSec]);

  const emrNote = useMemo(() => {
    const rows = obs
      .map(
        (o) =>
          `  t=${fmt(o.timeSeconds)} [${o.phase}] HR ${o.hr || "-"} bpm, BP ${o.sbp || "-"}/${o.dbp || "-"} mmHg${o.symptoms ? ` — ${o.symptoms}` : ""}`
      )
      .join("\n");
    return `Head-up tilt-table test — ${protocol.label} protocol.
Symptoms reproduced: ${flags.symptomsReproduced ? "Yes" : "No"}${flags.loc ? " (LOC)" : ""}
${flags.psychogenic ? "Suspicion of psychogenic pseudosyncope.\n" : ""}Asystole: ${asystoleSec === "" ? "not recorded" : `${asystoleSec} s`}

Observations:
${rows || "  (none recorded)"}

Interpretation: ${result.label}
${result.note}`;
  }, [obs, protocol.label, flags, asystoleSec, result]);

  const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(emrNote);
      toast.success("EMR note copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const exportTxt = () => {
    const blob = new Blob([emrNote], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HUTT-report-${stamp()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded");
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Head-up Tilt-Table Test Report", margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
    y += 20;
    doc.setTextColor(0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Protocol: ${protocol.label}`, margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const noteLines = doc.splitTextToSize(emrNote, pageWidth - margin * 2);
    for (const line of noteLines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }

    // Interpretation banner
    if (y > pageHeight - margin - 60) {
      doc.addPage();
      y = margin;
    }
    y += 8;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Interpretation", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const interp = doc.splitTextToSize(`${result.label} — ${result.note}`, pageWidth - margin * 2);
    for (const line of interp) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }

    doc.save(`HUTT-report-${stamp()}.pdf`);
    toast.success("PDF downloaded");
  };

  const shareNote = async () => {
    const shareData = {
      title: "HUTT Report",
      text: emrNote,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(emrNote);
        toast.success("Sharing not supported — copied to clipboard instead");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Share failed");
    }
  };


  return (
    <div className="text-slate-900">
      <div className="rounded-[28px] bg-gradient-sunset p-6 text-white shadow-glow md:p-8">
        <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.22em]">
          HUTT MINI APP
        </div>
        <h2 className="mt-4 text-2xl font-bold md:text-4xl">Head-up tilt-table test runner</h2>
        <p className="mt-3 max-w-3xl text-white/90 text-sm md:text-base">
          Pick a protocol, run the phase timer, log HR/BP, and get a VASIS-style interpretation with a copy-ready EMR note.
        </p>

        <div className="mt-5 inline-flex rounded-2xl bg-white/10 p-1 backdrop-blur">
          {(Object.keys(PROTOCOLS) as ProtocolType[]).map((p) => (
            <button
              key={p}
              onClick={() => setProtocolType(p)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                protocolType === p ? "bg-white text-slate-900 shadow" : "text-white/90 hover:bg-white/10"
              }`}
            >
              {PROTOCOLS[p].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/80">{protocol.description}</p>
      </div>

      {/* Detailed protocol setup */}
      <ProtocolReference activeProtocol={protocolType} onSelect={setProtocolType} />


      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        {/* Runner */}
        <Panel title="Phase runner" icon={<Timer size={18} />} className="lg:col-span-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phase {phaseIdx + 1} of {protocol.phases.length}
                </div>
                <div className="text-lg font-bold text-slate-800">{currentPhase.name}</div>
              </div>
              <div className="text-4xl font-bold tabular-nums text-slate-900">{fmt(seconds)}</div>
            </div>
            <p className="mt-2 text-xs text-slate-600">{currentPhase.detail}</p>
            <div className="mt-2 text-[11px] text-slate-500">
              Target: {fmt(currentPhase.minSeconds)}
              {currentPhase.maxSeconds !== currentPhase.minSeconds && `–${fmt(currentPhase.maxSeconds)}`}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                {running ? <Pause size={16} /> : <Play size={16} />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setSeconds(0);
                  setRunning(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                onClick={nextPhase}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Next phase →
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {protocol.phases.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setPhaseIdx(i);
                  setSeconds(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
                  i === phaseIdx
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {i + 1}. {p.name}
              </button>
            ))}
          </div>
        </Panel>

        {/* Vitals entry */}
        <Panel title="Vitals & symptoms log" icon={<HeartPulse size={18} />} className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="HR (bpm)" value={entry.hr} onChange={(v) => setEntry((e) => ({ ...e, hr: v }))} />
            <Field label="SBP" value={entry.sbp} onChange={(v) => setEntry((e) => ({ ...e, sbp: v }))} />
            <Field label="DBP" value={entry.dbp} onChange={(v) => setEntry((e) => ({ ...e, dbp: v }))} />
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-600">Symptoms</div>
              <input
                value={entry.symptoms}
                onChange={(e) => setEntry((s) => ({ ...s, symptoms: e.target.value }))}
                placeholder="e.g. dizziness"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>
          </div>
          <button
            onClick={addObs}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-sunset px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            + Log at t={fmt(seconds)}
          </button>

          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
            {obs.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No observations yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">Phase</th>
                    <th className="px-3 py-2 text-left">HR</th>
                    <th className="px-3 py-2 text-left">BP</th>
                    <th className="px-3 py-2 text-left">Symptoms</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {obs.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 tabular-nums">{fmt(o.timeSeconds)}</td>
                      <td className="px-3 py-2">{o.phase}</td>
                      <td className="px-3 py-2">{o.hr || "-"}</td>
                      <td className="px-3 py-2">
                        {o.sbp || "-"}/{o.dbp || "-"}
                      </td>
                      <td className="px-3 py-2">{o.symptoms || "-"}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeObs(o.id)}
                          className="text-xs text-slate-500 hover:text-rose-600"
                        >
                          remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Panel>

        {/* Findings */}
        <Panel title="Findings" icon={<ClipboardList size={18} />} className="lg:col-span-7">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["symptomsReproduced", "Typical symptoms reproduced"],
              ["loc", "Loss of consciousness during test"],
              ["hrDrop", "HR fall (>10% or <40 bpm)"],
              ["bpDrop", "SBP drop ≥20 or DBP ≥10 mmHg"],
              ["potsHrRise", "Sustained HR rise ≥30 bpm within 10 min (POTS)"],
              ["delayedDrop", "Delayed BP drop (>3 min upright)"],
              ["psychogenic", "Apparent LOC with normal HR/BP (PPS)"],
            ].map(([k, l]) => (
              <Check
                key={k}
                label={l}
                checked={(flags as any)[k]}
                onChange={(v) => setFlags((f) => ({ ...f, [k]: v }))}
              />
            ))}
          </div>
          <div className="mt-3 max-w-xs">
            <div className="mb-1 text-xs font-semibold text-slate-600">Asystole duration (s)</div>
            <input
              type="number"
              value={asystoleSec}
              onChange={(e) => setAsystoleSec(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              placeholder="e.g. 6"
            />
          </div>
        </Panel>

        {/* Interpretation */}
        <div className="lg:col-span-12">
          <div className={`rounded-3xl border shadow-lg ${result.tone}`}>
            <button
              type="button"
              onClick={() => setShowInterpretation((v) => !v)}
              className="w-full flex items-center justify-between gap-3 p-5 text-left"
              aria-expanded={showInterpretation}
            >
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
                  Interpretation (optional)
                </div>
                <div className="mt-1 text-2xl font-bold">{result.label}</div>
                <div className="mt-0.5 text-xs opacity-90">
                  {showInterpretation ? "Tap to hide" : "Tap to review the EMR note and disposition"}
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`shrink-0 transition-transform ${showInterpretation ? "rotate-180" : ""}`}
              />
            </button>
            {showInterpretation && (
              <div className="grid gap-5 border-t border-current/10 px-5 pb-5 pt-4 xl:grid-cols-3">
                <div className="xl:col-span-1">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-80">
                    Rationale
                  </div>
                  <p className="text-sm">{result.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={copy}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Download size={16} /> Copy EMR note
                    </button>
                    <button
                      onClick={exportTxt}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <FileText size={16} /> Export .txt
                    </button>
                    <button
                      onClick={exportPdf}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-sunset px-4 py-2 text-sm font-semibold text-white shadow-glow"
                    >
                      <Download size={16} /> Export PDF
                    </button>
                    <button
                      onClick={shareNote}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <Share2 size={16} /> Share
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <Printer size={16} /> Print
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <Save size={12} /> Draft auto-saves locally
                    <button
                      onClick={clearDraft}
                      className="ml-auto text-[11px] text-slate-500 underline hover:text-rose-600"
                    >
                      Clear draft
                    </button>
                  </div>

                </div>
                <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-800 xl:col-span-2">
{emrNote}
                </pre>
              </div>
            )}
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
      <div className="mt-4 space-y-4">{children}</div>
    </section>
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
      />
    </div>
  );
}

// ============================================================
// Protocol reference: Standard vs Italian with medications table
// ============================================================
type MedRow = {
  drug: string;
  role: string;
  dose: string;
  route: string;
  notes: string;
};

const STANDARD_MEDS: MedRow[] = [
  {
    drug: "0.9% Saline",
    role: "IV access / maintenance",
    dose: "TKVO ~20–30 mL/h; bolus 250–500 mL for hypotension",
    route: "IV peripheral cannula (18–20 G)",
    notes: "Establish before tilt; volume-load only if clinically hypovolaemic.",
  },
  {
    drug: "Atropine",
    role: "Rescue — bradycardia / asystole",
    dose: "0.5 mg IV bolus; repeat every 3–5 min up to 3 mg total",
    route: "IV push",
    notes: "For symptomatic HR < 40 bpm or asystole > 3 s not resolving on return to supine.",
  },
  {
    drug: "Phenylephrine",
    role: "Rescue — refractory hypotension",
    dose: "50–200 µg IV bolus, or infusion 0.1–0.5 µg/kg/min titrated to MAP ≥ 65",
    route: "IV bolus or infusion pump",
    notes: "Reserve for hypotension unresponsive to supine + fluids; caution in coronary/CV disease.",
  },
];

const ITALIAN_MEDS: MedRow[] = [
  {
    drug: "Glyceryl trinitrate (GTN / NTG)",
    role: "Provocation agent",
    dose: "300–400 µg — single sublingual spray (1–2 puffs, 400 µg spray delivers 400 µg/puff)",
    route: "Sublingual spray while patient upright at 60–70°",
    notes:
      "Given after 20 min negative passive tilt; keep upright 15–20 min or until endpoint. Do not repeat.",
  },
  {
    drug: "Isoproterenol (Isoprenaline)",
    role: "Alternative provocation (if GTN contraindicated)",
    dose: "Start 1 µg/min IV infusion; titrate by 1 µg/min every 5 min up to 3 µg/min",
    route: "IV infusion pump (dilute 1 mg in 250 mL D5W = 4 µg/mL)",
    notes:
      "Target HR rise ~20–25% above baseline. Stop if HR > 150, ectopy, chest pain, or endpoint reached.",
  },
  {
    drug: "0.9% Saline",
    role: "Carrier / bolus",
    dose: "TKVO; bolus 250–500 mL for hypotension",
    route: "IV",
    notes: "Mandatory line for potentiated protocol.",
  },
  {
    drug: "Atropine",
    role: "Rescue — bradycardia / asystole",
    dose: "0.5 mg IV; repeat q3–5 min (max 3 mg)",
    route: "IV push",
    notes: "First-line for cardioinhibitory endpoint with slow recovery.",
  },
  {
    drug: "Phenylephrine",
    role: "Rescue — refractory hypotension",
    dose: "50–200 µg IV bolus, or 0.1–0.5 µg/kg/min infusion",
    route: "IV",
    notes: "Especially relevant after GTN — nitrate-induced vasoplegia unresponsive to fluids.",
  },
];

function MedicationsTable({ rows, accent }: { rows: MedRow[]; accent: string }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className={`text-white ${accent}`}>
          <tr>
            <th className="px-3 py-2 font-semibold">Drug</th>
            <th className="px-3 py-2 font-semibold">Role</th>
            <th className="px-3 py-2 font-semibold">Dose / infusion rate</th>
            <th className="px-3 py-2 font-semibold">Route</th>
            <th className="px-3 py-2 font-semibold">Administration notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {rows.map((r) => (
            <tr key={r.drug} className="align-top">
              <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">{r.drug}</td>
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{r.role}</td>
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{r.dose}</td>
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{r.route}</td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProtocolReference({
  activeProtocol,
  onSelect,
}: {
  activeProtocol: ProtocolType;
  onSelect: (p: ProtocolType) => void;
}) {
  const [view, setView] = useState<ProtocolType>(activeProtocol);
  useEffect(() => setView(activeProtocol), [activeProtocol]);

  const isStd = view === "standard";
  const accent = isStd
    ? "bg-[hsl(28_100%_58%)]"
    : "bg-[hsl(280_75%_55%)]";
  const ring = isStd ? "border-[hsl(28_100%_58%/0.4)]" : "border-[hsl(280_75%_60%/0.4)]";
  const tint = isStd ? "bg-[hsl(28_100%_58%/0.06)]" : "bg-[hsl(280_75%_60%/0.06)]";

  return (
    <details
      open
      className="mt-5 group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 select-none">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_75%_60%)]">
            Study setup & protocol reference
          </div>
          <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
            HUTT — setup, phases, medications & endpoints
          </div>
        </div>
        <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-slate-100 px-5 py-5 space-y-5 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
        {/* Protocol toggle */}
        <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          {(["standard", "italian"] as ProtocolType[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setView(p);
                onSelect(p);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                view === p
                  ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:bg-white/60 dark:text-slate-300"
              }`}
            >
              {p === "standard" ? "Standard (Westminster)" : "Italian (NTG-potentiated)"}
            </button>
          ))}
        </div>

        {/* Common preparation */}
        <section>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pre-test setup (both protocols)</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Fasting ≥ 2 h; empty bladder; quiet, dim, temperature-controlled room (~22 °C).</li>
            <li>Withhold vasoactive drugs where safe (β-blockers, nitrates, diuretics, α-blockers) for ≥ 5 half-lives; document those that cannot be stopped.</li>
            <li>Informed consent; IV access with 0.9% saline TKVO; resuscitation trolley with atropine, IV fluids, phenylephrine at bedside.</li>
            <li>Tilt table with footboard, safety straps at knee / thigh / chest; ability to return to supine in ≤ 10 s.</li>
            <li>Continuous 3-lead ECG, non-invasive beat-to-beat BP (Finometer / Finapres / Task Force) plus intermittent cuff cross-check.</li>
            <li>Supine baseline monitoring ≥ 5–10 min before tilt. End-tilt angle <b>60–70°</b> (70° most common).</li>
          </ul>
        </section>

        {/* Phase timing */}
        <section className={`rounded-xl border ${ring} ${tint} p-4`}>
          <h4 className={`text-sm font-bold ${isStd ? "text-[hsl(16_100%_45%)] dark:text-[hsl(28_100%_65%)]" : "text-[hsl(280_75%_45%)] dark:text-[hsl(280_75%_70%)]"}`}>
            {isStd ? "Standard (Westminster) — phase timing" : "Italian (NTG-potentiated) — phase timing"}
          </h4>
          {isStd ? (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li><b>Supine baseline</b> — 5–10 min; record HR, BP, symptoms.</li>
              <li><b>Passive head-up tilt 60–70°</b> — 20–45 min (typically 40 min if asymptomatic).</li>
              <li><b>Return to supine</b> at endpoint or symptom onset; monitor 3–5 min until stable.</li>
            </ol>
          ) : (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li><b>Supine baseline</b> — 5–10 min.</li>
              <li><b>Passive tilt at 60°</b> — 20 min. If diagnostic → stop.</li>
              <li><b>Sublingual GTN 300–400 µg</b> spray while upright; continue tilt <b>15–20 min</b>.</li>
              <li><b>Return to supine</b> at endpoint or symptom onset; monitor until stable.</li>
            </ol>
          )}
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Diagnostic yield:{" "}
            {isStd
              ? "~30–50% sensitivity in reflex syncope; specificity ~90%."
              : "~60–65% sensitivity in reflex syncope; specificity ~90%. Shorter total test time."}
          </div>
        </section>

        {/* Medications table */}
        <section>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Medications — {isStd ? "Standard protocol" : "Italian protocol"}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Doses shown for adults with normal renal/hepatic function. Confirm against local formulary before use.
          </p>
          <MedicationsTable rows={isStd ? STANDARD_MEDS : ITALIAN_MEDS} accent={accent} />
        </section>

        {/* VASIS */}
        <section>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">VASIS classification (positive tests)</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><b>Type 1 — Mixed:</b> HR falls but not &lt; 40 bpm (or &lt; 40 for &lt; 10 s); BP falls before HR.</li>
            <li><b>Type 2A — Cardioinhibitory without asystole:</b> HR &lt; 40 bpm for &gt; 10 s, no asystole ≥ 3 s; BP falls before HR.</li>
            <li><b>Type 2B — Cardioinhibitory with asystole:</b> asystole &gt; 3 s; BP falls with or before HR.</li>
            <li><b>Type 3 — Vasodepressor:</b> HR does not fall &gt; 10% from peak; BP fall causes syncope.</li>
            <li>Additional patterns: POTS (HR rise ≥ 30 bpm within 10 min, no hypotension), classical / delayed OH, psychogenic pseudosyncope.</li>
          </ul>
        </section>

        {/* Stop rules & contraindications */}
        <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">Stop rules / endpoints</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Reproduction of the patient's typical syncope or presyncope with hypotension / bradycardia.</li>
            <li>SBP &lt; 90 mmHg or fall ≥ 30 mmHg from baseline.</li>
            <li>Asystole &gt; 3 s or symptomatic HR &lt; 40 bpm for &gt; 10 s.</li>
            <li>Isoproterenol: HR &gt; 150 bpm, sustained ectopy, chest pain, or intolerable symptoms.</li>
            <li>Completion of protocol time without symptoms → negative test.</li>
          </ul>

          <h4 className="mt-4 text-sm font-bold text-rose-700 dark:text-rose-300">Contraindications / cautions</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Severe aortic stenosis, critical mitral stenosis, obstructive HCM, proximal coronary stenosis, severe cerebrovascular disease.</li>
            <li>Recent (&lt; 48 h) sildenafil / vardenafil, or (&lt; 72 h) tadalafil → avoid GTN and isoproterenol potentiation.</li>
            <li>Pregnancy — relative contraindication, especially for GTN protocol.</li>
            <li>Uncontrolled hypertension, unstable arrhythmia, active ischaemia, raised intracranial pressure (GTN).</li>
            <li>Isoproterenol: avoid in ischaemic heart disease, significant LVOT obstruction, uncontrolled hyperthyroidism.</li>
          </ul>
        </section>

        <p className="text-xs text-slate-500">
          References: ESC 2018 syncope guidelines; Bartoletti A et al. "The Italian protocol" Europace 2000; VASIS classification Sutton R et al.; BHRS HUTT SOP.
        </p>
      </div>
    </details>
  );
}
