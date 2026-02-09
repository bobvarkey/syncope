import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAssessmentProgress } from "@/contexts/AssessmentProgressContext";
import { FileText, TestTube, Brain, CheckCircle2 } from "lucide-react";

// Section groupings
const sectionGroups = {
  "Clinical History": [
    "circumstances",
    "onset",
    "attack",
    "end",
    "background",
    "clinical-features",
  ],
  "Clinical Investigations": [
    "ecg-findings",
    "initial-evaluation",
    "tilt-test",
    "risk-score",
    "subclavian-steal",
    "carotid-massage",
    "orthostatic-intolerance",
  ],
  "Differential Diagnosis": [
    "differential-diagnosis-section",
    "diagnostic-criteria",
    "ai-diagnosis",
  ],
};

const groupIcons = {
  "Clinical History": FileText,
  "Clinical Investigations": TestTube,
  "Differential Diagnosis": Brain,
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
                Overall Assessment Progress
              </h3>
            </div>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-5xl font-bold text-primary">
                {overallCompletion}%
              </span>
            </div>
            <Progress value={overallCompletion} className="h-3 max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Complete all sections for comprehensive assessment
            </p>
          </div>

          {/* Section Group Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {Object.entries(sectionGroups).map(([groupName, sections]) => {
              const Icon = groupIcons[groupName as keyof typeof groupIcons];
              const completion = getGroupCompletion(sections);
              
              return (
                <div
                  key={groupName}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        {groupName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {sections.length} subsections
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {completion}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {completion === 100 ? "Complete" : "In Progress"}
                      </span>
                    </div>
                    <Progress value={completion} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
