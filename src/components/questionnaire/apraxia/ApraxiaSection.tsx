import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  GitBranch,
  Hand,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import algorithm from "@/data/bradley-limb-apraxia-diagnostic-algorithm.json";

// The source algorithm JSON is heterogeneous; content is rendered generically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const FIELDS: Any[] = algorithm.input_fields;
const TASKS: Any[] = FIELDS.filter((f) => f.assess_each_hand);
const ERROR_FIELD: Any = FIELDS.find((f) => f.id === "error_type");
const DOMINANCE_FIELD: Any = FIELDS.find((f) => f.id === "dominant_hand");
const LANGUAGE_FIELD: Any = FIELDS.find((f) => f.id === "language_comprehension");

const NODES: Record<string, Any> = Object.fromEntries(
  algorithm.decision_nodes.map((n: Any) => [n.id, n])
);
const PROFILES: Record<string, Any> = algorithm.diagnostic_profiles;

const DIAGNOSIS_LABELS: Record<string, string> = {
  callosal: "Callosal apraxia",
  ideomotor_parietal: "Ideomotor apraxia — parietal",
  ideomotor_disconnection: "Ideomotor apraxia — disconnection",
  dissociation: "Modality-specific (dissociation) apraxia",
  ideational: "Ideational apraxia",
  conceptual: "Conceptual apraxia",
  limb_kinetic: "Limb-kinetic apraxia",
};

const OPTION_LABELS: Record<string, string> = {
  normal: "Normal",
  abnormal: "Abnormal",
  not_tested: "Not tested",
  uninterpretable: "Uninterpretable",
};

const HAND_KEYS = ["dominant", "nondominant"] as const;
const HAND_LABELS: Record<(typeof HAND_KEYS)[number], string> = {
  dominant: "Dominant",
  nondominant: "Nondominant",
};

const pretty = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

type HandFinding = Partial<Record<(typeof HAND_KEYS)[number], string>>;
type Findings = Record<string, HandFinding>;

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? undefined : option)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs transition sm:text-sm",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {OPTION_LABELS[option] ?? pretty(option)}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-lg font-bold leading-none", tone)}>{value}</p>
    </div>
  );
}

