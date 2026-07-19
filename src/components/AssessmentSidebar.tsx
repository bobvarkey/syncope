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

// Sunset Blaze accent classes per icon
const sections = [
  {
    id: "clinical-history",
    title: "Clinical History",
    icon: FileText,
    color: "text-[hsl(16_100%_60%)]", // coral
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
    color: "text-[hsl(28_100%_58%)]", // amber
    subsections: [
      { id: "ecg-findings", title: "ECG Findings", icon: Activity, color: "text-[hsl(340_85%_60%)]" },
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
    color: "text-[hsl(280_75%_60%)]", // magenta
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
    color: "text-[hsl(160_70%_45%)]", // teal-green
    subsections: [
      { id: "interventions", title: "Interventions & Management", icon: Shield, color: "text-[hsl(160_70%_45%)]" },
    ],
  },
  {
    id: "drop-attacks-group",
    title: "Drop Attacks",
    icon: AlertTriangle,
    color: "text-[hsl(0_85%_60%)]", // red
    subsections: [
      { id: "drop-attacks", title: "Drop Attacks Workup", icon: AlertTriangle, color: "text-[hsl(0_85%_60%)]" },
    ],
  },
];

export function AssessmentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeSection, setActiveSection] = useState<string>("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
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

  return (
    <Sidebar className={cn("border-r", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <div className="p-2">
        <SidebarTrigger />
      </div>

      <SidebarContent>
        {sections.map((section) => {
          const isOpen = !!openGroups[section.id];
          return (
            <SidebarGroup key={section.id}>
              <Collapsible open={isOpen} onOpenChange={() => toggleGroup(section.id)}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={cn(
                      "flex items-center gap-2 cursor-pointer select-none rounded-md px-2 py-1.5",
                      "hover:bg-muted/60 transition-colors"
                    )}
                  >
                    <section.icon className={cn("h-4 w-4 shrink-0", section.color)} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 font-medium">{section.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent>
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
                                  "cursor-pointer transition-colors w-full",
                                  active && "bg-primary/10 text-primary font-medium"
                                )}
                              >
                                <subsection.icon
                                  className={cn("h-4 w-4 shrink-0", subsection.color)}
                                  strokeWidth={active ? 2.5 : 2}
                                />
                                {!collapsed && (
                                  <span className="flex-1">{subsection.title}</span>
                                )}
                                {!collapsed && progress > 0 && (
                                  <span className="text-xs text-muted-foreground ml-auto">
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
  );
}
