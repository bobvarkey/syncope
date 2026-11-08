export type Sex = "male" | "female";

export interface Assessment {
  age: number | null;
  sex: Sex;
  fellPastYear: boolean;
  feelsUnsteady: boolean;
  worriesAboutFalling: boolean;
  tugSeconds: number | null;
  chairStands: number | null;
  balanceStage: number; // highest stage (0-4) held for 10 seconds
  gaitObservations: string[];
}

// CDC STEADI 30-second chair stand: scores BELOW these are "at risk".
const CHAIR_NORMS: { min: number; max: number; male: number; female: number }[] = [
  { min: 60, max: 64, male: 14, female: 12 },
  { min: 65, max: 69, male: 12, female: 11 },
  { min: 70, max: 74, male: 12, female: 10 },
  { min: 75, max: 79, male: 11, female: 10 },
  { min: 80, max: 84, male: 10, female: 9 },
  { min: 85, max: 89, male: 8, female: 8 },
  { min: 90, max: 94, male: 7, female: 4 },
];

export function chairStandThreshold(age: number, sex: Sex): number | null {
  const row = CHAIR_NORMS.find((r) => age >= r.min && age <= r.max);
  return row ? row[sex] : null;
}

export const screenPositive = (a: Assessment) =>
  a.fellPastYear || a.feelsUnsteady || a.worriesAboutFalling;

export const tugAtRisk = (s: number) => s >= 12;
export const balanceAtRisk = (stage: number) => stage < 3; // can't hold tandem 10s

export function chairAtRisk(a: Assessment): boolean | null {
  if (a.chairStands == null || a.age == null) return null;
  const t = chairStandThreshold(a.age, a.sex);
  return t == null ? null : a.chairStands < t;
}

export type RiskLevel = "low" | "moderate" | "high";

export function overallRisk(a: Assessment): { level: RiskLevel; flags: string[] } {
  const flags: string[] = [];
  if (a.tugSeconds != null && tugAtRisk(a.tugSeconds)) flags.push("Timed Up & Go ≥ 12 s");
  if (chairAtRisk(a)) flags.push("Chair stand below age/sex norm");
  // Stage 0 means "not assessed"; only count a stage the clinician actually recorded.
  if (a.balanceStage > 0 && balanceAtRisk(a.balanceStage))
    flags.push("Cannot hold tandem stance 10 s");
  if (a.gaitObservations.length) flags.push(`${a.gaitObservations.length} gait abnormality noted`);

  const screen = screenPositive(a);
  let level: RiskLevel = "low";
  if (screen && flags.length) level = "high";
  else if (screen || flags.length) level = "moderate";
  if (a.fellPastYear && flags.length >= 2) level = "high";
  return { level, flags };
}
