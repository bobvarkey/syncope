import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Entry = {
  id: string; // DOM id to scroll to
  title: string;
  group: string;
  keywords?: string[];
};

// Flat searchable index — kept independent from the sidebar so tags/aliases
// can be tuned without touching sidebar layout code.
const entries: Entry[] = [
  // Mini apps
  { id: "syncope-mini-app", title: "Syncope triage — 60s bedside tool", group: "Mini apps", keywords: ["triage", "true syncope", "reflex", "orthostatic", "cardiac"] },
  { id: "hutt-mini-app", title: "HUTT — Head-Up Tilt Table Test", group: "Mini apps", keywords: ["hutt", "tilt", "italian", "westminster", "ntg", "gtn", "vasis", "isoproterenol", "atropine", "phenylephrine", "checklist"] },
  { id: "ecg-abcde", title: "ECG ABCDE screen (high-risk patterns)", group: "Mini apps", keywords: ["abcde", "brugada", "wpw", "delta", "epsilon", "long qt", "arvc", "ai", "upload"] },
  { id: "anti-arrhythmics", title: "Anti-arrhythmic drugs — Vaughan-Williams", group: "Pharmacology", keywords: ["vaughan williams", "class 0", "class i", "class ii", "class iii", "class iv", "class v", "ivabradine", "amiodarone", "flecainide", "sotalol", "verapamil", "diltiazem", "adenosine", "digoxin", "funny channel", "hcn", "mnemonic"] },
  { id: "syncope-medications", title: "Medications & syncope risk", group: "Pharmacology", keywords: ["medication", "qt prolonging", "beta blocker", "polypharmacy", "interaction"] },

  // Clinical history
  { id: "circumstances", title: "Circumstances", group: "Clinical history" },
  { id: "onset", title: "Onset", group: "Clinical history" },
  { id: "attack", title: "Attack", group: "Clinical history" },
  { id: "end", title: "End / recovery", group: "Clinical history" },
  { id: "background", title: "Background", group: "Clinical history" },
  { id: "clinical-features", title: "Clinical features", group: "Clinical history" },

  // Investigations
  { id: "ecg-findings", title: "ECG findings", group: "Investigations" },
  { id: "lab-tests", title: "Laboratory tests", group: "Investigations" },
  { id: "initial-evaluation", title: "Initial evaluation", group: "Investigations" },
  { id: "tilt-test", title: "Tilt test protocol", group: "Investigations" },
  { id: "risk-score", title: "Risk score", group: "Investigations", keywords: ["egsys", "canadian", "san francisco"] },
  { id: "subclavian-steal", title: "Subclavian steal", group: "Investigations" },
  { id: "carotid-massage", title: "Carotid sinus massage", group: "Investigations", keywords: ["csm"] },
  { id: "orthostatic-intolerance", title: "Orthostatic intolerance", group: "Investigations", keywords: ["pots", "oh"] },
  { id: "autonomic-testing", title: "Autonomic testing (Finometer)", group: "Investigations", keywords: ["finapres", "brs", "hrv"] },

  // Diagnosis
  { id: "differential-diagnosis-section", title: "Differential diagnosis", group: "Diagnosis" },
  { id: "diagnostic-criteria", title: "Diagnostic criteria", group: "Diagnosis" },
  { id: "ai-diagnosis", title: "AI diagnosis assistant", group: "Diagnosis" },

  // Management
  { id: "interventions", title: "Interventions & management", group: "Management", keywords: ["midodrine", "fludrocortisone", "pacemaker", "icd"] },

  // Drop attacks
  { id: "drop-attacks", title: "Drop attacks workup", group: "Drop attacks" },
];

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[hsl(45_100%_60%/0.55)] text-foreground rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function flashTarget(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add(
    "ring-2",
    "ring-primary",
    "ring-offset-2",
    "rounded-lg",
    "transition-shadow",
  );
  window.setTimeout(() => {
    el.classList.remove(
      "ring-2",
      "ring-primary",
      "ring-offset-2",
    );
  }, 1400);
}

const QuickSearch = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [] as Entry[];
    const scored = entries
      .map((e) => {
        const hay = [e.title, e.group, ...(e.keywords || [])]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return null;
        // Prioritise title matches
        const score = e.title.toLowerCase().includes(q) ? 0 : 1;
        return { e, score };
      })
      .filter(Boolean) as { e: Entry; score: number }[];
    return scored.sort((a, b) => a.score - b.score).map((r) => r.e);
  }, [q]);

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset cursor when results change
  useEffect(() => setCursor(0), [q]);

  const select = (id: string) => {
    setOpen(false);
    setQuery("");
    // Defer to allow the panel/backdrop to unmount before smooth scroll
    window.requestAnimationFrame(() => flashTarget(id));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      const r = results[cursor];
      if (r) {
        e.preventDefault();
        select(r.id);
      }
    }
  };

  const showPanel = open && q.length > 0;

  // Group results by their group label
  const grouped = useMemo(() => {
    const m = new Map<string, Entry[]>();
    results.forEach((r) => {
      const arr = m.get(r.group) || [];
      arr.push(r);
      m.set(r.group, arr);
    });
    return Array.from(m.entries());
  }, [results]);

  return (
    <>
      {showPanel && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-md animate-in fade-in"
          aria-hidden
        />
      )}
      <div className="relative w-full sm:w-80 md:w-96 z-40">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search mini-apps & sections…"
          aria-label="Search mini-apps and sections"
          className="h-9 pl-8 pr-16 text-sm bg-background/70"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="h-7 w-7"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          )}
        </div>

        {showPanel && (
          <div
            ref={panelRef}
            className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-xl border bg-popover/95 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-1"
          >
            {results.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No matches for “{query}”.
              </div>
            ) : (
              <>
                <ul className="py-1">
                  {grouped.map(([group, items]) => (
                    <li key={group}>
                      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {group}
                      </div>
                      <ul>
                        {items.map((r) => {
                          const globalIdx = results.indexOf(r);
                          const active = globalIdx === cursor;
                          return (
                            <li key={r.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setCursor(globalIdx)}
                                onClick={() => select(r.id)}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md",
                                  active
                                    ? "bg-primary/10 text-foreground"
                                    : "hover:bg-muted/60",
                                )}
                              >
                                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 truncate">
                                  {highlight(r.title, query)}
                                </span>
                                {active && (
                                  <CornerDownLeft className="h-3.5 w-3.5 text-primary" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-2 border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      <ArrowDown className="h-3 w-3" /> navigate
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CornerDownLeft className="h-3 w-3" /> open
                    </span>
                    <span>esc close</span>
                  </span>
                  <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuickSearch;
