import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  Info,
  Printer,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  Timer,
  Waves,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SexAtBirth = "female" | "male" | "intersex" | "not_recorded";

interface UprightReading {
  time_minutes: number;
  SBP_mmHg: number | "";
  DBP_mmHg: number | "";
  HR_bpm: number | "";
  symptoms: string[];
  symptom_notes: string;
}

interface McassState {
  // Patient intake
  patient_id: string;
  assessment_date: string;
  age_years: number | "";
  sex_at_birth: SexAtBirth | "";
  height_cm: number | "";
  weight_kg: number | "";
  test_indication: string[];
  relevant_conditions: string[];
  clinical_notes: string;

  // Pre-test preparation
  last_food_hours: number | "";
  caffeine_last_use_hours: number | "";
  nicotine_last_use_hours: number | "";
  alcohol_last_use_hours: number | "";
  vigorous_exercise_last_24_hours: string;
  medication_review_completed: boolean;
  medication_hold_plan_prescriber_approved: string;
  medications_affecting_autonomic_testing: string[];
  medication_notes: string;
  supine_rest_minutes: number | "";
  room_temperature_celsius: number | "";

  // Safety screen
  fall_precautions_used: boolean;
  supervised_standing_or_tilt: boolean;
  active_chest_pain: boolean;
  unstable_cardiopulmonary_status: boolean;
  recent_syncope_with_injury_risk: boolean;
  test_deferred_or_modified: boolean;
  safety_notes: string;

  // Symptoms
  orthostatic_symptoms: string[];
  sudomotor_symptoms: string[];
  symptom_chronicity_months: number | "";
  symptom_notes: string;

  // Resting HRV
  hrv_rhythm: string;
  hrv_recording_duration_minutes: number | "";
  hrv_artifact_percent: number | "";
  mean_heart_rate_bpm: number | "";
  mean_nn_interval_ms: number | "";
  SDNN_ms: number | "";
  SDSD_ms: number | "";
  RMSSD_ms: number | "";
  NN50_count: number | "";
  pNN50_percent: number | "";
  VLF_power_ms2: number | "";
  LF_power_ms2: number | "";
  HF_power_ms2: number | "";
  LF_HF_ratio: number | "";

  // Deep breathing
  db_breaths_per_minute: number | "";
  db_inspiration_seconds: number | "";
  db_expiration_seconds: number | "";
  db_acceptable_cycles: number | "";
  db_cycle_delta_hr_bpm: string;
  db_mean_delta_hr_bpm: number | "";
  db_EI_ratio: number | "";
  db_age_sex_normative_result: string;
  db_technical_quality: string;

  // Valsalva
  valsalva_performed: boolean;
  valsalva_strain_pressure_mmHg: number | "";
  valsalva_strain_duration_seconds: number | "";
  valsalva_acceptable_trials: number | "";
  valsalva_ratio: number | "";
  valsalva_ratio_normative_result: string;
  valsalva_beat_to_beat_bp_available: boolean;
  valsalva_late_phase_II_recovery: string;
  valsalva_phase_IV_overshoot: string;
  valsalva_adrenergic_interpretation: string;
  valsalva_notes: string;

  // Standing / tilt
  standing_performed: boolean;
  standing_method: string;
  standing_continuous_ecg: boolean;
  standing_continuous_beat_to_beat_bp: boolean;
  standing_supine_SBP_mmHg: number | "";
  standing_supine_DBP_mmHg: number | "";
  standing_supine_HR_bpm: number | "";
  standing_upright_readings: UprightReading[];
  standing_thirty_fifteen_ratio: number | "";
  standing_thirty_fifteen_normative_result: string;
  standing_test_terminated_early: boolean;
  standing_termination_reason: string;
  standing_notes: string;

  // Sustained handgrip
  handgrip_performed: boolean;
  handgrip_maximum_voluntary_contraction_kg: number | "";
  handgrip_target_percent_MVC: number | "";
  handgrip_duration_seconds: number | "";
  handgrip_baseline_DBP_mmHg: number | "";
  handgrip_peak_DBP_mmHg: number | "";
  handgrip_delta_DBP_mmHg: number | "";
  handgrip_interpretation: string;
  handgrip_notes: string;

  // Sudoscan
  sudoscan_performed: boolean;
  sudoscan_device_model: string;
  sudoscan_device_software_version: string;
  sudoscan_palmar_ESC_left_uS: number | "";
  sudoscan_palmar_ESC_right_uS: number | "";
  sudoscan_plantar_ESC_left_uS: number | "";
  sudoscan_plantar_ESC_right_uS: number | "";
  sudoscan_palmar_ESC_mean_uS: number | "";
  sudoscan_plantar_ESC_mean_uS: number | "";
  sudoscan_hand_lower_limit_normal_uS: number | "";
  sudoscan_foot_lower_limit_normal_uS: number | "";
  sudoscan_hand_status: string;
  sudoscan_foot_status: string;
  sudoscan_quality_flags: string[];
  sudoscan_quality_notes: string;

  // Clinician review / scoring
  clinician_cardiovagal_score: number | "";
  clinician_adrenergic_score: number | "";
  clinician_sudomotor_score: number | "";
  clinician_override_reason: string;
  clinician_interpretive_summary: string;
}

const initialState: McassState = {
  patient_id: "",
  assessment_date: new Date().toISOString().split("T")[0],
  age_years: "",
  sex_at_birth: "",
  height_cm: "",
  weight_kg: "",
  test_indication: [],
  relevant_conditions: [],
  clinical_notes: "",

  last_food_hours: "",
  caffeine_last_use_hours: "",
  nicotine_last_use_hours: "",
  alcohol_last_use_hours: "",
  vigorous_exercise_last_24_hours: "",
  medication_review_completed: false,
  medication_hold_plan_prescriber_approved: "",
  medications_affecting_autonomic_testing: [],
  medication_notes: "",
  supine_rest_minutes: "",
  room_temperature_celsius: "",

  fall_precautions_used: false,
  supervised_standing_or_tilt: false,
  active_chest_pain: false,
  unstable_cardiopulmonary_status: false,
  recent_syncope_with_injury_risk: false,
  test_deferred_or_modified: false,
  safety_notes: "",

  orthostatic_symptoms: [],
  sudomotor_symptoms: [],
  symptom_chronicity_months: "",
  symptom_notes: "",

  hrv_rhythm: "sinus",
  hrv_recording_duration_minutes: "",
  hrv_artifact_percent: "",
  mean_heart_rate_bpm: "",
  mean_nn_interval_ms: "",
  SDNN_ms: "",
  SDSD_ms: "",
  RMSSD_ms: "",
  NN50_count: "",
  pNN50_percent: "",
  VLF_power_ms2: "",
  LF_power_ms2: "",
  HF_power_ms2: "",
  LF_HF_ratio: "",

  db_breaths_per_minute: "",
  db_inspiration_seconds: "",
  db_expiration_seconds: "",
  db_acceptable_cycles: "",
  db_cycle_delta_hr_bpm: "",
  db_mean_delta_hr_bpm: "",
  db_EI_ratio: "",
  db_age_sex_normative_result: "",
  db_technical_quality: "",

  valsalva_performed: false,
  valsalva_strain_pressure_mmHg: "",
  valsalva_strain_duration_seconds: "",
  valsalva_acceptable_trials: "",
  valsalva_ratio: "",
  valsalva_ratio_normative_result: "",
  valsalva_beat_to_beat_bp_available: false,
  valsalva_late_phase_II_recovery: "",
  valsalva_phase_IV_overshoot: "",
  valsalva_adrenergic_interpretation: "",
  valsalva_notes: "",

  standing_performed: false,
  standing_method: "",
  standing_continuous_ecg: false,
  standing_continuous_beat_to_beat_bp: false,
  standing_supine_SBP_mmHg: "",
  standing_supine_DBP_mmHg: "",
  standing_supine_HR_bpm: "",
  standing_upright_readings: [],
  standing_thirty_fifteen_ratio: "",
  standing_thirty_fifteen_normative_result: "",
  standing_test_terminated_early: false,
  standing_termination_reason: "",
  standing_notes: "",

  handgrip_performed: false,
  handgrip_maximum_voluntary_contraction_kg: "",
  handgrip_target_percent_MVC: "",
  handgrip_duration_seconds: "",
  handgrip_baseline_DBP_mmHg: "",
  handgrip_peak_DBP_mmHg: "",
  handgrip_delta_DBP_mmHg: "",
  handgrip_interpretation: "",
  handgrip_notes: "",

  sudoscan_performed: false,
  sudoscan_device_model: "",
  sudoscan_device_software_version: "",
  sudoscan_palmar_ESC_left_uS: "",
  sudoscan_palmar_ESC_right_uS: "",
  sudoscan_plantar_ESC_left_uS: "",
  sudoscan_plantar_ESC_right_uS: "",
  sudoscan_palmar_ESC_mean_uS: "",
  sudoscan_plantar_ESC_mean_uS: "",
  sudoscan_hand_lower_limit_normal_uS: "",
  sudoscan_foot_lower_limit_normal_uS: "",
  sudoscan_hand_status: "",
  sudoscan_foot_status: "",
  sudoscan_quality_flags: [],
  sudoscan_quality_notes: "",

  clinician_cardiovagal_score: "",
  clinician_adrenergic_score: "",
  clinician_sudomotor_score: "",
  clinician_override_reason: "",
  clinician_interpretive_summary: "",
};

