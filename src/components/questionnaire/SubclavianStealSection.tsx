import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";

interface SubclavianStealSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const SubclavianStealSection = ({ data, onUpdate }: SubclavianStealSectionProps) => {
  const testPerformed = data.testPerformed;
  const hasAbnormalities = data.dopplerAbnormal || data.hyperemiaPositive;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Subclavian Steal Syndrome Workup
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Vascular steal syndrome assessment using Doppler ultrasound and hyperemia testing
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Subclavian steal syndrome occurs when stenosis/occlusion of the proximal subclavian artery 
          causes reversal of flow in the vertebral artery, potentially leading to vertebrobasilar insufficiency 
          and syncope during arm exercise.
        </AlertDescription>
      </Alert>

      {hasAbnormalities && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Abnormal Findings Detected</AlertTitle>
          <AlertDescription>
            Vascular abnormalities suggest possible subclavian steal syndrome. 
            Consider vascular surgery consultation.
          </AlertDescription>
        </Alert>
      )}

      {/* Clinical Presentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Presentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Symptoms Suggestive of Subclavian Steal
            </Label>
            <div className="space-y-3">
              {[
                { id: "arm-exercise-syncope", label: "Syncope with arm exercise" },
                { id: "arm-claudication", label: "Arm claudication" },
                { id: "vertebrobasilar-symptoms", label: "Vertebrobasilar symptoms (dizziness, diplopia, dysarthria, ataxia)" },
                { id: "bp-pulse-asymmetry", label: "Blood pressure or pulse asymmetry between arms" },
                { id: "supraclavicular-bruit", label: "Supraclavicular bruit" },
              ].map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom.id}
                    checked={data[symptom.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [symptom.id]: checked })}
                  />
                  <Label htmlFor={symptom.id} className="font-normal cursor-pointer">
                    {symptom.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="bp-right-arm" className="text-xs mb-2 block">
                Blood Pressure - Right Arm (mmHg)
              </Label>
              <Input
                id="bp-right-arm"
                placeholder="e.g., 120/80"
                value={data.bpRightArm || ""}
                onChange={(e) => onUpdate({ bpRightArm: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bp-left-arm" className="text-xs mb-2 block">
                Blood Pressure - Left Arm (mmHg)
              </Label>
              <Input
                id="bp-left-arm"
                placeholder="e.g., 100/70"
                value={data.bpLeftArm || ""}
                onChange={(e) => onUpdate({ bpLeftArm: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Section */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="test-performed"
            checked={testPerformed || false}
            onCheckedChange={(checked) => onUpdate({ testPerformed: checked })}
          />
          <Label htmlFor="test-performed" className="text-lg font-semibold cursor-pointer">
            Subclavian Steal Workup Performed
          </Label>
        </div>

        {testPerformed && (
          <div className="space-y-6 pl-6 border-l-2 border-primary">
            {/* Doppler Ultrasound */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Doppler Ultrasound of Vertebral Arteries
              </h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Doppler Findings
                  </Label>
                  <RadioGroup
                    value={data.dopplerFindings}
                    onValueChange={(value) => onUpdate({ dopplerFindings: value })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="doppler-normal" />
                      <Label htmlFor="doppler-normal" className="font-normal cursor-pointer">
                        <Badge variant="secondary" className="mr-2">Normal</Badge>
                        Normal antegrade flow in both vertebral arteries
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial-reversal" id="doppler-partial" />
                      <Label htmlFor="doppler-partial" className="font-normal cursor-pointer">
                        <Badge variant="default" className="mr-2">Abnormal</Badge>
                        Partial flow reversal (bidirectional flow)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="complete-reversal" id="doppler-complete" />
                      <Label htmlFor="doppler-complete" className="font-normal cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Abnormal</Badge>
                        Complete flow reversal (retrograde flow)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent-flow" id="doppler-absent" />
                      <Label htmlFor="doppler-absent" className="font-normal cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Abnormal</Badge>
                        Absent or minimal flow
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doppler-abnormal"
                    checked={data.dopplerAbnormal || false}
                    onCheckedChange={(checked) => onUpdate({ dopplerAbnormal: checked })}
                  />
                  <Label htmlFor="doppler-abnormal" className="font-medium cursor-pointer">
                    Doppler study shows abnormal flow pattern
                  </Label>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Affected Side
                  </Label>
                  <RadioGroup
                    value={data.affectedSide}
                    onValueChange={(value) => onUpdate({ affectedSide: value })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="left-side" />
                      <Label htmlFor="left-side" className="font-normal cursor-pointer">
                        Left
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="right-side" />
                      <Label htmlFor="right-side" className="font-normal cursor-pointer">
                        Right
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bilateral" id="bilateral-side" />
                      <Label htmlFor="bilateral-side" className="font-normal cursor-pointer">
                        Bilateral
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="doppler-details" className="text-sm font-medium mb-2 block">
                    Doppler Study Details
                  </Label>
                  <Textarea
                    id="doppler-details"
                    placeholder="Document flow velocities, waveform patterns, and specific findings..."
                    value={data.dopplerDetails || ""}
                    onChange={(e) => onUpdate({ dopplerDetails: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Hyperemia Test */}
            <div className="pt-6 border-t">
              <h4 className="font-semibold text-foreground mb-4">
                Reactive Hyperemia Test (Provocative Test)
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Blood pressure cuff applied to affected arm, inflated above systolic for 3-5 minutes, 
                then rapidly deflated while monitoring vertebral artery flow
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Hyperemia Test Result
                  </Label>
                  <RadioGroup
                    value={data.hyperemiaResult}
                    onValueChange={(value) => onUpdate({ hyperemiaResult: value })}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="hyperemia-negative" />
                      <Label htmlFor="hyperemia-negative" className="font-normal cursor-pointer">
                        <Badge variant="secondary" className="mr-2">Negative</Badge>
                        No change or improved antegrade flow
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="hyperemia-positive" />
                      <Label htmlFor="hyperemia-positive" className="font-normal cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Positive</Badge>
                        Worsening of retrograde flow or symptoms provoked
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hyperemia-positive-check"
                    checked={data.hyperemiaPositive || false}
                    onCheckedChange={(checked) => onUpdate({ hyperemiaPositive: checked })}
                  />
                  <Label htmlFor="hyperemia-positive-check" className="font-medium cursor-pointer">
                    Positive hyperemia test (confirms hemodynamically significant steal)
                  </Label>
                </div>

                <div>
                  <Label htmlFor="hyperemia-details" className="text-sm font-medium mb-2 block">
                    Hyperemia Test Details
                  </Label>
                  <Textarea
                    id="hyperemia-details"
                    placeholder="Document response to hyperemia, flow changes, symptom reproduction..."
                    value={data.hyperemiaDetails || ""}
                    onChange={(e) => onUpdate({ hyperemiaDetails: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Imaging */}
            <div className="pt-6 border-t">
              <h4 className="font-medium text-foreground mb-3">
                Additional Vascular Imaging
              </h4>
              <div className="space-y-3">
                {[
                  { id: "cta-performed", label: "CT Angiography performed" },
                  { id: "mra-performed", label: "MR Angiography performed" },
                  { id: "conventional-angio", label: "Conventional angiography performed" },
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
          </div>
        )}
      </div>

      {/* Clinical Summary */}
      {testPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Interpretation & Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Severity Classification
              </Label>
              <RadioGroup
                value={data.severity}
                onValueChange={(value) => onUpdate({ severity: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-steal" id="no-steal" />
                  <Label htmlFor="no-steal" className="font-normal cursor-pointer">
                    No evidence of subclavian steal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="latent" id="latent" />
                  <Label htmlFor="latent" className="font-normal cursor-pointer">
                    Latent steal (only evident on provocative testing)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermittent" id="intermittent" />
                  <Label htmlFor="intermittent" className="font-normal cursor-pointer">
                    Intermittent steal (variable flow patterns)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="permanent" />
                  <Label htmlFor="permanent" className="font-normal cursor-pointer">
                    Permanent steal (persistent retrograde flow)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="subclavian-notes" className="text-sm font-medium mb-2 block">
                Summary & Management Plan
              </Label>
              <Textarea
                id="subclavian-notes"
                placeholder="Document clinical significance, need for intervention, and management recommendations (conservative vs surgical/endovascular)..."
                value={data.notes || ""}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubclavianStealSection;
