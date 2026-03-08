import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity } from "lucide-react";

interface AutonomicTestingSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const AutonomicTestingSection = ({ data, onUpdate }: AutonomicTestingSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Autonomic Testing — Finometer / Finapres Beat-to-Beat Recording
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Continuous non-invasive arterial pressure monitoring with beat-to-beat haemodynamic analysis
        </p>
      </div>

      <Alert className="bg-muted/50 border-muted-foreground/20">
        <Activity className="h-4 w-4" />
        <AlertTitle>Equipment</AlertTitle>
        <AlertDescription>
          Finometer / Finapres device with finger cuff for continuous BP, cardiac output (CO), 
          total peripheral resistance (TPR), and stroke volume (SV) measurement.
        </AlertDescription>
      </Alert>

      {/* Test performed */}
      <div>
        <Label className="text-base font-medium mb-3 block">Was Finometer beat-to-beat recording performed?</Label>
        <RadioGroup
          value={data.performed}
          onValueChange={(value) => onUpdate({ performed: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="finometer-yes" />
            <Label htmlFor="finometer-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="finometer-no" />
            <Label htmlFor="finometer-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {data.performed === 'yes' && (
        <>
          {/* Protocol */}
          <div>
            <Label className="text-base font-medium mb-3 block">Protocol Used</Label>
            <Select value={data.protocol || ''} onValueChange={(value) => onUpdate({ protocol: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supine-standing">Supine → Active Standing</SelectItem>
                <SelectItem value="supine-tilt">Supine → Head-up Tilt (60–70°)</SelectItem>
                <SelectItem value="valsalva">Valsalva Manoeuvre</SelectItem>
                <SelectItem value="deep-breathing">Deep Breathing (6 breaths/min)</SelectItem>
                <SelectItem value="isometric-handgrip">Isometric Handgrip</SelectItem>
                <SelectItem value="cold-pressor">Cold Pressor Test</SelectItem>
                <SelectItem value="combined">Combined Protocol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Baseline haemodynamics */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Baseline Haemodynamics (Supine)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">SBP (mmHg)</Label>
                <Input placeholder="e.g., 125" value={data.baselineSBP || ''} onChange={(e) => onUpdate({ baselineSBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">DBP (mmHg)</Label>
                <Input placeholder="e.g., 78" value={data.baselineDBP || ''} onChange={(e) => onUpdate({ baselineDBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Heart Rate (bpm)</Label>
                <Input placeholder="e.g., 72" value={data.baselineHR || ''} onChange={(e) => onUpdate({ baselineHR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Cardiac Output (L/min)</Label>
                <Input placeholder="e.g., 5.2" value={data.baselineCO || ''} onChange={(e) => onUpdate({ baselineCO: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Stroke Volume (mL)</Label>
                <Input placeholder="e.g., 72" value={data.baselineSV || ''} onChange={(e) => onUpdate({ baselineSV: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">TPR (dyn·s/cm⁵)</Label>
                <Input placeholder="e.g., 1200" value={data.baselineTPR || ''} onChange={(e) => onUpdate({ baselineTPR: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Nadir / Stress haemodynamics */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Nadir / Stress Haemodynamics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">Lowest SBP (mmHg)</Label>
                <Input placeholder="e.g., 82" value={data.nadirSBP || ''} onChange={(e) => onUpdate({ nadirSBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Lowest DBP (mmHg)</Label>
                <Input placeholder="e.g., 50" value={data.nadirDBP || ''} onChange={(e) => onUpdate({ nadirDBP: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Max HR (bpm)</Label>
                <Input placeholder="e.g., 110" value={data.maxHR || ''} onChange={(e) => onUpdate({ maxHR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min CO (L/min)</Label>
                <Input placeholder="e.g., 3.1" value={data.nadirCO || ''} onChange={(e) => onUpdate({ nadirCO: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min SV (mL)</Label>
                <Input placeholder="e.g., 40" value={data.nadirSV || ''} onChange={(e) => onUpdate({ nadirSV: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Min TPR (dyn·s/cm⁵)</Label>
                <Input placeholder="e.g., 600" value={data.nadirTPR || ''} onChange={(e) => onUpdate({ nadirTPR: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Time to nadir (min)</Label>
                <Input placeholder="e.g., 3" value={data.timeToNadir || ''} onChange={(e) => onUpdate({ timeToNadir: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Baroreflex sensitivity */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Baroreflex Sensitivity (BRS)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">BRS (ms/mmHg)</Label>
                <Input placeholder="e.g., 12" value={data.brs || ''} onChange={(e) => onUpdate({ brs: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">BRS Interpretation</Label>
                <Select value={data.brsInterpretation || ''} onValueChange={(value) => onUpdate({ brsInterpretation: value })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Heart Rate Variability */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-foreground">Heart Rate Variability (HRV)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">LF Power (ms²)</Label>
                <Input placeholder="e.g., 800" value={data.lfPower || ''} onChange={(e) => onUpdate({ lfPower: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">HF Power (ms²)</Label>
                <Input placeholder="e.g., 400" value={data.hfPower || ''} onChange={(e) => onUpdate({ hfPower: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">LF/HF Ratio</Label>
                <Input placeholder="e.g., 2.0" value={data.lfHfRatio || ''} onChange={(e) => onUpdate({ lfHfRatio: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Autonomic pattern interpretation */}
          <div>
            <Label className="text-base font-medium mb-3 block">Autonomic Response Pattern</Label>
            <RadioGroup
              value={data.responsePattern || ''}
              onValueChange={(value) => onUpdate({ responsePattern: value })}
              className="space-y-3"
            >
              {[
                { value: "normal", label: "Normal autonomic response" },
                { value: "classic-oh", label: "Classic Orthostatic Hypotension (sustained SBP drop ≥20 mmHg within 3 min)" },
                { value: "initial-oh", label: "Initial Orthostatic Hypotension (transient SBP drop >40 mmHg within 15 s)" },
                { value: "delayed-oh", label: "Delayed Orthostatic Hypotension (progressive SBP drop after 3 min)" },
                { value: "vasodepressor", label: "Vasodepressor pattern (TPR drop, maintained CO)" },
                { value: "cardioinhibitory", label: "Cardioinhibitory pattern (HR drop, CO drop)" },
                { value: "mixed", label: "Mixed pattern (both vasodepressor + cardioinhibitory)" },
                { value: "pots", label: "POTS pattern (HR rise ≥30 bpm or >120 bpm within 10 min, no significant BP drop)" },
                { value: "autonomic-failure", label: "Autonomic Failure (progressive BP drop, no compensatory HR rise)" },
              ].map((item) => (
                <div key={item.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={item.value} id={`pattern-${item.value}`} className="mt-1" />
                  <Label htmlFor={`pattern-${item.value}`} className="font-normal cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Valsalva phases */}
          <div>
            <Label className="text-base font-medium mb-3 block">Valsalva Manoeuvre Phases (if performed)</Label>
            <div className="space-y-3">
              {[
                { id: "valsalva-performed", label: "Valsalva manoeuvre performed" },
                { id: "valsalva-phase2-late-absent", label: "Late Phase II recovery absent (sympathetic failure)" },
                { id: "valsalva-phase4-absent", label: "Phase IV overshoot absent (baroreflex failure)" },
                { id: "valsalva-flat-top", label: "Flat-top pattern (adrenergic failure)" },
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

          {/* Symptoms during test */}
          <div>
            <Label className="text-base font-medium mb-3 block">Symptoms During Testing</Label>
            <div className="space-y-3">
              {[
                { id: "symptom-dizziness", label: "Dizziness / lightheadedness" },
                { id: "symptom-presyncope", label: "Pre-syncope" },
                { id: "symptom-syncope", label: "Syncope during test" },
                { id: "symptom-palpitations", label: "Palpitations" },
                { id: "symptom-visual", label: "Visual disturbances (greying/blacking out)" },
                { id: "symptom-nausea", label: "Nausea" },
                { id: "symptom-diaphoresis", label: "Diaphoresis" },
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
            <Label htmlFor="autonomic-notes" className="text-base font-medium mb-3 block">Clinical Notes</Label>
            <Textarea
              id="autonomic-notes"
              placeholder="Additional observations, beat-to-beat waveform comments, cerebral autoregulation findings..."
              value={data.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AutonomicTestingSection;
