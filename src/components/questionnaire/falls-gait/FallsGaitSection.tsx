import { useState } from "react";
import { Activity, Footprints, Pill, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SteadiScreening from "./SteadiScreening";
import FallsAlgorithm from "./FallsAlgorithm";
import GaitAlgorithm from "./GaitAlgorithm";

export default function FallsGaitSection() {
  const [tab, setTab] = useState("screening");

  /** Opens the MFRS calculator in the Drop Attacks group and scrolls to it. */
  const openMfrs = () => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", "#medication-fall-risk");
    window.dispatchEvent(new Event("hashchange"));
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document
          .getElementById("medication-fall-risk")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <div className="h-1.5 w-full bg-gradient-sunset" aria-hidden />
      <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Footprints className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">Falls &amp; Gait Evaluation</h2>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              STEADI-based
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Screen fall risk, then route through the falls/drop-attacks or neurological gait algorithm.
            Pair with the medication review below — drug-related risk is scored separately.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={openMfrs}>
          <Pill className="h-4 w-4" />
          Medication risk (MFRS)
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/40 p-1 sm:w-auto sm:grid-cols-3">
          <TabsTrigger value="screening" className="gap-1.5 text-xs sm:text-sm">
            <Activity className="h-3.5 w-3.5" />
            Fall risk screen
          </TabsTrigger>
          <TabsTrigger value="falls" className="gap-1.5 text-xs sm:text-sm">
            <ShieldAlert className="h-3.5 w-3.5" />
            Falls &amp; drop attacks
          </TabsTrigger>
          <TabsTrigger value="gait" className="gap-1.5 text-xs sm:text-sm">
            <Footprints className="h-3.5 w-3.5" />
            Gait evaluation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="screening" className="mt-4">
          <SteadiScreening onOpenMfrs={openMfrs} />
        </TabsContent>
        <TabsContent value="falls" className="mt-4">
          <FallsAlgorithm />
        </TabsContent>
        <TabsContent value="gait" className="mt-4">
          <GaitAlgorithm />
        </TabsContent>
      </Tabs>
      </div>
    </section>
  );
}
