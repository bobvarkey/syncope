import Foundation

enum CalculatorKind: String, CaseIterable, Identifiable, Hashable, Codable {
    case bmi, map, gfrCockcroftGault, correctedCalcium, aniongap, qtc

    var id: String { rawValue }

    var title: String {
        switch self {
        case .bmi: "Body Mass Index"
        case .map: "Mean Arterial Pressure"
        case .gfrCockcroftGault: "Creatinine Clearance (Cockcroft–Gault)"
        case .correctedCalcium: "Corrected Calcium"
        case .aniongap: "Anion Gap"
        case .qtc: "QTc (Bazett)"
        }
    }

    var summary: String {
        switch self {
        case .bmi: "Weight vs. height snapshot."
        case .map: "Perfusion pressure from SBP & DBP."
        case .gfrCockcroftGault: "Estimated CrCl from creatinine."
        case .correctedCalcium: "Calcium adjusted for albumin."
        case .aniongap: "Na – (Cl + HCO₃)."
        case .qtc: "Rate-corrected QT interval."
        }
    }

    var systemImage: String {
        switch self {
        case .bmi: "figure"
        case .map: "waveform.path.ecg"
        case .gfrCockcroftGault: "drop.fill"
        case .correctedCalcium: "testtube.2"
        case .aniongap: "bolt.heart"
        case .qtc: "heart.text.square.fill"
        }
    }

    var group: CalculatorGroup {
        switch self {
        case .bmi, .map: .general
        case .gfrCockcroftGault, .correctedCalcium, .aniongap: .lab
        case .qtc: .cardiology
        }
    }
}

enum CalculatorGroup: String, CaseIterable, Identifiable, Hashable {
    case general, lab, cardiology
    var id: String { rawValue }
    var title: String {
        switch self {
        case .general: "General"
        case .lab: "Lab & Chemistry"
        case .cardiology: "Cardiology"
        }
    }
    var systemImage: String {
        switch self {
        case .general: "square.grid.2x2.fill"
        case .lab: "flask.fill"
        case .cardiology: "heart.fill"
        }
    }
    var accent: SunsetAccent {
        switch self {
        case .general: .coral
        case .lab: .amber
        case .cardiology: .magenta
        }
    }
}
