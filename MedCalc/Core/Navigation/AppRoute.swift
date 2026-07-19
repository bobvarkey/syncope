import SwiftUI

enum AppTab: String, CaseIterable, Identifiable, Hashable {
    case home, calculators, history, settings
    var id: String { rawValue }
    var title: String {
        switch self {
        case .home: "Home"
        case .calculators: "Calculators"
        case .history: "History"
        case .settings: "Settings"
        }
    }
    var systemImage: String {
        switch self {
        case .home: "sparkles"
        case .calculators: "function"
        case .history: "clock.arrow.circlepath"
        case .settings: "gearshape.fill"
        }
    }
}

enum AppRoute: Hashable {
    case calculator(CalculatorKind)
    case historyDetail(UUID)
}
