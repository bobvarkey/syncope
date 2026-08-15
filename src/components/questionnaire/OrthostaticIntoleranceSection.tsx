import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { ReferencePopup } from "@/components/ReferencePopup";

interface OrthostaticIntoleranceSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const OrthostaticIntoleranceSection = ({ data, onUpdate }: OrthostaticIntoleranceSectionProps) => {
  const handleCheckboxChange = (field: string, checked: boolean) => {
    onUpdate({ [field]: checked });
  };

  const handleInputChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Orthostatic Intolerance Evaluation</h2>
        <p className="text-muted-foreground">
          Assessment of orthostatic intolerance with tilt test protocol
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Definition:</strong> Orthostatic intolerance is defined as the presence of symptoms of cerebral hypoperfusion with standing and relief of symptoms by recumbency.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Characteristic Symptoms</CardTitle>
          <CardDescription>Select all symptoms present</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lightheadedness"
              checked={data.lightheadedness || false}
              onCheckedChange={(checked) => handleCheckboxChange('lightheadedness', checked as boolean)}
            />
            <Label htmlFor="lightheadedness">Lightheadedness or dizziness</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="palpitations"
              checked={data.palpitations || false}
              onCheckedChange={(checked) => handleCheckboxChange('palpitations', checked as boolean)}
            />
            <Label htmlFor="palpitations">Palpitations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="heatIntolerance"
              checked={data.heatIntolerance || false}
              onCheckedChange={(checked) => handleCheckboxChange('heatIntolerance', checked as boolean)}
            />
            <Label htmlFor="heatIntolerance">Heat intolerance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weakness"
              checked={data.weakness || false}
              onCheckedChange={(checked) => handleCheckboxChange('weakness', checked as boolean)}
            />
            <Label htmlFor="weakness">Sense of weakness</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tremulousness"
              checked={data.tremulousness || false}
              onCheckedChange={(checked) => handleCheckboxChange('tremulousness', checked as boolean)}
            />
            <Label htmlFor="tremulousness">Tremulousness</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mealExacerbation"
              checked={data.mealExacerbation || false}
              onCheckedChange={(checked) => handleCheckboxChange('mealExacerbation', checked as boolean)}
            />
            <Label htmlFor="mealExacerbation">Exacerbation by meals</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hyperhidrosis"
              checked={data.hyperhidrosis || false}
              onCheckedChange={(checked) => handleCheckboxChange('hyperhidrosis', checked as boolean)}
            />
            <Label htmlFor="hyperhidrosis">Hyperhidrosis</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exerciseIntolerance"
              checked={data.exerciseIntolerance || false}
              onCheckedChange={(checked) => handleCheckboxChange('exerciseIntolerance', checked as boolean)}
            />
            <Label htmlFor="exerciseIntolerance">Exercise intolerance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shortnessOfBreath"
              checked={data.shortnessOfBreath || false}
              onCheckedChange={(checked) => handleCheckboxChange('shortnessOfBreath', checked as boolean)}
            />
            <Label htmlFor="shortnessOfBreath">Shortness of breath</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10-15 Minute Tilt Test Classification</CardTitle>
          <CardDescription>Select the classification based on test results</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.tiltTestClassification || ""}
            onValueChange={(value) => handleInputChange('tiltTestClassification', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pots" id="pots" />
              <Label htmlFor="pots">OI with tachycardia (POTS)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oh" id="oh" />
              <Label htmlFor="oh">OI with Orthostatic Hypotension (OH)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ot" id="ot" />
              <Label htmlFor="ot">OI with Orthostatic Tremor (OT)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ochos" id="ochos" />
              <Label htmlFor="ochos">OI with cerebral hypoperfusion alone - Orthostatic Cerebral Hypoperfusion Syndrome (OCHOS)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hych" id="hych" />
              <Label htmlFor="hych">OI with cerebral hypoperfusion due to Hypocapnea (HYCH)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exclusion Criteria for HYCH and POTS</CardTitle>
          <CardDescription>Check all that apply (these exclude diagnosis)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="orthostaticHypotension"
              checked={data.orthostaticHypotension || false}
              onCheckedChange={(checked) => handleCheckboxChange('orthostaticHypotension', checked as boolean)}
            />
            <Label htmlFor="orthostaticHypotension">Orthostatic hypotension present</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="arrhythmiaBradycardia"
              checked={data.arrhythmiaBradycardia || false}
              onCheckedChange={(checked) => handleCheckboxChange('arrhythmiaBradycardia', checked as boolean)}
            />
            <Label htmlFor="arrhythmiaBradycardia">Presence of arrhythmia or bradycardia (HR &lt; 50 BPM) during supine or tilt test</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="incompleteTest"
              checked={data.incompleteTest || false}
              onCheckedChange={(checked) => handleCheckboxChange('incompleteTest', checked as boolean)}
            />
            <Label htmlFor="incompleteTest">Inability to complete the 10 min tilt test for any reason including syncope</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="structuralAbnormality"
              checked={data.structuralAbnormality || false}
              onCheckedChange={(checked) => handleCheckboxChange('structuralAbnormality', checked as boolean)}
            />
            <Label htmlFor="structuralAbnormality">Structural abnormality on brain MRI that could cause significant hemodynamic deficit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="abnormalVelocities"
              checked={data.abnormalVelocities || false}
              onCheckedChange={(checked) => handleCheckboxChange('abnormalVelocities', checked as boolean)}
            />
            <Label htmlFor="abnormalVelocities">Other cause of abnormal intracranial velocities (stroke, large vessel stenosis, abnormal hematocrit)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vasoactiveMedication"
              checked={data.vasoactiveMedication || false}
              onCheckedChange={(checked) => handleCheckboxChange('vasoactiveMedication', checked as boolean)}
            />
            <Label htmlFor="vasoactiveMedication">Use of medication affecting autonomic functions (vasoactive medication or orthostatic tachycardia-causing medication)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hypocapniaCause"
              checked={data.hypocapniaCause || false}
              onCheckedChange={(checked) => handleCheckboxChange('hypocapniaCause', checked as boolean)}
            />
            <Label htmlFor="hypocapniaCause">Pulmonary, cardiovascular or systemic disorder causing hypocapnia (including chronic fatigue syndrome, fibromyalgia)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hyperadrenergic"
              checked={data.hyperadrenergic || false}
              onCheckedChange={(checked) => handleCheckboxChange('hyperadrenergic', checked as boolean)}
            />
            <Label htmlFor="hyperadrenergic">Hyperadrenergic state (standing plasma norepinephrine ≥ 600 pg/ml)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HYCH Diagnostic Criteria</CardTitle>
          <CardDescription>All three criteria must be met</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hychOiSymptoms"
              checked={data.hychOiSymptoms || false}
              onCheckedChange={(checked) => handleCheckboxChange('hychOiSymptoms', checked as boolean)}
            />
            <Label htmlFor="hychOiSymptoms">OI symptoms present</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hychHypocapnia"
              checked={data.hychHypocapnia || false}
              onCheckedChange={(checked) => handleCheckboxChange('hychHypocapnia', checked as boolean)}
            />
            <Label htmlFor="hychHypocapnia">Orthostatic hypocapnia during tilt test (end tidal CO₂ &lt; 30 mmHg)</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTidalCO2">End Tidal CO₂ (mmHg)</Label>
            <Input
              id="endTidalCO2"
              type="number"
              value={data.endTidalCO2 || ""}
              onChange={(e) => handleInputChange('endTidalCO2', e.target.value)}
              placeholder="Enter value"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hychReducedCbfv"
              checked={data.hychReducedCbfv || false}
              onCheckedChange={(checked) => handleCheckboxChange('hychReducedCbfv', checked as boolean)}
            />
            <Label htmlFor="hychReducedCbfv">Reduced orthostatic cerebral blood flow velocity (CBFv) explained by decline in end tidal CO₂</Label>
          </div>
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Expected finding:</strong> Mean CBFv decreases by ~22.4% in HYCH with no significant change in HR or BP
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POTS Diagnostic Criteria</CardTitle>
          <CardDescription>Symptomatic heart rate increment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="potsHeartRateIncrease"
              checked={data.potsHeartRateIncrease || false}
              onCheckedChange={(checked) => handleCheckboxChange('potsHeartRateIncrease', checked as boolean)}
            />
            <Label htmlFor="potsHeartRateIncrease">Symptomatic increment of heart rate ≥ 30 BPM and exceeding 120 BPM</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baselineHr">Baseline HR (BPM)</Label>
              <Input
                id="baselineHr"
                type="number"
                value={data.baselineHr || ""}
                onChange={(e) => handleInputChange('baselineHr', e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standingHr">Standing HR (BPM)</Label>
              <Input
                id="standingHr"
                type="number"
                value={data.standingHr || ""}
                onChange={(e) => handleInputChange('standingHr', e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cerebral Blood Flow Velocity (CBFv) Measurements</CardTitle>
          <CardDescription>Normal drop of mean CBFv during tilt test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Normal CBFv values:</strong>
              <ul className="list-disc ml-6 mt-2">
                <li>Baseline (1st minute): &lt;90% drop</li>
                <li>5th minute: 89% of baseline</li>
                <li>10th minute: 85% of baseline</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cbfvBaseline">Baseline CBFv (cm/s)</Label>
              <Input
                id="cbfvBaseline"
                type="number"
                value={data.cbfvBaseline || ""}
                onChange={(e) => handleInputChange('cbfvBaseline', e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbfv1min">1st Minute CBFv (cm/s)</Label>
              <Input
                id="cbfv1min"
                type="number"
                value={data.cbfv1min || ""}
                onChange={(e) => handleInputChange('cbfv1min', e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cbfv5min">5th Minute CBFv (cm/s)</Label>
              <Input
                id="cbfv5min"
                type="number"
                value={data.cbfv5min || ""}
                onChange={(e) => handleInputChange('cbfv5min', e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbfv10min">10th Minute CBFv (cm/s)</Label>
              <Input
                id="cbfv10min"
                type="number"
                value={data.cbfv10min || ""}
                onChange={(e) => handleInputChange('cbfv10min', e.target.value)}
                placeholder="Enter value"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orthostatic Tremor (OT) Evaluation</CardTitle>
          <CardDescription>
            Assessment of orthostatic tremor using clinical examination and diagnostic tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <ReferencePopup triggerLabel="OT-10 Scale Reference">
              <p>
                The Orthostatic Tremor Severity Scale (OT-10) is a validated assessment tool. 
                Permission is required to use this scale and can be obtained from the International Parkinson and Movement Disorder Society.{" "}
                <a 
                  href="https://www.movementdisorders.org/MDS-Files1/PDFs/Rating-Scales/OT-10.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  View OT-10 Scale (PDF)
                </a>
              </p>
            </ReferencePopup>
          </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">Clinical Notes</h4>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tremor Distribution:</strong> Apart from in the legs, tremor is often present in other areas such as the hands, cranial muscles, and even the trunk. 
                In fact, only a small proportion of patients have isolated leg tremors.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Primary Investigations</h4>
            <p className="text-sm text-muted-foreground">Select investigations performed</p>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-auscultation"
                checked={data.otAuscultation || false}
                onCheckedChange={(checked) => handleCheckboxChange('otAuscultation', checked as boolean)}
              />
              <Label htmlFor="ot-auscultation">Auscultation using a stethoscope of the gastrocnemius muscles</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-surface-emg"
                checked={data.otSurfaceEmg || false}
                onCheckedChange={(checked) => handleCheckboxChange('otSurfaceEmg', checked as boolean)}
              />
              <Label htmlFor="ot-surface-emg">Surface EMG recordings on standing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-ecg-positions"
                checked={data.otEcgPositions || false}
                onCheckedChange={(checked) => handleCheckboxChange('otEcgPositions', checked as boolean)}
              />
              <Label htmlFor="ot-ecg-positions">ECG in lying and standing positions (can show 13-18 Hz oscillatory artifact)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-accelerometer"
                checked={data.otAccelerometer || false}
                onCheckedChange={(checked) => handleCheckboxChange('otAccelerometer', checked as boolean)}
              />
              <Label htmlFor="ot-accelerometer">Accelerometer recordings with a smartphone</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Special Circumstances Investigations</h4>
            <p className="text-sm text-muted-foreground">Additional tests to rule out underlying causes</p>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-thyroid"
                checked={data.otThyroid || false}
                onCheckedChange={(checked) => handleCheckboxChange('otThyroid', checked as boolean)}
              />
              <Label htmlFor="ot-thyroid">Thyroid function tests</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-protein-electrophoresis"
                checked={data.otProteinElectrophoresis || false}
                onCheckedChange={(checked) => handleCheckboxChange('otProteinElectrophoresis', checked as boolean)}
              />
              <Label htmlFor="ot-protein-electrophoresis">Serum protein electrophoresis (to rule out gammopathies)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-vitamin-b12"
                checked={data.otVitaminB12 || false}
                onCheckedChange={(checked) => handleCheckboxChange('otVitaminB12', checked as boolean)}
              />
              <Label htmlFor="ot-vitamin-b12">Vitamin B12 levels</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-wilson-disease"
                checked={data.otWilsonDisease || false}
                onCheckedChange={(checked) => handleCheckboxChange('otWilsonDisease', checked as boolean)}
              />
              <Label htmlFor="ot-wilson-disease">Diagnostic studies to exclude Wilson's disease (e.g., serum ceruloplasmin)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-dopamine-transporter"
                checked={data.otDopamineTransporter || false}
                onCheckedChange={(checked) => handleCheckboxChange('otDopamineTransporter', checked as boolean)}
              />
              <Label htmlFor="ot-dopamine-transporter">Dopamine transporter imaging (to rule out Parkinson's disease)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-brain-mri"
                checked={data.otBrainMri || false}
                onCheckedChange={(checked) => handleCheckboxChange('otBrainMri', checked as boolean)}
              />
              <Label htmlFor="ot-brain-mri">Brain MRI (to rule out structural causes: pontine/midbrain lesions, cerebellar atrophy)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ot-spinal-mri"
                checked={data.otSpinalMri || false}
                onCheckedChange={(checked) => handleCheckboxChange('otSpinalMri', checked as boolean)}
              />
              <Label htmlFor="ot-spinal-mri">Spinal MRI (in cases with bilateral pyramidal tract signs or sensory level)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="oiNotes">Additional Notes</Label>
        <Textarea
          id="oiNotes"
          value={data.oiNotes || ""}
          onChange={(e) => handleInputChange('oiNotes', e.target.value)}
          placeholder="Document any additional observations, findings, or clinical correlation..."
          rows={4}
        />
      </div>
    </div>
  );
};

export default OrthostaticIntoleranceSection;
