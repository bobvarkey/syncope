import SwiftUI

struct HomeView: View {
    var onOpenCalculator: (CalculatorKind) -> Void
    @Environment(DIContainer.self) private var di

    private let featured: [CalculatorKind] = [.qtc, .syncopeRisk, .hutt]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Spacing.l) {
                hero
                DisclaimerBanner()

                Text("Popular calculators")
                    .font(.system(size: 19, weight: .bold))
                    .padding(.top, DS.Spacing.s)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12),
                                    GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(featured) { k in
                        FeatureCard(kind: k) {
                            di.hapticsService.tap()
                            onOpenCalculator(k)
                        }
                    }
                }
            }
            .padding(DS.Spacing.m)
            .lineSpacing(4)
        }
        .scrollIndicators(.hidden)
    }

    private var hero: some View {
        UniformMedia(aspect: 16.0/10.0) {
            ZStack(alignment: .bottomLeading) {
                DS.sunset
                Circle()
                    .fill(.white.opacity(0.25))
                    .frame(width: 220, height: 220)
                    .blur(radius: 40)
                    .offset(x: 140, y: -60)
                VStack(alignment: .leading, spacing: 8) {
                    Text("Hi, clinician 👋")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.9))
                    Text("Fast, friendly bedside math.")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(.white)
                    Text("Pick a calculator, punch in the values, get a clean result.")
                        .font(.system(size: 15))
                        .foregroundStyle(.white.opacity(0.9))
                }
                .padding(DS.Spacing.l)
            }
        }
        .shadow(color: DS.Color.magenta.opacity(0.35), radius: 24, y: 12)
    }
}

struct FeatureCard: View {
    let kind: CalculatorKind
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            GlassCard {
                VStack(alignment: .leading, spacing: 10) {
                    Image(systemName: kind.systemImage)
                        .font(.title2.weight(.bold))
                        .foregroundStyle(kind.group.accent.color)
                    Text(kind.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                    Text(kind.summary)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.leading)
                }
                .frame(maxWidth: .infinity, minHeight: 130, alignment: .topLeading)
            }
        }
        .buttonStyle(.plain)
    }
}
