import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "lucide-react";

interface PatientInfoSectionProps {
  data: {
    name?: string;
    age?: string;
    sex?: string;
  };
  onUpdate: (data: any) => void;
}

const PatientInfoSection = ({ data, onUpdate }: PatientInfoSectionProps) => {
  const handleNameChange = (value: string) => {
    // Limit to 100 characters
    const sanitized = value.slice(0, 100);
    onUpdate({ name: sanitized });
  };

  const handleAgeChange = (value: string) => {
    // Only allow numbers, limit to 3 digits
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 3);
    const numValue = parseInt(sanitized);
    
    // Validate reasonable age range (0-120)
    if (sanitized === '' || (numValue >= 0 && numValue <= 120)) {
      onUpdate({ age: sanitized });
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 px-6 py-6 mb-6 rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Patient Information
        </h3>
        <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patient-name" className="text-sm font-medium">
            Patient Name
          </Label>
          <Input
            id="patient-name"
            type="text"
            placeholder="Enter patient name"
            value={data.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={100}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient-age" className="text-sm font-medium">
            Age (years)
          </Label>
          <Input
            id="patient-age"
            type="text"
            inputMode="numeric"
            placeholder="Enter age"
            value={data.age || ""}
            onChange={(e) => handleAgeChange(e.target.value)}
            maxLength={3}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Sex</Label>
          <RadioGroup
            value={data.sex || ""}
            onValueChange={(value) => onUpdate({ sex: value })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">
                Male
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">
                Female
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">
                Other
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoSection;
