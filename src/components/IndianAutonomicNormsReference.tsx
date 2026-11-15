import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import {
  AGE_GROUPS,
  EI_NORMS,
  HRDB_NORMS,
  PRT100_NORMS,
  PRT50_NORMS,
  QSART_NORMS,
  Sex,
  VALSALVA_RATIO_NORMS,
} from "@/lib/autonomicNorms";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const SEXES: Sex[] = ["male", "female"];
const formatRange = (range: { LLN: number; ULN: number }) => `${range.LLN}–${range.ULN}`;

export function IndianAutonomicNormsReference() {
  const [open, setOpen] = useState(false);
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarGroup className="mt-2 border-t pt-2">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            type="button"
            title="Indian age/sex autonomic norms"
            aria-label="Indian age/sex autonomic norms"
            className="h-auto min-h-9 w-full justify-start gap-2 whitespace-normal py-2 text-left"
            onClick={(event) => {
              if (collapsed && !isMobile) {
                event.preventDefault();
                event.stopPropagation();
                toggleSidebar();
                setOpen(true);
              }
            }}
          >
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 text-xs font-semibold leading-snug">
                  Indian autonomic norms
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <p className="mb-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            Indian adult reference intervals, shown as LLN–ULN. QSART values are sweat volume (µL).
            PRT100/PRT50 mean pressure recovery time to 100%/50% of baseline. Validated local
            laboratory ranges take precedence.
          </p>
          <div className="max-w-full overflow-x-auto rounded-md border touch-pan-x">
            <table className="w-max min-w-full border-collapse text-[10px] leading-tight">
              <caption className="sr-only">
                Indian age- and sex-specific HRDB, E:I, Valsalva, pressure recovery time, and QSART reference ranges
              </caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  {[
                    "Age",
                    "Sex",
                    "HRDB ΔHR (bpm)",
                    "E:I",
                    "Valsalva ratio",
                    "PRT100 (s)",
                    "PRT50 (s)",
                    "QSART forearm",
                    "QSART proximal leg",
                    "QSART distal leg",
                    "QSART foot",
                  ].map((heading) => (
                    <th key={heading} scope="col" className="border-b px-1.5 py-1.5 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.flatMap((ageGroup) =>
                  SEXES.map((sex) => (
                    <tr key={`${ageGroup}-${sex}`} className="even:bg-muted/30">
                      <th scope="row" className="border-t px-1.5 py-1 text-left font-medium">
                        {ageGroup}
                      </th>
                      <td className="border-t px-1.5 py-1 capitalize">{sex}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(HRDB_NORMS[ageGroup][sex])}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(EI_NORMS[ageGroup][sex])}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(VALSALVA_RATIO_NORMS[ageGroup][sex])}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(PRT100_NORMS[ageGroup][sex])}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(PRT50_NORMS[ageGroup][sex])}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(QSART_NORMS[ageGroup][sex].forearm)}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(QSART_NORMS[ageGroup][sex].proximal_leg)}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(QSART_NORMS[ageGroup][sex].distal_leg)}</td>
                      <td className="border-t px-1.5 py-1">{formatRange(QSART_NORMS[ageGroup][sex].foot)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}