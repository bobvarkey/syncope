import SwiftUI
import SwiftData

@main
struct MedCalcApp: App {
    @State private var container = DIContainer.live()
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(container)
                .environment(appState)
                .preferredColorScheme(appState.colorScheme)
                .tint(DS.Color.coral)
        }
        .modelContainer(for: [CalculationRecord.self])
    }
}

struct RootView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        if appState.hasOnboarded {
            MainShellView()
        } else {
            OnboardingView()
                .transition(.opacity.combined(with: .move(edge: .bottom)))
        }
    }
}
