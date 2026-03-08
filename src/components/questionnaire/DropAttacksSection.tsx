import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DropAttacksSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const DropAttacksSection = ({ data, onUpdate }: DropAttacksSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Drop Attacks — Clinical Workup
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Sudden falls without warning or with minimal prodrome; may or may not involve loss of consciousness
        </p>
      </div>

      <Alert className="bg-destructive/10 border-destructive/30">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle>Key Distinction</AlertTitle>
        <AlertDescription>
          Drop attacks may occur WITH or WITHOUT loss of consciousness. Carefully document awareness during the event to guide differential diagnosis.
        </AlertDescription>
      </Alert>

      {/* Awareness during event */}
      <div>
        <Label className="text-base font-medium mb-3 block">Awareness During the Drop</Label>
        <RadioGroup
          value={data.awareness || ''}
          onValueChange={(value) => onUpdate({ awareness: value })}
          className="space-y-2"
        >
          {[
            { value: "loc-present", label: "Loss of consciousness present" },
            { value: "loc-absent", label: "No loss of consciousness — patient fully aware during fall" },
            { value: "loc-uncertain", label: "Uncertain / unwitnessed" },
            { value: "brief-impairment", label: "Brief impairment of awareness (seconds)" },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <RadioGroupItem value={item.value} id={`awareness-${item.value}`} />
              <Label htmlFor={`awareness-${item.value}`} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Characteristics */}
      <div>
        <Label className="text-base font-medium mb-3 block">Drop Attack Characteristics</Label>
        <div className="space-y-3">
          {[
            { id: "da-sudden-onset", label: "Sudden onset without warning (no prodrome)" },
            { id: "da-legs-gave-way", label: "Legs suddenly 'gave way'" },
            { id: "da-forward-fall", label: "Forward fall (suggests postural/mechanical)" },
            { id: "da-backward-fall", label: "Backward fall" },
            { id: "da-lateral-fall", label: "Lateral fall" },
            { id: "da-no-trip", label: "No trip or environmental cause identified" },
            { id: "da-rapid-recovery", label: "Rapid recovery (able to get up immediately)" },
            { id: "da-injury", label: "Injury sustained during fall" },
            { id: "da-recurrent", label: "Recurrent episodes" },
            { id: "da-positional-trigger", label: "Triggered by head turning or neck extension" },
            { id: "da-exertional", label: "Exertional / during physical activity" },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={data[item.id] || false}
                onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
              />
              <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm mb-1 block">Frequency of episodes</Label>
          <Input
            placeholder="e.g., 3 per month"
            value={data.frequency || ''}
            onChange={(e) => onUpdate({ frequency: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Duration of each episode</Label>
          <Input
            placeholder="e.g., seconds, minutes"
            value={data.duration || ''}
            onChange={(e) => onUpdate({ duration: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* Differential for drop attacks */}
      <div>
        <Label className="text-base font-medium mb-3 block">Suspected Aetiology</Label>
        <RadioGroup
          value={data.suspectedAetiology || ''}
          onValueChange={(value) => onUpdate({ suspectedAetiology: value })}
          className="space-y-3"
        >
          {[
            { value: "vasovagal", label: "Vasovagal syncope (with minimal prodrome)" },
            { value: "cardiac-arrhythmia", label: "Cardiac arrhythmia (Stokes-Adams attack)" },
            { value: "orthostatic", label: "Orthostatic hypotension" },
            { value: "css", label: "Carotid sinus syndrome" },
            { value: "vertebrobasilar", label: "Vertebrobasilar insufficiency (VBI)" },
            { value: "epileptic-atonic", label: "Epileptic — atonic seizure / akinetic seizure" },
            { value: "epileptic-tonic", label: "Epileptic — tonic seizure with fall" },
            { value: "cataplexy", label: "Cataplexy (narcolepsy)" },
            { value: "meniere", label: "Ménière's disease / vestibular drop attack (Tumarkin)" },
            { value: "aortic-stenosis", label: "Aortic stenosis" },
            { value: "subclavian-steal", label: "Subclavian steal syndrome" },
            { value: "colloid-cyst", label: "Colloid cyst of 3rd ventricle (positional obstruction)" },
            { value: "nph", label: "Normal pressure hydrocephalus" },
            { value: "cryptogenic", label: "Cryptogenic / idiopathic drop attacks" },
            { value: "mechanical-msk", label: "Mechanical / musculoskeletal (knee buckling, gait disorder)" },
          ].map((item) => (
            <div key={item.value} className="flex items-start space-x-2">
              <RadioGroupItem value={item.value} id={`aetiology-${item.value}`} className="mt-1" />
              <Label htmlFor={`aetiology-${item.value}`} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Workup investigations */}
      <div>
        <Label className="text-base font-medium mb-3 block">Investigations Performed / Planned</Label>
        <div className="space-y-3">
          {[
            { id: "da-ecg", label: "12-lead ECG" },
            { id: "da-holter", label: "Holter / ambulatory ECG monitoring" },
            { id: "da-ilr", label: "Implantable loop recorder (ILR)" },
            { id: "da-echo", label: "Echocardiogram" },
            { id: "da-tilt-test", label: "Head-up tilt test" },
            { id: "da-csm", label: "Carotid sinus massage" },
            { id: "da-orthostatic-bp", label: "Active standing BP / Finometer" },
            { id: "da-eeg", label: "EEG" },
            { id: "da-mri-brain", label: "MRI Brain (posterior fossa / 3rd ventricle)" },
            { id: "da-mra-vertebral", label: "MRA / CTA vertebrobasilar circulation" },
            { id: "da-duplex-carotid", label: "Carotid / vertebral duplex ultrasound" },
            { id: "da-audiometry", label: "Audiometry / vestibular function tests" },
            { id: "da-sleep-study", label: "Polysomnography / MSLT (for narcolepsy/cataplexy)" },
            { id: "da-gait-analysis", label: "Gait and balance assessment" },
            { id: "da-bloods", label: "Blood tests (FBC, glucose, B12, thyroid)" },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={data[item.id] || false}
                onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
              />
              <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Red flags */}
      <div>
        <Label className="text-base font-medium mb-3 block text-destructive">Red Flags</Label>
        <div className="space-y-3">
          {[
            { id: "rf-exertional-drop", label: "Drop during exertion (cardiac cause until proven otherwise)" },
            { id: "rf-no-warning", label: "No warning at all (arrhythmia / structural cardiac)" },
            { id: "rf-family-scd", label: "Family history of sudden cardiac death" },
            { id: "rf-known-cardiac", label: "Known structural heart disease" },
            { id: "rf-head-injury", label: "Recurrent head / facial injury from falls" },
            { id: "rf-focal-neuro", label: "Focal neurological signs (posterior circulation)" },
            { id: "rf-pacemaker-malfunction", label: "Pacemaker / ICD in situ — ? malfunction" },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={data[item.id] || false}
                onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
              />
              <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="da-notes" className="text-base font-medium mb-3 block">Clinical Notes</Label>
        <Textarea
          id="da-notes"
          placeholder="Additional history, witness account, examination findings, working diagnosis..."
          value={data.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default DropAttacksSection;
