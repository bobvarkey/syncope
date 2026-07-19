import SwiftUI
import Observation

@Observable
final class AppState {
    var hasOnboarded: Bool {
        didSet { UserDefaults.standard.set(hasOnboarded, forKey: Constants.Storage.hasOnboarded) }
    }
    var colorSchemePreference: ColorSchemePreference {
        didSet { UserDefaults.standard.set(colorSchemePreference.rawValue, forKey: Constants.Storage.colorSchemePreference) }
    }
    var searchQuery: String = ""
    var isSidebarOpen: Bool = false

    init() {
        self.hasOnboarded = UserDefaults.standard.bool(forKey: Constants.Storage.hasOnboarded)
        let raw = UserDefaults.standard.string(forKey: Constants.Storage.colorSchemePreference) ?? ColorSchemePreference.system.rawValue
        self.colorSchemePreference = ColorSchemePreference(rawValue: raw) ?? .system
    }

    var colorScheme: ColorScheme? {
        switch colorSchemePreference {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}

enum ColorSchemePreference: String, CaseIterable, Identifiable {
    case system, light, dark
    var id: String { rawValue }
    var label: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }
}
