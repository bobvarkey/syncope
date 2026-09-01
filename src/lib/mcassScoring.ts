/**
 * Shared mCASS / CAN scoring logic used by both the Autonomic Function & mCASS
 * Analyzer (McassMiniApp) and the Autonomic Testing questionnaire section, so
 * both surfaces compute identical numbers from the same Indian age/sex norms
 * (with optional laboratory-specific overrides).
 */
import {
  EI_NORMS,
  HRDB_NORMS,
  LabOverrides,
  MCASS_SEVERITY,
  NormStatus,
  PRT100_NORMS,
  PRT50_NORMS,
  QsartSite,
  Range,
  Sex,
  VALSALVA_RATIO_NORMS,
  applyOverride,
  classifyAgainst,
  classifyPrt,
  classifyRatio3015,
  getQsartRange,
  getRange,
  getRatio3015Fallback,
} from "./autonomicNorms";

export type Num = number | "";
export const isNum = (v: Num): v is number => v !== "" && !Number.isNaN(Number(v));

/* --------------------------- Cardiovagal --------------------------- */

export interface CardiovagalInputs {
  age: Num;
  sex: Sex | "";
  hrdb: Num;
  ei: Num;
  vr: Num;
  ratio3015: Num;
  ratio3015LLN: Num;
  overrides?: LabOverrides;
}

export interface CardiovagalResult {
  score: 0 | 1 | 2 | 3;
  mild: number;
  severe: number;
  tested: number;
  hrdbRange: Range | null;
  eiRange: Range | null;
  vrRange: Range | null;
  hrdbStatus: NormStatus;
  eiStatus: NormStatus;
  vrStatus: NormStatus;
  r3015Status: NormStatus;
  ratio3015Fallback: ReturnType<typeof getRatio3015Fallback>;
}

export function computeCardiovagal(input: CardiovagalInputs): CardiovagalResult {
  const { age, sex, hrdb, ei, vr, ratio3015, ratio3015LLN, overrides } = input;
  const hrdbRange = applyOverride(getRange(HRDB_NORMS, age, sex), overrides?.hrdb);
  const eiRange = applyOverride(getRange(EI_NORMS, age, sex), overrides?.ei);
  const vrRange = applyOverride(getRange(VALSALVA_RATIO_NORMS, age, sex), overrides?.vr);
  const ratio3015Fallback = getRatio3015Fallback(age);

  const hrdbStatus = classifyAgainst(hrdb, hrdbRange);
  const eiStatus = classifyAgainst(ei, eiRange);
  const vrStatus = classifyAgainst(vr, vrRange);
  const r3015Status = classifyRatio3015(ratio3015, ratio3015LLN, age);

  const grade = (v: Num, lln: number | null): 0 | 1 | 2 | null => {
    if (!isNum(v) || lln === null) return null;
    const val = Number(v);
    if (val >= lln) return 0;
    return val >= lln * 0.9 ? 1 : 2;
  };
  const grades = [
    grade(hrdb, hrdbRange?.LLN ?? null),
    grade(ei, eiRange?.LLN ?? null),
    grade(vr, vrRange?.LLN ?? null),
    grade(ratio3015, isNum(ratio3015LLN) ? Number(ratio3015LLN) : ratio3015Fallback?.normalLLN ?? null),
  ].filter((g): g is 0 | 1 | 2 => g !== null);

  const mild = grades.filter((g) => g === 1).length;
  const severe = grades.filter((g) => g === 2).length;
  let score: 0 | 1 | 2 | 3 = 0;
  if (severe >= 2 || (severe >= 1 && mild >= 1)) score = 3;
  else if (severe === 1 || mild >= 2) score = 2;
  else if (mild === 1) score = 1;

  return {
    score,
    mild,
    severe,
    tested: grades.length,
    hrdbRange,
    eiRange,
    vrRange,
    hrdbStatus,
    eiStatus,
    vrStatus,
    r3015Status,
    ratio3015Fallback,
  };
}

/* --------------------------- Orthostatic --------------------------- */

export interface Reading {
  t: number;
  sbp: Num;
  dbp: Num;
  hr: Num;
  symptoms: string[];
}

export interface OrthoResult {
  available: boolean;
  maxSbpFall: number | null;
  maxDbpFall: number | null;
  maxHrRise: number | null;
  classical: boolean;
  delayed: boolean;
  attenuatedHR: boolean;
  timeToOH: number | null;
  maxSustainedHrRise: number | null;
  timeToPots: number | null;
  potsThreshold: number;
  symptoms: string[];
}

