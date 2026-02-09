import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle2, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TiltTestProtocolSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const TiltTestProtocolSection = ({ data, onUpdate }: TiltTestProtocolSectionProps) => {
  const testPerformed = data.testPerformed;
  const testPositive = data.testResult === 'positive';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Head-Up Tilt Table Test Protocol
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Class I recommendations for tilt testing procedure and response classification
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Head-Up Tilt Table (HUTT) protocol requires specific environmental conditions, patient preparation, 
          and monitoring standards to ensure accurate and safe testing.
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

      {/* Test Performance */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="test-performed"
            checked={testPerformed || false}
            onCheckedChange={(checked) => onUpdate({ testPerformed: checked })}
          />
          <Label htmlFor="test-performed" className="text-lg font-semibold cursor-pointer">
            Tilt Table Test Performed
          </Label>
        </div>

        {testPerformed && (
          <div className="space-y-6 pl-6 border-l-2 border-primary">
            {/* HUTT Protocol Requirements */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-500">
              <CardHeader>
                <CardTitle className="text-base">HUTT Protocol Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Environmental Conditions
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "quiet-room", label: "Room is quiet with minimal distractions" },
                      { id: "dim-lights", label: "Dim lights maintained throughout procedure" },
                      { id: "appropriate-temperature", label: "Appropriate room temperature (comfortable, not too warm)" },
                    ].map((condition) => (
                      <div key={condition.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition.id}
                          checked={data[condition.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [condition.id]: checked })}
                        />
                        <Label htmlFor={condition.id} className="font-normal cursor-pointer text-sm">
                          {condition.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Patient Preparation
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "fasting-2h", label: "Patient fasted for at least 2 hours before test" },
                      { id: "bladder-emptied", label: "Bladder emptied before procedure" },
                      { id: "comfortable-clothing", label: "Patient wearing comfortable, loose clothing" },
                    ].map((prep) => (
                      <div key={prep.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={prep.id}
                          checked={data[prep.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [prep.id]: checked })}
                        />
                        <Label htmlFor={prep.id} className="font-normal cursor-pointer text-sm">
                          {prep.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Blood Pressure Monitoring Method
                  </Label>
                  <RadioGroup
                    value={data.bpMonitoring}
                    onValueChange={(value) => onUpdate({ bpMonitoring: value })}
                    className="space-y-2"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="continuous-noninvasive" id="bp-continuous" />
                      <div className="flex-1">
                        <Label htmlFor="bp-continuous" className="font-normal cursor-pointer">
                          <Badge variant="default" className="mr-2">Recommended</Badge>
                          Continuous beat-to-beat finger arterial BP (non-invasive)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Preferred method - provides real-time monitoring
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="intermittent-sphygmo" id="bp-intermittent" />
                      <div className="flex-1">
                        <Label htmlFor="bp-intermittent" className="font-normal cursor-pointer">
                          Intermittent sphygmomanometer measurements
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Widely used in clinical practice, especially in children
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="invasive" id="bp-invasive" />
                      <div className="flex-1">
                        <Label htmlFor="bp-invasive" className="font-normal cursor-pointer">
                          <Badge variant="secondary" className="mr-2">Not Recommended</Badge>
                          Invasive arterial BP monitoring
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          May affect test specificity, especially in elderly and children
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Equipment & Safety Requirements
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "footboard-support", label: "Tilt table with footboard support (required for syncope evaluation)" },
                      { id: "rapid-tilt", label: "Table capable of smooth/rapid tilting and quick reset to supine (<10 s)" },
                      { id: "emergency-equipment", label: "Emergency resuscitation equipment available" },
                    ].map((equipment) => (
                      <div key={equipment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={equipment.id}
                          checked={data[equipment.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [equipment.id]: checked })}
                        />
                        <Label htmlFor={equipment.id} className="font-normal cursor-pointer text-sm">
                          {equipment.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Staff Requirements
                  </Label>
                  <div className="space-y-2">
                    {[
                      { id: "experienced-nurse", label: "Experienced nurse or medical technician present throughout (required)" },
                      { id: "physician-present", label: "Physician present throughout procedure" },
                      { id: "physician-available", label: "Physician immediately available (if not present)" },
                    ].map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={staff.id}
                          checked={data[staff.id] || false}
                          onCheckedChange={(checked) => onUpdate({ [staff.id]: checked })}
                        />
                        <Label htmlFor={staff.id} className="font-normal cursor-pointer text-sm">
                          {staff.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Alert className="mt-3">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Physician presence throughout is not mandatory as patient risk is very low, 
                      but immediate availability is essential.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Test Date */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Test Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !data.testDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.testDate ? format(new Date(data.testDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.testDate ? new Date(data.testDate) : undefined}
                    onSelect={(date) => onUpdate({ testDate: date?.toISOString() })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Protocol Compliance */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Protocol Compliance (Class I Recommendations)
              </h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Supine Pre-Tilt Phase Duration
                  </Label>
                  <RadioGroup
                    value={data.preTiltPhase}
                    onValueChange={(value) => onUpdate({ preTiltPhase: value })}
                    className="space-y-3"
                  >
                    <div className="border rounded-md p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <RadioGroupItem value="5-min-no-cannulation" id="5-min" />
                        <Label htmlFor="5-min" className="font-normal cursor-pointer">
                          ≥5 minutes (no venous cannulation)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Shorter preparation time when IV access not required
                      </p>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <RadioGroupItem value="20-45-min-with-cannulation" id="20-45-min" />
                        <Label htmlFor="20-45-min" className="font-normal cursor-pointer">
                          20-45 minutes (with venous cannulation)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Extended time to decrease likelihood of vasovagal reaction from IV insertion
                      </p>
                    </div>
                  </RadioGroup>
                  <div className="mt-3">
                    <Label htmlFor="actual-supine-time" className="text-xs mb-2 block">
                      Actual supine time before tilting (minutes)
                    </Label>
                    <Input
                      id="actual-supine-time"
                      type="number"
                      placeholder="e.g., 20"
                      value={data.actualSupineTime || ""}
                      onChange={(e) => onUpdate({ actualSupineTime: e.target.value })}
                      className="max-w-[150px]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tilt-angle" className="text-sm font-medium mb-2 block">
                    Tilt Angle (60-70° recommended)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="tilt-angle"
                      type="number"
                      placeholder="e.g., 70"
                      value={data.tiltAngle || ""}
                      onChange={(e) => onUpdate({ tiltAngle: e.target.value })}
                      className="max-w-[120px]"
                    />
                    <span className="text-muted-foreground">degrees</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="passive-duration" className="text-sm font-medium mb-2 block">
                    Passive Phase Duration (20-45 min recommended)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="passive-duration"
                      type="number"
                      placeholder="e.g., 20"
                      value={data.passiveDuration || ""}
                      onChange={(e) => onUpdate({ passiveDuration: e.target.value })}
                      className="max-w-[120px]"
                    />
                    <span className="text-muted-foreground">minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drug Provocation */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Drug Provocation (if passive phase negative)
              </h4>
              <RadioGroup
                value={data.drugProvocation}
                onValueChange={(value) => onUpdate({ drugProvocation: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="no-drug" />
                  <Label htmlFor="no-drug" className="font-normal cursor-pointer">
                    Not performed / Not applicable
                  </Label>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="isoprenaline" id="isoprenaline" />
                    <Label htmlFor="isoprenaline" className="font-semibold cursor-pointer">
                      Intravenous Isoproterenol/Isoprenaline
                    </Label>
                  </div>
                  {data.drugProvocation === 'isoprenaline' && (
                    <div className="ml-6 mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Incremental infusion: 1 to 3 μg/min to increase HR by 20-25% over baseline
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label htmlFor="iso-dose" className="text-xs">Dose (μg/min)</Label>
                          <Input
                            id="iso-dose"
                            placeholder="e.g., 2"
                            value={data.isoDose || ""}
                            onChange={(e) => onUpdate({ isoDose: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="iso-duration" className="text-xs">Duration (min)</Label>
                          <Input
                            id="iso-duration"
                            placeholder="15-20"
                            value={data.isoDuration || ""}
                            onChange={(e) => onUpdate({ isoDuration: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="nitroglycerin" id="nitroglycerin" />
                    <Label htmlFor="nitroglycerin" className="font-semibold cursor-pointer">
                      Sublingual Nitroglycerin
                    </Label>
                  </div>
                  {data.drugProvocation === 'nitroglycerin' && (
                    <div className="ml-6 mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Fixed dose: 400 μg spray administered in upright position
                      </p>
                      <div>
                        <Label htmlFor="ntg-duration" className="text-xs">Duration (min)</Label>
                        <Input
                          id="ntg-duration"
                          placeholder="15-20"
                          value={data.ntgDuration || ""}
                          onChange={(e) => onUpdate({ ntgDuration: e.target.value })}
                          className="mt-1 max-w-[150px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Test Endpoint & Result */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Test Endpoint & Result</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Test Endpoint</Label>
                  <RadioGroup
                    value={data.testEndpoint}
                    onValueChange={(value) => onUpdate({ testEndpoint: value })}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="syncope" id="syncope-endpoint" />
                      <Label htmlFor="syncope-endpoint" className="font-normal cursor-pointer">
                        Syncope induced
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id="completed-endpoint" />
                      <Label htmlFor="completed-endpoint" className="font-normal cursor-pointer">
                        Completed planned duration (no syncope)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="terminated" id="terminated-endpoint" />
                      <Label htmlFor="terminated-endpoint" className="font-normal cursor-pointer">
                        Terminated early (patient request, adverse effects)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Test Result</Label>
                  <RadioGroup
                    value={data.testResult}
                    onValueChange={(value) => onUpdate({ testResult: value })}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="positive-result" />
                      <Label htmlFor="positive-result" className="font-normal cursor-pointer">
                        <Badge variant="destructive" className="mr-2">Positive</Badge>
                        Syncope occurred
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="negative-result" />
                      <Label htmlFor="negative-result" className="font-normal cursor-pointer">
                        <Badge variant="secondary" className="mr-2">Negative</Badge>
                        No syncope
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {data.testEndpoint === 'syncope' && (
                  <div>
                    <Label htmlFor="time-to-syncope" className="text-sm font-medium mb-2 block">
                      Time to Syncope
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="time-to-syncope"
                        placeholder="e.g., 12"
                        value={data.timeToSyncope || ""}
                        onChange={(e) => onUpdate({ timeToSyncope: e.target.value })}
                        className="max-w-[120px]"
                      />
                      <span className="text-muted-foreground">minutes</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Classification of Positive Response */}
      {testPerformed && testPositive && (
        <div className="border rounded-lg p-6 bg-card">
          <Alert className="mb-6 bg-primary/10 border-primary">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>Positive Test - Classification Required</AlertTitle>
            <AlertDescription>
              Select the response type based on heart rate and blood pressure changes
            </AlertDescription>
          </Alert>

          <h4 className="font-semibold text-foreground mb-4">
            Classification of Positive Response
          </h4>

          <RadioGroup
            value={data.responseType}
            onValueChange={(value) => onUpdate({ responseType: value })}
            className="space-y-4"
          >
            <div className="border-l-4 border-blue-500 rounded-md p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="type-1-mixed" id="type-1" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="type-1" className="font-semibold cursor-pointer block">
                    Type 1 - Mixed
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    HR falls but remains ≥40 bpm OR falls to &lt;40 bpm for &lt;10 s (asystole &lt;3 s). 
                    BP falls before HR falls.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 rounded-md p-4 bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="type-2a-cardioinhibition" id="type-2a" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="type-2a" className="font-semibold cursor-pointer block">
                    Type 2A - Cardioinhibition Without Asystole
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    HR falls to &lt;40 bpm for &gt;10 s but no asystole &gt;3 s. 
                    BP falls before HR falls.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-red-500 rounded-md p-4 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="type-2b-cardioinhibition-asystole" id="type-2b" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="type-2b" className="font-semibold cursor-pointer block">
                    Type 2B - Cardioinhibition With Asystole
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asystole occurs for &gt;3 s. BP fall coincides with or occurs before HR fall.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 rounded-md p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="type-3-vasodepressor" id="type-3" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="type-3" className="font-semibold cursor-pointer block">
                    Type 3 - Vasodepressor
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    HR does not fall more than 10% from peak at time of syncope.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 rounded-md p-4 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="exception-1-chronotropic" id="exception-1" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="exception-1" className="font-semibold cursor-pointer block">
                    Exception 1 - Chronotropic Incompetence
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    No HR rise during tilt testing (&lt;10% from pre-tilt rate).
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-pink-500 rounded-md p-4 bg-pink-50 dark:bg-pink-950/20">
              <div className="flex items-start space-x-2 mb-2">
                <RadioGroupItem value="exception-2-pots" id="exception-2" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="exception-2" className="font-semibold cursor-pointer block">
                    Exception 2 - Excessive HR Rise (POTS)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Excessive HR rise at onset and throughout upright position (&gt;130 bpm) before syncope.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {/* Hemodynamic Details */}
          <div className="mt-6 pt-6 border-t">
            <h5 className="font-medium text-foreground mb-4">Hemodynamic Parameters During Syncope</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="baseline-hr" className="text-xs">Baseline HR (bpm)</Label>
                <Input
                  id="baseline-hr"
                  type="number"
                  placeholder="e.g., 70"
                  value={data.baselineHr || ""}
                  onChange={(e) => onUpdate({ baselineHr: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nadir-hr" className="text-xs">Nadir HR (bpm)</Label>
                <Input
                  id="nadir-hr"
                  type="number"
                  placeholder="e.g., 35"
                  value={data.nadirHr || ""}
                  onChange={(e) => onUpdate({ nadirHr: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="asystole-duration" className="text-xs">Asystole Duration (s)</Label>
                <Input
                  id="asystole-duration"
                  type="number"
                  placeholder="e.g., 5"
                  value={data.asystoleDuration || ""}
                  onChange={(e) => onUpdate({ asystoleDuration: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nadir-bp" className="text-xs">Nadir BP (mmHg)</Label>
                <Input
                  id="nadir-bp"
                  placeholder="e.g., 60/40"
                  value={data.nadirBp || ""}
                  onChange={(e) => onUpdate({ nadirBp: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Findings */}
      {testPerformed && (
        <div>
          <Label htmlFor="tilt-test-notes" className="text-base font-medium mb-3 block">
            Detailed Test Findings & Clinical Interpretation
          </Label>
          <Textarea
            id="tilt-test-notes"
            placeholder="Document prodromal symptoms, recovery time, reproducibility, and clinical significance..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[120px]"
          />
        </div>
      )}
    </div>
  );
};

export default TiltTestProtocolSection;
