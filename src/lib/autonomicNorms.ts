/**
 * Age- and sex-adjusted autonomic normative values (Indian adult reference dataset)
 * used by the Autonomic Function & mCASS Analyzer.
 *
 * Laboratory-specific validated norms should take precedence where available.
 */

export type Sex = "male" | "female";
export type AgeGroup = "20-30" | "31-40" | "41-50" | "51-60" | "61-70" | ">=71";

export const AGE_GROUPS: AgeGroup[] = ["20-30", "31-40", "41-50", "51-60", "61-70", ">=71"];

export function getAgeGroup(age: number | ""): AgeGroup | null {
  if (age === "" || Number.isNaN(Number(age))) return null;
  const a = Number(age);
  if (a < 20) return null;
  if (a <= 30) return "20-30";
  if (a <= 40) return "31-40";
  if (a <= 50) return "41-50";
  if (a <= 60) return "51-60";
  if (a <= 70) return "61-70";
  return ">=71";
}

export type Range = { LLN: number; ULN: number };
type BySex = Record<Sex, Range>;
type ByAge = Record<AgeGroup, BySex>;

const r = (LLN: number, ULN: number): Range => ({ LLN, ULN });

/** Heart-rate response to deep breathing (bpm) */
export const HRDB_NORMS: ByAge = {
  "20-30": { male: r(17.08, 44.68), female: r(16.86, 43.83) },
  "31-40": { male: r(13.4, 31.3), female: r(9.88, 30.51) },
  "41-50": { male: r(11.78, 35.49), female: r(9.05, 23.13) },
  "51-60": { male: r(7.74, 29.73), female: r(8.08, 34.91) },
  "61-70": { male: r(5.58, 26.71), female: r(6.68, 29.27) },
  ">=71": { male: r(3.61, 26.42), female: r(5.84, 18.34) },
};

/** Expiration:Inspiration ratio */
export const EI_NORMS: ByAge = {
  "20-30": { male: r(1.23, 1.88), female: r(1.25, 1.87) },
  "31-40": { male: r(1.18, 1.62), female: r(1.12, 1.55) },
  "41-50": { male: r(1.16, 1.6), female: r(1.14, 1.39) },
  "51-60": { male: r(1.13, 1.53), female: r(1.1, 1.59) },
  "61-70": { male: r(1.08, 1.46), female: r(1.1, 1.56) },
  ">=71": { male: r(1.05, 1.44), female: r(1.07, 1.35) },
};

/** Valsalva ratio */
export const VALSALVA_RATIO_NORMS: ByAge = {
  "20-30": { male: r(1.68, 2.49), female: r(1.4, 2.24) },
  "31-40": { male: r(1.5, 2.29), female: r(1.28, 2.14) },
  "41-50": { male: r(1.49, 1.94), female: r(1.27, 2.03) },
  "51-60": { male: r(1.32, 1.84), female: r(1.27, 1.99) },
  "61-70": { male: r(1.18, 1.8), female: r(1.26, 1.8) },
  ">=71": { male: r(1.11, 1.78), female: r(1.23, 1.7) },
};

/** Pressure recovery time to 100% of baseline (seconds) */
export const PRT100_NORMS: ByAge = {
  "20-30": { male: r(1.44, 4.65), female: r(1.28, 3.04) },
  "31-40": { male: r(1.62, 4.69), female: r(1.5, 4.56) },
  "41-50": { male: r(1.59, 3.62), female: r(1.44, 5.28) },
  "51-60": { male: r(1.77, 4.18), female: r(1.38, 5.0) },
  "61-70": { male: r(2.01, 6.86), female: r(1.49, 4.64) },
  ">=71": { male: r(1.29, 10.67), female: r(1.43, 7.05) },
};

/** Pressure recovery time to 50% of baseline (seconds) */
export const PRT50_NORMS: ByAge = {
  "20-30": { male: r(0.59, 1.95), female: r(0.7, 1.5) },
  "31-40": { male: r(0.72, 2.25), female: r(0.64, 2.03) },
  "41-50": { male: r(0.69, 1.79), female: r(0.74, 2.58) },
  "51-60": { male: r(0.89, 1.93), female: r(0.7, 2.23) },
  "61-70": { male: r(0.89, 3.9), female: r(0.68, 2.07) },
  ">=71": { male: r(0.54, 4.88), female: r(0.75, 3.71) },
};

