import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ChecklistLink from "@/components/ChecklistLink";

interface OnsetSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const OnsetSection = ({ data, onUpdate }: OnsetSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Onset of the Attack
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Symptoms experienced at the beginning of the episode
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium mb-1 block">Symptoms at Onset</Label>
          <ChecklistLink label="Check ECG Flags" className="text-sunset-orange hover:text-sunset-red" />
        </div>
          <div className="space-y-3">
            {[
              { id: "nausea", label: "Nausea" },
              { id: "vomiting", label: "Vomiting" },
              { id: "abdominal-discomfort", label: "Abdominal discomfort" },
              { id: "feeling-cold", label: "Feeling of cold" },
              { id: "sweating", label: "Sweating" },
              { id: "aura", label: "Aura" },
              { id: "neck-shoulder-pain", label: "Pain in neck or shoulders" },
              { id: "blurred-vision", label: "Blurred vision" },
              { id: "dizziness", label: "Dizziness" },
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

        <div>
          <Label htmlFor="onset-notes" className="text-base font-medium mb-3 block">
            Additional Details
          </Label>
          <Textarea
            id="onset-notes"
            placeholder="Describe the sequence and severity of symptoms..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default OnsetSection;
