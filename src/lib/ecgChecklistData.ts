
export type EcgChecklistCategory = 
  | "ischemia" 
  | "pre_excitation" 
  | "conduction" 
  | "channelopathy" 
  | "structural" 
  | "arrhythmogenic_cardiomyopathy" 
  | "repolarization" 
  | "thromboembolic"
  | "device"
  | "bradycardia";

export interface EcgChecklistItem {
  id: string;
  label: string;
  category: EcgChecklistCategory;
  criteria: string[];
  score: number;
  urgentOverride?: boolean;
  urgentOverrideConditions?: string[];
  modifierCriteria?: string[];
  clinicalCorrelates?: string[];
  action: string;
}

export interface EcgChecklistInterpretation {
  min: number;
  max: number;
  label: string;
  action: string;
}

export const ecgChecklistItems: EcgChecklistItem[] = [
  {
    id: "wellens_pattern",
    label: "Wellens pattern",
    category: "ischemia",
    criteria: [
      "Recent anginal chest pain, now pain-free",
      "Biphasic T waves in V2-V3",
      "OR deeply symmetric T-wave inversion in V2-V3, possibly extending V1-V6",
      "No pathologic precordial Q waves",
      "Preserved R-wave progression",
      "No significant ST elevation; ST shift less than 1 mm",
      "Normal or minimally elevated cardiac biomarkers when available"
    ],
    score: 3,
    urgentOverride: true,
    action: "Treat as possible critical LAD ischemia; urgent ACS/cardiologist assessment. Avoid exercise stress testing until specialist review."
  },
  {
    id: "wpw_preexcitation",
    label: "WPW / ventricular pre-excitation",
    category: "pre_excitation",
    criteria: [
      "PR interval less than 120 ms",
      "Delta wave present",
      "QRS duration greater than 110-120 ms",
      "Secondary ST-T changes may be present"
    ],
    score: 2,
    urgentOverrideConditions: [
      "Pre-excited atrial fibrillation",
      "Rapid irregular wide-complex tachycardia",
      "Exertional syncope",
      "Family history of sudden cardiac death"
    ],
    action: "Cardiology/electrophysiology assessment; urgent evaluation if override condition is present."
  },
  {
    id: "first_degree_av_block",
    label: "Increased PR interval / first-degree AV block",
    category: "conduction",
    criteria: [
      "PR interval greater than 200 ms"
    ],
    score: 1,
    modifierCriteria: [
      "Marked first-degree AV block: PR interval greater than 300 ms",
      "Associated bundle-branch block",
      "Associated syncope, bradycardia, or AV-nodal-blocking drugs"
    ],
    action: "Review drugs and conduction disease; isolated mild first-degree AV block is usually not sufficient to explain syncope."
  },
  {
    id: "av_block_high_grade",
    label: "Obstructed AV conduction / high-grade AV block",
    category: "conduction",
    criteria: [
      "Mobitz I: progressive PR prolongation followed by non-conducted P wave",
      "Mobitz II: fixed PR interval with intermittent non-conducted P wave",
      "2:1 AV block",
      "Advanced second-degree AV block",
      "Complete AV block: AV dissociation with escape rhythm"
    ],
    score: 3,
    urgentOverrideConditions: [
      "Mobitz II AV block",
      "2:1 or advanced second-degree AV block",
      "Complete AV block",
      "Symptomatic bradycardia"
    ],
    action: "Urgent monitored assessment and cardiology review; assess pacing requirement."
  },
  {
    id: "brugada_type_1",
    label: "Brugada Type 1 pattern",
    category: "channelopathy",
    criteria: [
      "Coved ST-segment elevation at least 2 mm",
      "Right precordial leads V1-V2, sometimes V3",
      "Descending ST segment followed by inverted T wave",
      "Consider high right-precordial lead placement if suspicion remains"
    ],
    score: 3,
    urgentOverride: true,
    action: "Urgent cardiology/electrophysiology assessment in unexplained syncope; exclude fever, electrolyte disturbance, and sodium-channel-blocking drug effects."
  },
  {
    id: "bifascicular_block",
    label: "Bifascicular block",
    category: "conduction",
    criteria: [
      "RBBB plus left anterior fascicular block",
      "OR RBBB plus left posterior fascicular block",
      "OR left bundle branch block / major intraventricular conduction disease"
    ],
    score: 2,
    urgentOverrideConditions: ["Unexplained syncope with bifascicular block"],
    action: "Evaluate for intermittent high-grade AV block; urgent cardiology/rhythm assessment."
  },
  {
    id: "lvh_pressure_overload",
    label: "LVH / pressure-overload phenotype",
    category: "structural",
    criteria: [
      "Sokolow-Lyon: S in V1 plus R in V5 or V6 at least 35 mm",
      "OR R wave in aVL at least 11 mm",
      "OR Cornell voltage: R in aVL plus S in V3 greater than 28 mm in men or greater than 20 mm in women",
      "Lateral ST depression/T-wave inversion may indicate LVH strain"
    ],
    score: 2,
    clinicalCorrelates: [
      "Aortic stenosis",
      "Hypertension",
      "Hypertrophic cardiomyopathy"
    ],
    action: "ECG cannot establish aortic stenosis; obtain echocardiography if murmur, exertional syncope, or structural-heart-disease suspicion."
  },
  {
    id: "hcm_hocm_phenotype",
    label: "HCM/HOCM ECG phenotype",
    category: "structural",
    criteria: [
      "LVH voltage",
      "Narrow, deep dagger-like Q waves in inferior and/or lateral leads",
      "Left atrial enlargement",
      "Diffuse or giant T-wave inversion, particularly in apical HCM",
      "ST-T repolarization abnormalities"
    ],
    score: 2,
    urgentOverrideConditions: ["Exertional syncope, supine syncope, ventricular arrhythmia, or family history of HCM/sudden death"],
    action: "Urgent echocardiography and cardiology assessment when clinical concern exists."
  },
  {
    id: "epsilon_wave_arvc",
    label: "Epsilon wave / ARVC phenotype",
    category: "arrhythmogenic_cardiomyopathy",
    criteria: [
      "Low-amplitude signal after QRS and before T wave in V1-V3",
      "T-wave inversion in V1-V3 beyond expected age/context",
      "Prolonged terminal activation or fragmented QRS in right precordial leads",
      "Ventricular ectopy or VT with left bundle branch block morphology"
    ],
    score: 3,
    urgentOverrideConditions: ["Unexplained syncope with ARVC phenotype or ventricular arrhythmia"],
    action: "Urgent cardiology/electrophysiology evaluation; consider echo, cardiac MRI, ambulatory rhythm monitoring, and family assessment."
  },
  {
    id: "long_qtc",
    label: "Long QTc",
    category: "repolarization",
    criteria: [
      "QTc 480 ms or greater is clearly abnormal",
      "QTc 500 ms or greater has higher torsades risk",
      "Review for QT-prolonging medicines and hypokalemia, hypomagnesemia, hypocalcemia"
    ],
    score: 3,
    urgentOverrideConditions: ["QTc at least 500 ms with syncope, ventricular ectopy, or torsades de pointes"],
    action: "Urgently correct reversible causes, stop avoidable QT-prolonging drugs, monitor rhythm, and involve cardiology."
  },
  {
    id: "short_qtc",
    label: "Short QTc",
    category: "repolarization",
    criteria: [
      "QTc 330 ms or less strongly supports short-QT syndrome",
      "QTc less than 360 ms is suspicious in appropriate clinical and family context"
    ],
    score: 2,
    urgentOverrideConditions: ["Unexplained syncope plus very short QTc or family history of sudden death"],
    action: "Cardiology/electrophysiology evaluation for possible inherited channelopathy."
  },
  {
    id: "pulmonary_embolism_rv_strain",
    label: "Pulmonary embolism / RV-strain pattern",
    category: "thromboembolic",
    criteria: [
      "Sinus tachycardia",
      "New right bundle branch block",
      "Right-axis deviation",
      "S1Q3T3 pattern",
      "Anterior T-wave inversion in V1-V4",
      "Right atrial enlargement or tall R wave in V1"
    ],
    score: 2,
    urgentOverrideConditions: ["Syncope with hypotension, hypoxemia, dyspnea, chest pain, or RV-strain ECG pattern"],
    action: "ECG is not diagnostic; assess for pulmonary embolism using clinical probability, D-dimer when appropriate, imaging, and echocardiography in unstable patients."
  },
  {
    id: "pacemaker_malfunction",
    label: "Pacemaker malfunction",
    category: "device",
    criteria: [
      "Failure to pace",
      "Failure to sense",
      "Cardiac pauses related to device failure",
      "Lead fracture or displacement evidence"
    ],
    score: 3,
    urgentOverride: true,
    action: "Urgent cardiology/pacing review; monitor rhythm; consider emergency pacing if unstable."
  },
  {
    id: "severe_sinus_bradycardia",
    label: "Severe sinus bradycardia",
    category: "bradycardia",
    criteria: [
      "Sinus rate <40 bpm",
      "Sinus pauses ≥3 seconds",
      "Sinoatrial block"
    ],
    score: 2,
    urgentOverrideConditions: ["Symptomatic bradycardia", "Syncope during bradycardia"],
    action: "Assess for reversible causes (drugs, electrolytes, ischemia); urgent cardiac evaluation."
  },
  {
    id: "acute_ischemia_stemi",
    label: "Acute Ischemia / STEMI pattern",
    category: "ischemia",
    criteria: [
      "ST-segment elevation in two or more contiguous leads",
      "New LBBB",
      "Hyperacute T waves",
      "ST depression suggesting reciprocal change or NSTEMI"
    ],
    score: 3,
    urgentOverride: true,
    action: "Urgent ACS protocol; cardiology/cath lab activation as appropriate."
  }
];

