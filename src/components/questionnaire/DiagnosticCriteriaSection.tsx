import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import ChecklistLink from "@/components/ChecklistLink";

interface DiagnosticCriteriaSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const DiagnosticCriteriaSection = ({ data, onUpdate }: DiagnosticCriteriaSectionProps) => {
  const hasDiagnosis = data.diagnosisType;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Diagnostic Criteria & Clinical Diagnosis
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Class I diagnostic criteria based on initial evaluation
        </p>
      </div>

      {hasDiagnosis && (
        <Alert className="bg-primary/10 border-primary">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>Provisional Diagnosis Documented</AlertTitle>
          <AlertDescription>
            Based on clinical criteria from history, physical examination, and initial tests.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Primary Diagnosis Type</Label>
          <RadioGroup
            value={data.diagnosisType}
            onValueChange={(value) => onUpdate({ diagnosisType: value })}
            className="space-y-3"
          >
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="vasovagal" id="vasovagal-dx" />
                <Label htmlFor="vasovagal-dx" className="font-semibold cursor-pointer">
                  Vasovagal Syncope
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Precipitating events (fear, pain, emotional distress, instrumentation, prolonged standing) 
                with typical prodromal symptoms
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="situational" id="situational-dx" />
                <Label htmlFor="situational-dx" className="font-semibold cursor-pointer">
                  Situational Syncope
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                During or immediately after urination, defaecation, cough or swallowing
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="orthostatic" id="orthostatic-dx" />
                <Label htmlFor="orthostatic-dx" className="font-semibold cursor-pointer">
                  Orthostatic Syncope
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Documentation of orthostatic hypotension (≥20 mmHg SBP drop or SBP &lt;90 mmHg) 
                associated with syncope or presyncope
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cardiac-ischemia" id="cardiac-ischemia-dx" />
                  <Label htmlFor="cardiac-ischemia-dx" className="font-semibold cursor-pointer">
                    Cardiac Ischemia-Related Syncope
                  </Label>
                </div>
                <ChecklistLink label="Check ECG Findings" className="text-sunset-orange hover:text-sunset-red" />
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                ECG evidence of acute ischemia with or without MI (mechanism may be cardiac low output, 
                arrhythmia, or Bezold-Jarisch reflex)
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-destructive/5 border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="arrhythmia" id="arrhythmia-dx" />
                  <Label htmlFor="arrhythmia-dx" className="font-semibold cursor-pointer">
                    Arrhythmia-Related Syncope
                  </Label>
                </div>
                <ChecklistLink label="Verify with Checklist" className="text-destructive hover:text-red-700" />
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                ECG-documented arrhythmia meeting diagnostic criteria
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="css" id="css-dx" />
                <Label htmlFor="css-dx" className="font-semibold cursor-pointer">
                  Carotid Sinus Syndrome (CSS)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Carotid sinus massage reproduces symptoms with asystole &gt;3 s and/or SBP drop &gt;50 mmHg
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="structural-cardiac" id="structural-cardiac-dx" />
                <Label htmlFor="structural-cardiac-dx" className="font-semibold cursor-pointer">
                  Structural Cardiac Disease
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Aortic stenosis, HOCM, pulmonary embolism, aortic dissection, or cardiac tamponade causing low output syncope
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="autonomic-failure" id="autonomic-failure-dx" />
                <Label htmlFor="autonomic-failure-dx" className="font-semibold cursor-pointer">
                  Autonomic Failure Syndromes
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Pure autonomic failure (PAF), multiple system atrophy (MSA), Parkinson's disease with autonomic failure, diabetic autonomic neuropathy
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="pots" id="pots-dx" />
                <Label htmlFor="pots-dx" className="font-semibold cursor-pointer">
                  Postural Orthostatic Tachycardia Syndrome (POTS)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                HR increase ≥30 bpm (or &gt;120 bpm) within 10 min of standing without significant BP drop
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="psychogenic" id="psychogenic-dx" />
                <Label htmlFor="psychogenic-dx" className="font-semibold cursor-pointer">
                  Psychogenic Pseudosyncope (PNES)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Apparent LOC without haemodynamic or EEG correlate; eyes closed; prolonged duration; high frequency
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="epileptic-seizure" id="epileptic-seizure-dx" />
                <Label htmlFor="epileptic-seizure-dx" className="font-semibold cursor-pointer">
                  Epileptic Seizure
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Witnessed tonic-clonic activity, tongue-biting, prolonged post-ictal confusion, EEG abnormalities
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="subclavian-steal" id="subclavian-steal-dx" />
                <Label htmlFor="subclavian-steal-dx" className="font-semibold cursor-pointer">
                  Subclavian Steal Syndrome
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Symptoms with ipsilateral arm exercise; BP differential &gt;20 mmHg between arms
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="undetermined" id="undetermined-dx" />
                <Label htmlFor="undetermined-dx" className="font-semibold cursor-pointer">
                  Undetermined / Requires Further Investigation
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Diagnosis cannot be made based on initial evaluation alone
              </p>
            </div>
          </RadioGroup>
        </div>

        {data.diagnosisType === 'orthostatic' && (
          <div className="border-l-4 border-primary pl-4 space-y-4">
            <h4 className="font-semibold text-foreground">Orthostatic Blood Pressure Measurements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bp-supine" className="text-sm mb-2 block">
                  Supine BP (after 5 min)
                </Label>
                <Input
                  id="bp-supine"
                  placeholder="e.g., 130/80"
                  value={data.bpSupine || ""}
                  onChange={(e) => onUpdate({ bpSupine: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bp-standing" className="text-sm mb-2 block">
                  Standing BP (lowest value)
                </Label>
                <Input
                  id="bp-standing"
                  placeholder="e.g., 90/60"
                  value={data.bpStanding || ""}
                  onChange={(e) => onUpdate({ bpStanding: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bp-time" className="text-sm mb-2 block">
                  Time to lowest BP (minutes)
                </Label>
                <Input
                  id="bp-time"
                  type="number"
                  placeholder="e.g., 2"
                  value={data.bpTime || ""}
                  onChange={(e) => onUpdate({ bpTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <Label className="text-base font-medium mb-3 block">Supporting Diagnostic Features</Label>
          <div className="space-y-3">
            {[
              { id: "typical-prodrome", label: "Typical prodromal symptoms present" },
              { id: "witnessed-account", label: "Reliable eyewitness account available" },
              { id: "documented-hypotension", label: "Documented hypotension during event" },
              { id: "ecg-correlation", label: "ECG findings correlate with clinical presentation" },
              { id: "reproducible-trigger", label: "Reproducible trigger identified" },
            ].map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={data[feature.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [feature.id]: checked })}
                />
                <Label htmlFor={feature.id} className="font-normal cursor-pointer">
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="diagnosis-confidence" className="text-base font-medium mb-3 block">
            Diagnostic Confidence
          </Label>
          <RadioGroup
            value={data.confidence}
            onValueChange={(value) => onUpdate({ confidence: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="definite" id="definite" />
              <Label htmlFor="definite" className="font-normal cursor-pointer">
                Definite - Meets Class I diagnostic criteria
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="probable" id="probable" />
              <Label htmlFor="probable" className="font-normal cursor-pointer">
                Probable - Strong clinical suspicion
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="possible" id="possible" />
              <Label htmlFor="possible" className="font-normal cursor-pointer">
                Possible - Differential diagnosis consideration
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="uncertain" id="uncertain" />
              <Label htmlFor="uncertain" className="font-normal cursor-pointer">
                Uncertain - Requires further investigation
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="further-testing" className="text-base font-medium mb-3 block">
            Recommended Further Testing
          </Label>
          <div className="space-y-3">
            {[
              { id: "tilt-table", label: "Tilt table test" },
              { id: "holter-monitoring", label: "Holter monitoring / Event recorder" },
              { id: "electrophysiology", label: "Electrophysiology study" },
              { id: "echocardiogram", label: "Echocardiogram" },
              { id: "stress-test", label: "Exercise stress test" },
              { id: "carotid-massage", label: "Carotid sinus massage" },
              { id: "autonomic-testing", label: "Autonomic function testing" },
              { id: "neurological-eval", label: "Neurological evaluation" },
            ].map((test) => (
              <div key={test.id} className="flex items-center space-x-2">
                <Checkbox
                  id={test.id}
                  checked={data[test.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [test.id]: checked })}
                />
                <Label htmlFor={test.id} className="font-normal cursor-pointer">
                  {test.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="diagnosis-summary" className="text-base font-medium mb-3 block">
            Clinical Summary & Rationale
          </Label>
          <Textarea
            id="diagnosis-summary"
            placeholder="Summarize the clinical reasoning, key diagnostic features, and management plan..."
            value={data.summary || ""}
            onChange={(e) => onUpdate({ summary: e.target.value })}
            className="min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DiagnosticCriteriaSection;
