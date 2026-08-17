import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import ChecklistLink from "@/components/ChecklistLink";

interface BackgroundSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

const BackgroundSection = ({ data, onUpdate }: BackgroundSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Medical Background
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Patient history and relevant medical information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-3 block">Family History</Label>
          <div className="space-y-3">
            {[
              { id: "family-sudden-death", label: "Sudden death" },
              { id: "family-arrhythmia", label: "Congenital arrhythmogenic heart disease" },
              { id: "family-fainting", label: "Fainting episodes" },
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={data[item.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [item.id]: checked })}
                />
                <Label htmlFor={item.id} className="font-normal cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-medium">Previous Cardiac Disease</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cardiac-disease"
              checked={data.cardiacDisease || false}
              onCheckedChange={(checked) => onUpdate({ cardiacDisease: checked })}
            />
            <Label htmlFor="cardiac-disease" className="font-normal cursor-pointer">
              History of cardiac disease
            </Label>
          </div>
          {data.cardiacDisease && (
            <Textarea
              placeholder="Specify cardiac conditions..."
              value={data.cardiacDetails || ""}
              onChange={(e) => onUpdate({ cardiacDetails: e.target.value })}
              className="mt-3"
            />
          )}
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Neurological History</Label>
          <div className="space-y-3">
            {[
              { id: "parkinsonism", label: "Parkinsonism" },
              { id: "epilepsy", label: "Epilepsy" },
              { id: "narcolepsy", label: "Narcolepsy" },
            ].map((condition) => (
              <div key={condition.id} className="flex items-center space-x-2">
                <Checkbox
                  id={condition.id}
                  checked={data[condition.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [condition.id]: checked })}
                />
                <Label htmlFor={condition.id} className="font-normal cursor-pointer">
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Metabolic Disorders</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetes"
              checked={data.diabetes || false}
              onCheckedChange={(checked) => onUpdate({ diabetes: checked })}
            />
            <Label htmlFor="diabetes" className="font-normal cursor-pointer">
              Diabetes
            </Label>
          </div>
          <Textarea
            placeholder="Other metabolic disorders..."
            value={data.metabolicDetails || ""}
            onChange={(e) => onUpdate({ metabolicDetails: e.target.value })}
            className="mt-3"
          />
        </div>


        <div>
          <Label className="text-base font-medium mb-3 block">Current Medications</Label>
          <div className="space-y-3">
            {[
              { id: "antihypertensive", label: "Antihypertensive", qtRisk: false, cyp3a4: false },
              { id: "antianginal", label: "Antianginal", qtRisk: false, cyp3a4: false },
              { id: "antidepressant", label: "Antidepressant (SSRIs, TCAs)", qtRisk: true, cyp3a4: false },
              { id: "antiarrhythmic", label: "Antiarrhythmic (Class IA, IC, III)", qtRisk: true, cyp3a4: false },
              { id: "diuretics", label: "Diuretics", qtRisk: false, cyp3a4: false },
              { id: "antipsychotic", label: "Antipsychotic medications", qtRisk: true, cyp3a4: false },
              { id: "macrolide-antibiotic", label: "Macrolide antibiotics (Erythromycin, Clarithromycin, Azithromycin)", qtRisk: true, cyp3a4: false },
              { id: "fluoroquinolone", label: "Fluoroquinolone antibiotics (Levofloxacin, Moxifloxacin)", qtRisk: true, cyp3a4: false },
              { id: "antifungal", label: "Azole antifungals (Fluconazole, Ketoconazole, Itraconazole)", qtRisk: true, cyp3a4: true },
              { id: "antiemetic", label: "Antiemetics (Ondansetron, Domperidone)", qtRisk: true, cyp3a4: false },
              { id: "opioid-methadone", label: "Methadone", qtRisk: true, cyp3a4: false },
              { id: "protease-inhibitor", label: "HIV Protease Inhibitors (Ritonavir, Saquinavir)", qtRisk: true, cyp3a4: true },
              { id: "calcium-channel-blocker", label: "Calcium Channel Blockers (Verapamil, Diltiazem)", qtRisk: false, cyp3a4: true },
              { id: "other-cyp3a4", label: "Other CYP3A4 Inhibitors (Grapefruit juice, Amiodarone)", qtRisk: false, cyp3a4: true },
              { id: "qt-prolonging-other", label: "Other QT prolonging agents", qtRisk: true, cyp3a4: false },
            ].map((medication) => (
              <div key={medication.id} className="flex items-center space-x-2">
                <Checkbox
                  id={medication.id}
                  checked={data[medication.id] || false}
                  onCheckedChange={(checked) => onUpdate({ [medication.id]: checked })}
                />
                <Label htmlFor={medication.id} className="font-normal cursor-pointer">
                  {medication.label}
                </Label>
                {medication.qtRisk && (
                  <Badge variant="destructive" className="text-[8px] h-3 px-1 ml-1 leading-none uppercase">QT</Badge>
                )}
                {medication.cyp3a4 && (
                  <Badge variant="outline" className="text-[8px] h-3 px-1 ml-1 leading-none border-orange-500 text-orange-600 uppercase">CYP</Badge>
                )}
              </div>
            ))}
          </div>
          <Textarea
            placeholder="List specific medications with dosages..."
            value={data.medicationDetails || ""}
            onChange={(e) => onUpdate({ medicationDetails: e.target.value })}
            className="mt-3"
          />
          
          {/* Drug Interaction Checker */}
          {(() => {
            const qtDrugs = [
              { id: "antidepressant", label: "Antidepressants" },
              { id: "antiarrhythmic", label: "Antiarrhythmics" },
              { id: "antipsychotic", label: "Antipsychotics" },
              { id: "macrolide-antibiotic", label: "Macrolide antibiotics" },
              { id: "fluoroquinolone", label: "Fluoroquinolones" },
              { id: "antifungal", label: "Azole antifungals" },
              { id: "antiemetic", label: "Antiemetics" },
              { id: "opioid-methadone", label: "Methadone" },
              { id: "protease-inhibitor", label: "HIV Protease Inhibitors" },
              { id: "qt-prolonging-other", label: "Other QT prolonging agents" }
            ].filter(drug => data[drug.id]);
            
            const cyp3a4Inhibitors = [
              { id: "antifungal", label: "Azole antifungals" },
              { id: "protease-inhibitor", label: "HIV Protease Inhibitors" },
              { id: "calcium-channel-blocker", label: "Calcium Channel Blockers" },
              { id: "other-cyp3a4", label: "Other CYP3A4 Inhibitors" }
            ].filter(drug => data[drug.id]);
            
            const hasMultipleQTDrugs = qtDrugs.length >= 2;
            const hasCYP3A4WithQT = cyp3a4Inhibitors.length > 0 && qtDrugs.length > 0;
            const hasElectrolyteIssue = data.diuretics; // Diuretics can cause hypokalemia
            
            const showInteractionWarning = hasMultipleQTDrugs || hasCYP3A4WithQT;
            
            if (!showInteractionWarning) return null;
            
            return (
              <Card className="mt-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    ⚠️ HIGH RISK Drug Interaction Detected
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-300">
                    Dangerous medication combinations identified - immediate review required
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasMultipleQTDrugs && (
                    <Alert className="border-red-300 bg-red-100/50 dark:bg-red-900/30">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm">
                        <strong className="text-red-700 dark:text-red-300">Multiple QT-Prolonging Medications ({qtDrugs.length} detected):</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-red-600 dark:text-red-300">
                          {qtDrugs.map(drug => (
                            <li key={drug.id}>{drug.label}</li>
                          ))}
                        </ul>
                        <p className="mt-3 font-semibold">
                          ⚠️ Risk: Additive QT prolongation significantly increases Torsades de Pointes risk
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {hasCYP3A4WithQT && (
                    <Alert className="border-orange-300 bg-orange-100/50 dark:bg-orange-900/30">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        <strong className="text-orange-700 dark:text-orange-300">CYP3A4 Inhibitor + QT-Prolonging Drug Interaction:</strong>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="font-semibold text-orange-600 dark:text-orange-300">CYP3A4 Inhibitors:</p>
                            <ul className="list-disc list-inside ml-2">
                              {cyp3a4Inhibitors.map(drug => (
                                <li key={drug.id}>{drug.label}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-600 dark:text-orange-300">Combined with QT drugs:</p>
                            <ul className="list-disc list-inside ml-2">
                              {qtDrugs.map(drug => (
                                <li key={drug.id}>{drug.label}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="mt-3 font-semibold">
                          ⚠️ Risk: CYP3A4 inhibition increases QT drug plasma levels → enhanced QT prolongation
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {hasElectrolyteIssue && qtDrugs.length > 0 && (
                    <Alert className="border-yellow-300 bg-yellow-100/50 dark:bg-yellow-900/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Additional Risk Factor:</strong> Diuretic use may cause hypokalemia/hypomagnesemia, 
                        further increasing Torsades de Pointes risk with QT-prolonging medications.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
                    <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">⚡ Immediate Actions Required:</h4>
                    <ul className="list-decimal list-inside space-y-2 text-sm">
                      <li><strong>Obtain baseline ECG immediately</strong> - measure QTc interval (normal &lt;450 ms men, &lt;460 ms women)</li>
                      <li><strong>Check electrolytes:</strong> K⁺, Mg²⁺, Ca²⁺ (correct any abnormalities before continuing medications)</li>
                      <li><strong>Review medication necessity:</strong> Can any QT-prolonging drugs be discontinued or substituted?</li>
                      <li><strong>If continuation necessary:</strong>
                        <ul className="list-disc list-inside ml-6 mt-1">
                          <li>Use lowest effective doses</li>
                          <li>ECG monitoring: repeat QTc after 2-3 days and with any dose changes</li>
                          <li>Discontinue if QTc &gt;500 ms or increases &gt;60 ms from baseline</li>
                          <li>Patient education on symptoms (palpitations, dizziness, syncope)</li>
                        </ul>
                      </li>
                      <li><strong>Consider cardiology consultation</strong> for high-risk patients</li>
                    </ul>
                  </div>
                  
                  <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                    <AlertDescription className="text-xs">
                      <strong>Risk Stratification:</strong> Document the indication for each QT-prolonging medication, 
                      assess benefit vs risk, and consider alternative therapies when available. Monitor for additional 
                      risk factors: female sex, age &gt;65, bradycardia, heart failure, recent AF conversion, renal/hepatic impairment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            );
          })()}
          
          {data["qt-prolonging-other"] && (
            <Card className="mt-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  Common QT Prolonging Agents
                </CardTitle>
                <CardDescription>
                  Review this list when assessing patient medications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-xs text-muted-foreground mb-4">
                  Select applicable medication categories the patient is currently taking:
                </p>
                
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antiarrhythmics"
                        checked={data["qt-antiarrhythmics"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antiarrhythmics": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antiarrhythmics" className="font-semibold cursor-pointer">
                          Antiarrhythmics (Class IA, IC, III)
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Quinidine, Procainamide, Disopyramide, Flecainide, Propafenone, Amiodarone, Sotalol, Dofetilide, Ibutilide, Dronedarone
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antibiotics"
                        checked={data["qt-antibiotics"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antibiotics": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antibiotics" className="font-semibold cursor-pointer">
                          Antibiotics
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          <strong>Macrolides:</strong> Erythromycin, Clarithromycin, Azithromycin<br/>
                          <strong>Fluoroquinolones:</strong> Levofloxacin, Moxifloxacin, Ciprofloxacin<br/>
                          <strong>Others:</strong> Pentamidine, Trimethoprim-sulfamethoxazole
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antipsychotics"
                        checked={data["qt-antipsychotics"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antipsychotics": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antipsychotics" className="font-semibold cursor-pointer">
                          Antipsychotics
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          <strong>Typical:</strong> Haloperidol, Chlorpromazine, Thioridazine, Pimozide<br/>
                          <strong>Atypical:</strong> Ziprasidone, Quetiapine, Risperidone, Olanzapine, Clozapine
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antidepressants-detail"
                        checked={data["qt-antidepressants-detail"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antidepressants-detail": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antidepressants-detail" className="font-semibold cursor-pointer">
                          Antidepressants
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          <strong>TCAs:</strong> Amitriptyline, Imipramine, Nortriptyline, Desipramine<br/>
                          <strong>SSRIs:</strong> Citalopram, Escitalopram (high doses)<br/>
                          <strong>Others:</strong> Venlafaxine, Mirtazapine
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antiemetics"
                        checked={data["qt-antiemetics"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antiemetics": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antiemetics" className="font-semibold cursor-pointer">
                          Antiemetics & Prokinetics
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Ondansetron, Granisetron, Domperidone, Droperidol, Metoclopramide
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antifungals-detail"
                        checked={data["qt-antifungals-detail"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antifungals-detail": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antifungals-detail" className="font-semibold cursor-pointer">
                          Antifungals
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Fluconazole, Ketoconazole, Itraconazole, Voriconazole, Pentamidine
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antimalarials"
                        checked={data["qt-antimalarials"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antimalarials": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antimalarials" className="font-semibold cursor-pointer">
                          Antimalarials
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Chloroquine, Hydroxychloroquine, Quinine
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-opioids"
                        checked={data["qt-opioids"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-opioids": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-opioids" className="font-semibold cursor-pointer">
                          Opioids
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Methadone, Oxycodone (high doses)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antihistamines"
                        checked={data["qt-antihistamines"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antihistamines": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antihistamines" className="font-semibold cursor-pointer">
                          Antihistamines
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          <strong>First generation:</strong> Diphenhydramine, Hydroxyzine, Promethazine<br/>
                          <strong>Others:</strong> Terfenadine, Astemizole (withdrawn in many countries)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-antiretrovirals"
                        checked={data["qt-antiretrovirals"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-antiretrovirals": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-antiretrovirals" className="font-semibold cursor-pointer">
                          Antiretrovirals
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Saquinavir, Ritonavir, Atazanavir, Lopinavir, Rilpivirine
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-anticancer"
                        checked={data["qt-anticancer"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-anticancer": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-anticancer" className="font-semibold cursor-pointer">
                          Anticancer Agents
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Arsenic trioxide, Vandetanib, Vemurafenib, Nilotinib, Dasatinib, Sunitinib, Tamoxifen, Anthracyclines (Doxorubicin, Daunorubicin)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-immunosuppressants"
                        checked={data["qt-immunosuppressants"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-immunosuppressants": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-immunosuppressants" className="font-semibold cursor-pointer">
                          Immunosuppressants
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          Tacrolimus, Fingolimod
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start space-x-2 mb-2">
                      <Checkbox
                        id="qt-miscellaneous"
                        checked={data["qt-miscellaneous"] || false}
                        onCheckedChange={(checked) => onUpdate({ "qt-miscellaneous": checked })}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor="qt-miscellaneous" className="font-semibold cursor-pointer">
                          Miscellaneous
                        </Label>
                        <p className="text-muted-foreground text-xs mt-1">
                          <strong>Cognitive enhancers:</strong> Donepezil, Galantamine, Rivastigmine<br/>
                          <strong>Antianginals:</strong> Ranolazine<br/>
                          <strong>PDE5 inhibitors:</strong> Vardenafil, Sildenafil (high doses)<br/>
                          <strong>Psychiatric:</strong> Lithium (overdose/toxicity)<br/>
                          <strong>GI drugs:</strong> Cisapride (withdrawn in many countries)<br/>
                          <strong>Others:</strong> Probucol, Bepridil, Tizanidine
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Alert className="mt-4 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <p><strong>High-Risk Factors for Torsades de Pointes:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Higher doses of QT-prolonging medications</li>
                      <li>Drug interactions (especially CYP3A4 inhibitors: grapefruit juice, ketoconazole, ritonavir, verapamil)</li>
                      <li>Electrolyte abnormalities: ↓K⁺ (hypokalemia &lt;3.5 mEq/L), ↓Mg²⁺ (hypomagnesemia), ↓Ca²⁺ (hypocalcemia)</li>
                      <li>Bradycardia (&lt;60 bpm) or heart block</li>
                      <li>Female sex (women have longer baseline QT intervals)</li>
                      <li>Structural heart disease (LV hypertrophy, heart failure, MI)</li>
                      <li>Congenital long QT syndrome (genetic predisposition)</li>
                      <li>Advanced age and renal/hepatic impairment</li>
                      <li>Recent conversion from atrial fibrillation</li>
                    </ul>
                    <p className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                      <strong>QTc Monitoring:</strong> Baseline QTc &gt;500 ms or increase &gt;60 ms from baseline requires immediate drug review and possible discontinuation.
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="border-t pt-6">
          <Label className="text-base font-medium mb-3 block">
            Recurrent Syncope Information
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Complete this section only if patient has had multiple episodes
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="first-episode" className="text-sm font-medium mb-2 block">
                Time since first episode
              </Label>
              <Input
                id="first-episode"
                placeholder="e.g., 6 months, 2 years"
                value={data.firstEpisode || ""}
                onChange={(e) => onUpdate({ firstEpisode: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="episode-count" className="text-sm font-medium mb-2 block">
                Number of previous episodes
              </Label>
              <Input
                id="episode-count"
                type="number"
                placeholder="Enter number"
                value={data.episodeCount || ""}
                onChange={(e) => onUpdate({ episodeCount: e.target.value })}
                className="max-w-[200px]"
              />
            </div>
            
            <div>
              <Label htmlFor="episode-pattern" className="text-sm font-medium mb-2 block">
                Pattern of recurrence
              </Label>
              <Textarea
                id="episode-pattern"
                placeholder="Describe frequency, triggers, and any patterns..."
                value={data.episodePattern || ""}
                onChange={(e) => onUpdate({ episodePattern: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="background-notes" className="text-base font-medium mb-3 block">
            Additional Medical History
          </Label>
          <Textarea
            id="background-notes"
            placeholder="Any other relevant medical history, allergies, or information..."
            value={data.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default BackgroundSection;
