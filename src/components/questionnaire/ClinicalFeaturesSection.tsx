import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ChecklistLink from "@/components/ChecklistLink";

interface ClinicalFeaturesSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const ClinicalFeaturesSection = ({ data, onUpdate }: ClinicalFeaturesSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Clinical Features Assessment
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Identify features suggestive of specific syncope types
        </p>
      </div>

      <div className="space-y-6">
        {/* Neurally-mediated syncope */}
        <div className="border-l-4 border-primary pl-4">
          <h4 className="font-semibold text-foreground mb-3">Neurally-Mediated Syncope</h4>
          <div className="space-y-3">
            {[
              { id: "absence-cardiac", label: "Absence of cardiological disease" },
              { id: "long-history", label: "Long history of syncope" },
              { id: "unpleasant-stimuli", label: "After sudden unexpected unpleasant sight, sound, smell or pain" },
              { id: "prolonged-standing-hot", label: "Prolonged standing or crowded, hot places" },
              { id: "nausea-vomiting-syncope", label: "Nausea, vomiting associated with syncope" },
              { id: "during-meal", label: "During the meal or in the absorptive state after a meal" },
              { id: "head-rotation", label: "With head rotation, pressure on carotid sinus (tumours, shaving, tight collars)" },
              { id: "after-exertion-nm", label: "After exertion" },
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

        {/* Orthostatic hypotension */}
        <div className="border-l-4 border-accent pl-4">
          <h4 className="font-semibold text-foreground mb-3">Syncope Due to Orthostatic Hypotension</h4>
          <div className="space-y-3">
            {[
              { id: "after-standing", label: "After standing up" },
              { id: "medication-related", label: "Temporal relationship with start of medication leading to hypotension or changes of dosage" },
              { id: "prolonged-standing-oh", label: "Prolonged standing especially in crowded, hot places" },
              { id: "autonomic-neuropathy", label: "Presence of autonomic neuropathy or Parkinsonism" },
              { id: "after-exertion-oh", label: "After exertion" },
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

        {/* Cardiac syncope */}
        <div className="border-l-4 border-destructive pl-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">Cardiac Syncope</h4>
          </div>
          <div className="space-y-3">
            {[
              { id: "structural-heart", label: "Presence of definite structural heart disease" },
              { id: "during-exertion-supine", label: "During exertion, or supine" },
              { id: "preceded-palpitation", label: "Preceded by palpitation" },
              { id: "family-sudden-death", label: "Family history of sudden death" },
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

        {/* Cerebrovascular syncope */}
        <div className="border-l-4 border-muted-foreground pl-4">
          <h4 className="font-semibold text-foreground mb-3">Cerebrovascular Syncope</h4>
          <div className="space-y-3">
            {[
              { id: "arm-exercise", label: "With arm exercise" },
              { id: "bp-pulse-difference", label: "Differences in blood pressure or pulse in the two arms" },
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

        {/* Dumping Syndrome */}
        <div className="border-l-4 border-secondary pl-4">
          <h4 className="font-semibold text-foreground mb-3">Dumping Syndrome (Rapid Gastric Emptying)</h4>
          <div className="space-y-3">
            {[
              { id: "post-gastric-surgery", label: "History of gastric surgery" },
              { id: "symptoms-after-eating", label: "Symptoms occurring within 30 minutes after eating (early dumping)" },
              { id: "symptoms-1-3-hours", label: "Symptoms occurring 1-3 hours after eating (late dumping)" },
              { id: "high-carb-meals", label: "Symptoms worse after high carbohydrate meals" },
              { id: "abdominal-cramping", label: "Abdominal cramping and diarrhea with episodes" },
              { id: "sweating-weakness", label: "Sweating, weakness, and dizziness after meals" },
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
          <Label htmlFor="clinical-features-notes" className="text-base font-medium mb-3 block">
            Clinical Pattern Summary
          </Label>
          <Textarea
            id="clinical-features-notes"
            placeholder="Summarize the clinical pattern and likely syncope type based on features above..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ClinicalFeaturesSection;
