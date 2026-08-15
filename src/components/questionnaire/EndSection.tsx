import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ChecklistLink from "@/components/ChecklistLink";

interface EndSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const EndSection = ({ data, onUpdate }: EndSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          End of the Attack
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Symptoms and observations following the episode
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium mb-1 block">Post-Episode Symptoms</Label>
          <ChecklistLink label="Check Arrhythmia Flags" className="text-sunset-orange hover:text-sunset-red" />
        </div>
        <div className="space-y-3">
          {[
            { id: "post-nausea", label: "Nausea" },
            { id: "post-vomiting", label: "Vomiting" },
            { id: "post-sweating", label: "Sweating" },
            { id: "post-cold", label: "Feeling of cold" },
            { id: "confusion", label: "Confusion" },
            { id: "muscle-aches", label: "Muscle aches" },
            { id: "chest-pain", label: "Chest pain" },
            { id: "palpitations", label: "Palpitations" },
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
        <Label className="text-base font-medium mb-3 block">Skin Color</Label>
        <div className="space-y-3">
          {[
            { id: "post-pallor", label: "Pallor (pale)" },
            { id: "post-flushing", label: "Flushing (red)" },
            { id: "normal-color", label: "Normal color" },
          ].map((color) => (
            <div key={color.id} className="flex items-center space-x-2">
              <Checkbox
                id={color.id}
                checked={data[color.id] || false}
                onCheckedChange={(checked) => onUpdate({ [color.id]: checked })}
              />
              <Label htmlFor={color.id} className="font-normal cursor-pointer">
                {color.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Incontinence</Label>
        <div className="space-y-3">
          {[
            { id: "urinary-incontinence", label: "Urinary incontinence" },
            { id: "faecal-incontinence", label: "Faecal incontinence" },
          ].map((incontinence) => (
            <div key={incontinence.id} className="flex items-center space-x-2">
              <Checkbox
                id={incontinence.id}
                checked={data[incontinence.id] || false}
                onCheckedChange={(checked) => onUpdate({ [incontinence.id]: checked })}
              />
              <Label htmlFor={incontinence.id} className="font-normal cursor-pointer">
                {incontinence.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Injury Assessment</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="end-injury"
            checked={data.injury || false}
            onCheckedChange={(checked) => onUpdate({ injury: checked })}
          />
          <Label htmlFor="end-injury" className="font-normal cursor-pointer">
            Injury sustained during or after episode
          </Label>
        </div>
      </div>

      <div>
        <Label htmlFor="end-notes" className="text-base font-medium mb-3 block">
          Recovery Details
        </Label>
        <Textarea
          id="end-notes"
          placeholder="Describe recovery time, clarity of consciousness, and any other relevant details..."
          value={data.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default EndSection;