/* ------------------------------------------------------------------ */
/* Static option lists (from spec)                                     */
/* ------------------------------------------------------------------ */

const TEST_INDICATIONS = [
  "Orthostatic intolerance",
  "Syncope or presyncope",
  "Suspected neurogenic orthostatic hypotension",
  "Suspected POTS",
  "Diabetes CAN screening",
  "Peripheral neuropathy",
  "Small-fiber neuropathy",
  "Parkinson disease or parkinsonism",
  "Multiple system atrophy",
  "Amyloidosis",
  "Autoimmune autonomic ganglionopathy",
  "Unexplained tachycardia",
  "Abnormal sweating",
  "Research protocol",
  "Other",
];

const RELEVANT_CONDITIONS = [
  "Diabetes mellitus",
  "Prediabetes",
  "Peripheral neuropathy",
  "Small-fiber neuropathy",
  "Parkinsonism",
  "Multiple system atrophy",
  "Amyloidosis",
  "Autoimmune autonomic ganglionopathy",
  "Spinal cord disorder",
  "Heart failure",
  "Coronary artery disease",
  "Arrhythmia",
  "Chronic kidney disease",
  "Thyroid disease",
  "Pulmonary disease",
  "Other",
  "None known",
];

const MEDICATIONS_AFFECTING = [
  "Beta blocker",
  "Alpha agonist",
  "Alpha blocker",
  "Sympathomimetic",
  "Anticholinergic",
  "Cholinergic agent",
  "Diuretic",
  "Fludrocortisone",
  "Midodrine",
  "Ivabradine",
  "Digoxin",
  "Non-dihydropyridine calcium-channel blocker",
  "Antidepressant",
  "Antihistamine",
  "Over-the-counter cold medication",
  "Antiarrhythmic",
  "Dopaminergic medication",
  "Other",
  "None known",
];

const ORTHOSTATIC_SYMPTOMS = [
  "Light-headedness",
  "Weakness",
  "Blurred vision",
  "Presyncope",
  "Syncope",
  "Palpitations",
  "Tremulousness",
  "Dyspnea",
  "Chest discomfort",
  "Nausea",
  "Headache",
  "Fatigue",
  "None",
];

const SUDOMOTOR_SYMPTOMS = [
  "Reduced sweating",
  "Excessive sweating",
  "Heat intolerance",
  "Distal dry skin",
  "Night sweats",
  "None",
];

const UPRIGHT_SYMPTOMS = [
  "None",
  "Light-headedness",
  "Weakness",
  "Blurred vision",
  "Presyncope",
  "Syncope",
  "Palpitations",
  "Tremulousness",
  "Nausea",
  "Headache",
  "Dyspnea",
  "Chest discomfort",
  "Other",
];

const SUDOSCAN_QUALITY_FLAGS = [
  "None",
  "Poor contact",
  "Callus",
  "Skin disease",
  "Edema",
  "Peripheral vascular disease",
  "Temperature issue",
  "Amputation or missing site",
  "Other",
];

const CHRONOTROPIC_MEDS = [
  "Beta blocker",
  "Ivabradine",
  "Digoxin",
  "Non-dihydropyridine calcium-channel blocker",
  "Antiarrhythmic",
];

/* ------------------------------------------------------------------ */
/* Derived calculations                                                */
/* ------------------------------------------------------------------ */

const num = (v: number | ""): number | null => (v === "" || v === null || isNaN(v as number) ? null : Number(v));

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function parseDeltaHrList(s: string): number[] {
  return s
    .split(/[,\s]+/)
    .map((x) => parseFloat(x))
    .filter((x) => !isNaN(x));
}

interface Derived {
  maxSystolicDrop: number | null;
  maxDiastolicDrop: number | null;
  maxHrIncrease: number | null;
  threeMinSystolicDrop: number | null;
  threeMinDiastolicDrop: number | null;
  deltaHrDeltaSbp: number | null;
  ohPresent: boolean | null;
  ohDelayed: boolean | null;
  hrCompensationInadequate: boolean | null;
  neurogenicPattern: boolean | null;
  potsSupported: boolean | null;
  potsIndeterminate: boolean | null;
  handPercentLLN: number | null;
  footPercentLLN: number | null;
  handBelow50: boolean;
  footBelow50: boolean;
  abnormalCardiovagalCount: number;
  canStage: string;
  severityCategory: string;
  completeness: string;
  qualityWarnings: string[];
  pattern: string;
}

