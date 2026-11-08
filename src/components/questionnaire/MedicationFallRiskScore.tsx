import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Minus,
  Plus,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RiskLevel = "high" | "moderate" | "low";

type MfrsCategory = {
  id: string;
  risk: RiskLevel;
  points: number;
  name: string;
  examples: string;
};

const MFRS_CATEGORIES: MfrsCategory[] = [
  {
    id: "opioids",
    risk: "high",
    points: 3,
    name: "Analgesics (opioids)",
    examples: "Morphine, oxycodone, tramadol, fentanyl",
  },
  {
    id: "antipsychotics",
    risk: "high",
    points: 3,
    name: "Antipsychotics",
    examples: "Haloperidol, quetiapine, risperidone, olanzapine",
  },
  {
    id: "anticonvulsants",
    risk: "high",
    points: 3,
    name: "Anticonvulsants",
    examples: "Gabapentin, phenytoin, valproate, carbamazepine",
  },
  {
    id: "benzodiazepines",
    risk: "high",
    points: 3,
    name: "Benzodiazepines",
    examples: "Lorazepam, diazepam, alprazolam, clonazepam",
  },
  {
    id: "antihypertensives",
    risk: "moderate",
    points: 2,
    name: "Antihypertensives",
    examples: "Lisinopril, amlodipine, metoprolol, losartan",
  },
  {
    id: "cardiac",
    risk: "moderate",
    points: 2,
    name: "Cardiac drugs",
    examples: "Digoxin, nitrates (isosorbide, nitroglycerin)",
  },
  {
    id: "antiarrhythmics",
    risk: "moderate",
    points: 2,
    name: "Antiarrhythmics",
    examples: "Amiodarone, flecainide, sotalol",
  },
  {
    id: "antidepressants",
    risk: "moderate",
    points: 2,
    name: "Antidepressants",
    examples: "Sertraline, citalopram, amitriptyline, trazodone",
  },
  {
    id: "diuretics",
    risk: "low",
    points: 1,
    name: "Diuretics",
    examples: "Furosemide, hydrochlorothiazide, spironolactone",
  },
];

const RISK_GROUPS: { level: RiskLevel; label: string; points: number }[] = [
  { level: "high", label: "High risk", points: 3 },
  { level: "moderate", label: "Moderate risk", points: 2 },
  { level: "low", label: "Low risk", points: 1 },
];

const riskStyles: Record<RiskLevel, string> = {
  high: "bg-rose-500/15 text-rose-600 border-rose-500/40",
  moderate: "bg-amber-500/15 text-amber-600 border-amber-500/40",
  low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40",
};

