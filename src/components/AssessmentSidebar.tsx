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
import { Progress } from "@/components/ui/progress";
import { useAssessmentProgress } from "@/contexts/AssessmentProgressContext";
import { cn } from "@/lib/utils";

const sections = [
  {
    id: "clinical-history",
    title: "Clinical History",
    icon: FileText,
    subsections: [
      { id: "circumstances", title: "Circumstances", icon: Eye },
      { id: "onset", title: "Onset", icon: Clock },
      { id: "attack", title: "Attack", icon: Zap },
      { id: "end", title: "End", icon: CheckSquare },
      { id: "background", title: "Background", icon: Heart },
      { id: "clinical-features", title: "Clinical Features", icon: Stethoscope },
    ],
  },
  {
    id: "investigations",
    title: "Investigations",
    icon: TestTube,
    subsections: [
      { id: "ecg-findings", title: "ECG Findings", icon: Activity },
      { id: "ecg-abcde", title: "ECG ABCDE Screen", icon: Activity },
      { id: "syncope-medications", title: "Medications & Syncope", icon: Pill },
      { id: "lab-tests", title: "Laboratory Tests", icon: TestTube },
      { id: "initial-evaluation", title: "Initial Evaluation", icon: Stethoscope },
      { id: "tilt-test", title: "Tilt Test Protocol", icon: TrendingUp },
      { id: "risk-score", title: "Risk Score", icon: TrendingUp },
      { id: "subclavian-steal", title: "Subclavian Steal", icon: Wind },
      { id: "carotid-massage", title: "Carotid Sinus Massage", icon: Heart },
      { id: "orthostatic-intolerance", title: "Orthostatic Intolerance", icon: Users },
      { id: "autonomic-testing", title: "Autonomic Testing", icon: Gauge },
    ],
  },
  {
    id: "differential-diagnosis",
    title: "Differential Diagnosis",
    icon: Brain,
    subsections: [
      { id: "differential-diagnosis-section", title: "Differential Diagnosis", icon: Lightbulb },
      { id: "diagnostic-criteria", title: "Diagnostic Criteria", icon: CheckSquare },
      { id: "ai-diagnosis", title: "AI Diagnosis Assistant", icon: Sparkles },
    ],
  },
  {
    id: "management",
    title: "Interventions",
    icon: Shield,
    subsections: [
      { id: "interventions", title: "Interventions & Management", icon: Shield },
    ],
  },
  {
    id: "drop-attacks-group",
    title: "Drop Attacks",
    icon: AlertTriangle,
    subsections: [
      { id: "drop-attacks", title: "Drop Attacks Workup", icon: AlertTriangle },
    ],
  },
];

export function AssessmentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeSection, setActiveSection] = useState<string>("");
  const { getCompletionPercentage } = useAssessmentProgress();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Find which section is currently in view
      for (const section of sections) {
        for (const subsection of section.subsections) {
          const element = document.getElementById(subsection.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + rect.height;
            
            if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
              setActiveSection(subsection.id);
              return;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset for header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Sidebar className={cn("border-r", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <div className="p-2">
        <SidebarTrigger />
      </div>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel className="flex items-center gap-2">
              <section.icon className="h-4 w-4" />
              {!collapsed && <span>{section.title}</span>}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {section.subsections.map((subsection) => {
                  const progress = getCompletionPercentage(subsection.id);
                  
                  return (
                    <SidebarMenuItem key={subsection.id}>
                      <div className="space-y-1">
                        <SidebarMenuButton
                          onClick={() => scrollToSection(subsection.id)}
                          className={cn(
                            "cursor-pointer transition-colors w-full",
                            activeSection === subsection.id && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <subsection.icon className="h-4 w-4" />
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
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
