import Foundation

struct CalculatorService: CalculatorServicing {
    func compute(kind: CalculatorKind, inputs: [String: Double]) throws -> CalculationResult {
        switch kind {
        case .bmi:
            let w = try require(inputs["weightKg"], "weight (kg)")
            let h = try require(inputs["heightCm"], "height (cm)") / 100
            guard h > 0 else { throw AppError.invalidInput("height must be > 0") }
            let bmi = w / (h * h)
            return CalculationResult(value: bmi.rounded(to: 1), unit: "kg/m²",
                                     interpretation: bmiInterpretation(bmi))
        case .map:
            let s = try require(inputs["sbp"], "SBP")
            let d = try require(inputs["dbp"], "DBP")
            let map = (s + 2 * d) / 3
            return CalculationResult(value: map.rounded(to: 0), unit: "mmHg",
                                     interpretation: map < 65 ? "Below typical perfusion threshold." : "Within typical range.")
        case .gfrCockcroftGault:
            let age = try require(inputs["age"], "age")
            let w = try require(inputs["weightKg"], "weight (kg)")
            let scr = try require(inputs["creatinineMgDl"], "creatinine")
            let isFemale = (inputs["isFemale"] ?? 0) > 0.5
            let crcl = ((140 - age) * w) / (72 * scr) * (isFemale ? 0.85 : 1.0)
            return CalculationResult(value: crcl.rounded(to: 0), unit: "mL/min",
                                     interpretation: crcl < 60 ? "Reduced clearance — review dosing." : "Normal range.")
        case .correctedCalcium:
            let ca = try require(inputs["calciumMgDl"], "calcium")
            let alb = try require(inputs["albuminGdl"], "albumin")
            let corrected = ca + 0.8 * (4.0 - alb)
            return CalculationResult(value: corrected.rounded(to: 2), unit: "mg/dL",
                                     interpretation: "Adjusted for albumin.")
        case .aniongap:
            let na = try require(inputs["sodium"], "Na")
            let cl = try require(inputs["chloride"], "Cl")
            let hco3 = try require(inputs["bicarb"], "HCO₃")
            let gap = na - (cl + hco3)
            return CalculationResult(value: gap.rounded(to: 1), unit: "mEq/L",
                                     interpretation: gap > 12 ? "Elevated anion gap." : "Normal range.")
        case .qtc:
            let qt = try require(inputs["qtMs"], "QT")
            let rr = try require(inputs["rrSec"], "RR")
            guard rr > 0 else { throw AppError.invalidInput("RR must be > 0") }
            let qtc = qt / sqrt(rr)
            return CalculationResult(value: qtc.rounded(to: 0), unit: "ms",
                                     interpretation: qtc > 460 ? "Prolonged QTc — clinical correlation advised." : "Within typical range.")
        }
    }

    private func require(_ v: Double?, _ name: String) throws -> Double {
        guard let v else { throw AppError.invalidInput("missing \(name)") }
        return v
    }

    private func bmiInterpretation(_ v: Double) -> String {
        switch v {
        case ..<18.5: "Below typical range."
        case 18.5..<25: "Within typical range."
        case 25..<30: "Above typical range."
        default: "Well above typical range."
        }
    }
}

private extension Double {
    func rounded(to places: Int) -> Double {
        let f = pow(10.0, Double(places))
        return (self * f).rounded() / f
    }
}