export const ecgChecklistInterpretations: EcgChecklistInterpretation[] = [
  {
    min: 0,
    max: 0,
    label: "No listed high-risk pattern detected",
    action: "Continue standard syncope assessment; a normal ECG does not exclude serious disease."
  },
  {
    min: 1,
    max: 2,
    label: "Abnormal ECG feature",
    action: "Review clinical context, drugs, electrolytes, family history, and arrange appropriate cardiac evaluation."
  },
  {
    min: 3,
    max: 4,
    label: "High-risk ECG phenotype",
    action: "Consider monitored evaluation and urgent cardiology/electrophysiology review."
  },
  {
    min: 5,
    max: 25,
    label: "Multiple high-risk ECG abnormalities",
    action: "Urgent monitored cardiac assessment and targeted workup."
  }
];

export const globalUrgentTriggers = [
  "Sustained VT, polymorphic VT, torsades de pointes, ventricular fibrillation",
  "Complete heart block, Mobitz II, 2:1 AV block, advanced second-degree AV block with symptoms",
  "Definite acute ischemic/STEMI pattern or suspected Wellens syndrome",
  "Type 1 Brugada pattern with unexplained syncope",
  "QTc at least 500 ms with syncope or ventricular arrhythmia",
  "Bifascicular block with unexplained syncope",
  "WPW with pre-excited AF or rapid irregular wide-complex tachycardia",
  "ARVC phenotype with syncope or ventricular arrhythmia"
];

