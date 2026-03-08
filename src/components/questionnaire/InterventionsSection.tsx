import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

interface InterventionsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const InterventionsSection = ({ data, onUpdate }: InterventionsSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Interventions & Management Plan
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Recommended and initiated interventions based on diagnosis
        </p>
      </div>

      {/* Non-pharmacological */}
      <div>
        <Label className="text-base font-medium mb-3 block">Non-Pharmacological Interventions</Label>
        <div className="space-y-3">
          {[
            { id: "int-education", label: "Patient education on syncope mechanism and prognosis" },
            { id: "int-hydration", label: "Increased fluid intake (2–3 L/day) and salt supplementation (6–10 g/day)" },
            { id: "int-counter-pressure", label: "Physical counter-pressure manoeuvres (PCM) training" },
            { id: "int-tilt-training", label: "Tilt training (progressive standing protocol)" },
            { id: "int-compression", label: "Compression stockings / abdominal binder" },
            { id: "int-sleep-elevation", label: "Head-up sleeping (10–20° elevation)" },
            { id: "int-avoid-triggers", label: "Trigger avoidance counselling" },
            { id: "int-driving", label: "Driving restriction advice given" },
            { id: "int-exercise", label: "Exercise programme (aerobic reconditioning)" },
            { id: "int-fall-prevention", label: "Fall prevention strategies" },
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

      {/* Pharmacological */}
      <div>
        <Label className="text-base font-medium mb-3 block">Pharmacological Interventions</Label>
        <div className="space-y-3">
          {[
            { id: "drug-midodrine", label: "Midodrine (α1-agonist)" },
            { id: "drug-fludrocortisone", label: "Fludrocortisone (mineralocorticoid)" },
            { id: "drug-droxidopa", label: "Droxidopa (norepinephrine prodrug)" },
            { id: "drug-pyridostigmine", label: "Pyridostigmine (cholinesterase inhibitor)" },
            { id: "drug-ivabradine", label: "Ivabradine (for IST / POTS)" },
            { id: "drug-beta-blocker", label: "Beta-blocker (for selected arrhythmias)" },
            { id: "drug-ssri", label: "SSRI (for vasovagal syncope)" },
            { id: "drug-octreotide", label: "Octreotide (post-prandial hypotension)" },
            { id: "drug-desmopressin", label: "Desmopressin (nocturnal polyuria)" },
            { id: "drug-erythropoietin", label: "Erythropoietin (for anaemia-related autonomic failure)" },
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

      <div>
        <Label htmlFor="drug-details" className="text-sm mb-1 block">Drug Details (dose, frequency)</Label>
        <Input
          id="drug-details"
          placeholder="e.g., Midodrine 5 mg TDS, Fludrocortisone 100 µg OD"
          value={data.drugDetails || ''}
          onChange={(e) => onUpdate({ drugDetails: e.target.value })}
        />
      </div>

      <Separator />

      {/* Device / Procedural */}
      <div>
        <Label className="text-base font-medium mb-3 block">Device / Procedural Interventions</Label>
        <div className="space-y-3">
          {[
            { id: "device-pacemaker", label: "Cardiac pacemaker (for cardioinhibitory syncope / CSS)" },
            { id: "device-icd", label: "Implantable Cardioverter-Defibrillator (ICD)" },
            { id: "device-ilr", label: "Implantable Loop Recorder (ILR) for monitoring" },
            { id: "device-catheter-ablation", label: "Catheter ablation (for arrhythmia)" },
            { id: "device-denervation", label: "Cardioneuroablation / Renal denervation" },
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

      {/* Medication review */}
      <div>
        <Label className="text-base font-medium mb-3 block">Medication Review</Label>
        <div className="space-y-3">
          {[
            { id: "med-review-polypharmacy", label: "Polypharmacy review — deprescribing hypotensive agents" },
            { id: "med-review-culprit", label: "Culprit medication identified and adjusted" },
            { id: "med-review-nitrates", label: "Nitrate / vasodilator dose reduced" },
            { id: "med-review-diuretics", label: "Diuretic dose adjusted" },
            { id: "med-review-psychotropics", label: "Psychotropic medication adjusted" },
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

      {/* Follow-up */}
      <div>
        <Label className="text-base font-medium mb-3 block">Follow-Up Plan</Label>
        <RadioGroup
          value={data.followUpPlan || ''}
          onValueChange={(value) => onUpdate({ followUpPlan: value })}
          className="space-y-2"
        >
          {[
            { value: "discharge", label: "Discharge with advice — no follow-up needed" },
            { value: "gp-followup", label: "GP / Primary care follow-up" },
            { value: "clinic-4w", label: "Specialist clinic review in 4 weeks" },
            { value: "clinic-3m", label: "Specialist clinic review in 3 months" },
            { value: "urgent", label: "Urgent referral (cardiology / neurology)" },
            { value: "admission", label: "Hospital admission for monitoring" },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <RadioGroupItem value={item.value} id={`followup-${item.value}`} />
              <Label htmlFor={`followup-${item.value}`} className="font-normal cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Management notes */}
      <div>
        <Label htmlFor="intervention-notes" className="text-base font-medium mb-3 block">Management Notes</Label>
        <Textarea
          id="intervention-notes"
          placeholder="Additional management details, referral plans, patient-specific considerations..."
          value={data.interventionNotes || ''}
          onChange={(e) => onUpdate({ interventionNotes: e.target.value })}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default InterventionsSection;
