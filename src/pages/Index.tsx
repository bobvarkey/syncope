import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Printer, Download, FileDown, History, TestTube, Brain, Shield, AlertTriangle } from "lucide-react";
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
import AutonomicTestingSection from "@/components/questionnaire/AutonomicTestingSection";
import InterventionsSection from "@/components/questionnaire/InterventionsSection";
import DropAttacksSection from "@/components/questionnaire/DropAttacksSection";
import SyncopeMedicationsSection from "@/components/questionnaire/SyncopeMedicationsSection";
import EcgSyncopeAbcde from "@/components/questionnaire/EcgSyncopeAbcde";
import SyncopeMiniApp from "@/components/questionnaire/SyncopeMiniApp";
import HuttMiniApp from "@/components/questionnaire/HuttMiniApp";
import EcgScoringChecklist from "@/components/questionnaire/EcgScoringChecklist";
import AntiArrhythmicsSection from "@/components/questionnaire/AntiArrhythmicsSection";
import { exportToPDF, exportToWord } from "@/utils/exportUtils";
import QuickSearch from "@/components/QuickSearch";
import heroImage from "@/assets/syncdx-hero.png.asset.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const IndexContent = () => {
  const { language, t } = useLanguage();
  const [openAccordionGroups, setOpenAccordionGroups] = useState<string[]>([]);
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
    autonomicTesting: {},
    diagnosticCriteria: {},
    interventions: {},
    dropAttacks: {},
    syncopeMedications: {},
    ecgAbcde: {},
    ecgScoring: {},
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const groupMapping: Record<string, string> = {
        'circumstances': 'clinical-history',
        'onset': 'clinical-history',
        'attack': 'clinical-history',
        'end': 'clinical-history',
        'background': 'clinical-history',
        'clinical-features': 'clinical-history',
        'ecg-scoring-checklist': 'investigations',
        'ecg-abcde': 'investigations',
        'syncope-medications': 'investigations',
        'lab-tests': 'investigations',
        'initial-evaluation': 'investigations',
        'tilt-test': 'investigations',
        'risk-score': 'investigations',
        'subclavian-steal': 'investigations',
        'carotid-massage': 'investigations',
        'orthostatic-intolerance': 'investigations',
        'autonomic-testing': 'investigations',
        'differential-diagnosis-section': 'differential-diagnosis',
        'diagnostic-criteria': 'differential-diagnosis',
        'ai-diagnosis': 'differential-diagnosis',
        'interventions': 'management',
        'drop-attacks': 'drop-attacks-group'
      };

      const groupId = groupMapping[hash];
      if (groupId) {
        setOpenAccordionGroups(prev => 
          prev.includes(groupId) ? prev : [...prev, groupId]
        );
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
        <div className="min-h-dvh flex w-full overflow-x-hidden">
          <AssessmentSidebar />
        
        <div className="flex-1 bg-background flex flex-col items-center w-full">
          <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 shadow-soft">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-sunset" aria-hidden />
            <div
              className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 w-full"
              style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
            >
              <SidebarTrigger className="lg:hidden shrink-0" />
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-sunset flex items-center justify-center shadow-glow mr-2.5 sm:mr-3 shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-2xl font-bold text-gradient-sunset truncate leading-tight">
                    {t('app.title')}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block truncate">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <QuickSearch />
              </div>
              <LanguageSwitcher />
              <Button
                onClick={() => document.getElementById('syncope-mini-app')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden sm:inline-flex bg-gradient-sunset hover:opacity-90 text-white border-0 shadow-glow"
                size="sm"
              >
                Start triage
              </Button>
            </div>
            <div className="md:hidden px-3 pb-2">
              <QuickSearch />
            </div>
          </header>

          <div className="w-full py-5 sm:py-8 px-3 sm:px-6 lg:px-8" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
            <div className="max-w-7xl mx-auto w-full">
              <section
                aria-label="SyncDx introduction"
                className="mb-5 sm:mb-8 rounded-2xl overflow-hidden border shadow-soft bg-card"
              >
                <div className="relative flex justify-center items-center bg-muted/20">
                  <img
                    src={heroImage.url}
                    alt="SyncDx – simplifies the evaluation of syncope or loss of consciousness in the OPD"
                    className="max-w-full h-auto object-contain max-h-[400px]"
                    loading="eager"
                  />
                </div>
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                      Ready to evaluate an episode?
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Start with a 60-second bedside triage.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      document.getElementById('syncope-mini-app')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="w-full sm:w-auto bg-gradient-sunset hover:opacity-90 text-white border-0 shadow-glow rounded-full h-12 px-6 text-base font-semibold active:scale-[0.98] transition-transform"
                  >
                    Start assessment
                  </Button>
                </div>
              </section>

              <div id="syncope-mini-app" className="mb-6 sm:mb-8 scroll-mt-20">
                <SyncopeMiniApp />
              </div>

              <div id="hutt-mini-app" className="mb-6 sm:mb-8 scroll-mt-20">
                <HuttMiniApp />
              </div>



              <AssessmentDashboard />


              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Patient Assessment Form</CardTitle>
                  <CardDescription>
                    Complete all sections to evaluate the episode of loss of consciousness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                <CardContent className="space-y-6">
                  <PatientInfoSection
                    data={formData.patientInfo}
                    onUpdate={(data) => updateSection('patientInfo', data)}
                  />
                  
                  <Accordion 
                    type="multiple" 
                    value={openAccordionGroups} 
                    onValueChange={setOpenAccordionGroups}
                    className="space-y-4"
                  >
                    {/* Clinical History Group */}
                    <AccordionItem value="clinical-history" className="border rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <History className="h-5 w-5 text-[hsl(16_100%_60%)]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Clinical History</h2>
                            <p className="text-xs text-muted-foreground font-normal">Patient history and episode characteristics</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-6 pb-4 space-y-8">
                        <div id="circumstances">
                          <SectionWithProgress sectionId="circumstances" data={formData.circumstances}>
                            <CircumstancesSection 
                              data={formData.circumstances} 
                              onUpdate={(data) => updateSection('circumstances', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="onset">
                          <SectionWithProgress sectionId="onset" data={formData.onset}>
                            <OnsetSection 
                              data={formData.onset} 
                              onUpdate={(data) => updateSection('onset', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="attack">
                          <SectionWithProgress sectionId="attack" data={formData.attack}>
                            <AttackSection 
                              data={formData.attack} 
                              onUpdate={(data) => updateSection('attack', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="end">
                          <SectionWithProgress sectionId="end" data={formData.end}>
                            <EndSection 
                              data={formData.end} 
                              onUpdate={(data) => updateSection('end', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="background">
                          <SectionWithProgress sectionId="background" data={formData.background}>
                            <BackgroundSection 
                              data={formData.background} 
                              onUpdate={(data) => updateSection('background', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="clinical-features">
                          <SectionWithProgress sectionId="clinical-features" data={formData.clinicalFeatures}>
                            <ClinicalFeaturesSection 
                              data={formData.clinicalFeatures} 
                              onUpdate={(data) => updateSection('clinicalFeatures', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Investigations Group */}
                    <AccordionItem value="investigations" className="border rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <TestTube className="h-5 w-5 text-[hsl(28_100%_58%)]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Clinical Investigations</h2>
                            <p className="text-xs text-muted-foreground font-normal">Diagnostic tests, examinations, and objective findings</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-6 pb-4 space-y-8">
                        <div id="ecg-scoring-checklist">
                          <EcgScoringChecklist
                            linkedAbcdeSelection={(formData.ecgAbcde as any)?.selectedPatterns}
                            data={formData.ecgScoring}
                            onUpdate={(data) => updateSection('ecgScoring', data)}
                          />
                        </div>

                        <Separator />
                        
                        <div id="ecg-abcde">
                          <EcgSyncopeAbcde
                            data={formData.ecgAbcde}
                            onUpdate={(data) => updateSection('ecgAbcde', data)}
                          />
                        </div>

                        <Separator />

                        <div id="syncope-medications">
                          <SectionWithProgress sectionId="syncope-medications" data={formData.syncopeMedications}>
                            <SyncopeMedicationsSection
                              data={formData.syncopeMedications}
                              onUpdate={(data) => updateSection('syncopeMedications', data)}
                            />
                          </SectionWithProgress>
                        </div>

                        <Separator />

                        <div id="anti-arrhythmics">
                          <AntiArrhythmicsSection />
                        </div>

                        <Separator />
                        
                        <div id="lab-tests">
                          <SectionWithProgress sectionId="lab-tests" data={formData.labTests}>
                            <LabTestsSection 
                              data={formData.labTests} 
                              onUpdate={(data) => updateSection('labTests', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="initial-evaluation">
                          <SectionWithProgress sectionId="initial-evaluation" data={formData.initialEvaluation}>
                            <InitialEvaluationSection 
                              data={formData.initialEvaluation} 
                              onUpdate={(data) => updateSection('initialEvaluation', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="tilt-test">
                          <SectionWithProgress sectionId="tilt-test" data={formData.tiltTestProtocol}>
                            <TiltTestProtocolSection 
                              data={formData.tiltTestProtocol} 
                              onUpdate={(data) => updateSection('tiltTestProtocol', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="risk-score">
                          <SectionWithProgress sectionId="risk-score" data={formData.riskScore}>
                            <RiskScoreSection 
                              data={formData.riskScore} 
                              onUpdate={(data) => updateSection('riskScore', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="subclavian-steal">
                          <SectionWithProgress sectionId="subclavian-steal" data={formData.subclavianSteal}>
                            <SubclavianStealSection 
                              data={formData.subclavianSteal} 
                              onUpdate={(data) => updateSection('subclavianSteal', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="carotid-massage">
                          <SectionWithProgress sectionId="carotid-massage" data={formData.carotidSinusMassage}>
                            <CarotidSinusMassageSection 
                              data={formData.carotidSinusMassage} 
                              onUpdate={(data) => updateSection('carotidSinusMassage', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="orthostatic-intolerance">
                          <SectionWithProgress sectionId="orthostatic-intolerance" data={formData.orthostaticIntolerance}>
                            <OrthostaticIntoleranceSection 
                              data={formData.orthostaticIntolerance} 
                              onUpdate={(data) => updateSection('orthostaticIntolerance', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="autonomic-testing">
                          <SectionWithProgress sectionId="autonomic-testing" data={formData.autonomicTesting}>
                            <AutonomicTestingSection 
                              data={formData.autonomicTesting} 
                              onUpdate={(data) => updateSection('autonomicTesting', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Differential Diagnosis Group */}
                    <AccordionItem value="differential-diagnosis" className="border rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Brain className="h-5 w-5 text-[hsl(280_75%_60%)]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Differential Diagnosis</h2>
                            <p className="text-xs text-muted-foreground font-normal">Clinical reasoning, diagnostic criteria, and AI-assisted analysis</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-6 pb-4 space-y-8">
                        <div id="differential-diagnosis-section">
                          <SectionWithProgress sectionId="differential-diagnosis-section" data={formData.differentialDiagnosis}>
                            <DifferentialDiagnosisSection 
                              data={formData.differentialDiagnosis} 
                              onUpdate={(data) => updateSection('differentialDiagnosis', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="diagnostic-criteria">
                          <SectionWithProgress sectionId="diagnostic-criteria" data={formData.diagnosticCriteria}>
                            <DiagnosticCriteriaSection 
                              data={formData.diagnosticCriteria} 
                              onUpdate={(data) => updateSection('diagnosticCriteria', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                        
                        <Separator />
                        
                        <div id="ai-diagnosis">
                          <AIDiagnosisSection />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Management Group */}
                    <AccordionItem value="management" className="border rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Shield className="h-5 w-5 text-[hsl(160_70%_45%)]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Interventions & Management</h2>
                            <p className="text-xs text-muted-foreground font-normal">Treatment plan including non-pharmacological, pharmacological, and device therapies</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-6 pb-4 space-y-8">
                        <div id="interventions">
                          <SectionWithProgress sectionId="interventions" data={formData.interventions}>
                            <InterventionsSection 
                              data={formData.interventions} 
                              onUpdate={(data) => updateSection('interventions', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Drop Attacks Group */}
                    <AccordionItem value="drop-attacks-group" className="border rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-[hsl(0_85%_60%)]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Drop Attacks Workup</h2>
                            <p className="text-xs text-muted-foreground font-normal">Evaluation of sudden falls with or without loss of consciousness</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pt-6 pb-4 space-y-8">
                        <div id="drop-attacks">
                          <SectionWithProgress sectionId="drop-attacks" data={formData.dropAttacks}>
                            <DropAttacksSection 
                              data={formData.dropAttacks} 
                              onUpdate={(data) => updateSection('dropAttacks', data)} 
                            />
                          </SectionWithProgress>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
                    <Button size="lg" className="bg-gradient-sunset hover:opacity-90 text-white border-0 shadow-glow">
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

              <footer className="mt-10 border-t border-border/50 pt-6 pb-2 print:hidden">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
                  <Link to="/disclaimer" className="hover:text-primary transition-colors">Medical Disclaimer</Link>
                  <Link to="/account-deletion" className="hover:text-primary transition-colors">Account Deletion</Link>
                </div>
                <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
                  © 2026 Syncope &amp; Loss of Consciousness Assessment. For educational use only.
                </p>
              </footer>
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
