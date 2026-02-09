import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface AttackSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const AttackSection = ({ data, onUpdate }: AttackSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          During the Attack (Eyewitness Account)
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Observations from witnesses present during the episode
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-3 block">Way of Falling</Label>
          <RadioGroup
            value={data.falling}
            onValueChange={(value) => onUpdate({ falling: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="slumping" id="slumping" />
              <Label htmlFor="slumping" className="font-normal cursor-pointer">Slumping</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kneeling" id="kneeling" />
              <Label htmlFor="kneeling" className="font-normal cursor-pointer">Kneeling over</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sudden-collapse" id="sudden-collapse" />
              <Label htmlFor="sudden-collapse" className="font-normal cursor-pointer">Sudden collapse</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Skin Color Changes</Label>
          <div className="space-y-3">
            {[
              { id: "pallor", label: "Pallor (pale)" },
              { id: "cyanosis", label: "Cyanosis (blue/purple)" },
              { id: "flushing", label: "Flushing (red)" },
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
          <Label htmlFor="loc-duration" className="text-base font-medium mb-3 block">
            Duration of Loss of Consciousness
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="loc-duration"
              type="number"
              placeholder="Enter duration"
              value={data.locDuration || ""}
              onChange={(e) => onUpdate({ locDuration: e.target.value })}
              className="max-w-[150px]"
            />
            <span className="text-muted-foreground">minutes/seconds</span>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Breathing Pattern</Label>
          <div className="space-y-3">
            {[
              { id: "snoring", label: "Snoring" },
              { id: "irregular-breathing", label: "Irregular breathing" },
              { id: "gasping", label: "Gasping" },
            ].map((pattern) => (
              <div key={pattern.id} className="flex items-center space-x-2">
                <Checkbox
                  id={pattern.id}
                  checked={data[pattern.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [pattern.id]: checked })}
                />
                <Label htmlFor={pattern.id} className="font-normal cursor-pointer">
                  {pattern.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Movement Types</Label>
          <div className="space-y-3">
            {[
              { id: "tonic", label: "Tonic (sustained muscle contraction)" },
              { id: "clonic", label: "Clonic (rhythmic jerking)" },
              { id: "tonic-clonic", label: "Tonic-clonic (both)" },
              { id: "minimal-myoclonus", label: "Minimal myoclonus (brief twitches)" },
              { id: "automatism", label: "Automatism (repetitive purposeless movements)" },
            ].map((movement) => (
              <div key={movement.id} className="flex items-center space-x-2">
                <Checkbox
                  id={movement.id}
                  checked={data[movement.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [movement.id]: checked })}
                />
                <Label htmlFor={movement.id} className="font-normal cursor-pointer">
                  {movement.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="movement-duration" className="text-base font-medium mb-3 block">
            Duration of Movements
          </Label>
          <Input
            id="movement-duration"
            placeholder="Describe duration of movements"
            value={data.movementDuration || ""}
            onChange={(e) => onUpdate({ movementDuration: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Movement Onset</Label>
          <RadioGroup
            value={data.movementOnset}
            onValueChange={(value) => onUpdate({ movementOnset: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="before-fall" id="before-fall" />
              <Label htmlFor="before-fall" className="font-normal cursor-pointer">Before fall</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="during-fall" id="during-fall" />
              <Label htmlFor="during-fall" className="font-normal cursor-pointer">During fall</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="after-fall" id="after-fall" />
              <Label htmlFor="after-fall" className="font-normal cursor-pointer">After fall</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Other Observations</Label>
          <div className="space-y-3">
            {[
              { id: "tongue-biting", label: "Tongue biting" },
              { id: "injury", label: "Injury during fall" },
            ].map((observation) => (
              <div key={observation.id} className="flex items-center space-x-2">
                <Checkbox
                  id={observation.id}
                  checked={data[observation.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [observation.id]: checked })}
                />
                <Label htmlFor={observation.id} className="font-normal cursor-pointer">
                  {observation.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="attack-notes" className="text-base font-medium mb-3 block">
            Eyewitness Description
          </Label>
          <Textarea
            id="attack-notes"
            placeholder="Record detailed eyewitness account of the episode..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
};

export default AttackSection;
