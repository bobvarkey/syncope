import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";

interface CarotidSinusMassageSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const CarotidSinusMassageSection = ({ data, onUpdate }: CarotidSinusMassageSectionProps) => {
  const testPerformed = data.testPerformed;
  const hasAbnormalResponse = data.responseType && data.responseType !== 'normal';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Carotid Sinus Massage
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pressure at the site where the common carotid artery bifurcates produces a reflex slowing in heart rate and fall in blood pressure. 
          In some patients with syncope, especially those &gt;40 years, an abnormal response to carotid massage can be observed.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm mb-6">
          <p><strong>Abnormal Response (Carotid Sinus Hypersensitivity):</strong> Ventricular pause ≥3 seconds and/or fall in systolic BP ≥50 mmHg</p>
          <p><strong>Positive Test (Diagnostic):</strong> Syncope reproduced during or immediately after massage in presence of asystole &gt;3s and/or SBP fall ≥50 mmHg. 
          A positive response is diagnostic of the cause of syncope in the absence of any other competing diagnosis.</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Clinical Importance</AlertTitle>
        <AlertDescription>
          Carotid sinus syndrome is a frequent cause of syncope, especially in the elderly. 
          <strong className="block mt-2">The syndrome is misdiagnosed in approximately 50% of cases if massage is not performed in the upright position.</strong>
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Reference Guidelines</AlertTitle>
        <AlertDescription>
          For comprehensive protocol details and evidence-based recommendations, see:{" "}
          <a
            href="https://academic.oup.com/europace/article/6/6/467/506166?login=false"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            ESC Guidelines on Management of Syncope (Europace)
          </a>
        </AlertDescription>
      </Alert>

      <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Pre-Test Requirements & Contraindications</AlertTitle>
        <AlertDescription className="text-sm space-y-2">
          <p><strong>Required:</strong> Carotid doppler before test to rule out significant carotid disease</p>
          <p><strong>Avoid in:</strong> Patients with previous TIA or stroke within past 3 months (unless carotid Doppler excluded significant stenosis), 
          or patients with carotid bruits</p>
          <p><strong>Setting:</strong> Should be performed in ICU or monitored setting with continuous ECG and BP monitoring</p>
        </AlertDescription>
      </Alert>