function computeDerived(s: McassState): Derived {
  const warnings: string[] = [];

  // Rhythm / HRV quality
  if (s.hrv_rhythm && s.hrv_rhythm !== "sinus") {
    warnings.push(
      "Standard time- and frequency-domain HRV metrics may be uninterpretable or misleading in non-sinus rhythm, paced rhythm, or frequent ectopy."
    );
  }
  const hrvDur = num(s.hrv_recording_duration_minutes);
  if (hrvDur !== null && hrvDur < 5) {
    warnings.push("Resting HRV duration is below 5 minutes; interpret short-term HRV measures cautiously.");
  }
  const artifact = num(s.hrv_artifact_percent);
  if (artifact !== null && artifact > 5) {
    warnings.push("Artifact burden is above a typical quality threshold. Review ECG data and preprocessing before interpretation.");
  }
  const cycles = num(s.db_acceptable_cycles);
  if (cycles !== null && cycles < 6) {
    warnings.push("Fewer than six acceptable deep-breathing cycles were recorded. Repeat testing or interpret cautiously.");
  }
  if (s.sudoscan_hand_status === "unknown no norms" || s.sudoscan_foot_status === "unknown no norms") {
    warnings.push(
      "Device-specific lower limits of normal are unavailable. Do not assign definitive sudomotor severity solely from broad screening cutoffs."
    );
  }
  const chronoHit = s.medications_affecting_autonomic_testing.some((m) => CHRONOTROPIC_MEDS.includes(m));
  if (chronoHit) {
    warnings.push(
      "Chronotropic medication exposure can confound deep-breathing HR response, standing HR response, POTS screening, and neurogenic-OH interpretation."
    );
  }
  const sudoscanQualityIssue = s.sudoscan_quality_flags.some(
    (f) =>
      f !== "None" &&
      ["Poor contact", "Callus", "Skin disease", "Edema", "Peripheral vascular disease", "Temperature issue", "Amputation or missing site"].includes(f)
  );
  if (sudoscanQualityIssue) {
    warnings.push("Sudoscan quality issue detected. ESC interpretation and sudomotor scoring may be limited.");
  }

  // Standing derived
  const supineSBP = num(s.standing_supine_SBP_mmHg);
  const supineDBP = num(s.standing_supine_DBP_mmHg);
  const supineHR = num(s.standing_supine_HR_bpm);
  const readings = s.standing_upright_readings.filter(
    (r) => r.SBP_mmHg !== "" && r.DBP_mmHg !== "" && r.HR_bpm !== ""
  );

  let maxSystolicDrop: number | null = null;
  let maxDiastolicDrop: number | null = null;
  let maxHrIncrease: number | null = null;
  let threeMinSystolicDrop: number | null = null;
  let threeMinDiastolicDrop: number | null = null;

  if (supineSBP !== null && readings.length > 0) {
    const sbps = readings.map((r) => Number(r.SBP_mmHg));
    maxSystolicDrop = supineSBP - Math.min(...sbps);
    const early = readings.filter((r) => r.time_minutes <= 3).map((r) => Number(r.SBP_mmHg));
    if (early.length > 0) threeMinSystolicDrop = supineSBP - Math.min(...early);
  }
  if (supineDBP !== null && readings.length > 0) {
    const dbps = readings.map((r) => Number(r.DBP_mmHg));
    maxDiastolicDrop = supineDBP - Math.min(...dbps);
    const early = readings.filter((r) => r.time_minutes <= 3).map((r) => Number(r.DBP_mmHg));
    if (early.length > 0) threeMinDiastolicDrop = supineDBP - Math.min(...early);
  }
  if (supineHR !== null && readings.length > 0) {
    const hrs = readings.map((r) => Number(r.HR_bpm));
    maxHrIncrease = Math.max(...hrs) - supineHR;
  }

  let deltaHrDeltaSbp: number | null = null;
  if (maxHrIncrease !== null && maxSystolicDrop !== null && maxSystolicDrop > 0) {
    deltaHrDeltaSbp = maxHrIncrease / maxSystolicDrop;
  }

  // OH logic
  let ohPresent: boolean | null = null;
  let ohDelayed: boolean | null = null;
  if (threeMinSystolicDrop !== null && threeMinDiastolicDrop !== null) {
    const earlyOH = threeMinSystolicDrop >= 20 || threeMinDiastolicDrop >= 10;
    const anyOH = (maxSystolicDrop !== null && maxSystolicDrop >= 20) || (maxDiastolicDrop !== null && maxDiastolicDrop >= 10);
    ohPresent = earlyOH || anyOH;
    ohDelayed = !earlyOH && anyOH;
  }

  // HR compensation
  let hrCompensationInadequate: boolean | null = null;
  if (maxHrIncrease !== null) hrCompensationInadequate = maxHrIncrease < 15;

  // Neurogenic pattern
  let neurogenicPattern: boolean | null = null;
  if (ohPresent === true && maxHrIncrease !== null && !chronoHit) {
    neurogenicPattern = maxHrIncrease < 15 || (deltaHrDeltaSbp !== null && deltaHrDeltaSbp < 0.5);
  }

  // POTS
  const age = num(s.age_years);
  let potsSupported: boolean | null = null;
  let potsIndeterminate = false;
  if (maxHrIncrease !== null && age !== null) {
    const threshold = age >= 20 ? 30 : age >= 12 ? 40 : null;
    if (threshold !== null) {
      const ohExplains = ohPresent === true;
      if (maxHrIncrease >= threshold && !ohExplains) potsSupported = true;
      else if (ohExplains) potsIndeterminate = true;
      else potsSupported = false;
    }
  }

  // Sudoscan
  const palmarMean = num(s.sudoscan_palmar_ESC_mean_uS);
  const plantarMean = num(s.sudoscan_plantar_ESC_mean_uS);
  const handLLN = num(s.sudoscan_hand_lower_limit_normal_uS);
  const footLLN = num(s.sudoscan_foot_lower_limit_normal_uS);
  let handPercentLLN: number | null = null;
  let footPercentLLN: number | null = null;
  if (palmarMean !== null && handLLN !== null && handLLN > 0) handPercentLLN = (100 * palmarMean) / handLLN;
  if (plantarMean !== null && footLLN !== null && footLLN > 0) footPercentLLN = (100 * plantarMean) / footLLN;
  const handBelow50 = handPercentLLN !== null && handPercentLLN < 50;
  const footBelow50 = footPercentLLN !== null && footPercentLLN < 50;

  // CAN stage
  let abnormalCardiovagalCount = 0;
  if (s.db_age_sex_normative_result === "abnormal") abnormalCardiovagalCount++;
  if (s.valsalva_ratio_normative_result === "abnormal") abnormalCardiovagalCount++;
  if (s.standing_thirty_fifteen_normative_result === "abnormal") abnormalCardiovagalCount++;

  let canStage = "No evidence of CAN";
  if (abnormalCardiovagalCount >= 1 && ohPresent === true) canStage = "Severe or advanced CAN";
  else if (abnormalCardiovagalCount >= 2) canStage = "Definite or confirmed CAN";
  else if (abnormalCardiovagalCount === 1) canStage = "Possible or early CAN";

  // Severity category
  const cv = num(s.clinician_cardiovagal_score);
  const ad = num(s.clinician_adrenergic_score);
  const su = num(s.clinician_sudomotor_score);
  const total = cv !== null && ad !== null && su !== null ? cv + ad + su : null;

  let severityCategory = "Not calculated";
  if (total !== null) {
    if (total === 0) severityCategory = "Normal";
    else if (total <= 3) severityCategory = "Mild autonomic dysfunction";
    else if (total <= 6) severityCategory = "Moderate autonomic dysfunction";
    else severityCategory = "Severe autonomic dysfunction";
  }

  // Completeness
  let completeness = "Not interpretable";
  const cvComplete = cv !== null;
  const adComplete = ad !== null;
  const suComplete = su !== null;
  if (cvComplete && adComplete && suComplete) completeness = "Complete mCASS";
  else if (cvComplete || adComplete || suComplete) completeness = "Partial autonomic profile";

  // Pattern
  let pattern = "Not assessed";
  if (cv !== null && ad !== null && su !== null) {
    const nonzero = [cv > 0, ad > 0, su > 0].filter(Boolean).length;
    if (nonzero >= 2) pattern = "Generalized autonomic dysfunction";
    else if (cv > 0 && cv >= ad && cv >= su) pattern = "Cardiovagal-predominant";
    else if (ad > 0 && ad >= cv && ad >= su) pattern = "Adrenergic-predominant";
    else if (su > 0 && su >= cv && su >= ad) pattern = "Sudomotor-predominant";
    else pattern = "No significant autonomic dysfunction";
  }

  return {
    maxSystolicDrop,
    maxDiastolicDrop,
    maxHrIncrease,
    threeMinSystolicDrop,
    threeMinDiastolicDrop,
    deltaHrDeltaSbp,
    ohPresent,
    ohDelayed,
    hrCompensationInadequate,
    neurogenicPattern,
    potsSupported,
    potsIndeterminate,
    handPercentLLN,
    footPercentLLN,
    handBelow50,
    footBelow50,
    abnormalCardiovagalCount,
    canStage,
    severityCategory,
    completeness,
    qualityWarnings: warnings,
    pattern,
  };
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  const toggle = (opt: string) => {
    if (opt === "None" || opt === "None known") {
      onChange([opt]);
      return;
    }
    const next = value.includes(opt) ? value.filter((x) => x !== opt) : [...value.filter((x) => x !== "None" && x !== "None known"), opt];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoSelect({
  value,
  onChange,
  options = ["yes", "no", "unknown"],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function BoolCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function McassMiniApp() {
  const [state, setState] = useState<McassState>(initialState);
  const [activeTab, setActiveTab] = useState("intake");

  const set = <K extends keyof McassState>(key: K, value: McassState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const derived = useMemo(() => computeDerived(state), [state]);

  const totalScore =
    num(state.clinician_cardiovagal_score) !== null &&
    num(state.clinician_adrenergic_score) !== null &&
    num(state.clinician_sudomotor_score) !== null
      ? (num(state.clinician_cardiovagal_score) as number) +
        (num(state.clinician_adrenergic_score) as number) +
        (num(state.clinician_sudomotor_score) as number)
      : null;

  const hardStops: string[] = [];
  if (state.test_deferred_or_modified)
    hardStops.push("The test was deferred or modified. Do not generate a complete mCASS without clinician confirmation of data validity.");
  if (state.unstable_cardiopulmonary_status)
    hardStops.push("Potential safety concern. Defer or modify testing pending clinician review.");
  if (state.active_chest_pain) hardStops.push("Potential safety concern. Defer testing and obtain appropriate clinical evaluation.");

  const addReading = () => {
    set("standing_upright_readings", [
      ...state.standing_upright_readings,
      { time_minutes: 1, SBP_mmHg: "", DBP_mmHg: "", HR_bpm: "", symptoms: [], symptom_notes: "" },
    ]);
  };
  const updateReading = (idx: number, patch: Partial<UprightReading>) => {
    set(
      "standing_upright_readings",
      state.standing_upright_readings.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };
  const removeReading = (idx: number) => {
    set("standing_upright_readings", state.standing_upright_readings.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setState(initialState);
    toast("Form reset", { description: "All mCASS entries cleared." });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcass-${state.patient_id || "assessment"}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("JSON exported");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = 20;
    const line = (text: string, size = 10, bold = false) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      lines.forEach((l: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(l, margin, y);
        y += size * 0.45;
      });
    };

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Modified Composite Autonomic Severity Score (mCASS) Report", margin, y);
    y += 8;
    line(`Patient ID: ${state.patient_id || "—"}   |   Date: ${state.assessment_date || "—"}   |   Age: ${state.age_years || "—"}   |   Sex: ${state.sex_at_birth || "—"}`, 9);
    y += 4;
    line(`Method: Cardiovagal testing: deep breathing/E:I, Valsalva ratio, 30:15 ratio. Adrenergic testing: Valsalva BP, orthostatic BP/HR. Sudomotor testing: Sudoscan ESC of palms and soles.`, 9);
    y += 4;
    line(
      `Score: Cardiovagal ${state.clinician_cardiovagal_score || "—"}/3; Adrenergic ${state.clinician_adrenergic_score || "—"}/4; Sudomotor ${state.clinician_sudomotor_score || "—"}/3; mCASS ${totalScore ?? "—"}/10.`,
      10,
      true
    );
    y += 4;
    line(`Severity category: ${derived.severityCategory}. Completeness: ${derived.completeness}.`, 9);
    y += 4;
    line(
      `Resting HRV: SDNN ${state.SDNN_ms || "—"} ms, RMSSD ${state.RMSSD_ms || "—"} ms, pNN50 ${state.pNN50_percent || "—"} percent. These metrics are supportive and interpreted with rhythm, recording quality, respiration, medications, and age-adjusted normative values.`,
      9
    );
    y += 4;
    line(
      `Deep breathing: mean delta HR ${state.db_mean_delta_hr_bpm || "—"} bpm; E:I ratio ${state.db_EI_ratio || "—"}; interpretation ${state.db_age_sex_normative_result || "—"}.`,
      9
    );
    y += 4;
    line(
      `Valsalva: ratio ${state.valsalva_ratio || "—"}; cardiovagal interpretation ${state.valsalva_ratio_normative_result || "—"}; adrenergic BP interpretation ${state.valsalva_adrenergic_interpretation || "—"}.`,
      9
    );
    y += 4;
    line(
      `Orthostatic hemodynamics: maximum SBP fall ${derived.maxSystolicDrop ?? "—"} mmHg, maximum DBP fall ${derived.maxDiastolicDrop ?? "—"} mmHg, maximum HR increase ${derived.maxHrIncrease ?? "—"} bpm, delta HR/delta SBP ${derived.deltaHrDeltaSbp ?? "—"} bpm/mmHg.`,
      9
    );
    y += 4;
    line(
      `Orthostatic hypotension: ${derived.ohPresent === null ? "—" : derived.ohPresent ? (derived.ohDelayed ? "present (delayed)" : "present") : "absent"}. HR compensation: ${derived.hrCompensationInadequate === null ? "—" : derived.hrCompensationInadequate ? "inadequate" : "adequate"}. Neurogenic orthostatic pattern: ${derived.neurogenicPattern === null ? "—" : derived.neurogenicPattern ? "supported" : "not supported"}.`,
      9
    );
    y += 4;
    line(
      `POTS physiological screen: ${derived.potsSupported === null ? (derived.potsIndeterminate ? "indeterminate" : "—") : derived.potsSupported ? "supported" : "not supported"}. This screen does not independently establish a POTS diagnosis.`,
      9
    );
    y += 4;
    line(
      `CAN classification: ${derived.canStage}. Number of abnormal cardiovagal reflex tests: ${derived.abnormalCardiovagalCount}.`,
      9
    );
    y += 4;
    line(`Autonomic pattern: ${derived.pattern}.`, 9);
    y += 4;
    line(`Data quality and limitations: ${derived.qualityWarnings.length ? derived.qualityWarnings.join(" ") : "None flagged."}`, 9);
    y += 6;
    line(
      "This mCASS is a modified CASS-derived clinical/research framework. The Sudoscan-derived sudomotor component is not equivalent to QSART- or thermoregulatory sweat-test-based formal Mayo CASS scoring. Results require correlation with symptoms, medications, rhythm, comorbidities, technical quality, and laboratory-specific normative values.",
      8
    );
    doc.save(`mcass-report-${state.patient_id || "assessment"}.pdf`);
    toast("PDF exported");
  };

  const handlePrint = () => window.print();

  return (
    <Card className="border-primary/40 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-sunset flex items-center justify-center shadow-glow shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">mCASS Autonomic Assessment</CardTitle>
              <CardDescription className="mt-1">
                Modified Composite Autonomic Severity Score — structured autonomic testing, orthostatic hemodynamics, POTS screen, CAN staging, HRV &amp; Sudoscan-derived sudomotor assessment.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">v1.0.0</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {/* Disclaimers */}
        <div className="mb-5 space-y-2">
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Clinical decision support only.</strong> This application does not establish a diagnosis, replace clinician judgment, replace formal autonomic laboratory interpretation, or substitute for patient-specific clinical assessment.
            </div>
          </div>
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>mCASS is a modified CASS-derived framework</strong> and is not equivalent to the validated Mayo Composite Autonomic Severity Score. When Sudoscan is used, the sudomotor component is not interchangeable with QSART- or thermoregulatory sweat-test-based formal CASS scoring.
            </div>
          </div>
          <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Do not stop, hold, or adjust medications based on this app.</strong> Medication changes and test preparation require approval from the treating clinician or autonomic laboratory. Use fall precautions and supervision for standing or tilt testing when clinically indicated.
            </div>
          </div>
        </div>

        {/* Hard stops */}
        {hardStops.length > 0 && (
          <div className="mb-5 space-y-2">
            {hardStops.map((msg, i) => (
              <div key={i} className="flex gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="intake">Intake</TabsTrigger>
            <TabsTrigger value="prep">Prep &amp; Safety</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="hrv">HRV</TabsTrigger>
            <TabsTrigger value="deepbreathing">Deep Breathing</TabsTrigger>
            <TabsTrigger value="valsalva">Valsalva</TabsTrigger>
            <TabsTrigger value="standing">Standing / Tilt</TabsTrigger>
            <TabsTrigger value="handgrip">Handgrip</TabsTrigger>
            <TabsTrigger value="sudoscan">Sudoscan</TabsTrigger>
            <TabsTrigger value="scoring">Scoring &amp; Report</TabsTrigger>
          </TabsList>

          {/* ---------------- INTAKE ---------------- */}
          <TabsContent value="intake" className="space-y-5 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Patient ID">
                <Input value={state.patient_id} onChange={(e) => set("patient_id", e.target.value)} placeholder="e.g. DEIDENTIFIED-DEMO-001" />
              </Field>
              <Field label="Assessment date">
                <Input type="date" value={state.assessment_date} onChange={(e) => set("assessment_date", e.target.value)} />
              </Field>
              <Field label="Age in years">
                <Input type="number" min={0} max={120} value={state.age_years} onChange={(e) => set("age_years", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Sex at birth">
                <Select value={state.sex_at_birth || undefined} onValueChange={(v) => set("sex_at_birth", v as SexAtBirth)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["female", "male", "intersex", "not_recorded"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Height in cm">
                <Input type="number" min={30} max={260} value={state.height_cm} onChange={(e) => set("height_cm", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Weight in kg">
                <Input type="number" min={1} max={500} value={state.weight_kg} onChange={(e) => set("weight_kg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
            </div>

            <MultiSelect label="Test indication" options={TEST_INDICATIONS} value={state.test_indication} onChange={(v) => set("test_indication", v)} />
            <MultiSelect label="Relevant conditions" options={RELEVANT_CONDITIONS} value={state.relevant_conditions} onChange={(v) => set("relevant_conditions", v)} />

            <Field label="Clinical notes">
              <Textarea value={state.clinical_notes} onChange={(e) => set("clinical_notes", e.target.value)} rows={3} />
            </Field>
          </TabsContent>

          {/* ---------------- PREP & SAFETY ---------------- */}
          <TabsContent value="prep" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Pre-test standardization:</strong> Avoid large meals ≥2h before; avoid alcohol 24h; avoid caffeine/nicotine/stimulants per lab protocol; avoid vigorous exercise day before and day of; do not independently stop prescribed medications; arrive early for quiet supine rest.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hours since food intake">
                <Input type="number" min={0} max={72} value={state.last_food_hours} onChange={(e) => set("last_food_hours", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Hours since caffeine">
                <Input type="number" min={0} max={240} value={state.caffeine_last_use_hours} onChange={(e) => set("caffeine_last_use_hours", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Hours since nicotine or tobacco">
                <Input type="number" min={0} max={240} value={state.nicotine_last_use_hours} onChange={(e) => set("nicotine_last_use_hours", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Hours since alcohol">
                <Input type="number" min={0} max={240} value={state.alcohol_last_use_hours} onChange={(e) => set("alcohol_last_use_hours", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Vigorous exercise in past 24 hours">
                <YesNoSelect value={state.vigorous_exercise_last_24_hours} onChange={(v) => set("vigorous_exercise_last_24_hours", v)} />
              </Field>
              <Field label="Prescriber-approved medication plan">
                <Select value={state.medication_hold_plan_prescriber_approved || undefined} onValueChange={(v) => set("medication_hold_plan_prescriber_approved", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["yes", "no", "not_needed", "unknown"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Supine rest before testing (minutes)" hint="Recommended: 15">
                <Input type="number" min={0} max={120} value={state.supine_rest_minutes} onChange={(e) => set("supine_rest_minutes", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Room temperature (°C)" hint="Recommended: 24">
                <Input type="number" min={10} max={35} value={state.room_temperature_celsius} onChange={(e) => set("room_temperature_celsius", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Medication review</Label>
              <BoolCheck label="Medication review completed" checked={state.medication_review_completed} onChange={(v) => set("medication_review_completed", v)} />
            </div>
            <MultiSelect label="Medications affecting autonomic testing" options={MEDICATIONS_AFFECTING} value={state.medications_affecting_autonomic_testing} onChange={(v) => set("medications_affecting_autonomic_testing", v)} />
            <Field label="Medication notes">
              <Textarea value={state.medication_notes} onChange={(e) => set("medication_notes", e.target.value)} rows={2} />
            </Field>

            <Separator />

            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold">Safety screen</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BoolCheck label="Fall precautions used" checked={state.fall_precautions_used} onChange={(v) => set("fall_precautions_used", v)} />
              <BoolCheck label="Standing or tilt supervised" checked={state.supervised_standing_or_tilt} onChange={(v) => set("supervised_standing_or_tilt", v)} />
              <BoolCheck label="Active chest pain" checked={state.active_chest_pain} onChange={(v) => set("active_chest_pain", v)} />
              <BoolCheck label="Unstable cardiopulmonary status" checked={state.unstable_cardiopulmonary_status} onChange={(v) => set("unstable_cardiopulmonary_status", v)} />
              <BoolCheck label="Recent syncope with injury risk" checked={state.recent_syncope_with_injury_risk} onChange={(v) => set("recent_syncope_with_injury_risk", v)} />
              <BoolCheck label="Test deferred or modified" checked={state.test_deferred_or_modified} onChange={(v) => set("test_deferred_or_modified", v)} />
            </div>
            <Field label="Safety notes">
              <Textarea value={state.safety_notes} onChange={(e) => set("safety_notes", e.target.value)} rows={2} />
            </Field>
          </TabsContent>

          {/* ---------------- SYMPTOMS ---------------- */}
          <TabsContent value="symptoms" className="space-y-5 mt-4">
            <MultiSelect label="Orthostatic symptoms" options={ORTHOSTATIC_SYMPTOMS} value={state.orthostatic_symptoms} onChange={(v) => set("orthostatic_symptoms", v)} />
            <MultiSelect label="Sudomotor symptoms" options={SUDOMOTOR_SYMPTOMS} value={state.sudomotor_symptoms} onChange={(v) => set("sudomotor_symptoms", v)} />
            <Field label="Symptom duration (months)">
              <Input type="number" min={0} max={1200} value={state.symptom_chronicity_months} onChange={(e) => set("symptom_chronicity_months", e.target.value === "" ? "" : Number(e.target.value))} />
            </Field>
            <Field label="Symptom notes">
              <Textarea value={state.symptom_notes} onChange={(e) => set("symptom_notes", e.target.value)} rows={3} />
            </Field>
          </TabsContent>

          {/* ---------------- HRV ---------------- */}
          <TabsContent value="hrv" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Protocol:</strong> Supine preferred; 15 min pre-recording rest; at least 5 min of stable artifact-screened ECG. Remain awake, avoid talking/moving/coughing/phone/active mental tasks; breathe normally. Preferred rhythm: sinus. Artifact warning threshold: &gt;5%.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Rhythm">
                <Select value={state.hrv_rhythm || undefined} onValueChange={(v) => set("hrv_rhythm", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["sinus", "atrial fibrillation", "frequent ectopy", "paced", "other non-sinus"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Recording duration (minutes)">
                <Input type="number" value={state.hrv_recording_duration_minutes} onChange={(e) => set("hrv_recording_duration_minutes", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Artifact burden (%)">
                <Input type="number" value={state.hrv_artifact_percent} onChange={(e) => set("hrv_artifact_percent", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Mean heart rate (bpm)">
                <Input type="number" value={state.mean_heart_rate_bpm} onChange={(e) => set("mean_heart_rate_bpm", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Mean NN interval (ms)">
                <Input type="number" value={state.mean_nn_interval_ms} onChange={(e) => set("mean_nn_interval_ms", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="SDNN (ms)">
                <Input type="number" value={state.SDNN_ms} onChange={(e) => set("SDNN_ms", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="SDSD (ms)">
                <Input type="number" value={state.SDSD_ms} onChange={(e) => set("SDSD_ms", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="RMSSD (ms)">
                <Input type="number" value={state.RMSSD_ms} onChange={(e) => set("RMSSD_ms", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="NN50 (count)">
                <Input type="number" value={state.NN50_count} onChange={(e) => set("NN50_count", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="pNN50 (%)">
                <Input type="number" value={state.pNN50_percent} onChange={(e) => set("pNN50_percent", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="VLF power (ms²)">
                <Input type="number" value={state.VLF_power_ms2} onChange={(e) => set("VLF_power_ms2", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="LF power (ms²)">
                <Input type="number" value={state.LF_power_ms2} onChange={(e) => set("LF_power_ms2", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="HF power (ms²)">
                <Input type="number" value={state.HF_power_ms2} onChange={(e) => set("HF_power_ms2", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="LF/HF ratio">
                <Input type="number" value={state.LF_HF_ratio} onChange={(e) => set("LF_HF_ratio", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Resting HRV parameters are supportive data and should not independently generate additional mCASS points. LF is not a pure cardiac sympathetic marker; LF/HF ratio should not be treated as a standalone validated index of sympathovagal balance.
            </p>
          </TabsContent>

          {/* ---------------- DEEP BREATHING ---------------- */}
          <TabsContent value="deepbreathing" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Protocol:</strong> 6 breaths/min (5s inspiration, 5s expiration), ~6 target cycles, ~1 minute. Supine or seated per lab reference. Continuous ECG. Follow paced breathing; avoid talking, coughing, straining, body movement.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Breaths per minute">
                <Input type="number" value={state.db_breaths_per_minute} onChange={(e) => set("db_breaths_per_minute", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Inspiration (seconds)">
                <Input type="number" value={state.db_inspiration_seconds} onChange={(e) => set("db_inspiration_seconds", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Expiration (seconds)">
                <Input type="number" value={state.db_expiration_seconds} onChange={(e) => set("db_expiration_seconds", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Acceptable cycles">
                <Input type="number" value={state.db_acceptable_cycles} onChange={(e) => set("db_acceptable_cycles", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Cycle delta HR (bpm, comma-separated)">
                <Input value={state.db_cycle_delta_hr_bpm} onChange={(e) => set("db_cycle_delta_hr_bpm", e.target.value)} placeholder="e.g. 8, 9, 8, 7, 9, 8" />
              </Field>
              <Field label="Mean delta HR (bpm)">
                <Input type="number" value={state.db_mean_delta_hr_bpm} onChange={(e) => set("db_mean_delta_hr_bpm", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="E:I ratio">
                <Input type="number" step="0.01" value={state.db_EI_ratio} onChange={(e) => set("db_EI_ratio", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Age/sex normative result">
                <Select value={state.db_age_sex_normative_result || undefined} onValueChange={(v) => set("db_age_sex_normative_result", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "borderline", "abnormal", "norms unavailable", "uninterpretable"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Technical quality">
                <Select value={state.db_technical_quality || undefined} onValueChange={(v) => set("db_technical_quality", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["adequate", "suboptimal breathing", "artifact or ectopy", "patient unable to complete", "other"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Screening values only: delta HR ≥15 bpm often broadly reassuring in younger/middle-aged adults; 10–14 bpm borderline; &lt;10 bpm markedly reduced (supports substantial cardiovagal impairment if confounders excluded). Use age-, sex-, and laboratory-adjusted norms as the preferred standard.
            </p>
          </TabsContent>

          {/* ---------------- VALSALVA ---------------- */}
          <TabsContent value="valsalva" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Protocol:</strong> Strain ~40 mmHg for ~15s. Valsalva ratio contributes to cardiovagal scoring; beat-to-beat BP response (late phase II recovery, phase IV overshoot) contributes to adrenergic scoring.
            </div>
            <div className="space-y-2">
              <BoolCheck label="Valsalva performed" checked={state.valsalva_performed} onChange={(v) => set("valsalva_performed", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Strain pressure (mmHg)" hint="Recommended: 40">
                <Input type="number" value={state.valsalva_strain_pressure_mmHg} onChange={(e) => set("valsalva_strain_pressure_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Strain duration (seconds)" hint="Recommended: 15">
                <Input type="number" value={state.valsalva_strain_duration_seconds} onChange={(e) => set("valsalva_strain_duration_seconds", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Acceptable trials">
                <Input type="number" value={state.valsalva_acceptable_trials} onChange={(e) => set("valsalva_acceptable_trials", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Valsalva ratio">
                <Input type="number" step="0.01" value={state.valsalva_ratio} onChange={(e) => set("valsalva_ratio", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Valsalva ratio normative result">
                <Select value={state.valsalva_ratio_normative_result || undefined} onValueChange={(v) => set("valsalva_ratio_normative_result", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "borderline", "abnormal", "norms unavailable", "uninterpretable"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Late phase II recovery">
                <Select value={state.valsalva_late_phase_II_recovery || undefined} onValueChange={(v) => set("valsalva_late_phase_II_recovery", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "reduced", "absent", "not assessed"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Phase IV overshoot">
                <Select value={state.valsalva_phase_IV_overshoot || undefined} onValueChange={(v) => set("valsalva_phase_IV_overshoot", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "reduced", "absent", "not assessed"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Adrenergic interpretation">
                <Select value={state.valsalva_adrenergic_interpretation || undefined} onValueChange={(v) => set("valsalva_adrenergic_interpretation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "mild abnormality", "moderate abnormality", "marked abnormality", "severe abnormality", "uninterpretable", "not assessed"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="space-y-2">
              <BoolCheck label="Beat-to-beat BP available" checked={state.valsalva_beat_to_beat_bp_available} onChange={(v) => set("valsalva_beat_to_beat_bp_available", v)} />
            </div>
            <Field label="Valsalva notes">
              <Textarea value={state.valsalva_notes} onChange={(e) => set("valsalva_notes", e.target.value)} rows={2} />
            </Field>
          </TabsContent>

          {/* ---------------- STANDING / TILT ---------------- */}
          <TabsContent value="standing" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Protocol:</strong> Supine rest ≥5 min (10–15 min preferred with HRV). Baseline supine BP/HR. Standing BP/HR at 1, 3, 5 min (if symptoms persist or delayed OH suspected); continue to 10 min if evaluating POTS. Use fall precautions; terminate for syncope, severe presyncope, chest pain, dangerous arrhythmia, or clinician concern.
            </div>
            <div className="space-y-2">
              <BoolCheck label="Standing / tilt performed" checked={state.standing_performed} onChange={(v) => set("standing_performed", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Method">
                <Select value={state.standing_method || undefined} onValueChange={(v) => set("standing_method", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["active standing", "head-up tilt", "both"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="30:15 ratio">
                <Input type="number" step="0.01" value={state.standing_thirty_fifteen_ratio} onChange={(e) => set("standing_thirty_fifteen_ratio", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="30:15 normative result">
                <Select value={state.standing_thirty_fifteen_normative_result || undefined} onValueChange={(v) => set("standing_thirty_fifteen_normative_result", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "borderline", "abnormal", "norms unavailable", "uninterpretable", "not assessed"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="space-y-2">
              <BoolCheck label="Continuous ECG" checked={state.standing_continuous_ecg} onChange={(v) => set("standing_continuous_ecg", v)} />
              <BoolCheck label="Continuous beat-to-beat BP" checked={state.standing_continuous_beat_to_beat_bp} onChange={(v) => set("standing_continuous_beat_to_beat_bp", v)} />
              <BoolCheck label="Test terminated early" checked={state.standing_test_terminated_early} onChange={(v) => set("standing_test_terminated_early", v)} />
            </div>
            {state.standing_test_terminated_early && (
              <Field label="Termination reason">
                <Textarea value={state.standing_termination_reason} onChange={(e) => set("standing_termination_reason", e.target.value)} rows={2} />
              </Field>
            )}

            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">Supine baseline</h4>
              <div className="grid grid-cols-3 gap-3">
                <Field label="SBP (mmHg)">
                  <Input type="number" value={state.standing_supine_SBP_mmHg} onChange={(e) => set("standing_supine_SBP_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
                </Field>
                <Field label="DBP (mmHg)">
                  <Input type="number" value={state.standing_supine_DBP_mmHg} onChange={(e) => set("standing_supine_DBP_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
                </Field>
                <Field label="HR (bpm)">
                  <Input type="number" value={state.standing_supine_HR_bpm} onChange={(e) => set("standing_supine_HR_bpm", e.target.value === "" ? "" : Number(e.target.value))} />
                </Field>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Upright readings</h4>
                <Button type="button" variant="outline" size="sm" onClick={addReading}>
                  + Add reading
                </Button>
              </div>
              {state.standing_upright_readings.length === 0 && (
                <p className="text-xs text-muted-foreground">No upright readings added yet.</p>
              )}
              {state.standing_upright_readings.map((r, idx) => (
                <div key={idx} className="rounded-lg border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Reading {idx + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeReading(idx)}>Remove</Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Field label="Time (min)">
                      <Input type="number" value={r.time_minutes} onChange={(e) => updateReading(idx, { time_minutes: Number(e.target.value) })} />
                    </Field>
                    <Field label="SBP">
                      <Input type="number" value={r.SBP_mmHg} onChange={(e) => updateReading(idx, { SBP_mmHg: e.target.value === "" ? "" : Number(e.target.value) })} />
                    </Field>
                    <Field label="DBP">
                      <Input type="number" value={r.DBP_mmHg} onChange={(e) => updateReading(idx, { DBP_mmHg: e.target.value === "" ? "" : Number(e.target.value) })} />
                    </Field>
                    <Field label="HR">
                      <Input type="number" value={r.HR_bpm} onChange={(e) => updateReading(idx, { HR_bpm: e.target.value === "" ? "" : Number(e.target.value) })} />
                    </Field>
                  </div>
                  <MultiSelect label="Symptoms" options={UPRIGHT_SYMPTOMS} value={r.symptoms} onChange={(v) => updateReading(idx, { symptoms: v })} />
                  <Field label="Symptom notes">
                    <Input value={r.symptom_notes} onChange={(e) => updateReading(idx, { symptom_notes: e.target.value })} />
                  </Field>
                </div>
              ))}
            </div>

            <Field label="Standing / tilt notes">
              <Textarea value={state.standing_notes} onChange={(e) => set("standing_notes", e.target.value)} rows={2} />
            </Field>
          </TabsContent>

          {/* ---------------- HANDGRIP ---------------- */}
          <TabsContent value="handgrip" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Protocol:</strong> ~30% of maximum voluntary contraction for 3–5 min. Ancillary adrenergic evidence; should not replace beat-to-beat Valsalva BP or standing/tilt BP assessment.
            </div>
            <div className="space-y-2">
              <BoolCheck label="Sustained handgrip performed" checked={state.handgrip_performed} onChange={(v) => set("handgrip_performed", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Maximum voluntary contraction (kg)">
                <Input type="number" value={state.handgrip_maximum_voluntary_contraction_kg} onChange={(e) => set("handgrip_maximum_voluntary_contraction_kg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Target % MVC" hint="Recommended: 30">
                <Input type="number" value={state.handgrip_target_percent_MVC} onChange={(e) => set("handgrip_target_percent_MVC", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Duration (seconds)">
                <Input type="number" value={state.handgrip_duration_seconds} onChange={(e) => set("handgrip_duration_seconds", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Baseline DBP (mmHg)">
                <Input type="number" value={state.handgrip_baseline_DBP_mmHg} onChange={(e) => set("handgrip_baseline_DBP_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Peak DBP (mmHg)">
                <Input type="number" value={state.handgrip_peak_DBP_mmHg} onChange={(e) => set("handgrip_peak_DBP_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Delta DBP (mmHg)">
                <Input type="number" value={state.handgrip_delta_DBP_mmHg} onChange={(e) => set("handgrip_delta_DBP_mmHg", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Interpretation">
                <Select value={state.handgrip_interpretation || undefined} onValueChange={(v) => set("handgrip_interpretation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "borderline", "abnormal", "uninterpretable", "not assessed"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Historical interpretation only: DBP rise ≥16 mmHg normal; 11–15 borderline; ≤10 abnormal. Use local laboratory reference values when available.
            </p>
            <Field label="Handgrip notes">
              <Textarea value={state.handgrip_notes} onChange={(e) => set("handgrip_notes", e.target.value)} rows={2} />
            </Field>
          </TabsContent>

          {/* ---------------- SUDOSCAN ---------------- */}
          <TabsContent value="sudoscan" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Sudoscan ESC:</strong> Palmar and plantar electrochemical skin conductance (µS). Provides the modified 0–3 mCASS sudomotor domain score. Not equivalent to QSART or thermoregulatory sweat testing; ESC alone must not be presented as a definitive diagnostic test for CAN.
            </div>
            <div className="space-y-2">
              <BoolCheck label="Sudoscan performed" checked={state.sudoscan_performed} onChange={(v) => set("sudoscan_performed", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Device model">
                <Input value={state.sudoscan_device_model} onChange={(e) => set("sudoscan_device_model", e.target.value)} />
              </Field>
              <Field label="Software version">
                <Input value={state.sudoscan_device_software_version} onChange={(e) => set("sudoscan_device_software_version", e.target.value)} />
              </Field>
              <Field label="Palmar ESC left (µS)">
                <Input type="number" value={state.sudoscan_palmar_ESC_left_uS} onChange={(e) => set("sudoscan_palmar_ESC_left_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Palmar ESC right (µS)">
                <Input type="number" value={state.sudoscan_palmar_ESC_right_uS} onChange={(e) => set("sudoscan_palmar_ESC_right_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Plantar ESC left (µS)">
                <Input type="number" value={state.sudoscan_plantar_ESC_left_uS} onChange={(e) => set("sudoscan_plantar_ESC_left_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Plantar ESC right (µS)">
                <Input type="number" value={state.sudoscan_plantar_ESC_right_uS} onChange={(e) => set("sudoscan_plantar_ESC_right_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Palmar ESC mean (µS)">
                <Input type="number" value={state.sudoscan_palmar_ESC_mean_uS} onChange={(e) => set("sudoscan_palmar_ESC_mean_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Plantar ESC mean (µS)">
                <Input type="number" value={state.sudoscan_plantar_ESC_mean_uS} onChange={(e) => set("sudoscan_plantar_ESC_mean_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Hand lower limit of normal (µS)">
                <Input type="number" value={state.sudoscan_hand_lower_limit_normal_uS} onChange={(e) => set("sudoscan_hand_lower_limit_normal_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Foot lower limit of normal (µS)">
                <Input type="number" value={state.sudoscan_foot_lower_limit_normal_uS} onChange={(e) => set("sudoscan_foot_lower_limit_normal_uS", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Hand status">
                <Select value={state.sudoscan_hand_status || undefined} onValueChange={(v) => set("sudoscan_hand_status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "abnormal", "unknown no norms", "uninterpretable"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Foot status">
                <Select value={state.sudoscan_foot_status || undefined} onValueChange={(v) => set("sudoscan_foot_status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["normal", "abnormal", "unknown no norms", "uninterpretable"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <MultiSelect label="Quality flags" options={SUDOSCAN_QUALITY_FLAGS} value={state.sudoscan_quality_flags} onChange={(v) => set("sudoscan_quality_flags", v)} />
            <Field label="Quality notes">
              <Textarea value={state.sudoscan_quality_notes} onChange={(e) => set("sudoscan_quality_notes", e.target.value)} rows={2} />
            </Field>
            <p className="text-[11px] text-muted-foreground">
              Broad screening ranges (feet only): generally normal &gt;60–70 µS; possible moderate dysfunction ~40–60 µS; abnormal &lt;40 µS. These are broad screening ranges only and should not replace device-specific laboratory normal limits.
            </p>
          </TabsContent>

          {/* ---------------- SCORING & REPORT ---------------- */}
          <TabsContent value="scoring" className="space-y-5 mt-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Scoring framework:</strong> mCASS = Cardiovagal (0–3) + Adrenergic (0–4) + Sudomotor (0–3) = 0–10. Severity: 0 Normal; 1–3 Mild; 4–6 Moderate; 7–10 Severe. Suggested scores must be reviewed and approved by a qualified clinician. The app preserves raw measurements, normative interpretation, data-quality flags, and the reason for any clinician override.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Cardiovagal score /3">
                <Input type="number" min={0} max={3} value={state.clinician_cardiovagal_score} onChange={(e) => set("clinician_cardiovagal_score", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Adrenergic score /4">
                <Input type="number" min={0} max={4} value={state.clinician_adrenergic_score} onChange={(e) => set("clinician_adrenergic_score", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
              <Field label="Sudomotor score /3">
                <Input type="number" min={0} max={3} value={state.clinician_sudomotor_score} onChange={(e) => set("clinician_sudomotor_score", e.target.value === "" ? "" : Number(e.target.value))} />
              </Field>
            </div>

            <Field label="Clinician override reason (if any)">
              <Textarea value={state.clinician_override_reason} onChange={(e) => set("clinician_override_reason", e.target.value)} rows={2} />
            </Field>
            <Field label="Interpretive summary">
              <Textarea value={state.clinician_interpretive_summary} onChange={(e) => set("clinician_interpretive_summary", e.target.value)} rows={3} />
            </Field>

            <Separator />

            {/* Derived results */}
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Derived results</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">mCASS total</span><div className="font-bold text-lg">{totalScore ?? "—"}/10</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Severity</span><div className="font-semibold">{derived.severityCategory}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Completeness</span><div className="font-semibold">{derived.completeness}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Max SBP fall</span><div className="font-semibold">{derived.maxSystolicDrop ?? "—"} mmHg</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Max DBP fall</span><div className="font-semibold">{derived.maxDiastolicDrop ?? "—"} mmHg</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Max HR rise</span><div className="font-semibold">{derived.maxHrIncrease ?? "—"} bpm</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">ΔHR/ΔSBP</span><div className="font-semibold">{derived.deltaHrDeltaSbp ?? "—"} bpm/mmHg</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Orthostatic hypotension</span><div className="font-semibold">{derived.ohPresent === null ? "—" : derived.ohPresent ? (derived.ohDelayed ? "Present (delayed)" : "Present") : "Absent"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">HR compensation</span><div className="font-semibold">{derived.hrCompensationInadequate === null ? "—" : derived.hrCompensationInadequate ? "Inadequate" : "Adequate"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Neurogenic pattern</span><div className="font-semibold">{derived.neurogenicPattern === null ? "—" : derived.neurogenicPattern ? "Supported" : "Not supported"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">POTS screen</span><div className="font-semibold">{derived.potsSupported === null ? (derived.potsIndeterminate ? "Indeterminate" : "—") : derived.potsSupported ? "Supported" : "Not supported"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">CAN stage</span><div className="font-semibold">{derived.canStage}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Abnormal cardiovagal tests</span><div className="font-semibold">{derived.abnormalCardiovagalCount}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Hand % LLN</span><div className="font-semibold">{derived.handPercentLLN === null ? "—" : derived.handPercentLLN.toFixed(0) + "%"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Foot % LLN</span><div className="font-semibold">{derived.footPercentLLN === null ? "—" : derived.footPercentLLN.toFixed(0) + "%"}</div></div>
                <div className="rounded-lg bg-muted/40 p-2"><span className="text-muted-foreground text-xs">Pattern</span><div className="font-semibold">{derived.pattern}</div></div>
              </div>
            </div>

            {derived.qualityWarnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">Data quality warnings</h3>
                </div>
                <ul className="list-disc pl-5 text-xs text-amber-800 space-y-1">
                  {derived.qualityWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <strong>Mandatory disclaimer:</strong> This mCASS is a modified CASS-derived clinical/research framework. The Sudoscan-derived sudomotor component is not equivalent to QSART- or thermoregulatory sweat-test-based formal Mayo CASS scoring. Results require correlation with symptoms, medications, rhythm, comorbidities, technical quality, and laboratory-specific normative values.
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleExportPDF} className="bg-gradient-sunset hover:opacity-90 text-white border-0 shadow-glow">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
              <Button onClick={handleExportJSON} variant="outline">
                <FileText className="w-4 h-4 mr-2" /> Export JSON
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button onClick={reset} variant="ghost">
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
