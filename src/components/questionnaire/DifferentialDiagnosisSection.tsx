import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DifferentialDiagnosisSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const DifferentialDiagnosisSection = ({ data, onUpdate }: DifferentialDiagnosisSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Differential Diagnosis
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Systematic evaluation of syncope causes and non-syncopal mimics
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Distinguish true syncope (transient loss of consciousness with loss of postural tone) 
          from non-syncopal attacks that may mimic syncope.
        </AlertDescription>
      </Alert>

      {/* True Syncope Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Causes of True Syncope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Neurally-mediated (reflex) */}
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold text-foreground mb-3">Neurally-Mediated (Reflex)</h4>
            <Alert className="mb-4 border-primary/40 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Evaluation:</strong> When the initial evaluation suggests reflex syncope, additional testing
                includes <strong>head-up tilt-table testing</strong> and <strong>carotid sinus massage</strong> (per
                ACC–AHA–HRS guidelines). Carotid sinus massage is especially important in patients &gt;40 years and
                should be performed in both supine and upright positions.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <div className="font-medium text-sm">Vasovagal Syncope (Common Faint)</div>
              <div className="ml-4 space-y-2">
                {[
                  { id: "vasovagal-classical", label: "Classical" },
                  { id: "vasovagal-non-classical", label: "Non-classical" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mt-3">
                {[
                  { id: "carotid-sinus", label: "Carotid sinus syncope" },
                  { id: "glossopharyngeal", label: "Glossopharyngeal neuralgia" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="font-medium text-sm mt-3">Situational Syncope</div>
              <div className="ml-4 space-y-2">
                {[
                  { id: "situation-hemorrhage", label: "Acute haemorrhage" },
                  { id: "situation-cough", label: "Cough, sneeze" },
                  { id: "situation-gi", label: "Gastrointestinal stimulation (swallow, defaecation, visceral pain)" },
                  { id: "situation-micturition", label: "Micturition (post-micturition)" },
                  { id: "situation-post-exercise", label: "Post-exercise" },
                  { id: "situation-post-prandial", label: "Post-prandial" },
                  { id: "situation-other", label: "Others (brass instrument playing, weightlifting)" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orthostatic Hypotension */}
          <div className="border-l-4 border-accent pl-4">
            <h4 className="font-semibold text-foreground mb-3">Orthostatic Hypotension</h4>
            <div className="space-y-3">
              <div className="font-medium text-sm">Autonomic Failure</div>
              <div className="ml-4 space-y-2">
                {[
                  { id: "autonomic-primary", label: "Primary autonomic failure syndromes (pure autonomic failure, MSA, Parkinson's with autonomic failure)" },
                  { id: "autonomic-secondary", label: "Secondary autonomic failure (diabetic neuropathy, amyloid neuropathy)" },
                  { id: "oh-post-exercise", label: "Post-exercise" },
                  { id: "oh-post-prandial", label: "Post-prandial" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { id: "drug-induced-oh", label: "Drug (and alcohol)-induced orthostatic syncope" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="font-medium text-sm mt-2">Volume Depletion</div>
              <div className="ml-4 space-y-2">
                {[
                  { id: "volume-hemorrhage", label: "Haemorrhage" },
                  { id: "volume-diarrhea", label: "Diarrhoea" },
                  { id: "volume-addisons", label: "Addison's disease" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={data[item.id] || false}
                      onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cardiac Arrhythmias */}
          <div className="border-l-4 border-destructive pl-4">
            <h4 className="font-semibold text-foreground mb-3">Cardiac Arrhythmias (Primary Cause)</h4>
            <div className="space-y-2">
              {[
                { id: "sinus-node-dysfunction", label: "Sinus node dysfunction (including brady/tachy syndrome)" },
                { id: "av-conduction-disease", label: "Atrioventricular conduction system disease" },
                { id: "paroxysmal-tachy", label: "Paroxysmal supraventricular and ventricular tachycardias" },
                { id: "inherited-syndromes", label: "Inherited syndromes (long QT, Brugada)" },
                { id: "device-malfunction", label: "Implanted device (pacemaker, ICD) malfunction" },
                { id: "drug-proarrhythmia", label: "Drug-induced proarrhythmias" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Structural Cardiac */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-semibold text-foreground mb-3">Structural Cardiac/Cardiopulmonary Disease</h4>
            <div className="space-y-2">
              {[
                { id: "valvular-disease", label: "Cardiac valvular disease" },
                { id: "acute-mi", label: "Acute myocardial infarction/ischaemia" },
                { id: "obstructive-cm", label: "Obstructive cardiomyopathy" },
                { id: "atrial-myxoma", label: "Atrial myxoma" },
                { id: "aortic-dissection", label: "Acute aortic dissection" },
                { id: "pericardial-disease", label: "Pericardial disease/tamponade" },
                { id: "pulmonary-embolus", label: "Pulmonary embolus/pulmonary hypertension" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cerebrovascular */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-foreground mb-3">Cerebrovascular</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vascular-steal"
                  checked={data["vascular-steal"] || false}
                  onCheckedChange={(checked) => onUpdate({ "vascular-steal": checked })}
                />
                <Label htmlFor="vascular-steal" className="font-normal cursor-pointer text-sm">
                  Vascular steal syndromes (e.g., subclavian steal)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bow-hunter"
                  checked={data["bow-hunter"] || false}
                  onCheckedChange={(checked) => onUpdate({ "bow-hunter": checked })}
                />
                <Label htmlFor="bow-hunter" className="font-normal cursor-pointer text-sm">
                  Bow-Hunter syndrome
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tia"
                  checked={data["tia"] || false}
                  onCheckedChange={(checked) => onUpdate({ "tia": checked })}
                />
                <Label htmlFor="tia" className="font-normal cursor-pointer text-sm">
                  TIA (Transient Ischemic Attack)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-Syncopal Attacks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Non-Syncopal Attacks (Commonly Misdiagnosed as Syncope)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Without impairment of consciousness */}
          <div className="border-l-4 border-muted pl-4">
            <h4 className="font-semibold text-foreground mb-3">
              Disorders Without Any Impairment of Consciousness
            </h4>
            <div className="space-y-2">
              {[
                { id: "falls", label: "Falls" },
                { id: "cataplexy", label: "Cataplexy" },
                { id: "drop-attacks", label: "Drop attacks" },
                { id: "psychogenic-pseudo", label: "Psychogenic pseudo-syncope" },
                { id: "tia-carotid", label: "Transient ischaemic attacks (TIA) of carotid origin" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* With impairment of consciousness */}
          <div className="border-l-4 border-muted pl-4">
            <h4 className="font-semibold text-foreground mb-3">
              Disorders With Partial or Complete Loss of Consciousness
            </h4>
            <div className="space-y-2">
              {[
                { id: "metabolic-disorders", label: "Metabolic disorders (hypoglycaemia, hypoxia, hyperventilation with hypocapnia)" },
                { id: "epilepsy", label: "Epilepsy" },
                { id: "intoxications", label: "Intoxications" },
                { id: "tia-vertebrobasilar", label: "Vertebro-basilar transient ischaemic attack" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={data[item.id] || false}
                    onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                  />
                  <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Working Diagnosis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Primary Diagnosis Classification
            </Label>
            <RadioGroup
              value={data.primaryDiagnosis}
              onValueChange={(value) => onUpdate({ primaryDiagnosis: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true-syncope" id="true-syncope" />
                <Label htmlFor="true-syncope" className="font-normal cursor-pointer">
                  True Syncope
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-syncopal" id="non-syncopal" />
                <Label htmlFor="non-syncopal" className="font-normal cursor-pointer">
                  Non-Syncopal Attack
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="uncertain" id="uncertain-diagnosis" />
                <Label htmlFor="uncertain-diagnosis" className="font-normal cursor-pointer">
                  Uncertain - Requires Further Evaluation
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="differential-notes" className="text-sm font-medium mb-2 block">
              Differential Diagnosis Reasoning
            </Label>
            <Textarea
              id="differential-notes"
              placeholder="Document clinical reasoning, ruling in/out specific diagnoses, and planned investigations..."
              value={data.notes || ""}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DifferentialDiagnosisSection;
