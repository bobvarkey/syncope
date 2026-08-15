import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAssessmentProgress } from "@/contexts/AssessmentProgressContext";
import { FileText, TestTube, Brain, CheckCircle2, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Section groupings matching AssessmentSidebar and Index accordion structure
const sectionGroups = {
  "Clinical History": [
    "circumstances",
    "onset",
    "attack",
    "end",
    "background",
    "clinical-features",
  ],
  "Investigations": [
    "ecg-scoring-checklist",
    "ecg-abcde",
    "syncope-medications",
    "lab-tests",
    "initial-evaluation",
    "tilt-test",
    "risk-score",
    "subclavian-steal",
    "carotid-massage",
    "orthostatic-intolerance",
    "autonomic-testing",
  ],
  "Differential Diagnosis": [
    "differential-diagnosis-section",
    "diagnostic-criteria",
    "ai-diagnosis",
  ],
  "Interventions": [
    "interventions",
  ],
  "Drop Attacks": [
    "drop-attacks",
  ],
};

const groupIcons = {
  "Clinical History": FileText,
  "Investigations": TestTube,
  "Differential Diagnosis": Brain,
  "Interventions": Shield,
  "Drop Attacks": AlertTriangle,
};

const sectionTitles: Record<string, string> = {
  "circumstances": "Circumstances",
  "onset": "Onset",
  "attack": "Attack",
  "end": "End",
  "background": "Background",
  "clinical-features": "Clinical Features",
  "ecg-scoring-checklist": "High-Risk ECG Checklist",
  "ecg-abcde": "ECG ABCDE Screen",
  "syncope-medications": "Medications & Syncope",
  "lab-tests": "Laboratory Tests",
  "initial-evaluation": "Initial Evaluation",
  "tilt-test": "Tilt Test Protocol",
  "risk-score": "Risk Score",
  "subclavian-steal": "Subclavian Steal",
  "carotid-massage": "Carotid Sinus Massage",
  "orthostatic-intolerance": "Orthostatic Intolerance",
  "autonomic-testing": "Autonomic Testing",
  "differential-diagnosis-section": "Differential Diagnosis",
  "diagnostic-criteria": "Diagnostic Criteria",
  "ai-diagnosis": "AI Diagnosis Assistant",
  "interventions": "Interventions & Management",
  "drop-attacks": "Drop Attacks Workup",
};

export function AssessmentDashboard() {
  const { sectionProgress } = useAssessmentProgress();

  // Calculate completion for each main group
  const getGroupCompletion = (sections: string[]) => {
    let totalCompleted = 0;
    let totalFields = 0;

    sections.forEach((sectionId) => {
      const progress = sectionProgress[sectionId];
      if (progress) {
        totalCompleted += progress.completed;
        totalFields += progress.total;
      }
    });

    if (totalFields === 0) return 0;
    return Math.round((totalCompleted / totalFields) * 100);
  };

  // Calculate overall completion
  const getOverallCompletion = () => {
    let totalCompleted = 0;
    let totalFields = 0;

    Object.values(sectionProgress).forEach((progress) => {
      totalCompleted += progress.completed;
      totalFields += progress.total;
    });

    if (totalFields === 0) return 0;
    return Math.round((totalCompleted / totalFields) * 100);
  };

  const overallCompletion = getOverallCompletion();

  return (
    <Card className="mb-6 border-2">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Overall Completion */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">
                Overall Clinical Assessment Progress
              </h3>
            </div>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-sunset drop-shadow-sm">
                {overallCompletion}%
              </span>
            </div>
            <Progress value={overallCompletion} className="h-4 max-w-xl mx-auto rounded-full overflow-hidden bg-muted">
               <div 
                className="h-full bg-gradient-sunset transition-all duration-500 ease-out" 
                style={{ width: `${overallCompletion}%` }} 
              />
            </Progress>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              Complete {Object.keys(sectionTitles).length} sections for a comprehensive evaluation
            </p>
          </div>

          {/* Section Group Stats & Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
            {Object.entries(sectionGroups).map(([groupName, sections]) => {
              const Icon = groupIcons[groupName as keyof typeof groupIcons];
              const completion = getGroupCompletion(sections);
              
              return (
                <Card 
                  key={groupName}
                  className="overflow-hidden border-muted transition-all hover:shadow-md bg-muted/5"
                >
                  <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold text-foreground">
                        {groupName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{completion}%</span>
                      <Progress value={completion} className="w-20 h-2" />
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-muted/50">
                      {sections.map(sectionId => {
                        const sectionCompletion = Math.round((sectionProgress[sectionId]?.completed / sectionProgress[sectionId]?.total) * 100) || 0;
                        const isComplete = sectionCompletion === 100;
                        const title = sectionTitles[sectionId] || sectionId;
                        
                        return (
                          <li key={sectionId}>
                            <button
                              onClick={() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })}
                              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                                  isComplete ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                                )}>
                                  {isComplete && <CheckCircle2 className="h-3.5 w-3.5" />}
                                </div>
                                <span className={cn(
                                  "text-sm font-medium truncate",
                                  isComplete ? "text-foreground/70 line-through" : "text-foreground"
                                )}>
                                  {title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {sectionCompletion > 0 && !isComplete && (
                                  <span className="text-[10px] font-bold text-primary/70">{sectionCompletion}%</span>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