export function computeChecklistScore(
  selectedIds: Set<string>,
  urgentOverrideIds: Set<string>,
  globalTriggerIds: Set<string>
) {
  let score = 0;
  let isUrgent = globalTriggerIds.size > 0;
  const activeItems: EcgChecklistItem[] = [];

  ecgChecklistItems.forEach(item => {
    if (selectedIds.has(item.id)) {
      score += item.score;
      activeItems.push(item);
      if (item.urgentOverride || urgentOverrideIds.has(item.id)) {
        isUrgent = true;
      }
    }
  });

  const interpretation = ecgChecklistInterpretations.find(
    i => score >= i.min && score <= i.max
  ) || ecgChecklistInterpretations[ecgChecklistInterpretations.length - 1];

  return {
    score,
    isUrgent,
    activeItems,
    interpretation
  };
}

/** Maps ABCDE/WOBBLER mini-screen pattern ids → checklist item ids */
export const abcdeToChecklistMap: Record<string, string> = {
  "av-block": "av_block_high_grade",
  "brugada": "brugada_type_1",
  "delta-wpw": "wpw_preexcitation",
  "epsilon-arvc": "epsilon_wave_arvc",
  "wellens": "wellens_pattern",
  "long-qt": "long_qtc",
  "short-qt": "short_qtc",
  "rv-strain": "pulmonary_embolism_rv_strain",
  "bifascicular": "bifascicular_block",
  "lvh-hocm": "lvh_pressure_overload",
  "sinus-brady": "severe_sinus_bradycardia",
  "complete-hb": "av_block_high_grade",
};

