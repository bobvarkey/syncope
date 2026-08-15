import { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Stethoscope,
  Brain,
  FileText,
  Zap,
  Clock,
  TrendingUp,
  Wind,
  Eye,
  Users,
  TestTube,
  Lightbulb,
  CheckSquare,
  Sparkles,
  Shield,
  Gauge,
  AlertTriangle,
  Pill,
  ChevronDown,
  Search,
  X,
  ArrowUpFromLine,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAssessmentProgress } from "@/contexts/AssessmentProgressContext";
import { cn } from "@/lib/utils";

// Sunset Blaze accent classes per icon + group gradients
const sections = [
  {
    id: "hutt-group",
    title: "HUTT Mini App",
    icon: ArrowUpFromLine,
    color: "text-[hsl(340_85%_60%)]",
    gradient: "from-[hsl(340_85%_60%/0.35)] via-[hsl(280_75%_60%/0.28)] to-[hsl(28_100%_58%/0.22)]",
    ring: "hsl(340_85%_60%)",
    prominent: true,
    subsections: [
      { id: "hutt-mini-app", title: "Head-Up Tilt Table Test", icon: ArrowUpFromLine, color: "text-[hsl(340_85%_60%)]" },
    ],
  },
  {
    id: "clinical-history",
    title: "Clinical History",
    icon: FileText,
    color: "text-[hsl(16_100%_60%)]", // coral
    gradient: "from-[hsl(16_100%_60%/0.22)] via-[hsl(28_100%_58%/0.18)] to-transparent",
    ring: "hsl(16_100%_60%)",
    subsections: [
      { id: "circumstances", title: "Circumstances", icon: Eye, color: "text-[hsl(16_100%_60%)]" },
      { id: "onset", title: "Onset", icon: Clock, color: "text-[hsl(28_100%_58%)]" },
      { id: "attack", title: "Attack", icon: Zap, color: "text-[hsl(45_100%_55%)]" },
      { id: "end", title: "End", icon: CheckSquare, color: "text-[hsl(160_70%_45%)]" },
      { id: "background", title: "Background", icon: Heart, color: "text-[hsl(340_85%_60%)]" },
      { id: "clinical-features", title: "Clinical Features", icon: Stethoscope, color: "text-[hsl(280_75%_60%)]" },
    ],
  },
  {
    id: "investigations",
    title: "Investigations",
    icon: TestTube,
    color: "text-[hsl(28_100%_58%)]",
    gradient: "from-[hsl(28_100%_58%/0.22)] via-[hsl(45_100%_55%/0.18)] to-transparent",
    ring: "hsl(28_100%_58%)",
    subsections: [
      { id: "ecg-scoring-checklist", title: "ECG High-Risk Checklist & Findings", icon: CheckSquare, color: "text-[hsl(28_100%_58%)]" },
      { id: "ecg-abcde", title: "ECG ABCDE Screen", icon: Activity, color: "text-[hsl(16_100%_60%)]" },
      { id: "syncope-medications", title: "Medications & Syncope", icon: Pill, color: "text-[hsl(280_75%_60%)]" },
      { id: "lab-tests", title: "Laboratory Tests", icon: TestTube, color: "text-[hsl(190_80%_50%)]" },
      { id: "initial-evaluation", title: "Initial Evaluation", icon: Stethoscope, color: "text-[hsl(160_70%_45%)]" },
      { id: "tilt-test", title: "Tilt Test Protocol", icon: TrendingUp, color: "text-[hsl(45_100%_55%)]" },
      { id: "risk-score", title: "Risk Score", icon: TrendingUp, color: "text-[hsl(16_100%_60%)]" },
      { id: "subclavian-steal", title: "Subclavian Steal", icon: Wind, color: "text-[hsl(190_80%_50%)]" },
      { id: "carotid-massage", title: "Carotid Sinus Massage", icon: Heart, color: "text-[hsl(340_85%_60%)]" },
      { id: "orthostatic-intolerance", title: "Orthostatic Intolerance", icon: Users, color: "text-[hsl(260_80%_65%)]" },
      { id: "autonomic-testing", title: "Autonomic Testing", icon: Gauge, color: "text-[hsl(28_100%_58%)]" },
    ],
  },
  {
    id: "differential-diagnosis",
    title: "Differential Diagnosis",
    icon: Brain,
    color: "text-[hsl(280_75%_60%)]",
    gradient: "from-[hsl(280_75%_60%/0.22)] via-[hsl(260_80%_65%/0.18)] to-transparent",
    ring: "hsl(280_75%_60%)",
    subsections: [
      { id: "differential-diagnosis-section", title: "Differential Diagnosis", icon: Lightbulb, color: "text-[hsl(45_100%_55%)]" },
      { id: "diagnostic-criteria", title: "Diagnostic Criteria", icon: CheckSquare, color: "text-[hsl(160_70%_45%)]" },
      { id: "ai-diagnosis", title: "AI Diagnosis Assistant", icon: Sparkles, color: "text-[hsl(260_80%_65%)]" },
    ],
  },
  {
    id: "management",
    title: "Interventions",
    icon: Shield,
    color: "text-[hsl(160_70%_45%)]",
    gradient: "from-[hsl(160_70%_45%/0.22)] via-[hsl(190_80%_50%/0.18)] to-transparent",
    ring: "hsl(160_70%_45%)",
    subsections: [
      { id: "interventions", title: "Interventions & Management", icon: Shield, color: "text-[hsl(160_70%_45%)]" },
    ],
  },
  {
    id: "drop-attacks-group",
    title: "Drop Attacks",
    icon: AlertTriangle,
    color: "text-[hsl(0_85%_60%)]",
    gradient: "from-[hsl(0_85%_60%/0.22)] via-[hsl(16_100%_60%/0.18)] to-transparent",
    ring: "hsl(0_85%_60%)",
    subsections: [
      { id: "drop-attacks", title: "Drop Attacks Workup", icon: AlertTriangle, color: "text-[hsl(0_85%_60%)]" },
    ],
  },
  {
    id: "pharmacology",
    title: "Pharmacology",
    icon: Pill,
    color: "text-[hsl(280_75%_60%)]",
    gradient: "from-[hsl(280_75%_60%/0.22)] via-[hsl(340_85%_60%/0.18)] to-transparent",
    ring: "hsl(280_75%_60%)",
    subsections: [
      { id: "anti-arrhythmics", title: "Anti-arrhythmic Drugs — Vaughan-Williams", icon: Pill, color: "text-[hsl(280_75%_60%)]" },
    ],
  },
];

