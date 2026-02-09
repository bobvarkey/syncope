import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const en: Record<string, string> = {
  // App header
  'app.title': 'Loss of Consciousness Assessment',
  'app.subtitle': 'Clinical Questionnaire for Seizure, Syncope, LOC and Orthostatic intolerance Evaluation',
  
  // Patient Info
  'patient.title': 'Patient Information',
  'patient.optional': '(Optional)',
  'patient.name': 'Patient Name',
  'patient.name.placeholder': 'Enter patient name',
  'patient.age': 'Age (years)',
  'patient.age.placeholder': 'Enter age',
  'patient.sex': 'Sex',
  'patient.male': 'Male',
  'patient.female': 'Female',
  'patient.other': 'Other',
  
  // Section headers
  'section.clinicalHistory': 'Clinical History',
  'section.clinicalHistory.desc': 'Patient history and episode characteristics',
  'section.investigations': 'Clinical Investigations',
  'section.investigations.desc': 'Diagnostic tests, examinations, and objective findings',
  'section.differential': 'Differential Diagnosis',
  'section.differential.desc': 'Clinical reasoning, diagnostic criteria, and AI-assisted analysis',
  
  // Form card
  'form.title': 'Patient Assessment Form',
  'form.description': 'Complete all sections to evaluate the episode of loss of consciousness',
  
  // Summary
  'summary.title': 'Assessment Summary',
  'summary.description': 'Comprehensive analysis and diagnostic impressions based on completed data',
  'summary.clinicalSummary': 'Clinical Summary & Diagnostic Impression',
  'summary.automatedAnalysis': 'Automated analysis of assessment findings with diagnostic considerations',
  'summary.riskFactors': 'Risk Factor Analysis',
  'summary.noRisks': 'No significant risk factors identified in completed sections',
  'summary.investigations': 'Investigation Results',
  'summary.diagnosticImpressions': 'Diagnostic Impressions',
  'summary.basedOnData': 'Based on completed assessment data and investigation results',
  'summary.insufficientData': 'Insufficient data to generate diagnostic impressions. Complete clinical history and investigations for analysis.',
  'summary.recommendations': 'Clinical Recommendations',
  'summary.completeAssessment': 'Complete the assessment to receive tailored clinical recommendations',
  'summary.importantNote': 'Important Note',
  'summary.disclaimer': 'This summary is generated automatically based on entered data and established clinical criteria. It is intended to assist clinical decision-making but should not replace comprehensive clinical judgment. All recommendations should be individualized based on the complete clinical context.',
  
  // Tilt test
  'tilt.title': 'Head-Up Tilt Table Test (HUTT)',
  'tilt.positive': 'Positive',
  'tilt.performed': 'Performed',
  'tilt.responseType': 'Response Type',
  'tilt.haemodynamic': 'Haemodynamic Response',
  'tilt.notPerformed': 'Tilt Table Test: Not performed or data not entered',
  
  // Carotid Sinus Massage
  'csm.title': 'Carotid Sinus Massage',
  'csm.abnormal': 'Abnormal',
  'csm.normal': 'Normal',
  'csm.responseClassification': 'Response Classification',
  'csm.notPerformed': 'Carotid Sinus Massage: Not performed or data not entered',
  
  // Orthostatic Intolerance
  'oi.title': 'Orthostatic Intolerance Testing',
  'oi.phenotype': 'Phenotype',
  'oi.notPerformed': 'Orthostatic Intolerance Testing: Not performed or data not entered',
  
  // Confidence levels
  'confidence.high': 'High Confidence',
  'confidence.moderate': 'Moderate Confidence',
  'confidence.low': 'Low Confidence',
  
  // Buttons
  'button.print': 'Print Assessment',
  'button.export': 'Export Data',
  'button.exportPdf': 'Export as PDF',
  'button.exportWord': 'Export as Word',
  
  // Language
  'language.english': 'English',
  'language.malayalam': 'മലയാളം',
  
  // Risk
  'risk': 'Risk',
};

