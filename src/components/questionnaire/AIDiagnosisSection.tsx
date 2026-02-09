import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIDiagnosisSection = () => {
  const [patientFindings, setPatientFindings] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!patientFindings.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter patient findings before requesting analysis",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-diagnosis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ patientFindings }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Payment Required",
            description: "Please add credits to your workspace to continue using AI features.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(errorData.error || "Failed to analyze findings");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI-powered differential diagnosis has been generated",
      });
    } catch (error) {
      console.error("Error analyzing findings:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI-Powered Differential Diagnosis Assistant
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter patient findings, symptoms, test results, and imaging findings to receive AI-generated differential diagnoses with confidence scores
        </p>
      </div>

      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertTitle>Powered by Advanced AI</AlertTitle>
        <AlertDescription className="text-sm">
          This tool uses advanced medical AI to analyze patient findings and suggest differential diagnoses. 
          <strong className="block mt-2">Always use clinical judgment and verify AI suggestions with established guidelines.</strong>
        </AlertDescription>
      </Alert>

      <Card className="border-purple-300">
        <CardHeader>
          <CardTitle className="text-base">Patient Findings Input</CardTitle>
          <CardDescription>
            Include symptoms, vital signs, test results, ECG findings, imaging results, and any relevant clinical information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example:&#10;&#10;- Patient: 45-year-old male&#10;- Chief complaint: Recurrent episodes of loss of consciousness&#10;- Symptoms: Palpitations before episodes, no prodrome, quick recovery&#10;- Vital signs: BP 120/80, HR 75 bpm&#10;- ECG: QTc 465 ms, occasional PVCs&#10;- Medications: Beta-blocker, SSRI&#10;- Past medical history: Hypertension, anxiety&#10;- Family history: Father had sudden cardiac death at age 50&#10;- Tilt table test: Negative&#10;- Carotid sinus massage: Normal response"
            value={patientFindings}
            onChange={(e) => setPatientFindings(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !patientFindings.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Differential Diagnoses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="border-green-300 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              AI Analysis Results
              <Badge variant="secondary" className="ml-auto">
                AI-Generated
              </Badge>
            </CardTitle>
            <CardDescription>
              Review the following differential diagnoses and use your clinical judgment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysis}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert variant="destructive" className="border-red-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Clinical Judgment Required</AlertTitle>
        <AlertDescription className="text-sm space-y-2">
          <p>
            <strong>IMPORTANT:</strong> This AI-powered tool is designed to assist clinical decision-making, 
            not replace it. All suggestions must be:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Verified against current clinical guidelines and evidence-based medicine</li>
            <li>Interpreted in the full context of the patient's clinical presentation</li>
            <li>Confirmed with appropriate diagnostic testing when indicated</li>
            <li>Discussed with specialist colleagues for complex or uncertain cases</li>
          </ul>
          <p className="mt-2">
            The AI may not have access to the most recent research or guidelines. 
            Always prioritize patient safety and established medical protocols.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AIDiagnosisSection;