export function computeOrtho(
  readings: Reading[],
  baselineHypertensive: boolean,
  age: Num
): OrthoResult {
  const supine = readings.find((x) => x.t === 0);
  const upright = readings.filter((x) => x.t > 0);
  if (!supine || !isNum(supine.sbp) || !isNum(supine.dbp)) {
    return {
      available: false,
      maxSbpFall: null,
      maxDbpFall: null,
      maxHrRise: null,
      classical: false,
      delayed: false,
      attenuatedHR: false,
      timeToOH: null,
      maxSustainedHrRise: null,
      timeToPots: null,
      potsThreshold: isNum(age) && Number(age) >= 12 && Number(age) <= 19 ? 40 : 30,
      symptoms: [],
    };
  }
  const sbp0 = Number(supine.sbp);
  const dbp0 = Number(supine.dbp);
  const hr0 = isNum(supine.hr) ? Number(supine.hr) : null;

  const sbpThresh = baselineHypertensive && sbp0 >= 150 ? 30 : 20;
  const dbpThresh = baselineHypertensive && dbp0 >= 90 ? 15 : 10;

  let maxSbpFall = 0;
  let maxDbpFall = 0;
  let maxHrRise: number | null = null;
  let timeToOH: number | null = null;
  let classical = false;
  let delayed = false;
  let timeToPots: number | null = null;

  upright.forEach((rd) => {
    if (isNum(rd.sbp)) maxSbpFall = Math.max(maxSbpFall, sbp0 - Number(rd.sbp));
    if (isNum(rd.dbp)) maxDbpFall = Math.max(maxDbpFall, dbp0 - Number(rd.dbp));
    if (hr0 !== null && isNum(rd.hr)) {
      const rise = Number(rd.hr) - hr0;
      maxHrRise = maxHrRise === null ? rise : Math.max(maxHrRise, rise);
    }
    const meets =
      (isNum(rd.sbp) && sbp0 - Number(rd.sbp) >= sbpThresh) ||
      (isNum(rd.dbp) && dbp0 - Number(rd.dbp) >= dbpThresh);
    if (meets && timeToOH === null) timeToOH = rd.t;
    if (meets && rd.t <= 3) classical = true;
    if (meets && rd.t > 3) delayed = true;
  });

  const potsThreshold = isNum(age) && Number(age) >= 12 && Number(age) <= 19 ? 40 : 30;
  upright
    .filter((rd) => rd.t <= 10)
    .forEach((rd) => {
      if (hr0 !== null && isNum(rd.hr) && Number(rd.hr) - hr0 >= potsThreshold && timeToPots === null) {
        timeToPots = rd.t;
      }
    });

  return {
    available: true,
    maxSbpFall,
    maxDbpFall,
    maxHrRise,
    classical,
    delayed: delayed && !classical,
    attenuatedHR: (classical || delayed) && maxHrRise !== null && maxHrRise < 15,
    timeToOH,
    maxSustainedHrRise: maxHrRise,
    timeToPots,
    potsThreshold,
    symptoms: Array.from(new Set(upright.flatMap((rd) => rd.symptoms))),
  };
}

/* --------------------------- Adrenergic --------------------------- */

export interface AdrenergicInputs {
  age: Num;
  sex: Sex | "";
  latePhaseII: string;
  phaseIV: string;
  prt100: Num;
  prt50: Num;
  ortho: OrthoResult;
  overrides?: LabOverrides;
}

export interface AdrenergicResult {
  score: number;
  valsalvaSeverity: number;
  flags: string[];
  prt100Range: Range | null;
  prt50Range: Range | null;
  prt100Status: NormStatus;
  prt50Status: NormStatus;
}

