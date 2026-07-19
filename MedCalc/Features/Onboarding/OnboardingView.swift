import SwiftUI

struct OnboardingView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(spacing: DS.Spacing.l) {
            Spacer()
            UniformMedia(aspect: 1) {
                ZStack {
                    DS.sunset
                    Image(systemName: "stethoscope")
                        .font(.system(size: 90, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .frame(maxWidth: 260)

            VStack(spacing: 10) {
                Text("Welcome to MedCalc")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(DS.sunset)
                Text("Warm, fast, and delightfully simple bedside calculators.")
                    .font(.system(size: 17))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, DS.Spacing.l)
                    .lineSpacing(4)
            }

            DisclaimerBanner().padding(.horizontal, DS.Spacing.l)

            Spacer()

            Button {
                withAnimation(.snappy) { appState.hasOnboarded = true }
            } label: {
                Label("Let's go", systemImage: "arrow.right")
            }
            .buttonStyle(SunsetButtonStyle())
            .padding(.horizontal, DS.Spacing.l)
            .padding(.bottom, DS.Spacing.xl)
        }
        .background(Color(.systemBackground).ignoresSafeArea())
    }
}