// Malayalam translations
const ml: Record<string, string> = {
  // App header
  'app.title': 'ബോധക്ഷയ വിലയിരുത്തൽ',
  'app.subtitle': 'അപസ്മാരം, സിൻകോപ്പ്, LOC, ഓർത്തോസ്റ്റാറ്റിക് അസഹിഷ്ണുത മൂല്യനിർണ്ണയത്തിനുള്ള ക്ലിനിക്കൽ ചോദ്യാവലി',
  
  // Patient Info
  'patient.title': 'രോഗി വിവരങ്ങൾ',
  'patient.optional': '(ഐച്ഛികം)',
  'patient.name': 'രോഗിയുടെ പേര്',
  'patient.name.placeholder': 'രോഗിയുടെ പേര് നൽകുക',
  'patient.age': 'പ്രായം (വർഷങ്ങൾ)',
  'patient.age.placeholder': 'പ്രായം നൽകുക',
  'patient.sex': 'ലിംഗഭേദം',
  'patient.male': 'പുരുഷൻ',
  'patient.female': 'സ്ത്രീ',
  'patient.other': 'മറ്റുള്ളവ',
  
  // Section headers
  'section.clinicalHistory': 'ക്ലിനിക്കൽ ചരിത്രം',
  'section.clinicalHistory.desc': 'രോഗിയുടെ ചരിത്രവും എപ്പിസോഡ് സവിശേഷതകളും',
  'section.investigations': 'ക്ലിനിക്കൽ അന്വേഷണങ്ങൾ',
  'section.investigations.desc': 'ഡയഗ്നോസ്റ്റിക് ടെസ്റ്റുകൾ, പരിശോധനകൾ, വസ്തുനിഷ്ഠമായ കണ്ടെത്തലുകൾ',
  'section.differential': 'ഡിഫറൻഷ്യൽ ഡയഗ്നോസിസ്',
  'section.differential.desc': 'ക്ലിനിക്കൽ യുക്തി, ഡയഗ്നോസ്റ്റിക് മാനദണ്ഡങ്ങൾ, AI-സഹായിത വിശകലനം',
  
  // Form card
  'form.title': 'രോഗി വിലയിരുത്തൽ ഫോം',
  'form.description': 'ബോധക്ഷയ എപ്പിസോഡ് വിലയിരുത്തുന്നതിന് എല്ലാ വിഭാഗങ്ങളും പൂർത്തിയാക്കുക',
  
  // Summary
  'summary.title': 'വിലയിരുത്തൽ സംഗ്രഹം',
  'summary.description': 'പൂർത്തിയാക്കിയ ഡാറ്റയെ അടിസ്ഥാനമാക്കിയുള്ള സമഗ്ര വിശകലനവും ഡയഗ്നോസ്റ്റിക് ഇംപ്രഷനുകളും',
  'summary.clinicalSummary': 'ക്ലിനിക്കൽ സംഗ്രഹവും ഡയഗ്നോസ്റ്റിക് ഇംപ്രഷനും',
  'summary.automatedAnalysis': 'ഡയഗ്നോസ്റ്റിക് പരിഗണനകളുള്ള വിലയിരുത്തൽ കണ്ടെത്തലുകളുടെ സ്വയംചാലിത വിശകലനം',
  'summary.riskFactors': 'റിസ്ക് ഫാക്ടർ വിശകലനം',
  'summary.noRisks': 'പൂർത്തിയാക്കിയ വിഭാഗങ്ങളിൽ കാര്യമായ അപകട ഘടകങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
  'summary.investigations': 'അന്വേഷണ ഫലങ്ങൾ',
  'summary.diagnosticImpressions': 'ഡയഗ്നോസ്റ്റിക് ഇംപ്രഷനുകൾ',
  'summary.basedOnData': 'പൂർത്തിയാക്കിയ വിലയിരുത്തൽ ഡാറ്റയും അന്വേഷണ ഫലങ്ങളും അടിസ്ഥാനമാക്കി',
  'summary.insufficientData': 'ഡയഗ്നോസ്റ്റിക് ഇംപ്രഷനുകൾ സൃഷ്ടിക്കാൻ അപര്യാപ്തമായ ഡാറ്റ. വിശകലനത്തിനായി ക്ലിനിക്കൽ ചരിത്രവും അന്വേഷണങ്ങളും പൂർത്തിയാക്കുക.',
  'summary.recommendations': 'ക്ലിനിക്കൽ ശുപാർശകൾ',
  'summary.completeAssessment': 'അനുയോജ്യമായ ക്ലിനിക്കൽ ശുപാർശകൾ ലഭിക്കാൻ വിലയിരുത്തൽ പൂർത്തിയാക്കുക',
  'summary.importantNote': 'പ്രധാന കുറിപ്പ്',
  'summary.disclaimer': 'ഈ സംഗ്രഹം നൽകിയ ഡാറ്റയെയും സ്ഥാപിത ക്ലിനിക്കൽ മാനദണ്ഡങ്ങളെയും അടിസ്ഥാനമാക്കി സ്വയമേവ സൃഷ്ടിക്കപ്പെട്ടതാണ്. ഇത് ക്ലിനിക്കൽ തീരുമാനമെടുക്കലിനെ സഹായിക്കാൻ ഉദ്ദേശിച്ചുള്ളതാണ്, എന്നാൽ സമഗ്രമായ ക്ലിനിക്കൽ വിധിന്യായത്തെ മാറ്റിസ്ഥാപിക്കരുത്. എല്ലാ ശുപാർശകളും പൂർണ്ണമായ ക്ലിനിക്കൽ സന്ദർഭത്തെ അടിസ്ഥാനമാക്കി വ്യക്തിഗതമാക്കണം.',
  
  // Tilt test
  'tilt.title': 'ഹെഡ്-അപ്പ് ടിൽറ്റ് ടേബിൾ ടെസ്റ്റ് (HUTT)',
  'tilt.positive': 'പോസിറ്റീവ്',
  'tilt.performed': 'നടത്തി',
  'tilt.responseType': 'പ്രതികരണ തരം',
  'tilt.haemodynamic': 'ഹീമോഡൈനാമിക് പ്രതികരണം',
  'tilt.notPerformed': 'ടിൽറ്റ് ടേബിൾ ടെസ്റ്റ്: നടത്തിയില്ല അല്ലെങ്കിൽ ഡാറ്റ നൽകിയിട്ടില്ല',
  
  // Carotid Sinus Massage
  'csm.title': 'കരോട്ടിഡ് സൈനസ് മസാജ്',
  'csm.abnormal': 'അസാധാരണം',
  'csm.normal': 'സാധാരണ',
  'csm.responseClassification': 'പ്രതികരണ വർഗ്ഗീകരണം',
  'csm.notPerformed': 'കരോട്ടിഡ് സൈനസ് മസാജ്: നടത്തിയില്ല അല്ലെങ്കിൽ ഡാറ്റ നൽകിയിട്ടില്ല',
  
  // Orthostatic Intolerance
  'oi.title': 'ഓർത്തോസ്റ്റാറ്റിക് അസഹിഷ്ണുത ടെസ്റ്റിംഗ്',
  'oi.phenotype': 'ഫിനോടൈപ്പ്',
  'oi.notPerformed': 'ഓർത്തോസ്റ്റാറ്റിക് അസഹിഷ്ണുത ടെസ്റ്റിംഗ്: നടത്തിയില്ല അല്ലെങ്കിൽ ഡാറ്റ നൽകിയിട്ടില്ല',
  
  // Confidence levels
  'confidence.high': 'ഉയർന്ന വിശ്വാസ്യത',
  'confidence.moderate': 'മിതമായ വിശ്വാസ്യത',
  'confidence.low': 'കുറഞ്ഞ വിശ്വാസ്യത',
  
  // Buttons
  'button.print': 'വിലയിരുത്തൽ പ്രിന്റ് ചെയ്യുക',
  'button.export': 'ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുക',
  'button.exportPdf': 'PDF ആയി എക്സ്പോർട്ട്',
  'button.exportWord': 'Word ആയി എക്സ്പോർട്ട്',
  
  // Language
  'language.english': 'English',
  'language.malayalam': 'മലയാളം',
  
  // Risk
  'risk': 'അപകടം',
};

const translations: Record<Language, Record<string, string>> = { en, ml };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