export type QsartSite = "forearm" | "proximal_leg" | "distal_leg" | "foot";

export const QSART_SITES: { key: QsartSite; label: string }[] = [
  { key: "forearm", label: "Forearm" },
  { key: "proximal_leg", label: "Proximal leg" },
  { key: "distal_leg", label: "Distal leg" },
  { key: "foot", label: "Foot" },
];

/** QSART sweat volume (µL) by age group / sex / site */
export const QSART_NORMS: Record<AgeGroup, Record<Sex, Record<QsartSite, Range>>> = {
  "20-30": {
    male: {
      forearm: r(0.153, 2.302),
      proximal_leg: r(0.135, 2.373),
      distal_leg: r(0.24, 1.754),
      foot: r(0.182, 1.314),
    },
    female: {
      forearm: r(0.23, 0.9),
      proximal_leg: r(0.224, 1.003),
      distal_leg: r(0.285, 0.94),
      foot: r(0.219, 0.71),
    },
  },
  "31-40": {
    male: {
      forearm: r(0.313, 1.367),
      proximal_leg: r(0.41, 1.502),
      distal_leg: r(0.318, 1.334),
      foot: r(0.217, 0.86),
    },
    female: {
      forearm: r(0.234, 0.84),
      proximal_leg: r(0.243, 0.899),
      distal_leg: r(0.283, 0.873),
      foot: r(0.264, 0.886),
    },
  },
  "41-50": {
    male: {
      forearm: r(0.295, 1.403),
      proximal_leg: r(0.322, 0.977),
      distal_leg: r(0.345, 0.864),
      foot: r(0.236, 1.078),
    },
    female: {
      forearm: r(0.196, 1.106),
      proximal_leg: r(0.177, 1.161),
      distal_leg: r(0.197, 0.861),
      foot: r(0.21, 1.246),
    },
  },
  "51-60": {
    male: {
      forearm: r(0.342, 1.217),
      proximal_leg: r(0.342, 0.896),
      distal_leg: r(0.342, 0.84),
      foot: r(0.284, 0.711),
    },
    female: {
      forearm: r(0.332, 0.722),
      proximal_leg: r(0.361, 0.85),
      distal_leg: r(0.444, 0.81),
      foot: r(0.276, 0.787),
    },
  },
  "61-70": {
    male: {
      forearm: r(0.383, 1.612),
      proximal_leg: r(0.419, 1.264),
      distal_leg: r(0.354, 1.297),
      foot: r(0.3, 1.604),
    },
    female: {
      forearm: r(0.215, 0.754),
      proximal_leg: r(0.226, 0.848),
      distal_leg: r(0.331, 0.747),
      foot: r(0.28, 0.664),
    },
  },
  ">=71": {
    male: {
      forearm: r(0.379, 1.554),
      proximal_leg: r(0.393, 1.293),
      distal_leg: r(0.349, 1.269),
      foot: r(0.299, 1.555),
    },
    female: {
      forearm: r(0.292, 0.683),
      proximal_leg: r(0.337, 0.723),
      distal_leg: r(0.328, 0.701),
      foot: r(0.294, 0.559),
    },
  },
};

export function getRange(
  norms: ByAge,
  age: number | "",
  sex: Sex | ""
): Range | null {
  const g = getAgeGroup(age);
  if (!g || !sex) return null;
  return norms[g][sex];
}

export function getQsartRange(
  age: number | "",
  sex: Sex | "",
  site: QsartSite
): Range | null {
  const g = getAgeGroup(age);
  if (!g || !sex) return null;
  return QSART_NORMS[g][sex][site];
}

/**
 * Optional laboratory-specific LLN/ULN overrides that take precedence over the
 * Indian adult reference dataset. Used by both the mCASS analyzer and the
 * Autonomic Testing section so they compute identical results.
 */
export interface LabOverrides {
  hrdb?: Partial<Range>;
  ei?: Partial<Range>;
  vr?: Partial<Range>;
  prt100?: Partial<Range>;
  prt50?: Partial<Range>;
  qsart?: Partial<Record<QsartSite, Partial<Range>>>;
}

/** Merges an optional lab override on top of a dataset range (override wins field-by-field). */
export function applyOverride(range: Range | null, override?: Partial<Range>): Range | null {
  if (!range && !override) return null;
  if (!override || (override.LLN === undefined && override.ULN === undefined)) return range;
  return {
    LLN: override.LLN ?? range?.LLN ?? 0,
    ULN: override.ULN ?? range?.ULN ?? 0,
  };
}

