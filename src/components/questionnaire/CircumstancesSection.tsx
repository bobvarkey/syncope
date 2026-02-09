import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CircumstancesSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const CircumstancesSection = ({ data, onUpdate }: CircumstancesSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Circumstances Prior to the Attack
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Document the patient's position, activity, and environment before the episode
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-3 block">Position</Label>
          <RadioGroup
            value={data.position}
            onValueChange={(value) => onUpdate({ position: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supine" id="supine" />
              <Label htmlFor="supine" className="font-normal cursor-pointer">Supine (lying down)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sitting" id="sitting" />
              <Label htmlFor="sitting" className="font-normal cursor-pointer">Sitting</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standing" id="standing" />
              <Label htmlFor="standing" className="font-normal cursor-pointer">Standing</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Activity</Label>
          <div className="space-y-3">
            {[
              { id: "rest", label: "At rest" },
              { id: "posture-change", label: "Change in posture" },
              { id: "during-exercise", label: "During exercise" },
              { id: "after-exercise", label: "After exercise" },
              { id: "urination", label: "During or after urination" },
              { id: "defaecation", label: "During or after defaecation" },
              { id: "cough", label: "During or after cough" },
              { id: "swallowing", label: "During or after swallowing" },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={activity.id}
                  checked={data[activity.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [activity.id]: checked })}
                />
                <Label htmlFor={activity.id} className="font-normal cursor-pointer">
                  {activity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Predisposing Factors</Label>
          <div className="space-y-3">
            {[
              { id: "crowded-places", label: "Crowded places" },
              { id: "warm-places", label: "Warm places" },
              { id: "prolonged-standing", label: "Prolonged standing" },
              { id: "post-prandial", label: "Post-prandial period (after eating)" },
            ].map((factor) => (
              <div key={factor.id} className="flex items-center space-x-2">
                <Checkbox
                  id={factor.id}
                  checked={data[factor.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [factor.id]: checked })}
                />
                <Label htmlFor={factor.id} className="font-normal cursor-pointer">
                  {factor.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Precipitating Events</Label>
          <div className="space-y-3">
            {[
              { id: "fear", label: "Fear" },
              { id: "intense-pain", label: "Intense pain" },
              { id: "neck-movements", label: "Neck movements" },
            ].map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <Checkbox
                  id={event.id}
                  checked={data[event.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [event.id]: checked })}
                />
                <Label htmlFor={event.id} className="font-normal cursor-pointer">
                  {event.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="circumstances-notes" className="text-base font-medium mb-3 block">
            Additional Notes
          </Label>
          <Textarea
            id="circumstances-notes"
            placeholder="Document any other relevant circumstances..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default CircumstancesSection;