const STORAGE_KEY = "assessment-sidebar-open-groups";

export function AssessmentSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeSection, setActiveSection] = useState<string>("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
    } catch {
      /* ignore quota errors */
    }
  }, [openGroups]);
  const { getCompletionPercentage } = useAssessmentProgress();

  const q = query.trim().toLowerCase();
  const filteredSections = q
    ? sections
        .map((s) => {
          const sectionMatch = s.title.toLowerCase().includes(q);
          const subs = s.subsections.filter((sub) =>
            sub.title.toLowerCase().includes(q)
          );
          if (sectionMatch) return s; // keep all subs
          if (subs.length) return { ...s, subsections: subs };
          return null;
        })
        .filter(Boolean) as typeof sections
    : sections;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        for (const subsection of section.subsections) {
          const element = document.getElementById(subsection.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + rect.height;
            if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
              setActiveSection(subsection.id);
              // auto-open the containing group
              setOpenGroups((prev) =>
                prev[section.id] ? prev : { ...prev, [section.id]: true }
              );
              return;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
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
  };

  return (
    <>
      {q && (
        <div
          onClick={() => setQuery("")}
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-md animate-in fade-in"
          aria-hidden="true"
        />
      )}
      <Sidebar className={cn("border-r relative z-40", collapsed ? "w-14" : "w-72")} collapsible="icon">
      <div className="p-2 space-y-2 border-b">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          {!collapsed && isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSidebar()}
              className="text-muted-foreground hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          )}
        </div>
        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections…"
              className="h-8 pl-8 pr-8 text-sm"
              aria-label="Search sections"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <SidebarContent>
        {filteredSections.length === 0 && !collapsed && (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">
            No sections match "{query}"
          </div>
        )}
        {filteredSections.map((section) => {
          const isOpen = q ? true : !!openGroups[section.id];
          return (
            <SidebarGroup key={section.id} className={cn("mb-1", (section as any).prominent && "mb-2")}>
              <Collapsible open={isOpen} onOpenChange={() => toggleGroup(section.id)}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={cn(
                      "flex items-center gap-2 cursor-pointer select-none rounded-lg px-2 py-2.5 text-base h-auto",
                      "bg-gradient-to-r border transition-all duration-300 ease-out",
                      section.gradient,
                      "dark:bg-background/40 dark:backdrop-blur-sm",
                      (section as any).prominent
                        ? "border-[color:var(--ring-color)]/60 shadow-md ring-1 ring-[color:var(--ring-color)]/30 dark:ring-[color:var(--ring-color)]/50 py-3"
                        : "border-transparent hover:border-[color:var(--ring-color)]/40 hover:shadow-sm dark:hover:border-[color:var(--ring-color)]/60"
                    )}
                    style={{ ["--ring-color" as any]: section.ring }}
                  >
                    <section.icon
                      className={cn(
                        "shrink-0 drop-shadow-sm dark:brightness-125 dark:saturate-150",
                        section.color,
                        (section as any).prominent ? "h-6 w-6" : "h-5 w-5"
                      )}
                      strokeWidth={2.75}
                    />
                    {!collapsed && (
                      <>
                        <span className={cn(
                          "flex-1 font-extrabold tracking-tight uppercase",
                          (section as any).prominent ? "text-sm" : "text-[13px]",
                          section.color,
                          "dark:brightness-150 dark:saturate-150 dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                        )}>
                          {highlight(section.title)}
                          {(section as any).prominent && (
                            <span className="ml-1.5 inline-block align-middle rounded-full bg-[color:var(--ring-color)] text-white text-[9px] font-black px-1.5 py-0.5 leading-none">
                              NEW
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-300 ease-out",
                            section.color,
                            "dark:brightness-150",
                            isOpen && "rotate-180"
                          )}
                          strokeWidth={2.75}
                        />
                      </>
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.subsections.map((subsection) => {
                        const progress = getCompletionPercentage(subsection.id);
                        const active = activeSection === subsection.id;
                        return (
                          <SidebarMenuItem key={subsection.id}>
                            <div className="space-y-1">
                              <SidebarMenuButton
                                onClick={() => scrollToSection(subsection.id)}
                                className={cn(
                                  "cursor-pointer transition-all duration-200 ease-out w-full text-sm py-2 h-auto rounded-md font-semibold",
                                  "hover:bg-muted/70 dark:hover:bg-muted/40",
                                  "dark:text-foreground/90",
                                  active && "bg-gradient-to-r shadow-sm dark:bg-background/60",
                                  active && section.gradient
                                )}
                                style={active ? { borderLeft: `3px solid ${section.ring}` } : undefined}
                              >
                                <subsection.icon
                                  className={cn(
                                    "h-4 w-4 shrink-0 dark:brightness-125 dark:saturate-150",
                                    subsection.color
                                  )}
                                  strokeWidth={active ? 2.75 : 2.25}
                                />
                                {!collapsed && (
                                  <span className={cn(
                                    "flex-1 leading-snug",
                                    active
                                      ? "font-bold text-foreground dark:text-white"
                                      : "font-semibold text-foreground/90 dark:text-foreground/95"
                                  )}>
                                    {highlight(subsection.title)}
                                  </span>
                                )}
                                {!collapsed && progress > 0 && (
                                  <span className={cn(
                                    "text-xs ml-auto font-bold dark:brightness-150 dark:saturate-150",
                                    subsection.color
                                  )}>
                                    {progress}%
                                  </span>
                                )}
                              </SidebarMenuButton>
                              {!collapsed && (
                                <Progress value={progress} className="h-1" />
                              )}
                            </div>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
    </>
  );
}