export default function MedicationFallRiskScore() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const setCount = (id: string, raw: string) => {
    const value = Number.parseInt(raw, 10);
    setCounts((prev) => ({ ...prev, [id]: Number.isFinite(value) && value > 0 ? value : 0 }));
  };

  const bump = (id: string, delta: number) =>
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const { total, drugCount } = useMemo(() => {
    let points = 0;
    let drugs = 0;
    for (const category of MFRS_CATEGORIES) {
      const count = counts[category.id] || 0;
      points += count * category.points;
      drugs += count;
    }
    return { total: points, drugCount: drugs };
  }, [counts]);

  const highRisk = total >= 6;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Medication Fall Risk Score (MFRS)
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            A 9-category checklist that assigns 1, 2 or 3 points per drug to estimate medication-induced
            fall risk. A total of <span className="font-semibold text-foreground">6 or higher</span> is
            high risk.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          AHRQ Tool 3I
        </Badge>
      </div>

      <Card className="border-border/70 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Scoring worksheet</CardTitle>
          <CardDescription>
            Review all active scheduled and as-needed (PRN) medications. Multiply the number of drugs in
            each class by its point value, then add the columns together.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {RISK_GROUPS.map((group, groupIndex) => {
            const groupCategories = MFRS_CATEGORIES.filter((c) => c.risk === group.level);
            const groupSubtotal = groupCategories.reduce(
              (sum, c) => sum + (counts[c.id] || 0) * c.points,
              0
            );
            return (
              <div key={group.level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className={cn("rounded-full border px-2 py-0.5", riskStyles[group.level])}>
                      {group.label}
                    </span>
                    <span>{group.points} points per drug</span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    Subtotal {groupSubtotal}
                  </span>
                </div>

                <div className="divide-y rounded-xl border border-border/70 bg-card">
                  {groupCategories.map((category) => {
                    const count = counts[category.id] || 0;
                    const subtotal = count * category.points;
                    return (
                      <div
                        key={category.id}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1fr_auto_auto]"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold leading-snug text-foreground">
                            {category.name}
                          </div>
                          <div className="text-[11px] leading-snug text-muted-foreground">
                            {category.examples}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => bump(category.id, -1)}
                            disabled={count === 0}
                            aria-label={`Fewer ${category.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={count === 0 ? "" : count}
                            placeholder="0"
                            onChange={(event) => setCount(category.id, event.target.value)}
                            className="h-7 w-14 text-center text-sm tabular-nums"
                            aria-label={`Number of ${category.name}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => bump(category.id, 1)}
                            aria-label={`More ${category.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="hidden w-14 text-right sm:block">
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {count} × {category.points}
                          </span>
                          <div className="text-sm font-bold tabular-nums text-foreground">= {subtotal}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {groupIndex < RISK_GROUPS.length - 1 && <Separator className="opacity-0" />}
              </div>
            );
          })}

          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
              highRisk
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  highRisk ? "bg-rose-500/15" : "bg-emerald-500/15"
                )}
              >
                {highRisk ? (
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                  Total MFRS score
                </div>
                <div className="text-3xl font-bold leading-none tabular-nums">{total}</div>
                <div className="mt-1 text-[11px] opacity-80">
                  {drugCount} contributing drug{drugCount === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 sm:max-w-md">
              <Badge
                className={cn(
                  "border text-[10px] font-bold uppercase tracking-wider",
                  highRisk
                    ? "border-rose-300 bg-rose-100 text-rose-700"
                    : "border-emerald-300 bg-emerald-100 text-emerald-700"
                )}
              >
                {highRisk ? "High medication risk" : "Lower medication risk"}
              </Badge>
              <p className="mt-2 text-xs leading-relaxed">
                {highRisk
                  ? "Flag the chart for a formal pharmacist or physician medication review — deprescribing, dose reduction or safer alternatives."
                  : "Maintain standard fall precautions and monitor for side effects such as dizziness or drowsiness."}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 bg-background/70"
              onClick={() => setCounts({})}
              disabled={drugCount === 0}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            How to apply the score
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold">Count every individual drug.</span> Two drugs in the same
                category score separately — e.g. two antihypertensives = 2 + 2 points.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold">Include combination pills.</span> Score each active
                ingredient separately — e.g. lisinopril + hydrochlorothiazide = 2 + 1 = 3 points.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold">Score 0–5:</span> standard fall precautions; monitor for
                dizziness or drowsiness.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold">Score 6 or higher:</span> formal pharmacist/physician
                medication review for deprescribing, dose reduction or safer alternatives.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <span className="font-semibold">Pair with a physical tool.</span> Use alongside the Morse
                Fall Scale or STRATIFY — MFRS measures only drug-related risk.
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notes &amp; sources
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Featured as Tool 3I in the AHRQ <em>Preventing Falls in Hospitals</em> Toolkit. This calculator
            is for clinical decision support and does not replace medication review.
          </p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <a
              href="https://www.ahrq.gov/sites/default/files/publications/files/fallpxtoolkit_0.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              AHRQ Preventing Falls in Hospitals Toolkit
            </a>
            <a
              href="https://pharmacia.pensoft.net/article/101609/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Pharmacia — MFRS validation article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
