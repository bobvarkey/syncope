export type RiskLevel = "high" | "intermediate";

export interface EcgPattern {
  id: string;
  key: string; // WOBBLER / ABCDE mnemonic letter
  name: string;
  risk: RiskLevel;
  description: string;
}

export const HIGH_RISK_POINTS = 3;
export const INTERMEDIATE_RISK_POINTS = 1;

export const ecgPatterns: EcgPattern[] = [
  { id: "av-block",           key: "A", name: "AV block (2°/3°)",           risk: "high",         description: "Mobitz II or complete AV block — pacing pathway." },
  { id: "brugada",            key: "B", name: "Brugada type 1",              risk: "high",         description: "Coved ST-elevation ≥2mm with T inversion in V1–V2." },
  { id: "complete-hb",        key: "C", name: "Chronic ischaemia / Q-waves", risk: "high",         description: "Q waves suggesting prior MI; substrate for VT." },
  { id: "delta-wpw",          key: "D", name: "Delta wave (WPW)",            risk: "high",         description: "Short PR + slurred QRS upstroke; pre-excitation." },
  { id: "epsilon-arvc",       key: "E", name: "Epsilon wave (ARVC)",         risk: "high",         description: "Small deflection at end of QRS in V1–V3; RV cardiomyopathy." },
  { id: "wellens",            key: "W", name: "Wellens' syndrome",           risk: "high",         description: "Biphasic (type A) or deep symmetric inverted (type B) T waves in V2–V3 during pain-free interval, with preserved R waves and no Q waves — critical proximal LAD stenosis. Usually presents with chest pain, but transient severe LAD ischaemia can cause arrhythmia or a sudden fall in cardiac output leading to syncope." },
  { id: "long-qt",            key: "L", name: "Long QT (QTc >480 ms)",       risk: "high",         description: "Torsades risk; check meds and electrolytes." },
  { id: "short-qt",           key: "R", name: "Short QT (QTc <340 ms)",      risk: "high",         description: "Genetic short QT syndrome; VF risk." },
  { id: "rv-strain",          key: "R", name: "RV strain pattern",           risk: "intermediate", description: "S1Q3T3, RBBB, RV strain — consider PE." },
  { id: "bifascicular",       key: "A", name: "Bifascicular block",          risk: "intermediate", description: "LBBB or RBBB + fascicular block; may progress to CHB." },
  { id: "sinus-brady",        key: "A", name: "Sinus bradycardia <40 bpm",   risk: "intermediate", description: "Off rate-lowering meds — sinus node dysfunction." },
  { id: "lvh-hocm",           key: "C", name: "LVH / HOCM pattern",          risk: "intermediate", description: "Prominent LVH with T-wave inversion; consider HOCM/AS." },
  { id: "early-repol",        key: "E", name: "Early repolarisation (inferior)", risk: "intermediate", description: "J-point elevation with slurring in inferior leads." },
];

export interface ScoreContribution {
  id: string;
  key: string;
  name: string;
  risk: RiskLevel;
  points: number;
}

export interface EcgRiskResult {
  activePatterns: EcgPattern[];
  breakdown: ScoreContribution[];
  highCount: number;
  intermediateCount: number;
  riskScore: number;
  overallRisk: "high" | "intermediate" | "low";
  wobblerLetters: string[];
  recommendation: {
    action: string;
    priority: "Critical" | "Intermediate" | "Low";
    reason: string;
  };
}

export const patternPoints = (risk: RiskLevel) =>
  risk === "high" ? HIGH_RISK_POINTS : INTERMEDIATE_RISK_POINTS;

export function computeEcgRisk(selected: Record<string, boolean> = {}): EcgRiskResult {
  const activePatterns = ecgPatterns.filter((p) => selected[p.id]);

  const breakdown: ScoreContribution[] = activePatterns.map((p) => ({
    id: p.id,
    key: p.key,
    name: p.name,
    risk: p.risk,
    points: patternPoints(p.risk),
  }));

  const highCount = activePatterns.filter((p) => p.risk === "high").length;
  const intermediateCount = activePatterns.filter((p) => p.risk === "intermediate").length;
  const riskScore = breakdown.reduce((acc, b) => acc + b.points, 0);

  const overallRisk: "high" | "intermediate" | "low" =
    highCount > 0 ? "high" : intermediateCount > 0 ? "intermediate" : "low";

  const wobblerLetters = activePatterns
    .map((p) => p.key)
    .filter((v, i, a) => a.indexOf(v) === i);

  let recommendation: EcgRiskResult["recommendation"];
  if (highCount > 0 || riskScore >= 3) {
    recommendation = {
      action: "Urgent Cardiology Referral & Admission",
      priority: "Critical",
      reason:
        highCount > 0
          ? `${highCount} high-risk pattern(s) triggered (${HIGH_RISK_POINTS} pts each)`
          : `Cumulative intermediate findings reached ${riskScore} pts (threshold 3)`,
    };
  } else if (intermediateCount > 0 || riskScore >= 1) {
    recommendation = {
      action: "Cardiology Consult & Monitoring",
      priority: "Intermediate",
      reason: `${intermediateCount} intermediate-risk pattern(s) triggered (${INTERMEDIATE_RISK_POINTS} pt each), total ${riskScore} pts`,
    };
  } else {
    recommendation = {
      action: "Routine Follow-up / Observation",
      priority: "Low",
      reason: "No WOBBLER red flag triggered (0 pts)",
    };
  }

  return {
    activePatterns,
    breakdown,
    highCount,
    intermediateCount,
    riskScore,
    overallRisk,
    wobblerLetters,
    recommendation,
  };
}

export interface EcgTestCase {
  label: string;
  patterns: string[];
  expectedScore: number;
  expectedPriority: "Critical" | "Intermediate" | "Low";
  note: string;
}

export const ecgTestCases: EcgTestCase[] = [
  { label: "Brugada T1", patterns: ["brugada"], expectedScore: 3, expectedPriority: "Critical", note: "Single high-risk pattern → urgent referral." },
  { label: "WPW + LVH", patterns: ["delta-wpw", "lvh-hocm"], expectedScore: 4, expectedPriority: "Critical", note: "High + intermediate combination." },
  { label: "RV Strain", patterns: ["rv-strain"], expectedScore: 1, expectedPriority: "Intermediate", note: "Isolated intermediate finding." },
  { label: "Sinus Brady", patterns: ["sinus-brady"], expectedScore: 1, expectedPriority: "Intermediate", note: "Isolated intermediate finding." },
  { label: "Borderline: Bifascicular + Brady", patterns: ["bifascicular", "sinus-brady"], expectedScore: 2, expectedPriority: "Intermediate", note: "Two intermediate flags, still below the 3-pt urgent threshold." },
  { label: "Borderline: 3 intermediates", patterns: ["bifascicular", "sinus-brady", "early-repol"], expectedScore: 3, expectedPriority: "Critical", note: "Cumulative intermediate flags reach 3 pts → escalates to urgent." },
  { label: "Intermediate: LVH + Early repol", patterns: ["lvh-hocm", "early-repol"], expectedScore: 2, expectedPriority: "Intermediate", note: "Structural + benign-looking repolarisation change." },
  { label: "Intermediate: RV strain + Bifascicular", patterns: ["rv-strain", "bifascicular"], expectedScore: 2, expectedPriority: "Intermediate", note: "Consider PE work-up plus conduction monitoring." },
  { label: "Normal ECG", patterns: [], expectedScore: 0, expectedPriority: "Low", note: "No red flag — normal ECG does not exclude cardiac syncope." },
];
