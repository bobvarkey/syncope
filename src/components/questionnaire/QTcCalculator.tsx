import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, AlertTriangle, Info, TrendingUp } from "lucide-react";
import ChecklistLink from "@/components/ChecklistLink";

interface QTcCalculatorProps {
  onResultUpdate?: (results: any) => void;
}

const QTcCalculator = ({ onResultUpdate }: QTcCalculatorProps) => {
  const [qtInterval, setQtInterval] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [sex, setSex] = useState<string>("male");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (qtInterval && heartRate) {
      calculateQTc();
    } else {
      setResults(null);
    }
  }, [qtInterval, heartRate, sex]);

  const calculateQTc = () => {
    const qt = parseFloat(qtInterval);
    const hr = parseFloat(heartRate);

    if (isNaN(qt) || isNaN(hr) || qt <= 0 || hr <= 0 || hr > 300) {
      setResults(null);
      return;
    }

    // Convert heart rate to RR interval in seconds
    const rrInterval = 60 / hr;

    // Bazett Formula: QTc = QT / √RR
    const qtcBazett = qt / Math.sqrt(rrInterval);

    // Fridericia Formula: QTc = QT / ∛RR
    const qtcFridericia = qt / Math.cbrt(rrInterval);

    // Framingham Formula: QTc = QT + 0.154(1 - RR)
    const qtcFramingham = qt + 0.154 * (1 - rrInterval) * 1000;

    const calculatedResults = {
      qt,
      hr,
      rrInterval: rrInterval.toFixed(3),
      bazett: Math.round(qtcBazett),
      fridericia: Math.round(qtcFridericia),
      framingham: Math.round(qtcFramingham),
      sex
    };

    setResults(calculatedResults);
    if (onResultUpdate) {
      onResultUpdate(calculatedResults);
    }
  };

  const getInterpretation = (qtc: number, formula: string) => {
    const normalMale = 450;
    const normalFemale = 460;
    const borderlineMale = 450;
    const borderlineFemale = 460;
    const prolongedMale = 470;
    const prolongedFemale = 480;
    const critical = 500;

    const normalThreshold = sex === "male" ? normalMale : normalFemale;
    const prolongedThreshold = sex === "male" ? prolongedMale : prolongedFemale;

    if (qtc < normalThreshold) {
      return {
        status: "Normal",
        color: "green",
        risk: "Low",
        description: `QTc is within normal limits for ${sex === "male" ? "males" : "females"}`
      };
    } else if (qtc >= normalThreshold && qtc < prolongedThreshold) {
      return {
        status: "Borderline",
        color: "yellow",
        risk: "Moderate",
        description: "QTc is borderline prolonged - monitor closely, review medications"
      };
    } else if (qtc >= prolongedThreshold && qtc < critical) {
      return {
        status: "Prolonged",
        color: "orange",
        risk: "High",
        description: "QTc is prolonged - significant risk of arrhythmias, immediate action required"
      };
    } else {
      return {
        status: "Critical",
        color: "red",
        risk: "Very High",
        description: "QTc is critically prolonged - URGENT: High risk of Torsades de Pointes"
      };
    }
  };

  const getRiskStratification = () => {
    if (!results) return null;

    const avgQTc = Math.round((results.bazett + results.fridericia + results.framingham) / 3);
    const interpretation = getInterpretation(avgQTc, "average");

    return {
      avgQTc,
      interpretation,
      recommendations: getRecommendations(avgQTc, interpretation.status)
    };
  };

  const getRecommendations = (qtc: number, status: string) => {
    const recommendations = [];

    if (status === "Normal") {
      recommendations.push("Continue current management");
      recommendations.push("Routine monitoring as clinically indicated");
      if (qtc > 420) {
        recommendations.push("Recheck if starting QT-prolonging medications");
      }
    } else if (status === "Borderline") {
      recommendations.push("⚠️ Review all medications for QT-prolonging agents");
      recommendations.push("Check electrolytes (K⁺, Mg²⁺, Ca²⁺) and correct abnormalities");
      recommendations.push("Repeat ECG in 24-48 hours or after medication adjustment");
      recommendations.push("Avoid additional QT-prolonging medications if possible");
      recommendations.push("Patient education on symptoms (palpitations, dizziness, syncope)");
    } else if (status === "Prolonged") {
      recommendations.push("🚨 IMMEDIATE ACTION: Review and discontinue QT-prolonging medications");
      recommendations.push("URGENT: Check and correct electrolytes (target K⁺ >4.0, Mg²⁺ >2.0)");
      recommendations.push("Continuous cardiac monitoring recommended");
      recommendations.push("Cardiology consultation within 24 hours");
      recommendations.push("Repeat ECG after electrolyte correction and medication adjustment");
      recommendations.push("Consider beta-blocker if congenital LQTS suspected");
    } else {
      recommendations.push("🚨🚨 CRITICAL: Immediate cardiology consultation required");
      recommendations.push("URGENT: Discontinue ALL QT-prolonging medications immediately");
      recommendations.push("Continuous cardiac monitoring mandatory - ICU/telemetry");
      recommendations.push("STAT electrolyte panel and aggressive correction");
      recommendations.push("Consider prophylactic magnesium sulfate infusion");
      recommendations.push("Emergency beta-blocker therapy if Torsades risk");
      recommendations.push("Have defibrillator immediately available");
      recommendations.push("Screen for congenital LQTS (family history, genetic testing)");
    }

    return recommendations;
  };

  const riskStrat = getRiskStratification();

  return (
    <Card className="border-blue-500 shadow-md">
      <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
        <CardTitle className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            QTc Interval Calculator
          </div>
          <ChecklistLink label="View High-Risk Checklist" className="text-blue-600 hover:text-blue-800" />
        </CardTitle>
        <CardDescription>
          Calculate corrected QT interval using Bazett, Fridericia, and Framingham formulas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="qt-interval" className="text-sm font-medium mb-2 block">
              QT Interval (ms) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="qt-interval"
              type="number"
              placeholder="e.g., 400"
              value={qtInterval}
              onChange={(e) => setQtInterval(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Measure from QRS onset to T wave end
            </p>
          </div>

          <div>
            <Label htmlFor="heart-rate" className="text-sm font-medium mb-2 block">
              Heart Rate (bpm) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="heart-rate"
              type="number"
              placeholder="e.g., 75"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calculate: 60 / RR interval (sec)
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Patient Sex <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={sex} onValueChange={setSex} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer font-normal">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer font-normal">Female</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-1">
              Affects normal range thresholds
            </p>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Normal QTc:</strong> Males &lt;450 ms, Females &lt;460 ms | 
            <strong className="ml-2">Prolonged:</strong> Males ≥470 ms, Females ≥480 ms | 
            <strong className="ml-2">Critical:</strong> ≥500 ms (high Torsades risk)
          </AlertDescription>
        </Alert>

        {results && (
          <>
            <Separator />

            {/* Results Section */}
            <div>
              <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Calculated QTc Values
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Bazett Formula", value: results.bazett, desc: "QTc = QT / √RR", note: "Most commonly used, less accurate at extreme HR" },
                  { name: "Fridericia Formula", value: results.fridericia, desc: "QTc = QT / ∛RR", note: "Better for high/low heart rates" },
                  { name: "Framingham Formula", value: results.framingham, desc: "QTc = QT + 0.154(1-RR)", note: "Linear correction, population-derived" }
                ].map((formula) => {
                  const interp = getInterpretation(formula.value, formula.name);
                  return (
                    <Card key={formula.name} className={`border-2 border-${interp.color}-500`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{formula.name}</CardTitle>
                        <CardDescription className="text-xs">{formula.desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-center">
                          <div className={`text-3xl font-bold text-${interp.color}-600`}>
                            {formula.value} ms
                          </div>
                          <Badge 
                            variant={interp.status === "Normal" ? "secondary" : "destructive"}
                            className="mt-2"
                          >
                            {interp.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          {formula.note}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {riskStrat && (
              <>
                <Separator />

                {/* Risk Stratification */}
                <div>
                  <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Overall Risk Assessment
                  </h4>
                  
                  <Alert className={
                    riskStrat.interpretation.color === "green" 
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : riskStrat.interpretation.color === "yellow"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                      : riskStrat.interpretation.color === "orange"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  }>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold">
                      Average QTc: {riskStrat.avgQTc} ms
                      <Badge variant={riskStrat.interpretation.status === "Normal" ? "secondary" : "destructive"} className="ml-2">
                        {riskStrat.interpretation.status}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {riskStrat.interpretation.risk} Risk
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="font-semibold mb-2">{riskStrat.interpretation.description}</p>
                      <div className="text-xs mt-3 space-y-1">
                        <p><strong>Measured QT:</strong> {results.qt} ms | <strong>Heart Rate:</strong> {results.hr} bpm | <strong>RR Interval:</strong> {results.rrInterval} s</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Clinical Recommendations */}
                <Card className="border-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="text-base">Clinical Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {riskStrat.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className={
                            rec.includes("🚨🚨") ? "text-red-600 font-bold" :
                            rec.includes("🚨") ? "text-orange-600 font-bold" :
                            rec.includes("⚠️") ? "text-yellow-600 font-bold" :
                            "text-blue-600"
                          }>
                            {rec.includes("🚨") || rec.includes("⚠️") ? "→" : "•"}
                          </span>
                          <span className={
                            rec.includes("🚨🚨") ? "font-bold text-red-700 dark:text-red-300" :
                            rec.includes("🚨") || rec.includes("⚠️") ? "font-semibold" :
                            ""
                          }>
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Formula Comparison Note */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Formula Selection Guide:</strong> Bazett is most commonly used but overcorrects at high HR and undercorrects at low HR. 
                    Fridericia and Framingham provide better accuracy at extreme heart rates. Consider using Fridericia for heart rates &lt;60 or &gt;90 bpm. 
                    If formulas disagree significantly, clinical judgment and repeat measurements are advised.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </>
        )}

        {!results && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter QT interval and heart rate to calculate corrected QT interval using multiple validated formulas
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default QTcCalculator;
