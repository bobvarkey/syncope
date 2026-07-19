import SwiftUI

struct SettingsView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        @Bindable var state = appState
        Form {
            Section("Appearance") {
                Picker("Theme", selection: $state.colorSchemePreference) {
                    ForEach(ColorSchemePreference.allCases) { p in
                        Text(p.label).tag(p)
                    }
                }
                .pickerStyle(.segmented)
            }
            Section("Accessibility") {
                Label("Supports Dynamic Type", systemImage: "textformat.size")
                Label("VoiceOver friendly", systemImage: "waveform")
                Label("High-contrast palette", systemImage: "circle.lefthalf.filled")
            }
            Section("About") {
                LabeledContent("App", value: Constants.appName)
                LabeledContent("Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")
            }
            Section("Legal") {
                Text(Constants.disclaimer).font(.footnote).foregroundStyle(.secondary)
            }
        }
    }
}
