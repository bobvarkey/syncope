import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, Info, TrendingUp, Activity } from "lucide-react";

interface SummaryReportSectionProps {
  formData: any;
}

const SummaryReportSection = ({ formData }: SummaryReportSectionProps) => {
  // Helper functions to analyze data
  const analyzeRiskFactors = () => {
    const risks = [];
    if (formData.background?.cardiacHistory) risks.push("Cardiac history present");
    if (formData.background?.neurologicalHistory) risks.push("Neurological history present");
    if (formData.ecgFindings?.abnormalFindings) risks.push("Abnormal ECG findings");
    if (formData.riskScore?.highRisk) risks.push("High Canadian Syncope Risk Score");
    return risks;
  };

  const analyzeTiltTest = () => {
    const tilt = formData.tiltTestProtocol;
    if (!tilt?.testPerformed) return null;
    
    const results = {
      performed: true,
      positive: tilt.positiveResponse || false,
      type: tilt.responseType || "Not classified",
      haemodynamicResponse: tilt.haemodynamicResponse || "Not specified"
    };
    return results;
  };

  const analyzeCarotidMassage = () => {
    const csm = formData.carotidSinusMassage;
    if (!csm?.testPerformed) return null;
    
    return {
      performed: true,
      abnormal: csm.responseType && csm.responseType !== 'normal',
      type: csm.responseType || "Not classified"
    };
  };

  const analyzeOrthostaticIntolerance = () => {
    const oi = formData.orthostaticIntolerance;
    if (!oi?.testPerformed) return null;
    
    return {
      performed: true,
      phenotype: oi.phenotype || "Not classified",
      hasPOTS: oi.phenotype === 'pots',
      hasOH: oi.phenotype === 'oh'
    };
  };

  const getDiagnosticImpression = () => {
    const impressions = [];
    
    // Analyze tilt test
    const tilt = analyzeTiltTest();
    if (tilt?.positive) {
      impressions.push({
        condition: "Neurally Mediated Syncope",
        confidence: "High",
        evidence: `Positive tilt table test with ${tilt.type} response`
      });
    }

    // Analyze carotid sinus massage
    const csm = analyzeCarotidMassage();
    if (csm?.abnormal) {
      impressions.push({
        condition: "Carotid Sinus Syndrome",
        confidence: "High",
        evidence: `Abnormal carotid sinus massage with ${csm.type} response`
      });
    }

    // Analyze orthostatic intolerance
    const oi = analyzeOrthostaticIntolerance();
    if (oi?.hasPOTS) {
      impressions.push({
        condition: "Postural Orthostatic Tachycardia Syndrome (POTS)",
        confidence: "High",
        evidence: "Orthostatic intolerance testing confirms POTS phenotype"
      });
    } else if (oi?.hasOH) {
      impressions.push({
        condition: "Orthostatic Hypotension",
        confidence: "High",
        evidence: "Orthostatic intolerance testing confirms OH phenotype"
      });
    }

    // Check for cardiac concerns
    if (formData.ecgFindings?.abnormalFindings || formData.background?.cardiacHistory) {
      impressions.push({
        condition: "Cardiac Etiology - Further Evaluation Needed",
        confidence: "Moderate",
        evidence: "Abnormal ECG findings and/or cardiac history present"
      });
    }

    // Check differential diagnoses
    if (formData.differentialDiagnosis?.seizure) {
      impressions.push({
        condition: "Seizure Disorder - Consider",
        confidence: "Low to Moderate",
        evidence: "Clinical features suggest possible seizure activity"
      });
    }

    return impressions;
  };

  const getRecommendations = () => {
    const recommendations = [];
    const risks = analyzeRiskFactors();

    if (risks.length > 0) {
      recommendations.push("Close follow-up recommended due to identified risk factors");
    }

    const tilt = analyzeTiltTest();
    if (tilt?.positive) {
      recommendations.push("Consider lifestyle modifications and increased salt/fluid intake for neurally mediated syncope");
      if (tilt.type === "cardioinhibitory") {
        recommendations.push("Pacemaker therapy may be considered for dominant cardioinhibitory response");
      }
    }

    const csm = analyzeCarotidMassage();
    if (csm?.abnormal) {
      recommendations.push("Pacemaker therapy may be indicated for carotid sinus syndrome");
    }

    const oi = analyzeOrthostaticIntolerance();
    if (oi?.hasPOTS) {
      recommendations.push("POTS management: increase fluid/salt intake, compression stockings, exercise reconditioning");
      recommendations.push("Consider pharmacotherapy if lifestyle measures insufficient");
    }

    if (formData.ecgFindings?.abnormalFindings) {
      recommendations.push("Cardiology referral for comprehensive cardiac evaluation");
    }

    if (formData.subclavianSteal?.testPerformed && formData.subclavianSteal?.positiveTest) {
      recommendations.push("Vascular surgery consultation for subclavian steal syndrome");
    }

    return recommendations;
  };

  const risks = analyzeRiskFactors();
  const diagnosticImpressions = getDiagnosticImpression();
  const recommendations = getRecommendations();
  const tiltResults = analyzeTiltTest();
  const csmResults = analyzeCarotidMassage();
  const oiResults = analyzeOrthostaticIntolerance();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Clinical Summary & Diagnostic Impression
        </h3>
        <p className="text-sm text-muted-foreground">
          Automated analysis of assessment findings with diagnostic considerations
        </p>
      </div>

      {/* Risk Factors Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Risk Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {risks.length > 0 ? (
            <div className="space-y-2">
              {risks.map((risk, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Risk</Badge>
                  <span className="text-sm">{risk}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No significant risk factors identified in completed sections</p>
          )}
        </CardContent>
      </Card>

      {/* Investigation Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Investigation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tilt Test */}
          {tiltResults ? (
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Head-Up Tilt Table Test (HUTT)</h4>
                <Badge variant={tiltResults.positive ? "destructive" : "secondary"}>
                  {tiltResults.positive ? "Positive" : "Performed"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Response Type:</strong> {tiltResults.type}</p>
                <p><strong>Haemodynamic Response:</strong> {tiltResults.haemodynamicResponse}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <strong>Tilt Table Test:</strong> Not performed or data not entered
            </div>
          )}

          <Separator />

          {/* Carotid Sinus Massage */}
          {csmResults ? (
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Carotid Sinus Massage</h4>
                <Badge variant={csmResults.abnormal ? "destructive" : "secondary"}>
                  {csmResults.abnormal ? "Abnormal" : "Normal"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Response Classification:</strong> {csmResults.type}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <strong>Carotid Sinus Massage:</strong> Not performed or data not entered
            </div>
          )}

          <Separator />

          {/* Orthostatic Intolerance */}
          {oiResults ? (
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Orthostatic Intolerance Testing</h4>
                <Badge variant={oiResults.hasPOTS || oiResults.hasOH ? "destructive" : "secondary"}>
                  {oiResults.phenotype}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Phenotype:</strong> {oiResults.phenotype}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <strong>Orthostatic Intolerance Testing:</strong> Not performed or data not entered
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Impressions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Diagnostic Impressions
          </CardTitle>
          <CardDescription>
            Based on completed assessment data and investigation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diagnosticImpressions.length > 0 ? (
            <div className="space-y-4">
              {diagnosticImpressions.map((impression, index) => (
                <Alert key={index} className={
                  impression.confidence === "High" 
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                    : impression.confidence === "Moderate"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                }>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle className="font-semibold">
                    {impression.condition}
                    <Badge variant="outline" className="ml-2">{impression.confidence} Confidence</Badge>
                  </AlertTitle>
                  <AlertDescription className="text-sm mt-2">
                    {impression.evidence}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Insufficient data to generate diagnostic impressions. Complete clinical history and investigations for analysis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Clinical Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Clinical Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the assessment to receive tailored clinical recommendations
            </p>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Important Note</AlertTitle>
        <AlertDescription>
          This summary is generated automatically based on entered data and established clinical criteria. 
          It is intended to assist clinical decision-making but should not replace comprehensive clinical judgment. 
          All recommendations should be individualized based on the complete clinical context.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SummaryReportSection;
