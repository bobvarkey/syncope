import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, ShieldCheck, Activity, Info, Stethoscope, ArrowRightCircle, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  ecgChecklistItems,
  globalUrgentTriggers,
  computeChecklistScore,
  mapAbcdeSelectionToChecklist,
} from "@/lib/ecgChecklistData";
import { cn } from "@/lib/utils";

interface EcgScoringChecklistProps {
  /** Selections coming from the ABCDE / WOBBLER mini-screen */
  linkedAbcdeSelection?: Record<string, boolean>;
}

const EcgScoringChecklist = ({ linkedAbcdeSelection }: EcgScoringChecklistProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [urgentOverrideIds, setUrgentOverrideIds] = useState<Set<string>>(new Set());
  const [globalTriggerIds, setGlobalTriggerIds] = useState<Set<string>>(new Set());
  const [autoSync, setAutoSync] = useState(true);

  const linkedIds = useMemo(
    () => mapAbcdeSelectionToChecklist(linkedAbcdeSelection || {}),
    [linkedAbcdeSelection]
  );
  const linkedKey = linkedIds.slice().sort().join("|");

  // Auto-import findings selected in the ABCDE screen
  useEffect(() => {
    if (!autoSync || linkedIds.length === 0) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      linkedIds.forEach((id) => {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedKey, autoSync]);

  const importLinked = () => {
    if (linkedIds.length === 0) {
      toast({ title: "Nothing to import", description: "No mapped patterns selected in the ABCDE screen yet." });
      return;
    }
    setSelectedIds((prev) => new Set([...prev, ...linkedIds]));
    toast({ title: `Imported ${linkedIds.length} finding(s)`, description: "Pulled from the ECG ABCDE / WOBBLER screen." });
  };

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      // Also clear any associated overrides if item is deselected
      const nextOverrides = new Set(urgentOverrideIds);
      nextOverrides.delete(id);
      setUrgentOverrideIds(nextOverrides);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleOverride = (id: string) => {
    const next = new Set(urgentOverrideIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setUrgentOverrideIds(next);
  };

  const toggleGlobalTrigger = (id: string) => {
    const next = new Set(globalTriggerIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setGlobalTriggerIds(next);
  };

  const { score, isUrgent, activeItems, interpretation } = useMemo(() => 
    computeChecklistScore(selectedIds, urgentOverrideIds, globalTriggerIds), 
    [selectedIds, urgentOverrideIds, globalTriggerIds]
  );


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sunset-orange to-sunset-red" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-sunset-orange" />
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Syncope ECG High-Risk Checklist</CardTitle>
                <CardDescription>Clinical decision-support for potentially life-threatening ECG patterns</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-[10px] uppercase tracking-widest bg-primary/5">
              v1.0 Clinical
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Global Urgent Triggers Section */}
          <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Immediate Red Flags (Global Triggers)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {globalUrgentTriggers.map((trigger, idx) => (
                <div key={idx} className="flex items-start gap-3 group cursor-pointer" onClick={() => toggleGlobalTrigger(trigger)}>
                  <Checkbox 
                    id={`trigger-${idx}`} 
                    checked={globalTriggerIds.has(trigger)}
                    className="mt-0.5 border-destructive/50 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <Label 
                    htmlFor={`trigger-${idx}`} 
                    className="text-xs leading-tight cursor-pointer group-hover:text-destructive transition-colors"
                  >
                    {trigger}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          {/* Main Checklist Items */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Accordion type="multiple" className="w-full space-y-2">
              {ecgChecklistItems.map((item) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id} 
                  className={cn(
                    "border rounded-lg px-2 transition-all duration-200",
                    selectedIds.has(item.id) ? "border-primary/50 bg-primary/5 shadow-sm" : "border-muted"
                  )}
                >
                  <div className="flex items-center py-2">
                    <Checkbox 
                      id={`check-${item.id}`} 
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mr-3"
                    />
                    <AccordionTrigger className="flex-1 py-1 hover:no-underline">
                      <div className="flex flex-col items-start text-left gap-1">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-[9px] h-4 py-0 uppercase tracking-tighter opacity-70">
                            {item.category.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] h-4 py-0 border-primary/20">
                            +{item.score} pts
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pb-4 pt-1 px-8 border-t border-primary/10 mt-1">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" /> Diagnostic Criteria
                        </Label>
                        <ul className="list-disc pl-4 space-y-1">
                          {item.criteria.map((c, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{c}</li>
                          ))}
                        </ul>
                      </div>

                      {item.urgentOverrideConditions && (
                        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> High-Risk Context (Urgent)
                          </Label>
                          <div className="space-y-1.5">
                            {item.urgentOverrideConditions.map((cond, i) => (
                              <div key={i} className="flex items-start gap-2 group cursor-pointer" onClick={() => toggleOverride(item.id)}>
                                <Checkbox 
                                  id={`override-${item.id}-${i}`}
                                  checked={urgentOverrideIds.has(item.id)}
                                  className="mt-0.5 scale-75 border-amber-500/50 data-[state=checked]:bg-amber-500"
                                />
                                <Label className="text-xs text-amber-700 leading-tight cursor-pointer">{cond}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-md bg-primary/5 border border-primary/10 p-3 space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" /> Recommended Action
                        </Label>
                        <p className="text-xs italic text-primary/80 leading-relaxed">{item.action}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Result Display Card */}
            <div className="space-y-4">
              <Card className={cn(
                "sticky top-24 transition-colors duration-500 border-2",
                isUrgent ? "border-destructive bg-destructive/5" : "border-primary/20"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Scoring Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end justify-between border-b pb-4 border-primary/10">
                    <div className="space-y-1">
                      <span className="text-4xl font-black text-primary">{score}</span>
                      <span className="text-sm text-muted-foreground ml-2">/ 25 points</span>
                    </div>
                    <div className="text-right">
                      {isUrgent && (
                        <Badge variant="destructive" className="animate-pulse mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                          URGENT FLAG ACTIVE
                        </Badge>
                      )}
                      <p className={cn(
                        "text-lg font-extrabold leading-tight",
                        isUrgent ? "text-destructive" : "text-primary"
                      )}>
                        {interpretation.label}
                      </p>
                    </div>
                  </div>

                  <Alert className={cn(
                    "border-none",
                    isUrgent ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    <div className="flex gap-3">
                      <ArrowRightCircle className="h-5 w-5 shrink-0" />
                      <div>
                        <AlertTitle className="text-xs font-bold uppercase tracking-widest mb-1 opacity-90">Protocol Recommendation</AlertTitle>
                        <AlertDescription className="text-sm font-medium leading-snug">
                          {isUrgent ? "Urgent monitored cardiac assessment and targeted workup required immediately." : interpretation.action}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-4">
                      {activeItems.length > 0 ? (
                        activeItems.map(item => (
                          <div key={item.id} className="space-y-1 border-l-2 border-primary/20 pl-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                              <Badge variant="outline" className="text-[9px]">+{item.score} pts</Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight italic">{item.action}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                          <ShieldCheck className="h-12 w-12 mb-2" />
                          <p className="text-xs font-medium italic">Select findings to generate report</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-[10px] text-muted-foreground italic px-2 text-center max-w-2xl mx-auto leading-tight">
        Disclaimer: This tool is for clinical decision support only and does not replace expert medical judgment.
        ECG interpretation should always be integrated with the clinical history, physical examination, 
        and other diagnostic findings. "Urgent" status reflects potential for immediate life-threatening events.
      </div>
    </div>
  );
};

export default EcgScoringChecklist;
