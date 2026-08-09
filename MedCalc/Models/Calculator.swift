import Foundation

enum CalculatorKind: String, CaseIterable, Identifiable, Hashable, Codable {
    case qtc, syncopeRisk, hutt

    var id: String { rawValue }

    var title: String {
        switch self {
        case .qtc: "QTc (Bazett / Fridericia)"
        case .syncopeRisk: "Syncope Risk (OESIL / SFSR)"
        case .hutt: "HUTT Interpretation Helper"
        }
    }

    var summary: String {
        switch self {
        case .qtc: "Rate-corrected QT interval."
        case .syncopeRisk: "Descriptive syncope risk scoring."
        case .hutt: "Head-up tilt test response helper."
        }
    }

    var systemImage: String {
        switch self {
        case .qtc: "heart.text.square.fill"
        case .syncopeRisk: "waveform.path.ecg"
        case .hutt: "arrow.up.and.down.and.arrow.left.and.right"
        }
    }

    var group: CalculatorGroup {
        switch self {
        case .qtc, .syncopeRisk, .hutt: .cardiology
        }
    }
}

enum CalculatorGroup: String, CaseIterable, Identifiable, Hashable {
    case cardiology
    var id: String { rawValue }
    var title: String {
        switch self {
        case .cardiology: "Cardiology"
        }
    }
    var systemImage: String {
        switch self {
        case .cardiology: "heart.fill"
        }
    }
    var accent: SunsetAccent {
        switch self {
        case .cardiology: .magenta
        }
    }
}
