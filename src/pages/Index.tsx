import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Printer, Download, FileDown } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AssessmentSidebar } from "@/components/AssessmentSidebar";
import { AssessmentProgressProvider } from "@/contexts/AssessmentProgressContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { SectionWithProgress } from "@/components/SectionWithProgress";
import { AssessmentDashboard } from "@/components/AssessmentDashboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PatientInfoSection from "@/components/questionnaire/PatientInfoSection";
import CircumstancesSection from "@/components/questionnaire/CircumstancesSection";
import OnsetSection from "@/components/questionnaire/OnsetSection";
import AttackSection from "@/components/questionnaire/AttackSection";
import EndSection from "@/components/questionnaire/EndSection";
import BackgroundSection from "@/components/questionnaire/BackgroundSection";
import ClinicalFeaturesSection from "@/components/questionnaire/ClinicalFeaturesSection";
import ECGFindingsSection from "@/components/questionnaire/ECGFindingsSection";
import DiagnosticCriteriaSection from "@/components/questionnaire/DiagnosticCriteriaSection";
import InitialEvaluationSection from "@/components/questionnaire/InitialEvaluationSection";
import TiltTestProtocolSection from "@/components/questionnaire/TiltTestProtocolSection";
import RiskScoreSection from "@/components/questionnaire/RiskScoreSection";
import DifferentialDiagnosisSection from "@/components/questionnaire/DifferentialDiagnosisSection";
import SubclavianStealSection from "@/components/questionnaire/SubclavianStealSection";
import CarotidSinusMassageSection from "@/components/questionnaire/CarotidSinusMassageSection";
import OrthostaticIntoleranceSection from "@/components/questionnaire/OrthostaticIntoleranceSection";
import SummaryReportSection from "@/components/questionnaire/SummaryReportSection";
import AIDiagnosisSection from "@/components/questionnaire/AIDiagnosisSection";
import LabTestsSection from "@/components/questionnaire/LabTestsSection";
import { exportToPDF, exportToWord } from "@/utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const IndexContent = () => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    patientInfo: {},
    circumstances: {},
    onset: {},
    attack: {},
    end: {},
    background: {},
    clinicalFeatures: {},
    ecgFindings: {},
    labTests: {},
    initialEvaluation: {},
    tiltTestProtocol: {},
    riskScore: {},
    differentialDiagnosis: {},
    subclavianSteal: {},
    carotidSinusMassage: {},
    orthostaticIntolerance: {},
    diagnosticCriteria: {},
  });

  const updateSection = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syncope-assessment-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportPDF = () => {
    exportToPDF(formData, language);
  };

  const handleExportWord = () => {
    exportToWord(formData, language);
  };

  return (
    <AssessmentProgressProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AssessmentSidebar />
        
        <div className="flex-1 bg-background">
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center flex-1">
                <FileText className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('app.title')}
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>
          </header>

          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <AssessmentDashboard />
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Patient Assessment Form</CardTitle>
                  <CardDescription>
                    Complete all sections to evaluate the episode of loss of consciousness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <PatientInfoSection
                    data={formData.patientInfo}
                    onUpdate={(data) => updateSection('patientInfo', data)}
                  />
                  
                  <div className="bg-muted/30 -mx-6 -mt-6 px-6 py-6 mb-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Clinical History</h2>
                    <p className="text-sm text-muted-foreground">Patient history and episode characteristics</p>
                  </div>
                  
                  <div id="circumstances">
                    <SectionWithProgress sectionId="circumstances" data={formData.circumstances}>
                      <CircumstancesSection 
                        data={formData.circumstances} 
                        onUpdate={(data) => updateSection('circumstances', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="onset">
                    <SectionWithProgress sectionId="onset" data={formData.onset}>
                      <OnsetSection 
                        data={formData.onset} 
                        onUpdate={(data) => updateSection('onset', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="attack">
                    <SectionWithProgress sectionId="attack" data={formData.attack}>
                      <AttackSection 
                        data={formData.attack} 
                        onUpdate={(data) => updateSection('attack', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="end">
                    <SectionWithProgress sectionId="end" data={formData.end}>
                      <EndSection 
                        data={formData.end} 
                        onUpdate={(data) => updateSection('end', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="background">
                    <SectionWithProgress sectionId="background" data={formData.background}>
                      <BackgroundSection 
                        data={formData.background} 
                        onUpdate={(data) => updateSection('background', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="clinical-features">
                    <SectionWithProgress sectionId="clinical-features" data={formData.clinicalFeatures}>
                      <ClinicalFeaturesSection 
                        data={formData.clinicalFeatures} 
                        onUpdate={(data) => updateSection('clinicalFeatures', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="bg-primary/5 -mx-6 px-6 py-6 my-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Clinical Investigations</h2>
                    <p className="text-sm text-muted-foreground">Diagnostic tests, examinations, and objective findings</p>
                  </div>
                  
                  <div id="ecg-findings">
                    <SectionWithProgress sectionId="ecg-findings" data={formData.ecgFindings}>
                      <ECGFindingsSection 
                        data={formData.ecgFindings} 
                        onUpdate={(data) => updateSection('ecgFindings', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="lab-tests">
                    <SectionWithProgress sectionId="lab-tests" data={formData.labTests}>
                      <LabTestsSection 
                        data={formData.labTests} 
                        onUpdate={(data) => updateSection('labTests', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="initial-evaluation">
                    <SectionWithProgress sectionId="initial-evaluation" data={formData.initialEvaluation}>
                      <InitialEvaluationSection 
                        data={formData.initialEvaluation} 
                        onUpdate={(data) => updateSection('initialEvaluation', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="tilt-test">
                    <SectionWithProgress sectionId="tilt-test" data={formData.tiltTestProtocol}>
                      <TiltTestProtocolSection 
                        data={formData.tiltTestProtocol} 
                        onUpdate={(data) => updateSection('tiltTestProtocol', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="risk-score">
                    <SectionWithProgress sectionId="risk-score" data={formData.riskScore}>
                      <RiskScoreSection 
                        data={formData.riskScore} 
                        onUpdate={(data) => updateSection('riskScore', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="subclavian-steal">
                    <SectionWithProgress sectionId="subclavian-steal" data={formData.subclavianSteal}>
                      <SubclavianStealSection 
                        data={formData.subclavianSteal} 
                        onUpdate={(data) => updateSection('subclavianSteal', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="carotid-massage">
                    <SectionWithProgress sectionId="carotid-massage" data={formData.carotidSinusMassage}>
                      <CarotidSinusMassageSection 
                        data={formData.carotidSinusMassage} 
                        onUpdate={(data) => updateSection('carotidSinusMassage', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="orthostatic-intolerance">
                    <SectionWithProgress sectionId="orthostatic-intolerance" data={formData.orthostaticIntolerance}>
                      <OrthostaticIntoleranceSection 
                        data={formData.orthostaticIntolerance} 
                        onUpdate={(data) => updateSection('orthostaticIntolerance', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="bg-green-50 dark:bg-green-950/20 -mx-6 px-6 py-6 my-8 border-t-2 border-green-500">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Differential Diagnosis</h2>
                    <p className="text-sm text-muted-foreground">Clinical reasoning, diagnostic criteria, and AI-assisted analysis</p>
                  </div>
                  
                  <div id="differential-diagnosis-section">
                    <SectionWithProgress sectionId="differential-diagnosis-section" data={formData.differentialDiagnosis}>
                      <DifferentialDiagnosisSection 
                        data={formData.differentialDiagnosis} 
                        onUpdate={(data) => updateSection('differentialDiagnosis', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="diagnostic-criteria">
                    <SectionWithProgress sectionId="diagnostic-criteria" data={formData.diagnosticCriteria}>
                      <DiagnosticCriteriaSection 
                        data={formData.diagnosticCriteria} 
                        onUpdate={(data) => updateSection('diagnosticCriteria', data)} 
                      />
                    </SectionWithProgress>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div id="ai-diagnosis">
                    <AIDiagnosisSection />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6 border-primary/50 shadow-lg">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-2xl">Assessment Summary</CardTitle>
                  <CardDescription>
                    Comprehensive analysis and diagnostic impressions based on completed data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SummaryReportSection formData={formData} />
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-4 justify-center print:hidden">
                <Button onClick={handlePrint} variant="outline" size="lg">
                  <Printer className="w-4 h-4 mr-2" />
                  {t('button.print')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="lg">
                      <FileDown className="w-4 h-4 mr-2" />
                      {t('button.export')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      {t('button.exportPdf')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportWord}>
                      {t('button.exportWord')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      </SidebarProvider>
    </AssessmentProgressProvider>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <IndexContent />
    </LanguageProvider>
  );
};

export default Index;