      {hasAbnormalResponse && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Abnormal Response Detected</AlertTitle>
          <AlertDescription>
            Carotid sinus hypersensitivity identified. Consider carotid sinus syndrome as cause of syncope.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Performance */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="test-performed"
            checked={testPerformed || false}
            onCheckedChange={(checked) => onUpdate({ testPerformed: checked })}
          />
          <Label htmlFor="test-performed" className="text-lg font-semibold cursor-pointer">
            Carotid Sinus Massage Performed
          </Label>
        </div>

        {testPerformed && (
          <div className="space-y-6 pl-6 border-l-2 border-primary">
            {/* Protocol Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Patient Position During Test
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "supine-only", label: "Supine position only" },
                      { id: "supine-upright", label: "Both supine and upright positions (on tilt table)" },
                    ].map((position) => (
                      <div key={position.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={position.id}
                          checked={data[position.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [position.id]: checked })}
                        />
                        <Label htmlFor={position.id} className="font-normal cursor-pointer">
                          {position.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Monitoring Used
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "continuous-ecg", label: "Continuous ECG monitoring (required)" },
                      { id: "continuous-bp", label: "Continuous blood pressure monitoring (non-invasive device recommended)" },
                    ].map((monitoring) => (
                      <div key={monitoring.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={monitoring.id}
                          checked={data[monitoring.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [monitoring.id]: checked })}
                        />
                        <Label htmlFor={monitoring.id} className="font-normal cursor-pointer">
                          {monitoring.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-500">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-sm font-semibold">Massage Technique</AlertTitle>
                  <AlertDescription className="text-sm space-y-2">
                    <p><strong>Location:</strong> Anterior margin of sternocleidomastoid muscle at level of cricoid cartilage</p>
                    <p><strong>Duration:</strong> Firmly massage for minimum 5 seconds, maximum 10 seconds</p>
                    <p><strong>Sequence:</strong> Right carotid massaged first. After 1-2 minutes, left side massaged if right side failed to yield positive result.</p>
                    <p><strong>Critical:</strong> Must be performed in BOTH supine and upright (tilt table) positions. Testing only in supine position misses ~50% of diagnoses.</p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Baseline Measurements */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Baseline Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseline-hr-csm" className="text-xs mb-2 block">
                    Baseline Heart Rate (bpm)
                  </Label>
                  <Input
                    id="baseline-hr-csm"
                    type="number"
                    placeholder="e.g., 70"
                    value={data.baselineHr || ""}
                    onChange={(e) => onUpdate({ baselineHr: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="baseline-bp-csm" className="text-xs mb-2 block">
                    Baseline BP (mmHg)
                  </Label>
                  <Input
                    id="baseline-bp-csm"
                    placeholder="e.g., 130/80"
                    value={data.baselineBp || ""}
                    onChange={(e) => onUpdate({ baselineBp: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right Side Massage */}
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-base">Right Carotid Massage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="right-duration" className="text-xs mb-2 block">
                      Duration (seconds)
                    </Label>
                    <Input
                      id="right-duration"
                      type="number"
                      placeholder="5-10"
                      value={data.rightDuration || ""}
                      onChange={(e) => onUpdate({ rightDuration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="right-max-pause" className="text-xs mb-2 block">
                      Max Pause (seconds)
                    </Label>
                    <Input
                      id="right-max-pause"
                      type="number"
                      placeholder="e.g., 4"
                      value={data.rightMaxPause || ""}
                      onChange={(e) => onUpdate({ rightMaxPause: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="right-bp-drop" className="text-xs mb-2 block">
                      SBP Drop (mmHg)
                    </Label>
                    <Input
                      id="right-bp-drop"
                      type="number"
                      placeholder="e.g., 30"
                      value={data.rightBpDrop || ""}
                      onChange={(e) => onUpdate({ rightBpDrop: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="right-symptoms"
                    checked={data.rightSymptoms || false}
                    onCheckedChange={(checked) => onUpdate({ rightSymptoms: checked })}
                  />
                  <Label htmlFor="right-symptoms" className="font-normal cursor-pointer">
                    Symptoms reproduced during right-sided massage
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Left Side Massage */}
            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <CardTitle className="text-base">Left Carotid Massage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="left-duration" className="text-xs mb-2 block">
                      Duration (seconds)
                    </Label>
                    <Input
                      id="left-duration"
                      type="number"
                      placeholder="5-10"
                      value={data.leftDuration || ""}
                      onChange={(e) => onUpdate({ leftDuration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="left-max-pause" className="text-xs mb-2 block">
                      Max Pause (seconds)
                    </Label>
                    <Input
                      id="left-max-pause"
                      type="number"
                      placeholder="e.g., 2"
                      value={data.leftMaxPause || ""}
                      onChange={(e) => onUpdate({ leftMaxPause: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="left-bp-drop" className="text-xs mb-2 block">
                      SBP Drop (mmHg)
                    </Label>
                    <Input
                      id="left-bp-drop"
                      type="number"
                      placeholder="e.g., 20"
                      value={data.leftBpDrop || ""}
                      onChange={(e) => onUpdate({ leftBpDrop: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="left-symptoms"
                    checked={data.leftSymptoms || false}
                    onCheckedChange={(checked) => onUpdate({ leftSymptoms: checked })}
                  />
                  <Label htmlFor="left-symptoms" className="font-normal cursor-pointer">
                    Symptoms reproduced during left-sided massage
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Atropine Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atropine Challenge (if asystolic response)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="atropine-given"
                    checked={data.atropineGiven || false}
                    onCheckedChange={(checked) => onUpdate({ atropineGiven: checked })}
                  />
                  <Label htmlFor="atropine-given" className="font-medium cursor-pointer">
                    Atropine administered (1 mg or 0.02 mg/kg IV)
                  </Label>
                </div>

                {data.atropineGiven && (
                  <div className="ml-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Repeat massage after atropine to assess vasodepressor component
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="post-atropine-pause" className="text-xs mb-2 block">
                          Max Pause Post-Atropine (s)
                        </Label>
                        <Input
                          id="post-atropine-pause"
                          type="number"
                          placeholder="e.g., 0"
                          value={data.postAtropinePause || ""}
                          onChange={(e) => onUpdate({ postAtropinePause: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="post-atropine-bp" className="text-xs mb-2 block">
                          SBP Drop Post-Atropine (mmHg)
                        </Label>
                        <Input
                          id="post-atropine-bp"
                          type="number"
                          placeholder="e.g., 60"
                          value={data.postAtropineBp || ""}
                          onChange={(e) => onUpdate({ postAtropineBp: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={data.responseType}
                  onValueChange={(value) => onUpdate({ responseType: value })}
                  className="space-y-3"
                >
                  <div className="border rounded-md p-3 bg-secondary/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <RadioGroupItem value="normal" id="response-normal" />
                      <Label htmlFor="response-normal" className="font-semibold cursor-pointer">
                        Normal Response
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Pause &lt;3 seconds AND SBP drop &lt;50 mmHg
                    </p>
                  </div>

                  <div className="border rounded-md p-3 bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <RadioGroupItem value="cardioinhibitory" id="response-cardio" />
                      <Label htmlFor="response-cardio" className="font-semibold cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Abnormal</Badge>
                        Cardioinhibitory Response
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Asystole ≥3 seconds (with or without SBP drop)
                    </p>
                  </div>

                  <div className="border rounded-md p-3 bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <RadioGroupItem value="vasodepressor" id="response-vaso" />
                      <Label htmlFor="response-vaso" className="font-semibold cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Abnormal</Badge>
                        Vasodepressor Response
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Fall in SBP ≥50 mmHg without significant asystole (&lt;3 s)
                    </p>
                  </div>

                  <div className="border rounded-md p-3 bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <RadioGroupItem value="mixed" id="response-mixed" />
                      <Label htmlFor="response-mixed" className="font-semibold cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Abnormal</Badge>
                        Mixed Response
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Asystole ≥3 seconds AND fall in SBP ≥50 mmHg on rhythm resumption from baseline
                    </p>
                  </div>
                </RadioGroup>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> Carotid sinus syndrome is frequently misdiagnosed if massage 
                    is not performed in the upright position. Especially important in elderly patients.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Reproducibility & Complications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-semibold text-sm mb-2">Reproducibility</h5>
                  <p className="text-sm text-muted-foreground">
                    High reproducibility: ~93% concordance between abnormal and normal responses during repeat testing. 
                    Pause &gt;3s consistently reproduced in patients with severe carotid sinus syndrome.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Complications
                  </h5>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Incidence:</strong> Neurological complications are rare (0.17-0.45% in large studies)</p>
                    <p><strong>Main Risk:</strong> Transient ischaemic events or stroke</p>
                    <p><strong>Other:</strong> Self-limited atrial fibrillation (rarely); asystole is self-terminating after massage ends (no resuscitation usually needed)</p>
                    <p className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                      <strong>Contraindications:</strong> TIA/stroke within 3 months (unless carotid Doppler negative), carotid bruits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Interpretation */}
            <div>
              <Label htmlFor="csm-interpretation" className="text-base font-medium mb-3 block">
                Clinical Interpretation & Significance
              </Label>
              <Textarea
                id="csm-interpretation"
                placeholder="Document clinical significance, whether symptoms were reproduced, implications for diagnosis and management, vasodepressor component importance for pacing decisions..."
                value={data.notes || ""}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarotidSinusMassageSection;
