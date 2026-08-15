import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ChecklistLink from "@/components/ChecklistLink";

interface RiskScoreSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const RiskScoreSection = ({ data, onUpdate }: RiskScoreSectionProps) => {
  // Calculate Canadian Syncope Risk Score
  const criteria = [
    { id: "predisposition-vasovagal", label: "Clinical predisposition to vasovagal symptoms (medical judgement)", points: -1 },
    { id: "heart-disease-history", label: "History of heart disease", points: 1 },
    { id: "systolic-bp-low", label: "Systolic BP <90 mmHg or >180 mmHg", points: 2 },
    { id: "troponin-elevated", label: "Elevated troponin (>99th percentile)", points: 2 },
    { id: "abnormal-qrs", label: "Abnormal QRS axis (<-30° or >100°)", points: 1 },
    { id: "qrs-duration", label: "QRS duration >130 ms", points: 1 },
    { id: "corrected-qt", label: "Corrected QT interval >480 ms", points: 2 },
    { id: "ed-diagnosis-cardiac", label: "ED diagnosis of cardiac syncope (medical judgement)", points: 2 },
  ];

  const calculateScore = () => {
    let score = 0;
    criteria.forEach(criterion => {
      if (data[criterion.id]) {
        score += criterion.points;
      }
    });
    return score;
  };

  const score = calculateScore();

  const getRiskLevel = (score: number) => {
    if (score <= -2) return { level: "Very Low", color: "bg-green-100 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100", risk: "<0.4%", icon: CheckCircle2 };
    if (score === -1) return { level: "Low", color: "bg-blue-100 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100", risk: "0.4-1.2%", icon: Info };
    if (score >= 0 && score <= 3) return { level: "Medium", color: "bg-yellow-100 dark:bg-yellow-950 border-yellow-500 text-yellow-900 dark:text-yellow-100", risk: "1.2-4.8%", icon: AlertTriangle };
    if (score >= 4 && score <= 5) return { level: "High", color: "bg-orange-100 dark:bg-orange-950 border-orange-500 text-orange-900 dark:text-orange-100", risk: "4.8-19.7%", icon: AlertCircle };
    return { level: "Very High", color: "bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-100", risk: ">19.7%", icon: AlertCircle };
  };

  const riskInfo = getRiskLevel(score);
  const RiskIcon = riskInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Canadian Syncope Risk Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Predicts 30-day serious adverse events
          </p>
        </div>
        <ChecklistLink variant="outline" label="View High-Risk Checklist" className="border-primary/20 text-primary" />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The Canadian Syncope Risk Score helps stratify patients into risk categories for serious 
          outcomes within 30 days (arrhythmia, MI, structural heart disease, death, or procedural intervention).
        </AlertDescription>
      </Alert>

      {/* Risk Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.map((criterion) => (
            <div 
              key={criterion.id}
              className="flex items-start justify-between p-3 rounded-md border hover:bg-accent transition-colors"
            >
              <div className="flex items-start space-x-3 flex-1">
                <Checkbox
                  id={criterion.id}
                  checked={data[criterion.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [criterion.id]: checked })}
                  className="mt-1"
                />
                <Label 
                  htmlFor={criterion.id} 
                  className="cursor-pointer flex-1 font-normal"
                >
                  {criterion.label}
                </Label>
              </div>
              <Badge 
                variant={criterion.points < 0 ? "secondary" : "default"}
                className="ml-2"
              >
                {criterion.points > 0 ? '+' : ''}{criterion.points}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className={`border-2 ${riskInfo.color}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <RiskIcon className="w-8 h-8" />
              <div>
                <div className="text-sm font-medium uppercase tracking-wide mb-1">
                  Total Score
                </div>
                <div className="text-5xl font-bold">
                  {score}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-semibold">
                {riskInfo.level} Risk
              </div>
              <div className="text-lg">
                30-day serious outcome risk: <span className="font-semibold">{riskInfo.risk}</span>
              </div>
            </div>

            <Progress 
              value={Math.min(((score + 3) / 14) * 100, 100)} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Very Low Risk (≤-2 points)</div>
                <div className="text-sm text-muted-foreground">
                  &lt;0.4% risk. Consider discharge with outpatient follow-up.
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium">Low Risk (-1 point)</div>
                <div className="text-sm text-muted-foreground">
                  0.4-1.2% risk. Consider discharge with close outpatient follow-up or brief observation.
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium">Medium Risk (0-3 points)</div>
                <div className="text-sm text-muted-foreground">
                  1.2-4.8% risk. Strongly consider admission or prolonged ED observation.
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium">High Risk (4-5 points)</div>
                <div className="text-sm text-muted-foreground">
                  4.8-19.7% risk. Admission with cardiac monitoring and workup recommended.
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium">Very High Risk (≥6 points)</div>
                <div className="text-sm text-muted-foreground">
                  &gt;19.7% risk. Immediate admission and urgent cardiology consultation.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Notes */}
      <div>
        <Label htmlFor="risk-score-notes" className="text-base font-medium mb-3 block">
          Risk Assessment Notes & Management Plan
        </Label>
        <Textarea
          id="risk-score-notes"
          placeholder="Document clinical decision-making, disposition plan, and follow-up recommendations..."
          value={data.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default RiskScoreSection;
