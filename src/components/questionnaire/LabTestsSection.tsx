import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface LabTestsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const LabTestsSection = ({ data, onUpdate }: LabTestsSectionProps) => {
  const labTests = [
    {
      category: "Thyroid Function",
      tests: [
        { 
          id: "tsh", 
          label: "TSH (Thyroid Stimulating Hormone)",
          description: "Hyperthyroidism can cause palpitations, atrial fibrillation; hypothyroidism can cause bradycardia",
          hasValue: true,
        },
        { 
          id: "free-t4", 
          label: "Free T4",
          description: "Confirms thyroid dysfunction suspected from TSH",
          hasValue: true,
        },
        { 
          id: "free-t3", 
          label: "Free T3",
          description: "Useful in suspected T3 toxicosis",
          hasValue: true,
        },
      ],
    },
    {
      category: "Electrolytes & Metabolic",
      tests: [
        { 
          id: "sodium", 
          label: "Sodium (Na+)",
          description: "Hyponatremia can cause confusion, seizures, altered mental status",
          hasValue: true,
        },
        { 
          id: "potassium", 
          label: "Potassium (K+)",
          description: "Hypokalemia/hyperkalemia can cause arrhythmias and muscle weakness",
          hasValue: true,
        },
        { 
          id: "calcium", 
          label: "Calcium (Ca2+)",
          description: "Hypocalcemia can cause QT prolongation; hypercalcemia can cause short QT, arrhythmias",
          hasValue: true,
        },
        { 
          id: "magnesium", 
          label: "Magnesium (Mg2+)",
          description: "Hypomagnesemia associated with arrhythmias and QT prolongation",
          hasValue: true,
        },
        { 
          id: "glucose", 
          label: "Glucose",
          description: "Hypoglycemia is a common reversible cause of syncope and altered consciousness",
          hasValue: true,
        },
      ],
    },
    {
      category: "Hematological",
      tests: [
        { 
          id: "hemoglobin", 
          label: "Hemoglobin / Hematocrit",
          description: "Anemia reduces oxygen-carrying capacity, contributing to syncope",
          hasValue: true,
        },
        { 
          id: "b12", 
          label: "Vitamin B12",
          description: "B12 deficiency can cause neuropathy, autonomic dysfunction, and cognitive impairment",
          hasValue: true,
        },
        { 
          id: "folate", 
          label: "Folate",
          description: "Folate deficiency associated with anemia and neurological symptoms",
          hasValue: true,
        },
      ],
    },
    {
      category: "Cardiac Biomarkers",
      tests: [
        { 
          id: "troponin", 
          label: "Troponin I/T",
          description: "Elevated in acute coronary syndrome which may present with syncope",
          hasValue: true,
        },
        { 
          id: "bnp", 
          label: "BNP / NT-proBNP",
          description: "Elevated in heart failure, which can contribute to syncope",
          hasValue: true,
        },
      ],
    },
    {
      category: "Other Tests",
      tests: [
        { 
          id: "creatinine", 
          label: "Creatinine / eGFR",
          description: "Renal function affects electrolyte balance and drug metabolism",
          hasValue: true,
        },
        { 
          id: "d-dimer", 
          label: "D-Dimer",
          description: "When pulmonary embolism suspected as cause of syncope",
          hasValue: true,
        },
        { 
          id: "cortisol", 
          label: "Cortisol / ACTH",
          description: "Adrenal insufficiency can cause hypotension and syncope",
          hasValue: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Laboratory Tests
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Document laboratory investigations that may contribute to syncope diagnosis
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Laboratory tests help identify metabolic, hematological, and endocrine causes of syncope. 
          Electrolyte imbalances and thyroid dysfunction are particularly important reversible causes.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {labTests.map((category) => (
          <div key={category.category} className="border rounded-lg p-6 bg-card">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {category.category}
            </h4>
            
            <div className="space-y-4">
              {category.tests.map((test) => (
                <div 
                  key={test.id} 
                  className="border rounded-md p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <Checkbox
                      id={test.id}
                      checked={data[test.id]?.performed || false}
                      onCheckedChange={(checked) => 
                        onUpdate({ 
                          [test.id]: { 
                            ...data[test.id],
                            performed: checked 
                          } 
                        })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={test.id} className="font-medium cursor-pointer block">
                        {test.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.description}
                      </p>
                    </div>
                  </div>
                  
                  {test.hasValue && data[test.id]?.performed && (
                    <div className="ml-7 mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`${test.id}-value`} className="text-xs text-muted-foreground">
                            Result Value
                          </Label>
                          <Input
                            id={`${test.id}-value`}
                            placeholder="Enter value"
                            value={data[test.id]?.value || ""}
                            onChange={(e) =>
                              onUpdate({
                                [test.id]: {
                                  ...data[test.id],
                                  value: e.target.value,
                                },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${test.id}-unit`} className="text-xs text-muted-foreground">
                            Unit
                          </Label>
                          <Input
                            id={`${test.id}-unit`}
                            placeholder="e.g., mIU/L, mmol/L"
                            value={data[test.id]?.unit || ""}
                            onChange={(e) =>
                              onUpdate({
                                [test.id]: {
                                  ...data[test.id],
                                  unit: e.target.value,
                                },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`${test.id}-reference`} className="text-xs text-muted-foreground">
                          Reference Range / Interpretation
                        </Label>
                        <Input
                          id={`${test.id}-reference`}
                          placeholder="e.g., Normal range: 0.4-4.0 mIU/L"
                          value={data[test.id]?.reference || ""}
                          onChange={(e) =>
                            onUpdate({
                              [test.id]: {
                                ...data[test.id],
                                reference: e.target.value,
                              },
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <Label htmlFor="lab-tests-summary" className="text-sm font-medium mb-2 block">
          Laboratory Results Summary & Clinical Interpretation
        </Label>
        <Textarea
          id="lab-tests-summary"
          placeholder="Summarize key laboratory findings and their clinical significance in the context of syncope evaluation..."
          value={data.labTestsSummary || ""}
          onChange={(e) => onUpdate({ labTestsSummary: e.target.value })}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default LabTestsSection;