export function computeAdrenergic(input: AdrenergicInputs): AdrenergicResult {
  const { age, sex, latePhaseII, phaseIV, prt100, prt50, ortho, overrides } = input;
  const prt100Range = applyOverride(getRange(PRT100_NORMS, age, sex), overrides?.prt100);
  const prt50Range = applyOverride(getRange(PRT50_NORMS, age, sex), overrides?.prt50);
  const prt100Status = classifyPrt(prt100, prt100Range);
  const prt50Status = classifyPrt(prt50, prt50Range);

  let valsalvaSeverity = 0;
  const flags: string[] = [];
  if (latePhaseII === "reduced") {
    valsalvaSeverity = Math.max(valsalvaSeverity, 1);
    flags.push("Reduced late phase II recovery");
  }
  if (latePhaseII === "absent") {
    valsalvaSeverity = 2;
    flags.push("Absent late phase II recovery");
  }
  if (phaseIV === "reduced") {
    valsalvaSeverity = Math.max(valsalvaSeverity, 1);
    flags.push("Reduced phase IV overshoot");
  }
  if (phaseIV === "absent") {
    valsalvaSeverity = 2;
    flags.push("Absent phase IV overshoot");
  }
  if (prt100Status === "high") {
    valsalvaSeverity = Math.max(valsalvaSeverity, 1);
    flags.push("Prolonged PRT100");
  }
  if (prt50Status === "high") {
    valsalvaSeverity = Math.max(valsalvaSeverity, 1);
    flags.push("Prolonged PRT50");
  }
  if (flags.length >= 2) valsalvaSeverity = Math.max(valsalvaSeverity, 2);

  let score = 0;
  if (ortho.classical) score = 2;
  else if (ortho.delayed) score = 1;

  if (ortho.classical && (ortho.attenuatedHR || valsalvaSeverity >= 1)) score = 3;
  if (ortho.classical && ortho.attenuatedHR && valsalvaSeverity >= 2) score = 4;
  if (!ortho.classical && !ortho.delayed) score = valsalvaSeverity >= 2 ? 2 : valsalvaSeverity;
  score = Math.min(4, score);

  return { score, valsalvaSeverity, flags, prt100Range, prt50Range, prt100Status, prt50Status };
}

/* --------------------------- Sudomotor --------------------------- */

export interface SudomotorInputs {
  age: Num;
  sex: Sex | "";
  sudoMode: "sudoscan" | "qsart";
  sudoscan: { rHand: Num; lHand: Num; rFoot: Num; lFoot: Num };
  sudoscanLln: { hand: Num; foot: Num };
  qsart: Record<QsartSite, Num>;
  overrides?: LabOverrides;
}

export interface SudomotorResult {
  score: number;
  handAbn: boolean;
  footAbn: boolean;
  handSevere: boolean;
  footSevere: boolean;
  tested: boolean;
  detail: string[];
  handPct: number | null;
  footPct: number | null;
  handLlnUsedDefault: boolean;
  footLlnUsedDefault: boolean;
}

export function computeSudomotor(input: SudomotorInputs): SudomotorResult {
  const { age, sex, sudoMode, sudoscan, sudoscanLln, qsart, overrides } = input;
  let handAbn = false;
  let footAbn = false;
  let handSevere = false;
  let footSevere = false;
  let tested = false;
  const detail: string[] = [];
  let handPct: number | null = null;
  let footPct: number | null = null;
  let handLlnUsedDefault = false;
  let footLlnUsedDefault = false;

  if (sudoMode === "sudoscan") {
    const hands = [sudoscan.rHand, sudoscan.lHand].filter(isNum) as number[];
    const feet = [sudoscan.rFoot, sudoscan.lFoot].filter(isNum) as number[];
    tested = hands.length > 0 || feet.length > 0;
    const worstHand = hands.length ? Math.min(...hands) : null;
    const worstFoot = feet.length ? Math.min(...feet) : null;
    handLlnUsedDefault = worstHand !== null && !isNum(sudoscanLln.hand);
    footLlnUsedDefault = worstFoot !== null && !isNum(sudoscanLln.foot);
    const handLln = isNum(sudoscanLln.hand) ? Number(sudoscanLln.hand) : 60;
    const footLln = isNum(sudoscanLln.foot) ? Number(sudoscanLln.foot) : 60;
    if (worstHand !== null) {
      handAbn = worstHand < handLln;
      handSevere = worstHand < handLln * (2 / 3);
      handPct = handLln > 0 ? (100 * worstHand) / handLln : null;
      detail.push(`Hands ${worstHand} µS (LLN ${handLln}${handLlnUsedDefault ? " default" : ""})`);
    }
    if (worstFoot !== null) {
      footAbn = worstFoot < footLln;
      footSevere = worstFoot < footLln * (2 / 3);
      footPct = footLln > 0 ? (100 * worstFoot) / footLln : null;
      detail.push(`Feet ${worstFoot} µS (LLN ${footLln}${footLlnUsedDefault ? " default" : ""})`);
    }
  } else {
    const handSites: QsartSite[] = ["forearm"];
    const footSites: QsartSite[] = ["distal_leg", "foot"];
    const evalSite = (site: QsartSite) => {
      const v = qsart[site];
      const range = applyOverride(getQsartRange(age, sex, site), overrides?.qsart?.[site]);
      if (!isNum(v) || !range) return null;
      tested = true;
      detail.push(`${site.replace("_", " ")} ${v} µL (LLN ${range.LLN})`);
      return { abnormal: Number(v) < range.LLN, severe: Number(v) < range.LLN * 0.5 };
    };
    handSites.forEach((site) => {
      const res = evalSite(site);
      if (res) {
        handAbn = handAbn || res.abnormal;
        handSevere = handSevere || res.severe;
      }
    });
    footSites.forEach((site) => {
      const res = evalSite(site);
      if (res) {
        footAbn = footAbn || res.abnormal;
        footSevere = footSevere || res.severe;
      }
    });
    const proximal = evalSite("proximal_leg");
    if (proximal) {
      footAbn = footAbn || proximal.abnormal;
      footSevere = footSevere || proximal.severe;
    }
  }

  let score = 0;
  const anySevere = handSevere || footSevere;
  if (handAbn && footAbn && anySevere) score = 3;
  else if ((handAbn && footAbn) || (anySevere && (handAbn || footAbn))) score = 2;
  else if (handAbn || footAbn || anySevere) score = 1;

  return {
    score,
    handAbn,
    footAbn,
    handSevere,
    footSevere,
    tested,
    detail,
    handPct,
    footPct,
    handLlnUsedDefault,
    footLlnUsedDefault,
  };
}

