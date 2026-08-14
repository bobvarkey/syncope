import { describe, it, expect } from "vitest";
import {
  computeEcgRisk,
  ecgTestCases,
  ecgPatterns,
  patternPoints,
} from "./ecgRiskScoring";

const select = (ids: string[]) =>
  ids.reduce<Record<string, boolean>>((acc, id) => ({ ...acc, [id]: true }), {});

describe("computeEcgRisk", () => {
  it("returns a zero score and low priority for no findings", () => {
    const r = computeEcgRisk({});
    expect(r.riskScore).toBe(0);
    expect(r.overallRisk).toBe("low");
    expect(r.recommendation.priority).toBe("Low");
    expect(r.breakdown).toHaveLength(0);
  });

  it("scores high-risk patterns at 3 points and intermediate at 1", () => {
    expect(patternPoints("high")).toBe(3);
    expect(patternPoints("intermediate")).toBe(1);
    const r = computeEcgRisk(select(["brugada", "rv-strain"]));
    expect(r.riskScore).toBe(4);
    expect(r.highCount).toBe(1);
    expect(r.intermediateCount).toBe(1);
  });

  it("escalates to Critical when cumulative intermediate flags reach 3 points", () => {
    const r = computeEcgRisk(select(["bifascicular", "sinus-brady", "early-repol"]));
    expect(r.highCount).toBe(0);
    expect(r.riskScore).toBe(3);
    expect(r.recommendation.priority).toBe("Critical");
  });

  it("stays Intermediate at 2 points with no high-risk pattern", () => {
    const r = computeEcgRisk(select(["bifascicular", "sinus-brady"]));
    expect(r.riskScore).toBe(2);
    expect(r.overallRisk).toBe("intermediate");
    expect(r.recommendation.priority).toBe("Intermediate");
  });

  it("dedupes WOBBLER mnemonic letters", () => {
    const r = computeEcgRisk(select(["av-block", "bifascicular", "sinus-brady"]));
    expect(r.wobblerLetters).toEqual(["A"]);
  });

  it("ignores unknown pattern ids", () => {
    const r = computeEcgRisk({ "not-a-pattern": true });
    expect(r.riskScore).toBe(0);
  });

  it("produces a breakdown entry per active pattern", () => {
    const r = computeEcgRisk(select(["brugada", "lvh-hocm"]));
    expect(r.breakdown.map((b) => b.id)).toEqual(["brugada", "lvh-hocm"]);
    expect(r.breakdown.map((b) => b.points)).toEqual([3, 1]);
    expect(r.breakdown.reduce((a, b) => a + b.points, 0)).toBe(r.riskScore);
  });

  it("has unique pattern ids", () => {
    const ids = ecgPatterns.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("published ECG test cases", () => {
  it.each(ecgTestCases)(
    "$label scores $expectedScore with $expectedPriority priority",
    ({ patterns, expectedScore, expectedPriority }) => {
      const r = computeEcgRisk(select(patterns));
      expect(r.riskScore).toBe(expectedScore);
      expect(r.recommendation.priority).toBe(expectedPriority);
    }
  );
});