export function mapAbcdeSelectionToChecklist(
  selected: Record<string, boolean> = {}
): string[] {
  return Object.entries(selected)
    .filter(([, v]) => v)
    .map(([id]) => abcdeToChecklistMap[id])
    .filter(Boolean) as string[];
}

export interface EcgMeasurements {
  prInterval?: number;
  qrsDuration?: number;
  qtcInterval?: number;
  leadFindings?: string[];
}

export function analyzeMeasurements(measurements: EcgMeasurements): string[] {
  const triggeredIds = new Set<string>();
  const { prInterval, qrsDuration, qtcInterval, leadFindings } = measurements;

  // PR Interval Logic
  if (prInterval) {
    if (prInterval > 200) {
      triggeredIds.add("first_degree_av_block");
    }
    if (prInterval < 120 && qrsDuration && qrsDuration > 110) {
      triggeredIds.add("wpw_preexcitation");
    }
  }

  // QRS Duration Logic
  if (qrsDuration) {
    if (qrsDuration >= 120) {
      // Typically bifascicular or general conduction delay in this context
      triggeredIds.add("bifascicular_block");
    }
  }

  // QTc Logic
  if (qtcInterval) {
    if (qtcInterval >= 480) {
      triggeredIds.add("long_qtc");
    } else if (qtcInterval <= 330) {
      triggeredIds.add("short_qtc");
    }
  }

  // Lead Findings Mapping
  if (leadFindings) {
    if (leadFindings.includes("coved_st_v1_v2")) triggeredIds.add("brugada_type_1");
    if (leadFindings.includes("biphasic_t_v2_v3")) triggeredIds.add("wellens_pattern");
    if (leadFindings.includes("deep_t_inversion_v2_v3")) triggeredIds.add("wellens_pattern");
    if (leadFindings.includes("s1q3t3")) triggeredIds.add("pulmonary_embolism_rv_strain");
    if (leadFindings.includes("epsilon_wave")) triggeredIds.add("epsilon_wave_arvc");
  }

  return Array.from(triggeredIds);
}

export const LEAD_FINDING_OPTIONS = [
  { id: "coved_st_v1_v2", label: "Coved ST elevation (V1-V2)" },
  { id: "biphasic_t_v2_v3", label: "Biphasic T-waves (V2-V3)" },
  { id: "deep_t_inversion_v2_v3", label: "Deep T-inversion (V2-V3)" },
  { id: "s1q3t3", label: "S1Q3T3 Pattern" },
  { id: "epsilon_wave", label: "Epsilon wave (V1-V3)" },
  { id: "dagger_q_waves", label: "Dagger Q-waves (Inferior/Lateral)" },
];
