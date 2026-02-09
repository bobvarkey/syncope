import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface InitialEvaluationSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const InitialEvaluationSection = ({ data, onUpdate }: InitialEvaluationSectionProps) => {
  const initialTests = [
    { id: "history-taking", label: "History taking" },
    { id: "standing-test", label: "3-min active standing test" },
    { id: "physical-exam", label: "Physical examination" },
    { id: "ecg-12-lead", label: "12-Lead ECG" },
  ];

  const completedInitialTests = initialTests.filter(test => data[test.id]).length;
  const initialProgress = (completedInitialTests / initialTests.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Initial Evaluation & Diagnostic Tests
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Document completion of initial assessment and additional diagnostic testing
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Initial evaluation (4 core components) should be completed for all patients. 
          Additional diagnostic tests (12 available options) are ordered based on clinical presentation.
        </AlertDescription>
      </Alert>

      {/* Initial Evaluation Section */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">
            Initial Evaluation (4 Points)
          </h4>
          <span className="text-sm text-muted-foreground">
            {completedInitialTests}/4 completed
          </span>
        </div>
        
        <Progress value={initialProgress} className="mb-6" />

        <div className="space-y-4">
          {initialTests.map((test) => (
            <div 
              key={test.id} 
              className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent transition-colors"
            >
              <Checkbox
                id={test.id}
                checked={data[test.id] || false}
                onCheckedChange={(checked) => onUpdate({ [test.id]: checked })}
              />
              <Label 
                htmlFor={test.id} 
                className="font-medium cursor-pointer flex-1"
              >
                {test.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Label htmlFor="initial-eval-notes" className="text-sm font-medium mb-2 block">
            Initial Evaluation Summary
          </Label>
          <Textarea
            id="initial-eval-notes"
            placeholder="Document key findings from initial evaluation..."
            value={data.initialEvalNotes || ""}
            onChange={(e) => onUpdate({ initialEvalNotes: e.target.value })}
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Available Diagnostic Tests Section */}
      <div className="border rounded-lg p-6 bg-card">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Available Diagnostic Tests (12 Points)
        </h4>
        <p className="text-sm text-muted-foreground mb-6">
          Select tests that have been performed or are recommended
        </p>

        <div className="space-y-6">
          <div>
            <h5 className="font-medium text-foreground mb-3">Cardiovascular Monitoring</h5>
            <div className="space-y-3 ml-2">
              {[
                { 
                  id: "holter-monitor", 
                  label: "Holter monitor",
                  description: "24-48 hour continuous ECG recording"
                },
                { 
                  id: "external-loop-recorder", 
                  label: "External loop recorder",
                  description: "Patient-activated event recorder"
                },
                { 
                  id: "implantable-loop-recorder", 
                  label: "Implantable loop recorder (Follow-up)",
                  description: "Long-term subcutaneous ECG monitoring"
                },
                { 
                  id: "ambulatory-bp", 
                  label: "24 h ambulatory blood pressure monitoring",
                  description: "Continuous blood pressure tracking"
                },
                { 
                  id: "continuous-bp", 
                  label: "Non-invasive continuous blood pressure",
                  description: "Beat-to-beat BP monitoring"
                },
              ].map((test) => (
                <div key={test.id} className="border rounded-md p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={test.id}
                      checked={data[test.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [test.id]: checked })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={test.id} className="font-medium cursor-pointer block">
                        {test.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-foreground mb-3">Provocative Testing</h5>
            <div className="space-y-3 ml-2">
              {[
                { 
                  id: "tilt-test", 
                  label: "Head-up tilt test",
                  description: "Assessment of neurally-mediated syncope (minimum 10-15 minutes)"
                },
                { 
                  id: "autonomic-function", 
                  label: "Basic autonomic function test",
                  description: "Valsalva, deep breathing, handgrip tests"
                },
                { 
                  id: "ecg-stress", 
                  label: "ECG stress test",
                  description: "Exercise-induced arrhythmia assessment"
                },
              ].map((test) => (
                <div key={test.id} className="border rounded-md p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={test.id}
                      checked={data[test.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [test.id]: checked })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={test.id} className="font-medium cursor-pointer block">
                        {test.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-foreground mb-3">Structural & Imaging</h5>
            <div className="space-y-3 ml-2">
              {[
                { 
                  id: "echocardiography", 
                  label: "Echocardiography",
                  description: "Structural heart disease assessment"
                },
                { 
                  id: "neuroimaging", 
                  label: "Neuroimaging",
                  description: "CT/MRI for cerebrovascular assessment"
                },
                { 
                  id: "mibg-scan", 
                  label: "MIBG scan",
                  description: "Can help differentiate PD from MSA. Shows reduced cardiac MIBG uptake in PD, while uptake is often normal or only modestly reduced in MSA. PD involves POST-Ganglionic nerve endings in the heart, whereas MSA does not."
                },
                { 
                  id: "sleep-study", 
                  label: "Sleep study (Ring or Polysomnography)",
                  description: "Screening for sleep apnea may detect arrhythmia as a common cause of syncope. Sleep apnea causes repetitive hypoxia and intrathoracic pressure changes, triggering sympathetic/parasympathetic oscillations that can lead to bradycardia, atrial fibrillation, and AV blocks potentially requiring pacemaker. Relationship is bidirectional: heart conditions predispose to sleep apnea while untreated sleep apnea worsens cardiovascular outcomes."
                },
              ].map((test) => (
                <div key={test.id} className="border rounded-md p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={test.id}
                      checked={data[test.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [test.id]: checked })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={test.id} className="font-medium cursor-pointer block">
                        {test.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-foreground mb-3">Invasive Testing</h5>
            <div className="space-y-3 ml-2">
              <div className="border rounded-md p-3 hover:bg-accent transition-colors">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="electrophysiology"
                    checked={data.electrophysiology || false}
                    onCheckedChange={(checked) => onUpdate({ electrophysiology: checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="electrophysiology" className="font-medium cursor-pointer block">
                      Electrophysiological studies
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invasive cardiac conduction system assessment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="diagnostic-tests-notes" className="text-sm font-medium mb-2 block">
            Diagnostic Test Results & Interpretation
          </Label>
          <Textarea
            id="diagnostic-tests-notes"
            placeholder="Document key findings from diagnostic tests and their clinical significance..."
            value={data.diagnosticTestsNotes || ""}
            onChange={(e) => onUpdate({ diagnosticTestsNotes: e.target.value })}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
};

export default InitialEvaluationSection;
