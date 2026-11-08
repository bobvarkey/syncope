import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  GitBranch,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  comparisonTitles,
  episodicAlgorithm,
  getAlgorithmNode,
  isEndpoint,
  type AlgorithmOption,
  type EndpointNode,
} from "@/lib/episodicAlgorithm";

type Step = {
  nodeId: string;
  choiceLabel?: string;
};

const humanize = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const sourcePages = (pages: number[]) => `Bradley pp. ${pages.join(", ")}`;

export default function EpisodicConsciousnessAlgorithm() {
  const startId = episodicAlgorithm.implementation.entry_node;
  const [steps, setSteps] = useState<Step[]>([{ nodeId: startId }]);
  const [impressions, setImpressions] = useState<EndpointNode[]>([]);
  const [copied, setCopied] = useState(false);

  const currentNodeId = steps[steps.length - 1].nodeId;
  const node = getAlgorithmNode(currentNodeId);

  // Every diagnostic endpoint reached is collected, so several branches can be
  // explored and kept side by side (the source allows multiple diagnoses).
  useEffect(() => {
    const current = getAlgorithmNode(currentNodeId);
    if (!current || !isEndpoint(current)) return;
    setImpressions((prev) =>
      prev.some((item) => item.id === current.id) ? prev : [...prev, current]
    );
    setCopied(false);
  }, [currentNodeId]);

  const breadcrumbs = useMemo(
    () =>
      steps.map((step, index) =>
        index === 0 ? "Start" : step.choiceLabel ?? getAlgorithmNode(step.nodeId)?.id ?? step.nodeId
      ),
    [steps]
  );

  const choose = (option: AlgorithmOption) =>
    setSteps((prev) => [...prev, { nodeId: option.next, choiceLabel: option.label }]);

  const back = () => setSteps((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const restart = () => setSteps([{ nodeId: startId }]);

  const copySummary = async () => {
    const text = impressions
      .map(
        (item) =>
          `• ${item.diagnosis_or_category}\n  Clues: ${item.supporting_clues.join("; ")}\n  Evaluation: ${item.suggested_evaluation.join("; ")}\n  Source: ${sourcePages(item.source_pages)}`
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(
        `${episodicAlgorithm.title}\n\n${text || "No diagnostic endpoints reached."}`
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-lg md:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[hsl(16_100%_60%)]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-[hsl(280_75%_60%)]/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-200">
            <GitBranch size={13} />
            BRADLEY&apos;S NEUROLOGY · CH. 2–3
          </div>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight md:text-4xl">
            {episodicAlgorithm.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Source-grounded decision routing for transient loss of consciousness, falls and drop
            attacks. Answer one question at a time; unknown answers are allowed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-slate-200">
              {episodicAlgorithm.source.book}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-slate-200">
              {episodicAlgorithm.source.publication_year}
            </span>
            <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-amber-200">
              Not a validated diagnostic score
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Walker */}
        <div className="lg:col-span-8">
          <Card className="overflow-hidden border-border/70 shadow-soft">
            <CardHeader className="space-y-3 border-b border-border/60 bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                  Step {steps.length}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={back}
                    disabled={steps.length === 1}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={restart}
                    disabled={steps.length === 1 && impressions.length === 0}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <RotateCcw size={14} />
                    Restart
                  </Button>
                </div>
              </div>
              <ol className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {breadcrumbs.map((crumb, index) => (
                  <li key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 && <ChevronRight size={11} className="text-muted-foreground/60" />}
                    <span
                      className={cn(
                        "max-w-[220px] truncate rounded-full px-2 py-0.5 font-semibold",
                        index === breadcrumbs.length - 1
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                      title={crumb}
                    >
                      {crumb}
                    </span>
                  </li>
                ))}
              </ol>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {!node && (
                <p className="text-sm text-destructive">
                  Unknown algorithm node “{currentNodeId}”. Restart the algorithm.
                </p>
              )}

              {node && !isEndpoint(node) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
                    {node.question}
                  </h3>
                  <div className="space-y-2">
                    {node.options.map((option) => (
                      <button
                        key={`${node.id}-${option.next}-${option.label}`}
                        type="button"
                        onClick={() => choose(option)}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-medium leading-snug text-foreground">
                          {option.label}
                        </span>
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pick “Uncertain” when findings are indeterminate — the source allows unknown
                    answers.
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Source: {sourcePages(node.source_pages)}
                  </p>
                </div>
              )}

              {node && isEndpoint(node) && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700/80">
                        Diagnostic endpoint
                      </div>
                      <h3 className="mt-1 text-lg font-bold leading-snug sm:text-xl">
                        {node.diagnosis_or_category}
                      </h3>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Supporting clues
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                        {node.supporting_clues.map((clue) => (
                          <li key={clue} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{clue}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Suggested evaluation
                      </h4>
                      <ol className="mt-2 space-y-1.5 text-sm text-foreground">
                        {node.suggested_evaluation.map((item, index) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                              {index + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen size={13} />
                      Source: {sourcePages(node.source_pages)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={back} className="gap-1.5">
                        <ArrowLeft size={14} />
                        Explore another branch
                      </Button>
                      <Button size="sm" onClick={restart} className="gap-1.5">
                        <RotateCcw size={14} />
                        Start over
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side rail */}
        <div className="space-y-5 lg:col-span-4">
          <Card className="border-border/70 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList size={17} className="text-primary" />
                Initial assessment
              </CardTitle>
              <CardDescription>Gather before routing the episode</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible defaultValue="history" className="w-full">
                <AccordionItem value="history" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
                    History
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {episodicAlgorithm.initial_assessment.history.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="examination" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-muted-foreground" />
                      Examination
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {episodicAlgorithm.initial_assessment.examination.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="safety" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-semibold text-amber-700 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <ShieldAlert size={14} />
                      Safety overlay
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                      {episodicAlgorithm.initial_assessment.safety_note}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-soft">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 size={17} className="text-primary" />
                  Collected impressions
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {impressions.length}
                </Badge>
              </div>
              <CardDescription>
                Multiple diagnoses may coexist — each branch you reach is kept here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {impressions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  No impressions yet. Answer the questions to reach a diagnostic endpoint.
                </p>
              ) : (
                <ul className="space-y-2">
                  {impressions.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {item.diagnosis_or_category}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {sourcePages(item.source_pages)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setImpressions((prev) => prev.filter((entry) => entry.id !== item.id))
                        }
                        className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Remove ${item.diagnosis_or_category}`}
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copySummary}
                disabled={impressions.length === 0}
                className="w-full gap-1.5"
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy summary"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparative features */}
      <Card className="border-border/70 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comparative features</CardTitle>
          <CardDescription>Bedside discriminators from the source text</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion type="multiple" className="w-full">
            {Object.entries(episodicAlgorithm.comparative_features).map(([key, pair]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  {comparisonTitles[key] ?? humanize(key)}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(pair).map(([side, items]) => (
                      <div key={side} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {humanize(side)}
                        </div>
                        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                          {items.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Cautions + source */}
      <Card className="border-amber-200/70 bg-amber-50/40 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-amber-900">
            <ShieldAlert size={17} />
            Clinical cautions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-sm text-amber-900/90">
            {episodicAlgorithm.clinical_cautions.map((caution) => (
              <li key={caution} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{caution}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2 px-1 text-center text-[11px] text-muted-foreground">
        <Separator className="mb-3" />
        <p>
          Source: {episodicAlgorithm.source.book} ({episodicAlgorithm.source.publication_year}) —{" "}
          {episodicAlgorithm.source.chapters
            .map((chapter) => `Ch. ${chapter.number}: ${chapter.title}`)
            .join("; ")}
          .
        </p>
        <p className="text-muted-foreground/80">{episodicAlgorithm.scope}</p>
      </div>
    </div>
  );
}