/**
 * 30:15 ratio (active standing) — provisional, age-aware screening fallback.
 *
 * No validated India-specific age-stratified reference table exists for this
 * ratio. These bands are derived from published age-adjusted Ewing-test
 * literature (NOT Indian-specific) and are only a screening fallback when a
 * laboratory-specific LLN is unavailable; prefer lab age/sex-adjusted norms.
 */
export type Ratio3015AgeBand = "18-40" | "41-60" | "61-70" | ">=70";

export interface Ratio3015Band {
  /** Values at/above this are reassuring / normal. */
  normalLLN: number;
  /** Values at/above this (but below normalLLN) are borderline; below is abnormal. */
  borderlineLow: number;
}

export const RATIO_3015_FALLBACK: Record<Ratio3015AgeBand, Ratio3015Band> = {
  "18-40": { normalLLN: 1.04, borderlineLow: 1.01 },
  "41-60": { normalLLN: 1.04, borderlineLow: 1.01 },
  "61-70": { normalLLN: 1.02, borderlineLow: 1.0 },
  ">=70": { normalLLN: 1.0, borderlineLow: 0.98 },
};

export function getRatio3015AgeBand(age: number | ""): Ratio3015AgeBand | null {
  if (age === "" || Number.isNaN(Number(age))) return null;
  const a = Number(age);
  if (a < 18) return null;
  if (a <= 40) return "18-40";
  if (a <= 60) return "41-60";
  if (a <= 70) return "61-70";
  return ">=70";
}

export function getRatio3015Fallback(age: number | ""): Ratio3015Band | null {
  const band = getRatio3015AgeBand(age);
  return band ? RATIO_3015_FALLBACK[band] : null;
}

export type NormStatus = "normal" | "low" | "high" | "unknown";

/**
 * Classify the 30:15 ratio. Uses the lab-specific LLN when supplied
 * (normal vs. abnormal only); otherwise falls back to the provisional,
 * non-Indian-specific age-band table above ("high" is reused to render the
 * "borderline" badge).
 */
export function classifyRatio3015(
  value: number | "",
  labLLN: number | "",
  age: number | ""
): NormStatus {
  if (value === "" || Number.isNaN(Number(value))) return "unknown";
  const v = Number(value);
  if (labLLN !== "" && !Number.isNaN(Number(labLLN))) {
    return v >= Number(labLLN) ? "normal" : "low";
  }
  const band = getRatio3015Fallback(age);
  if (!band) return "unknown";
  if (v >= band.normalLLN) return "normal";
  if (v >= band.borderlineLow) return "high";
  return "low";
}

/** Below LLN = abnormal (low); above ULN flagged as high (informational). */
export function classifyAgainst(value: number | "", range: Range | null): NormStatus {
  if (value === "" || value === null || Number.isNaN(Number(value)) || !range) return "unknown";
  const v = Number(value);
  if (v < range.LLN) return "low";
  if (v > range.ULN) return "high";
  return "normal";
}

/** For PRT (prolonged = abnormal): above ULN is abnormal. */
export function classifyPrt(value: number | "", range: Range | null): NormStatus {
  if (value === "" || value === null || Number.isNaN(Number(value)) || !range) return "unknown";
  const v = Number(value);
  if (v > range.ULN) return "high";
  return "normal";
}

export const SUDOSCAN_GUIDE = [
  { band: "> 60–70 µS", meaning: "Broadly normal" },
  { band: "40–60 µS", meaning: "Borderline / possible-moderate dysfunction" },
  { band: "< 40 µS", meaning: "Abnormal — verify against device-specific norms" },
] as const;

export function sudoscanBand(v: number | ""): NormStatus {
  if (v === "" || Number.isNaN(Number(v))) return "unknown";
  const n = Number(v);
  if (n < 40) return "low";
  if (n <= 60) return "high"; // borderline
  return "normal";
}

export const MCASS_SEVERITY = (total: number): string => {
  if (total === 0) return "Normal";
  if (total <= 3) return "Mild autonomic dysfunction";
  if (total <= 6) return "Moderate autonomic dysfunction";
  return "Severe autonomic dysfunction";
};
