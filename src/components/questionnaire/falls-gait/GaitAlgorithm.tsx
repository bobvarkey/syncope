import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import data from "@/data/gait-algorithm.json";

// The source algorithm JSON is heterogeneous; step content is rendered generically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const A: Any = data.algorithm;
const S: Any = Object.fromEntries(A.steps.map((s: Any) => [s.id, s]));
const LEVELS = ["LOWER", "MIDDLE", "HIGHER", "OTHER"];
const DEFAULT_RESULT = ["Normal", "Abnormal", "Unable", "Not tested"];
const EXAM_RESULT = ["Normal", "Abnormal", "Not tested"];

type Answers = Record<string, string | string[]>;

const PAGES = [
  "Safety",
  "History",
  "Functional",
  "Posture",
  "Walking",
  "Special tests",
  "Neuro exam",
  "Phenotype",
  "Pathways",
  "Report",
];

function Chip({
  on,
  children,
  onClick,
  tone = "primary",
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
  tone?: "primary" | "tint";
}) {
  const active =
    tone === "tint"
      ? "border-primary/60 bg-primary/10 text-foreground"
      : "border-primary bg-primary text-primary-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-left text-sm transition ${
        on ? active : "border-border bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  options,
  multiple,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  multiple?: boolean;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const arr = Array.isArray(value) ? value : [];
  return (
    <div className="border-b border-border py-4 last:border-0">
      <p className="font-medium">
        {label}
        {multiple && (
          <span className="ml-2 text-xs text-muted-foreground">select all that apply</span>
        )}
      </p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = multiple ? arr.includes(o) : value === o;
          return (
            <Chip
              key={o}
              on={on}
              tone={multiple ? "tint" : "primary"}
              onClick={() =>
                multiple ? onChange(on ? arr.filter((x) => x !== o) : [...arr, o]) : onChange(on ? "" : o)
              }
            >
              {o}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function GaitAlgorithm() {
  const [page, setPage] = useState(0);
  const [ans, setAns] = useState<Answers>({});
  const [patterns, setPatterns] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<Record<string, "" | "yes" | "no" | "on">>({});

  const set = (k: string) => (v: string | string[]) => setAns((p) => ({ ...p, [k]: v }));

  const redFlags = S.STEP_1.questions.filter((q: Any) => ans[q.id] === "Yes").map((q: Any) => q.text);
  const emergency = redFlags.length > 0;

  const report = useMemo(() => {
    const chosen = LEVELS.flatMap((lvl) =>
      S[`STEP_9_${lvl}`].patterns
        .filter((p: Any) => patterns.includes(p.name))
        .map((p: Any) => ({ ...p, level: lvl }))
    );
    const levels = [...new Set(chosen.map((c: Any) => c.level as string))];
    const level = !levels.length
      ? "Not determined"
      : levels.length > 1
        ? "Mixed"
        : levels[0] === "OTHER"
          ? "Non-neurological / multifactorial"
          : levels[0]![0]! + levels[0]!.slice(1).toLowerCase();

    const count = new Map<string, number>();
    chosen.forEach((c: Any) => c.differentials.forEach((d: string) => count.set(d, (count.get(d) ?? 0) + 1)));
    const differentials = [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([d, n]) => (n > 1 ? `${d} (supported by ${n} patterns)` : d));

    const inv = new Set<string>(chosen.flatMap((c: Any) => c.investigations ?? []));

    const pathways: string[] = [];
    S.STEP_10.branches.forEach((b: Any) => {
      const t = triggers[b.trigger];
      if (!t) return;
      const branch = b.question ? (t === "yes" ? b.if_yes : t === "no" ? b.if_no : null) : null;
      const consider = branch ? [branch.consider].flat() : [];
      const evals: string[] = branch ? branch.evaluation : b.evaluate ?? [];
      pathways.push(`${b.trigger}${consider.length ? ` → consider ${consider.join(", ")}` : ""}`);
      evals.forEach((e) => inv.add(e));
    });

    const positives: string[] = [];
    S.STEP_3.tests.forEach((t: Any) =>
      ((ans[`FUNC_${t.name}`] as string[]) ?? []).forEach((o) => {
        const f = t.findings.find((x: Any) => x.observation === o);
        positives.push(`${t.name}: ${o}${f?.suggests ? ` (suggests ${f.suggests.join(", ")})` : ""}`);
      })
    );

    const single = (
      fields: Any[],
      key: "question" | "label" | "name",
      normal = ["Normal", "Negative", "Upright", "Not tested", ""]
    ) =>
      fields.forEach((f: Any) => {
        const v = ans[f.id ?? f[key]];
        const vals = Array.isArray(v) ? v : v ? [v] : [];
        vals.filter((x) => !normal.includes(x)).forEach((x) => positives.push(`${f[key]}: ${x}`));
      });
    single(S.STEP_4.fields, "question");
    single(S.STEP_5.observations, "label");
    single(S.STEP_6.tests, "name");
    S.STEP_7.sections.forEach((sec: Any) =>
      sec.fields.forEach((f: string) => {
        if (ans[`EXAM_${sec.name}_${f}`] === "Abnormal") positives.push(`${sec.name} – ${f}: abnormal`);
      })
    );

    const confidence =
      chosen.length === 0 ? "Low" : positives.length >= 4 && chosen.length <= 2 ? "High" : "Moderate";
    return { chosen, level, differentials, investigations: [...inv], pathways, positives, confidence };
  }, [ans, patterns, triggers]);

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            algorithm: A.id,
            date: new Date().toISOString(),
            answers: ans,
            patterns,
            triggers,
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
    a.download = "gait-assessment.json";
    a.click();
  };

  const body = () => {
    switch (page) {
      case 0:
        return (
          <>
            {S.STEP_1.questions.map((q: Any) => (
              <Field key={q.id} label={q.text} options={q.options} value={ans[q.id]} onChange={set(q.id)} />
            ))}
            {emergency && (
              <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <p className="flex items-center gap-2 text-lg font-semibold text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {S.STEP_1.decision.if_any_yes.priority}
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {S.STEP_1.decision.if_any_yes.actions.map((x: string) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        );
      case 1:
        return S.STEP_2.fields.map((f: Any) => (
          <Field
            key={f.id}
            label={f.question}
            options={f.options}
            multiple={f.multiple}
            value={ans[f.id]}
            onChange={set(f.id)}
          />
        ));
      case 2:
        return S.STEP_3.tests.map((t: Any) => (
          <Field
            key={t.name}
            label={t.name}
            hint={t.instruction}
            multiple
            options={t.findings.map((f: Any) => f.observation)}
            value={ans[`FUNC_${t.name}`]}
            onChange={set(`FUNC_${t.name}`)}
          />
        ));
      case 3:
        return (
          <>
            {S.STEP_4.fields.map((f: Any) => (
              <Field
                key={f.id}
                label={f.question}
                options={f.options}
                multiple={f.multiple}
                value={ans[f.id]}
                onChange={set(f.id)}
              />
            ))}
            <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
              <p className="font-semibold">Interpretation guide</p>
              <ul className="mt-1 space-y-1">
                {S.STEP_4.interpretation_rules.map((r: Any) => (
                  <li key={r.if}>
                    <span className="text-muted-foreground">{r.if}</span> → {r.suggest}
                  </li>
                ))}
              </ul>
            </div>
          </>
        );
      case 4:
        return S.STEP_5.observations.map((f: Any) => (
          <Field
            key={f.id}
            label={f.label}
            options={f.options}
            multiple={f.multiple}
            value={ans[f.id]}
            onChange={set(f.id)}
          />
        ));
      case 5:
        return (
          <>
            {S.STEP_6.safety && (
              <p className="mb-2 rounded-lg bg-amber-500/15 p-3 text-sm text-amber-900 dark:text-amber-200">
                {S.STEP_6.safety}
              </p>
            )}
            {emergency && (
              <p className="mb-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                Red flags present — do not perform unsafe walking tests.
              </p>
            )}
            {S.STEP_6.tests.map((t: Any) => (
              <Field
                key={t.id}
                label={t.name}
                hint={t.purpose}
                options={t.result ?? DEFAULT_RESULT}
                value={ans[t.id]}
                onChange={set(t.id)}
              />
            ))}
          </>
        );
      case 6:
        return S.STEP_7.sections.map((sec: Any) => (
          <div key={sec.name} className="mb-6">
            <h3 className="text-lg font-semibold">{sec.name}</h3>
            {sec.fields.map((f: string) => {
              const k = `EXAM_${sec.name}_${f}`;
              return (
                <div
                  key={f}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 last:border-0"
                >
                  <span className="text-sm">{f}</span>
                  <div className="flex gap-1">
                    {EXAM_RESULT.map((o) => (
                      <Chip key={o} on={ans[k] === o} onClick={() => set(k)(ans[k] === o ? "" : o)}>
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ));
      case 7:
        return (
          <div className="space-y-6">
            {S.STEP_8.branches.map((b: Any) => (
              <div key={b.id}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {b.id} level
                </p>
                <h3 className="text-lg font-semibold">{b.condition}</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {S[b.next].patterns.map((p: Any) => {
                    const on = patterns.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setPatterns((x) => (on ? x.filter((y) => y !== p.name) : [...x, p.name]))
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <p className="text-base font-semibold">{p.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{p.features.join(" · ")}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      case 8:
        return S.STEP_10.branches.map((b: Any) => {
          const t = triggers[b.trigger] ?? "";
          const setT = (v: typeof t) => setTriggers((p) => ({ ...p, [b.trigger]: v }));
          return (
            <div key={b.trigger} className="border-b border-border py-4 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{b.trigger}</p>
                <Chip on={!!t} onClick={() => setT(t ? "" : b.question ? "yes" : "on")}>
                  {t ? "Present" : "Absent"}
                </Chip>
              </div>
              {t && b.question && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span>{b.question}</span>
                  <Chip on={t === "yes"} onClick={() => setT("yes")}>
                    Yes
                  </Chip>
                  <Chip on={t === "no"} onClick={() => setT("no")}>
                    No
                  </Chip>
                </div>
              )}
            </div>
          );
        });
      default:
        return (
          <div id="gait-report">
            <h2 className="text-2xl font-bold">{S.STEP_11.report_template.heading}</h2>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            {emergency && <List title="Red flags" items={redFlags} />}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Primary phenotype", report.chosen[0]?.name ?? "—"],
                  ["Neurological level", report.level],
                  ["Confidence", report.confidence],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
                  <p className="text-base font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <List
              title="Presenting complaint"
              items={
                [ans["ONSET"], ans["COURSE"], ...[ans["MAIN_COMPLAINT"] ?? []].flat()].filter(
                  Boolean
                ) as string[]
              }
            />
            <List title="Secondary phenotypes" items={report.chosen.slice(1).map((c: Any) => c.name)} />
            <List title="Supporting positive findings" items={report.positives} />
            <List title="Ranked differential diagnosis" items={report.differentials} />
            <List title="Symptom-triggered pathways" items={report.pathways} />
            <List title="Recommended investigations" items={report.investigations} />
            {report.chosen.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Select at least one gait pattern on the Phenotype step to generate localization and
                differentials.
              </p>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              {A.clinical_disclaimer} Source: {A.source}.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{A.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{A.purpose}</p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Stepwise algorithm
          </Badge>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-1.5">
        {PAGES.map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(i)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              i === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {i + 1}. {p}
            {i === 0 && emergency ? " ⚠" : ""}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        {page < 9 && (
          <h2 className="mb-2 text-xl font-semibold">
            {[S.STEP_1, S.STEP_2, S.STEP_3, S.STEP_4, S.STEP_5, S.STEP_6, S.STEP_7, S.STEP_8, S.STEP_10][page].title}
          </h2>
        )}
        {body()}
      </section>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {page < 9 ? (
          <Button onClick={() => setPage(page + 1)} className="gap-1.5">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJson}>
              Export JSON
            </Button>
            <Button onClick={() => window.print()}>Print report</Button>
            <Button variant="ghost" onClick={() => setPage(0)} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