function Battery({
  findings,
  setFindings,
  errorTypes,
  setErrorTypes,
  dominance,
  setDominance,
  language,
  setLanguage,
  onRunAlgorithm,
}: {
  findings: Findings;
  setFindings: (next: Findings) => void;
  errorTypes: string[];
  setErrorTypes: (next: string[]) => void;
  dominance: string;
  setDominance: (next: string) => void;
  language: string;
  setLanguage: (next: string) => void;
  onRunAlgorithm: () => void;
}) {
  const setHand = (taskId: string, hand: "dominant" | "nondominant", value?: string) => {
    const current = findings[taskId] ?? {};
    setFindings({ ...findings, [taskId]: { ...current, [hand]: value } });
  };

  const toggleError = (option: string) => {
    if (errorTypes.includes(option)) {
      setErrorTypes(errorTypes.filter((e) => e !== option));
      return;
    }
    if (option === "none") {
      setErrorTypes(["none"]);
      return;
    }
    setErrorTypes([...errorTypes.filter((e) => e !== "none"), option]);
  };

  const counts = useMemo(() => {
    let dominant = 0;
    let nondominant = 0;
    for (const task of TASKS) {
      if (findings[task.id]?.dominant === "abnormal") dominant += 1;
      if (findings[task.id]?.nondominant === "abnormal") nondominant += 1;
    }
    return { dominant, nondominant };
  }, [findings]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
        Test both upper limbs independently. Record performance for every task, then use the
        decision tree. Findings do not constitute a diagnosis on their own.
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Dominant abnormalities"
          value={`${counts.dominant} / ${TASKS.length}`}
          tone={counts.dominant ? "text-destructive" : "text-[hsl(160_70%_45%)]"}
        />
        <Stat
          label="Nondominant abnormalities"
          value={`${counts.nondominant} / ${TASKS.length}`}
          tone={counts.nondominant ? "text-destructive" : "text-[hsl(160_70%_45%)]"}
        />
        <Stat
          label="Error types recorded"
          value={String(errorTypes.length)}
          tone={errorTypes.length ? "text-foreground" : "text-muted-foreground"}
        />
      </div>

      <div className="space-y-3">
        {TASKS.map((task) => (
          <div key={task.id} className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
            <p className="font-medium text-foreground">{task.label}</p>
            {task.task_examples?.length > 0 && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {task.task_examples.join(" · ")}
              </p>
            )}
            <div className="mt-3 space-y-2">
              {HAND_KEYS.map((hand) => (
                <div
                  key={hand}
                  className="grid gap-1.5 sm:grid-cols-[7.5rem_1fr] sm:items-center"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {HAND_LABELS[hand]}
                  </span>
                  <Choice
                    label={`${task.label} — ${HAND_LABELS[hand]} hand`}
                    value={findings[task.id]?.[hand]}
                    options={task.options}
                    onChange={(value) => setHand(task.id, hand, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
          <p className="text-sm font-medium">Dominant hand</p>
          <p className="text-xs text-muted-foreground">Handedness of the patient.</p>
          <div className="mt-2">
            <Choice
              label="Dominant hand"
              value={dominance}
              options={DOMINANCE_FIELD?.options ?? []}
              onChange={(value) => setDominance(value ?? "")}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
          <p className="text-sm font-medium">Language comprehension</p>
          <p className="text-xs text-muted-foreground">
            Aphasia can confound command-based testing.
          </p>
          <div className="mt-2">
            <Choice
              label="Language comprehension"
              value={language}
              options={LANGUAGE_FIELD?.options ?? []}
              onChange={(value) => setLanguage(value ?? "")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
        <p className="text-sm font-medium">
          Error types <span className="ml-1 text-xs text-muted-foreground">select all that apply</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Error types">
          {(ERROR_FIELD?.options ?? []).map((option: string) => {
            const on = errorTypes.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => toggleError(option)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs transition sm:text-sm",
                  on
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {pretty(option)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-sm text-muted-foreground">
          Recorded findings are a bedside profile, not a score. Confirm the pattern clinically.
        </p>
        <Button size="sm" className="gap-1.5" onClick={onRunAlgorithm}>
          <GitBranch className="h-4 w-4" />
          Run decision tree
        </Button>
      </div>
    </div>
  );
}

function DecisionTree() {
  const [path, setPath] = useState<string[]>(["start"]);
  const nodeId = path[path.length - 1];
  const node = NODES[nodeId];

  const go = (next: string) => setPath((previous) => [...previous, next]);
  const back = () => setPath((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous));
  const reset = () => setPath(["start"]);

  const renderPattern = (profile: Any) => {
    if (!profile) return null;
    return (
      <details className="mt-3 rounded-lg border border-border/70 bg-muted/20 p-3">
        <summary className="cursor-pointer text-sm font-medium">Pattern across tasks</summary>
        <dl className="mt-2 space-y-1 text-sm">
          {TASKS.map((task) => (
            <div key={task.id} className="grid gap-0.5 sm:grid-cols-[11rem_1fr]">
              <dt className="text-muted-foreground">{task.label}</dt>
              <dd className="text-foreground">{pretty(profile[task.id] ?? "—")}</dd>
            </div>
          ))}
        </dl>
      </details>
    );
  };

  let body: React.ReactNode;

  if (node.type === "question") {
    body = (
      <>
        <p className="text-base font-medium text-foreground">{node.prompt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => go(node.yes)}>
            Yes <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => go(node.no)}>
            No
          </Button>
        </div>
      </>
    );
  } else if (node.type === "assessment") {
    body = (
      <>
        <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
          Assessment
        </Badge>
        <p className="text-sm text-foreground">{node.instruction}</p>
        <Button size="sm" className="mt-4 gap-1.5" onClick={() => go(node.next)}>
          Findings recorded <ArrowRight className="h-4 w-4" />
        </Button>
      </>
    );
  } else if (node.type === "diagnostic_consideration") {
    body = (
      <>
        <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
          Consider
        </Badge>
        <p className="text-base font-semibold text-foreground">
          {DIAGNOSIS_LABELS[node.diagnosis] ?? pretty(node.diagnosis)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{node.instruction}</p>
        {renderPattern(PROFILES[node.diagnosis])}
        <Button size="sm" className="mt-4 gap-1.5" onClick={() => go(node.next)}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </>
    );
  } else if (node.type === "terminal_candidate") {
    const profile = PROFILES[node.diagnosis];
    body = (
      <>
        <Badge className="mb-2 gap-1 bg-primary/15 text-primary hover:bg-primary/15">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Candidate pattern
        </Badge>
        <p className="text-lg font-semibold text-foreground">
          {DIAGNOSIS_LABELS[node.diagnosis] ?? pretty(node.diagnosis)}
        </p>
        {profile?.hallmark && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.hallmark}</p>
        )}
        {profile?.localization?.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested localization
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {profile.localization.map((site: string) => (
                <Badge key={site} variant="secondary" className="text-xs font-normal">
                  {site}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {renderPattern(profile)}
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
          {node.action}
        </p>
      </>
    );
  } else {
    body = (
      <>
        <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
          Result
        </Badge>
        <p className="text-base font-medium text-foreground">{node.result}</p>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {path.length}
        </span>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1"
            onClick={back}
            disabled={path.length === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="sm" variant="ghost" className="gap-1" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">{body}</div>

      <p className="text-xs text-muted-foreground">
        Decision support only. Multiple apraxia subtypes may coexist, and the source does not
        provide validated scoring weights or a numerical cutoff.
      </p>
    </div>
  );
}

function Profiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(PROFILES).map(([key, profile]) => (
        <div key={key} className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-foreground">{DIAGNOSIS_LABELS[key] ?? pretty(key)}</p>
            <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wider">
              Subtype
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{profile.hallmark}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.localization?.map((site: string) => (
              <Badge key={site} variant="secondary" className="text-[11px] font-normal">
                {site}
              </Badge>
            ))}
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-primary">
              Examination pattern
            </summary>
            <dl className="mt-1.5 space-y-0.5 text-xs">
              {TASKS.map((task) => (
                <div key={task.id} className="grid gap-0.5 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-muted-foreground">{task.label}</dt>
                  <dd className="text-foreground">{pretty(profile[task.id] ?? "—")}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      ))}
    </div>
  );
}

function Reference() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
        <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
          <ClipboardList className="h-4 w-4 text-primary" />
          Interpretation rules
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {algorithm.interpretation_rules.map((rule: string) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
          <h3 className="font-semibold text-foreground">Associated conditions</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {algorithm.associated_conditions.map((condition: string) => (
              <Badge key={condition} variant="secondary" className="text-xs font-normal">
                {condition}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
          <h3 className="font-semibold text-foreground">Related mimics</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {algorithm.related_mimics.map((mimic: string) => (
              <Badge key={mimic} variant="outline" className="text-xs font-normal">
                {mimic}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4">
        <h3 className="font-semibold text-foreground">Management from source</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rehabilitation
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
              {algorithm.management_from_source.rehabilitation.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Environment
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
              {algorithm.management_from_source.environment.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {algorithm.management_from_source.caveat}
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground sm:p-4">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Source
        </p>
        <p className="mt-1">
          {algorithm.source.book}, Chapter {algorithm.source.chapter} —{" "}
          {algorithm.source.authors.join(", ")}, pp. {algorithm.source.printed_pages}
        </p>
        <p className="mt-1">
          {algorithm.purpose}. {algorithm.source_fidelity_note}
        </p>
        <p className="mt-1">
          Clinical review required; no automated definitive diagnosis
          {algorithm.validation?.source_year ? ` · source year ${algorithm.validation.source_year}` : ""}.
        </p>
      </div>
    </div>
  );
}

export default function ApraxiaSection() {
  const [tab, setTab] = useState("battery");
  const [findings, setFindings] = useState<Findings>({});
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [dominance, setDominance] = useState("");
  const [language, setLanguage] = useState("");

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <div className="h-1.5 w-full bg-gradient-sunset" aria-hidden />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Hand className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-semibold text-foreground">Limb Apraxia Evaluation</h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                Bradley · Ch 10
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Bedside praxis battery and structured decision tree for limb apraxias and related
              disorders. Examine both hands; distinguish spatiotemporal production errors from
              content errors.
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/40 p-1 sm:grid-cols-4">
            <TabsTrigger value="battery" className="gap-1.5 text-xs sm:text-sm">
              <ClipboardList className="h-3.5 w-3.5" />
              Bedside battery
            </TabsTrigger>
            <TabsTrigger value="tree" className="gap-1.5 text-xs sm:text-sm">
              <GitBranch className="h-3.5 w-3.5" />
              Decision tree
            </TabsTrigger>
            <TabsTrigger value="profiles" className="gap-1.5 text-xs sm:text-sm">
              <Hand className="h-3.5 w-3.5" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="reference" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" />
              Reference
            </TabsTrigger>
          </TabsList>

          <TabsContent value="battery" className="mt-4">
            <Battery
              findings={findings}
              setFindings={setFindings}
              errorTypes={errorTypes}
              setErrorTypes={setErrorTypes}
              dominance={dominance}
              setDominance={setDominance}
              language={language}
              setLanguage={setLanguage}
              onRunAlgorithm={() => setTab("tree")}
            />
          </TabsContent>

          <TabsContent value="tree" className="mt-4">
            <DecisionTree />
          </TabsContent>

          <TabsContent value="profiles" className="mt-4">
            <Profiles />
          </TabsContent>

          <TabsContent value="reference" className="mt-4">
            <Reference />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
