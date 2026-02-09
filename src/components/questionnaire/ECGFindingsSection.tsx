import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import QTcCalculator from "./QTcCalculator";

interface ECGFindingsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const ECGFindingsSection = ({ data, onUpdate }: ECGFindingsSectionProps) => {
  const hasAbnormalities = Object.keys(data).some(
    key => key !== 'notes' && key !== 'ecgDetails' && data[key] === true
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          ECG Findings
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Document ECG abnormalities suggesting arrhythmic syncope
        </p>
      </div>

      {hasAbnormalities && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Abnormal ECG Findings Detected</AlertTitle>
          <AlertDescription>
            ECG abnormalities suggest possible arrhythmic syncope. Further cardiac evaluation recommended.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-3 block">Conduction Abnormalities</Label>
          <div className="space-y-3">
            {[
              { 
                id: "bifascicular-block", 
                label: "Bifascicular block (LBBB or RBBB + left anterior/posterior fascicular block)" 
              },
              { 
                id: "intraventricular-conduction", 
                label: "Other intraventricular conduction abnormalities (QRS duration ≥0.12 s)" 
              },
              { 
                id: "mobitz-i", 
                label: "Mobitz I second degree atrioventricular block" 
              },
              { 
                id: "mobitz-ii", 
                label: "Mobitz II second degree atrioventricular block" 
              },
              { 
                id: "third-degree-avb", 
                label: "Third degree atrioventricular block" 
              },
              { 
                id: "alternating-bbb", 
                label: "Alternating left and right bundle branch block" 
              },
            ].map((finding) => (
              <div key={finding.id} className="flex items-center space-x-2">
                <Checkbox
                  id={finding.id}
                  checked={data[finding.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [finding.id]: checked })}
                />
                <Label htmlFor={finding.id} className="font-normal cursor-pointer">
                  {finding.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Bradycardia and Pauses</Label>
          <div className="space-y-3">
            {[
              { 
                id: "sinus-bradycardia", 
                label: "Asymptomatic sinus bradycardia (<50 bpm) without negative chronotropic meds" 
              },
              { 
                id: "severe-bradycardia", 
                label: "Sinus bradycardia <40 bpm" 
              },
              { 
                id: "sinoatrial-block", 
                label: "Sinoatrial block or sinus pause ≥3 s" 
              },
              { 
                id: "repetitive-sa-blocks", 
                label: "Repetitive sinoatrial blocks" 
              },
            ].map((finding) => (
              <div key={finding.id} className="flex items-center space-x-2">
                <Checkbox
                  id={finding.id}
                  checked={data[finding.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [finding.id]: checked })}
                />
                <Label htmlFor={finding.id} className="font-normal cursor-pointer">
                  {finding.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Tachyarrhythmias</Label>
          <div className="space-y-3">
            {[
              { 
                id: "paroxysmal-svt", 
                label: "Rapid paroxysmal supraventricular tachycardia" 
              },
              { 
                id: "ventricular-tachycardia", 
                label: "Ventricular tachycardia" 
              },
              { 
                id: "pre-excited-qrs", 
                label: "Pre-excited QRS complexes (WPW pattern)" 
              },
            ].map((finding) => (
              <div key={finding.id} className="flex items-center space-x-2">
                <Checkbox
                  id={finding.id}
                  checked={data[finding.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [finding.id]: checked })}
                />
                <Label htmlFor={finding.id} className="font-normal cursor-pointer">
                  {finding.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Repolarization and Structural Abnormalities</Label>
          <div className="space-y-3">
            {[
              { 
                id: "prolonged-qt", 
                label: "Prolonged QT interval" 
              },
              { 
                id: "brugada-pattern", 
                label: "Brugada syndrome pattern (RBBB with ST-elevation in V1-V3)" 
              },
              { 
                id: "arvd-features", 
                label: "Features of ARVD (negative T waves in right precordial leads, epsilon waves, late potentials)" 
              },
              { 
                id: "mi-q-waves", 
                label: "Q waves suggesting myocardial infarction" 
              },
            ].map((finding) => (
              <div key={finding.id} className="flex items-center space-x-2">
                <Checkbox
                  id={finding.id}
                  checked={data[finding.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [finding.id]: checked })}
                />
                <Label htmlFor={finding.id} className="font-normal cursor-pointer">
                  {finding.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Device-Related</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pacemaker-malfunction"
              checked={data["pacemaker-malfunction"] || false}
              onCheckedChange={(checked) => onUpdate({ "pacemaker-malfunction": checked })}
            />
            <Label htmlFor="pacemaker-malfunction" className="font-normal cursor-pointer">
              Pacemaker malfunction with cardiac pauses
            </Label>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Ischemia</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acute-ischemia"
              checked={data["acute-ischemia"] || false}
              onCheckedChange={(checked) => onUpdate({ "acute-ischemia": checked })}
            />
            <Label htmlFor="acute-ischemia" className="font-normal cursor-pointer">
              ECG evidence of acute ischemia with or without myocardial infarction
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="ecg-details" className="text-base font-medium mb-3 block">
            Detailed ECG Findings
          </Label>
          <Textarea
            id="ecg-details"
            placeholder="Document specific ECG measurements, intervals, and morphology details..."
            value={data.ecgDetails || ""}
            onChange={(e) => onUpdate({ ecgDetails: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        <Separator className="my-8" />

        {/* QTc Calculator */}
        <QTcCalculator 
          onResultUpdate={(results) => onUpdate({ qtcResults: results })}
        />

        <Separator className="my-8" />

        <div>
          <Label htmlFor="ecg-notes" className="text-base font-medium mb-3 block">
            ECG Interpretation
          </Label>
          <Textarea
            id="ecg-notes"
            placeholder="Clinical significance and recommended follow-up based on ECG findings..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ECGFindingsSection;
