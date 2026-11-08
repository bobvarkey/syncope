import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, ChevronRight, RotateCcw } from "lucide-react";
import data from "@/data/falls-algorithm.json";

// The source algorithm JSON is a heterogeneous tree; values are rendered generically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const D: Any = data;
const N: Any = Object.fromEntries(D.nodes.map((n: Any) => [n.id, n]));
const TAIL = ["FALL_RISK", "PREVENTION", "FINAL_REPORT"];
const SKIP = new Set([
  "id",
  "title",
  "type",
  "source_type",
  "next",
  "question",
  "options",
  "fields",
  "questions",
  "decision",
  "branches",
  "patterns",
  "functional_tests",
  "interventions",
  "output",
  "outputs",
  "report_sections",
]);
const label = (k: string) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const itemName = (b: Any) => b.name ?? b.trigger ?? b.category ?? b.value;
const DX_KEYS = ["consider", "differentials"];
const INV_KEYS = ["investigations", "evaluation", "assessment"];

function Value({ v }: { v: Any }) {
  if (v == null) return null;
  if (typeof v !== "object") return <span>{String(v)}</span>;
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x !== "object"))
      return (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
          {v.map((x) => (
            <li key={String(x)}>{String(x)}</li>
          ))}
        </ul>
      );
    return (
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {v.map((x, i) => (
          <div key={i} className="rounded-lg bg-muted p-3 text-sm">
            <Value v={x} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {Object.entries(v)
        .filter(([k]) => k !== "source_type" && k !== "id")
        .map(([k, x]) =>
          k === "name" || k === "trigger" ? (
            <p key={k} className="font-semibold">
              {String(x)}
            </p>
          ) : (
            <div key={k}>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label(k)}</span>{" "}
              <Value v={x} />
            </div>
          )
        )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export default function FallsAlgorithm() {
  const [path, setPath] = useState<string[]>(["START"]);
  const [queue, setQueue] = useState<string[]>([]);
  const [ans, setAns] = useState<Any>({});
  const [picked, setPicked] = useState<Any>({});
  const id = path[path.length - 1]!;
  const node = N[id];

  const set = (k: string, v: Any) => setAns((p: Any) => ({ ...p, [k]: v }));
  const toggle = (nid: string, name: string) =>
    setPicked((p: Any) => {
      const cur = p[nid] ?? [];
      return {
        ...p,
        [nid]: cur.includes(name) ? cur.filter((x: string) => x !== name) : [...cur, name],
      };
    });

  const go = (next: string | string[]) => {
    const list = [next].flat();
    setQueue((q) => [...list.slice(1), ...q]);
    setPath((p) => [...p, list[0]!]);
  };

  const advance = () => {
    if (node.next) return go(node.next);
    if (id === "SAFETY") return go(node.decision.if_all_no);
    if (queue.length) {
      const [h, ...r] = queue;
      setQueue(r);
      return setPath((p) => [...p, h!]);
    }
    const t = TAIL.indexOf(id);
    go(TAIL[t + 1] ?? "FALL_RISK");
  };

  const back = () => path.length > 1 && setPath((p) => p.slice(0, -1));
  const restart = () => {
    setPath(["START"]);
    setQueue([]);
    setAns({});
    setPicked({});
  };

  const redFlags = N.SAFETY.questions.filter((q: Any) => ans[q.id] === "Yes").map((q: Any) => q.question);

  const report = useMemo(() => {
    const visited = [...new Set(path)].filter(
      (p) => !["START", "SAFETY", "FALL_RISK", "PREVENTION", "FINAL_REPORT"].includes(p)
    );
    const dx: string[] = [];
    const inv = new Set<string>();
    const mech: string[] = [];
    const urgent: string[] = [];
    visited.forEach((nid) => {
      const n = N[nid];
      const items = [...(n.branches ?? []), ...(n.patterns ?? [])].filter((b: Any) => !b.next);
      const sel = picked[nid] ?? [];
      if (items.length && sel.length) mech.push(`${n.title}: ${sel.join(", ")}`);
      else if (!n.options && !n.next && !(n.branches ?? []).some((b: Any) => b.next)) mech.push(n.title);
      const sources = [n, ...items.filter((b: Any) => sel.includes(itemName(b)))];
      sources.forEach((s: Any) => {
        DX_KEYS.forEach((k) =>
          [s[k] ?? []].flat().forEach((x: Any) => dx.push(typeof x === "string" ? x : x.name))
        );
        INV_KEYS.forEach((k) =>
          [s[k] ?? []].flat().forEach((x: Any) => typeof x === "string" && inv.add(x))
        );
        if (s.priority) urgent.push(s.priority);
      });
    });
    const choices = path
      .filter((p) => ans[`choice_${p}`])
      .map((p) => `${N[p].title}: ${ans[`choice_${p}`]}`);
    return { mech, dx: [...new Set(dx)], inv: [...inv], urgent: [...new Set(urgent)], choices };
  }, [path, picked, ans]);

  const selectable = [...(node.branches ?? []), ...(node.patterns ?? [])];
  const navBranches = selectable.filter((b: Any) => b.next);
  const pickBranches = selectable.filter((b: Any) => !b.next);
  const isChoice = node.options?.length;

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            algorithm: D.algorithm_id,
            date: new Date().toISOString(),
            path,
            answers: ans,
            selections: picked,
            redFlags,
            report,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "falls-assessment.json";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{D.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{D.purpose}</p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Branching algorithm
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
        {path.map((p, i) => (
          <button
            key={`${p}-${i}`}
            type="button"
            onClick={() => setPath(path.slice(0, i + 1))}
            className="rounded-full bg-muted px-2 py-0.5 hover:bg-secondary"
          >
            {N[p].title}
          </button>
        ))}
        {queue.length > 0 && (
          <span className="ml-2">· queued: {queue.map((q) => N[q].title).join(", ")}</span>
        )}
      </div>

      {redFlags.length > 0 && id !== "SAFETY" && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {N.SAFETY.decision.if_any_yes.priority}: {redFlags.length} red flag(s)
          </span>
        </div>
      )}

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <h2 className="text-xl font-semibold text-foreground">{node.title}</h2>
        {node.source_type === "clinical_extension" && (
          <p className="text-xs text-muted-foreground">Clinical workflow extension</p>
        )}

        {id === "FINAL_REPORT" ? (
          <div className="mt-4 space-y-4 text-sm">
            {(
              [
                ["Red flags", redFlags],
                ["Urgency", report.urgent],
                ["Clinical decisions", report.choices],
                ["Mechanisms evaluated", report.mech],
                ["Differential diagnoses", report.dx],
                ["Recommended investigations", report.inv],
                ["Management plan", Object.values(picked.PREVENTION ?? {})],
              ] as [string, string[]][]
            ).map(([t, items]) =>
              items.length ? (
                <div key={t}>
                  <h3 className="text-base font-semibold">{t}</h3>
                  <Value v={items} />
                </div>
              ) : null
            )}
            {ans.fall_risk_level && (
              <div>
                <h3 className="text-base font-semibold">Fall risk</h3>
                <p>{ans.fall_risk_level}</p>
              </div>
            )}
            {ans.notes && (
              <div>
                <h3 className="text-base font-semibold">Clinical impression</h3>
                <p className="whitespace-pre-wrap">{ans.notes}</p>
              </div>
            )}
            <label className="block print:hidden">
              <span className="font-semibold">Clinical impression / follow-up</span>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-background p-2"
                rows={4}
                value={ans.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              {D.disclaimer} Source: {D.source.chapter} — {D.source.authors.join(", ")}.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {node.note && (
              <p className="rounded-lg bg-amber-500/15 p-3 text-sm text-amber-900 dark:text-amber-200">
                {node.note}
              </p>
            )}
            {(node.caution || node.rule || node.action) && (
              <p className="rounded-lg bg-muted p-3 text-sm">{node.caution ?? node.rule ?? node.action}</p>
            )}

            {node.fields && (
              <div className="grid gap-3 sm:grid-cols-2">
                {node.fields.map((f: Any) => {
                  const name = typeof f === "string" ? f : f.name;
                  const type = typeof f === "string" ? "text" : f.type;
                  const k = `${id}_${name}`;
                  return type === "boolean" ? (
                    <div
                      key={k}
                      className="flex items-center justify-between gap-2 border-b border-border py-2"
                    >
                      <span className="text-sm">{name}</span>
                      <div className="flex gap-1">
                        {["Yes", "No"].map((o) => (
                          <Chip key={o} on={ans[k] === o} onClick={() => set(k, o)}>
                            {o}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <label key={k} className="text-sm">
                      {name}
                      <input
                        type={type === "number" ? "number" : "text"}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                        value={ans[k] ?? ""}
                        onChange={(e) => set(k, e.target.value)}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {node.questions?.map((q: Any) => {
              const text = typeof q === "string" ? q : q.question;
              const k = typeof q === "string" ? `${id}_${q}` : q.id;
              return (
                <div
                  key={k}
                  className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0"
                >
                  <span>{text}</span>
                  <div className="flex gap-1">
                    {["Yes", "No"].map((o) => (
                      <Chip key={o} on={ans[k] === o} onClick={() => set(k, o)}>
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
              );
            })}

            {id === "SAFETY" && redFlags.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <p className="text-lg font-semibold text-destructive">
                  {node.decision.if_any_yes.priority}
                </p>
                <Value v={node.decision.if_any_yes.actions} />
              </div>
            )}

            {Object.entries(node)
              .filter(([k]) => !SKIP.has(k) && !["note", "caution", "rule", "action"].includes(k))
              .map(([k, v]) => (
                <div key={k}>
                  <h3 className="text-base font-semibold">{label(k)}</h3>
                  <Value v={v} />
                </div>
              ))}

            {node.functional_tests && (
              <div>
                <h3 className="text-base font-semibold">Functional tests</h3>
                <div className="mt-2 flex flex-wrap gap-3">
                  {node.functional_tests.map((t: Any) => (
                    <label key={t.name} className="text-sm">
                      {t.name} ({t.unit})
                      <input
                        type="number"
                        className="mt-1 block w-32 rounded-md border border-input bg-background px-3 py-2"
                        value={ans[`FT_${t.name}`] ?? ""}
                        onChange={(e) => set(`FT_${t.name}`, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {node.output?.risk_level && (
              <div>
                <h3 className="text-base font-semibold">Overall fall risk (clinician judgement)</h3>
                <p className="text-xs text-muted-foreground">{node.output.note}</p>
                <div className="mt-2 flex gap-2">
                  {node.output.risk_level.map((r: string) => (
                    <Chip key={r} on={ans.fall_risk_level === r} onClick={() => set("fall_risk_level", r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {node.interventions && (
              <div className="space-y-3">
                {node.interventions.map((iv: Any) => (
                  <div key={iv.category}>
                    <h3 className="text-base font-semibold">{iv.category}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {iv.actions.map((a: string) => (
                        <Chip
                          key={a}
                          on={(picked.PREVENTION ?? []).includes(a)}
                          onClick={() => toggle("PREVENTION", a)}
                        >
                          {a}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pickBranches.length > 0 && (
              <div>
                <h3 className="text-base font-semibold">Select what applies</h3>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {pickBranches.map((b: Any) => {
                    const on = (picked[id] ?? []).includes(itemName(b));
                    return (
                      <button
                        key={itemName(b)}
                        type="button"
                        onClick={() => toggle(id, itemName(b))}
                        className={`rounded-xl border p-4 text-left text-sm transition ${
                          on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <Value v={b} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(isChoice || navBranches.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold">{node.question ?? "Choose the next pathway"}</h3>
                <div className="mt-3 grid gap-2">
                  {(node.options ?? []).map((o: Any) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        set(`choice_${id}`, o.value);
                        go(o.next);
                      }}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-left font-medium transition hover:border-primary/60 hover:bg-primary/5"
                    >
                      {o.value}
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                  {navBranches.map((b: Any) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        set(`choice_${id}`, b.trigger);
                        go(b.next);
                      }}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-left font-medium transition hover:border-primary/60 hover:bg-primary/5"
                    >
                      {b.trigger}
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" disabled={path.length === 1} onClick={back}>
            Back
          </Button>
          <Button variant="ghost" onClick={restart} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
        <div className="flex gap-2">
          {id === "FINAL_REPORT" ? (
            <>
              <Button variant="outline" onClick={exportJson}>
                Export JSON
              </Button>
              <Button onClick={() => window.print()}>Print report</Button>
            </>
          ) : !isChoice && !navBranches.length ? (
            <Button onClick={advance}>
              {queue.length
                ? `Next: ${N[queue[0]!].title}`
                : node.next || id === "SAFETY"
                  ? "Next"
                  : TAIL.includes(id)
                    ? "Next"
                    : "Continue to fall risk"}
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => go("FALL_RISK")}>
              Skip to fall risk
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
