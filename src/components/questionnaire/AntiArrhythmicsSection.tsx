import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import diagram from "@/assets/anti-arrhythmic-classes.png.asset.json";

type DrugClass = {
  id: string;
  label: string;
  title: string;
  mnemonicWord: string;
  target: string;
  color: string; // tailwind bg/text tints
  subGroups?: { label: string; mnemonic?: string; drugs: string[] }[];
  drugs?: string[];
  notes?: string;
};

const classes: DrugClass[] = [
  {
    id: "I",
    label: "Class I",
    title: "Na⁺ channel blockers",
    mnemonicWord: "Some → Sodium",
    target: "Fast Na⁺ channels — slow phase 0 depolarisation",
    color: "border-violet-500/50 bg-violet-500/5",
    notes: "Sub-mnemonic: “Quinidine likes fever” (Ia · Ib · Ic)",
    subGroups: [
      { label: "Class Ia", mnemonic: "Quinidine", drugs: ["Quinidine", "Procainamide", "Disopyramide"] },
      { label: "Class Ib", mnemonic: "likes", drugs: ["Lidocaine", "Mexiletine"] },
      { label: "Class Ic", mnemonic: "fever", drugs: ["Flecainide", "Propafenone"] },
    ],
  },
  {
    id: "II",
    label: "Class II",
    title: "Beta blockers",
    mnemonicWord: "Block → Beta blockers",
    target: "β-adrenergic receptors — ↓ SA/AV node automaticity",
    color: "border-rose-500/50 bg-rose-500/5",
    notes: "Mnemonic: “-LOL” suffix",
    drugs: ["Propranolol", "Metoprolol", "Atenolol", "Bisoprolol", "Esmolol", "Carvedilol"],
  },
  {
    id: "III",
    label: "Class III",
    title: "K⁺ channel blockers",
    mnemonicWord: "Potassium → Potassium",
    target: "K⁺ efflux — prolong repolarisation & QT",
    color: "border-emerald-500/50 bg-emerald-500/5",
    notes: "Mnemonic: “AIDS”",
    drugs: ["Amiodarone", "Ibutilide", "Dofetilide", "Sotalol", "Dronedarone"],
  },
  {
    id: "IV",
    label: "Class IV",
    title: "Ca²⁺ channel blockers (non-DHP)",
    mnemonicWord: "Channels → Calcium",
    target: "L-type Ca²⁺ channels — slow AV nodal conduction",
    color: "border-blue-500/50 bg-blue-500/5",
    drugs: ["Verapamil", "Diltiazem"],
  },
  {
    id: "V",
    label: "Class V",
    title: "Miscellaneous agents",
    mnemonicWord: "Mainly → Miscellaneous",
    target: "Varied — vagal tone, Na/K-ATPase, adenosine receptors",
    color: "border-amber-500/50 bg-amber-500/5",
    drugs: ["Digoxin", "Adenosine", "Magnesium sulfate", "Ivabradine"],
  },
];

const AntiArrhythmicsSection = () => {
  const [openId, setOpenId] = useState<string | null>("I");

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-primary" />
              Anti-arrhythmic Drugs — Vaughan-Williams
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Memory hooks and drug lists. Tap a class for details.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
            Reference · Pharmacology
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Master mnemonic */}
        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Master mnemonic</p>
          <p className="text-base font-semibold text-foreground">
            “Some Block Potassium Channels Mainly”
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">Some</span> → Sodium channel blockers · Class I</li>
            <li><span className="font-medium text-foreground">Block</span> → Beta blockers · Class II</li>
            <li><span className="font-medium text-foreground">Potassium</span> → Potassium channel blockers · Class III</li>
            <li><span className="font-medium text-foreground">Channels</span> → Calcium channel blockers · Class IV</li>
            <li><span className="font-medium text-foreground">Mainly</span> → Miscellaneous agents · Class V</li>
          </ul>
        </div>

        {/* Cellular target diagram */}
        <figure className="rounded-lg border overflow-hidden bg-background">
          <img
            src={diagram.url}
            alt="Cellular targets of anti-arrhythmic classes I–IV"
            loading="lazy"
            className="w-full h-auto object-contain max-h-96 mx-auto"
          />
          <figcaption className="px-3 py-2 text-[11px] text-muted-foreground border-t bg-muted/30 leading-snug">
            Cellular targets: Class I (Na⁺), Class II (β-receptors), Class III (K⁺), Class IV (Ca²⁺).
          </figcaption>
        </figure>

        {/* Class cards */}
        <div className="space-y-2">
          {classes.map((c) => {
            const open = openId === c.id;
            return (
              <div key={c.id} className={cn("rounded-lg border transition-all", c.color)}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="w-full flex items-center justify-between gap-3 p-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {c.label}
                      </Badge>
                      <span className="font-semibold text-sm text-foreground">{c.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{c.mnemonicWord}</span> · {c.target}
                    </p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-3">
                    {c.notes && (
                      <p className="text-xs italic text-muted-foreground">{c.notes}</p>
                    )}
                    {c.subGroups && (
                      <div className="grid gap-2 sm:grid-cols-3">
                        {c.subGroups.map((sg) => (
                          <div key={sg.label} className="rounded-md border bg-background/60 p-2">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">{sg.label}</span>
                              {sg.mnemonic && (
                                <span className="text-[10px] italic text-primary">“{sg.mnemonic}”</span>
                              )}
                            </div>
                            <ul className="mt-1 space-y-0.5">
                              {sg.drugs.map((d) => (
                                <li key={d} className="text-xs text-foreground">• {d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    {c.drugs && (
                      <div className="flex flex-wrap gap-1.5">
                        {c.drugs.map((d) => (
                          <Badge key={d} variant="secondary" className="text-xs font-normal">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-dashed pt-2">
          Educational reference only — dosing, indications, and contraindications must be verified against local
          formulary and current guidelines.
        </p>
      </CardContent>
    </Card>
  );
};

export default AntiArrhythmicsSection;