/* --------------------------- CAN stage / POTS / pattern --------------------------- */

export function computeCanStage(
  hrdbStatus: NormStatus,
  vrStatus: NormStatus,
  r3015Status: NormStatus,
  orthoClassical: boolean
): { count: number; stage: string } {
  const abnormal = [hrdbStatus === "low", vrStatus === "low", r3015Status === "low"].filter(Boolean).length;
  if (abnormal >= 1 && orthoClassical) return { count: abnormal, stage: "Severe / advanced CAN" };
  if (abnormal === 0) return { count: 0, stage: "No evidence of CAN" };
  if (abnormal === 1) return { count: 1, stage: "Possible / early CAN" };
  return { count: abnormal, stage: "Definite / confirmed CAN" };
}

export function computePots(ortho: OrthoResult): {
  met: boolean;
  threshold: number;
  timeToCriterion: number | null;
  note: string;
} {
  const met = ortho.timeToPots !== null && !ortho.classical;
  return {
    met,
    threshold: ortho.potsThreshold ?? 30,
    timeToCriterion: ortho.timeToPots,
    note:
      ortho.timeToPots !== null && ortho.classical
        ? "HR rise present but orthostatic hypotension may explain the tachycardia"
        : "",
  };
}

export function computePattern(cardiovagalScore: number, adrenergicScore: number, sudomotorScore: number): string {
  const domains = [
    cardiovagalScore > 0 ? "cardiovagal" : null,
    adrenergicScore > 0 ? "adrenergic" : null,
    sudomotorScore > 0 ? "sudomotor" : null,
  ].filter(Boolean) as string[];
  if (domains.length === 0) return "No significant objective autonomic abnormality";
  if (domains.length >= 2) {
    if (cardiovagalScore > 0 && adrenergicScore > 0 && sudomotorScore === 0)
      return "Generalized autonomic dysfunction — central-predominant pattern (cardiovagal + adrenergic, limited distal sudomotor involvement)";
    if (sudomotorScore >= 2 && (cardiovagalScore > 0 || adrenergicScore > 0))
      return "Generalized autonomic dysfunction — peripheral-predominant pattern (prominent sudomotor with cardiovascular involvement)";
    return "Generalized autonomic dysfunction";
  }
  return `${domains[0].charAt(0).toUpperCase()}${domains[0].slice(1)}-predominant`;
}

export { MCASS_SEVERITY };

export function computeMcassTotal(cardiovagalScore: number, adrenergicScore: number, sudomotorScore: number) {
  const total = cardiovagalScore + adrenergicScore + sudomotorScore;
  return { total, severity: MCASS_SEVERITY(total) };
}
