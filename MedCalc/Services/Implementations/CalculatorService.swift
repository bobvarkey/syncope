import Foundation

struct CalculatorService: CalculatorServicing {
    func compute(kind: CalculatorKind, inputs: [String: Double]) throws -> CalculationResult {
        switch kind {
        case .qtc:
            return try computeQTc(inputs)
        case .syncopeRisk:
            return try computeSyncopeRisk(inputs)
        case .hutt:
            return try computeHutt(inputs)
        }
    }

    // MARK: - QTc (Bazett / Fridericia)

    private func computeQTc(_ inputs: [String: Double]) throws -> CalculationResult {
        let qt = try require(inputs["qtMs"], "QT (ms)")
        let rr = try require(inputs["rrSec"], "RR (s)")
        guard qt > 0, rr > 0 else { throw AppError.invalidInput("QT and RR must be greater than 0") }

        let bazett = qt / sqrt(rr)
        let fridericia = qt / cbrt(rr)

        let interpretation: String
        if bazett > 500 {
            interpretation = "Bazett QTc is above 500 ms — a value commonly cited as high risk. Clinical correlation advised."
        } else if bazett > 460 {
            interpretation = "Bazett QTc is above 460 ms — above the commonly cited reference range. Clinical correlation advised."
        } else {
            interpretation = "Bazett QTc is within the commonly cited reference range."
        }

        return CalculationResult(
            value: bazett.rounded(to: 0),
            unit: "ms (Bazett)",
            interpretation: interpretation
        )
    }

    // MARK: - Syncope Risk (OESIL / SFSR)

    private func computeSyncopeRisk(_ inputs: [String: Double]) throws -> CalculationResult {
        // OESIL score: 1 point each for age ≥65, no preceding CV history,
        // syncope without prodrome, abnormal ECG.
        let age = inputs["age"] ?? 0
        let noCvHistory = (inputs["noCvHistory"] ?? 0) > 0.5
        let noProdrome = (inputs["noProdrome"] ?? 0) > 0.5
        let abnormalEcg = (inputs["abnormalEcg"] ?? 0) > 0.5

        var oesil = 0
        if age >= 65 { oesil += 1 }
        if noCvHistory { oesil += 1 }
        if noProdrome { oesil += 1 }
        if abnormalEcg { oesil += 1 }

        // SFSR (San Francisco Syncope Rule): high risk if any of
        // abnormal ECG, dyspnea, hematocrit <30%, SBP <90, or heart failure history.
        let abnormalEcgSfsr = (inputs["sfsrAbnormalEcg"] ?? 0) > 0.5
        let dyspnea = (inputs["dyspnea"] ?? 0) > 0.5
        let lowHematocrit = (inputs["lowHematocrit"] ?? 0) > 0.5
        let lowSbp = (inputs["lowSbp"] ?? 0) > 0.5
        let heartFailure = (inputs["heartFailure"] ?? 0) > 0.5
        let sfsrPositive = abnormalEcgSfsr || dyspnea || lowHematocrit || lowSbp || heartFailure

        let interpretation: String
        if oesil >= 2 {
            interpretation = "OESIL score \(oesil)/4 — a higher score is associated with increased risk in published studies. This is descriptive and does not direct management."
        } else {
            interpretation = "OESIL score \(oesil)/4 — a lower score is associated with lower risk in published studies. This is descriptive and does not direct management."
        }

        return CalculationResult(
            value: Double(oesil),
            unit: "/4 (OESIL)",
            interpretation: interpretation
        )
    }

    // MARK: - HUTT Interpretation Helper

    private func computeHutt(_ inputs: [String: Double]) throws -> CalculationResult {
        let responseType = inputs["responseType"] ?? 0
        // 0 = negative, 1 = vasovagal (mixed), 2 = cardioinhibitory, 3 = vasodepressor, 4 = POTS-like
        let reproduced = (inputs["symptomsReproduced"] ?? 0) > 0.5

        let label: String
        let interpretation: String
        switch Int(responseType) {
        case 1:
            label = "Vasovagal (mixed)"
            interpretation = reproduced
                ? "Symptoms reproduced with a mixed vasovagal response. Descriptive only — correlate with the clinical picture."
                : "Mixed vasovagal response recorded without symptom reproduction. Descriptive only."
        case 2:
            label = "Cardioinhibitory"
            interpretation = reproduced
                ? "Symptoms reproduced with a cardioinhibitory response. Descriptive only — correlate with the clinical picture."
                : "Cardioinhibitory response recorded without symptom reproduction. Descriptive only."
        case 3:
            label = "Vasodepressor"
            interpretation = reproduced
                ? "Symptoms reproduced with a vasodepressor response. Descriptive only — correlate with the clinical picture."
                : "Vasodepressor response recorded without symptom reproduction. Descriptive only."
        case 4:
            label = "POTS-like"
            interpretation = "POTS-like heart rate pattern recorded. Descriptive only — correlate with the clinical picture."
        default:
            label = "Negative"
            interpretation = "No diagnostic response recorded. Descriptive only — correlate with the clinical picture."
        }

        return CalculationResult(
            value: responseType,
            unit: label,
            interpretation: interpretation
        )
    }

    // MARK: - Helpers

    private func require(_ v: Double?, _ name: String) throws -> Double {
        guard let v else { throw AppError.invalidInput("missing \(name)") }
        return v
    }
}

private extension Double {
    func rounded(to places: Int) -> Double {
        let f = pow(10.0, Double(places))
        return (self * f).rounded() / f
    }
}
