import SwiftUI

/// Sunset Blaze design system: coral → amber → magenta → violet.
enum DS {
    enum Color {
        static let coral   = SwiftUI.Color(red: 1.00, green: 0.42, blue: 0.35)
        static let amber   = SwiftUI.Color(red: 1.00, green: 0.72, blue: 0.24)
        static let magenta = SwiftUI.Color(red: 0.93, green: 0.24, blue: 0.60)
        static let violet  = SwiftUI.Color(red: 0.55, green: 0.30, blue: 0.90)

        static let surface = SwiftUI.Color(.secondarySystemBackground)
        static let card    = SwiftUI.Color(.tertiarySystemBackground)
    }

    static let sunset = LinearGradient(
        colors: [Color.coral, Color.amber, Color.magenta, Color.violet],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    enum Spacing {
        static let xs: CGFloat = 6
        static let s: CGFloat = 10
        static let m: CGFloat = 16
        static let l: CGFloat = 24
        static let xl: CGFloat = 36
    }

    enum Radius {
        static let card: CGFloat = 20
        static let pill: CGFloat = 999
    }
}

enum SunsetAccent {
    case coral, amber, magenta, violet
    var color: Color {
        switch self {
        case .coral: DS.Color.coral
        case .amber: DS.Color.amber
        case .magenta: DS.Color.magenta
        case .violet: DS.Color.violet
        }
    }
}

// MARK: - Reusable Components

struct GlassCard<Content: View>: View {
    var content: () -> Content
    var body: some View {
        content()
            .padding(DS.Spacing.m)
            .background(
                RoundedRectangle(cornerRadius: DS.Radius.card, style: .continuous)
                    .fill(.ultraThinMaterial)
            )
            .overlay(
                RoundedRectangle(cornerRadius: DS.Radius.card, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
            )
    }
}

struct SunsetButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 17, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.vertical, 14)
            .padding(.horizontal, 22)
            .frame(maxWidth: .infinity)
            .background(DS.sunset, in: RoundedRectangle(cornerRadius: DS.Radius.pill, style: .continuous))
            .shadow(color: DS.Color.magenta.opacity(0.35), radius: 18, y: 8)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

struct StickyGlassHeader<Trailing: View>: View {
    var title: String
    var onMenu: () -> Void
    @ViewBuilder var trailing: () -> Trailing

    var body: some View {
        HStack(spacing: DS.Spacing.m) {
            Button(action: onMenu) {
                Image(systemName: "line.3.horizontal")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.primary)
                    .padding(10)
                    .background(.ultraThinMaterial, in: Circle())
            }
            .accessibilityLabel("Open menu")

            Text(title)
                .font(.system(size: 19, weight: .bold))
                .foregroundStyle(DS.sunset)

            Spacer()
            trailing()
        }
        .padding(.horizontal, DS.Spacing.m)
        .padding(.vertical, DS.Spacing.s)
        .background(.ultraThinMaterial)
        .overlay(Rectangle().frame(height: 3).foregroundStyle(DS.sunset), alignment: .top)
    }
}

struct DisclaimerBanner: View {
    var body: some View {
        Text(Constants.disclaimer)
            .font(.footnote)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.leading)
            .padding(DS.Spacing.s)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color.yellow.opacity(0.12))
            )
            .accessibilityLabel("Medical disclaimer: \(Constants.disclaimer)")
    }
}

struct HighlightedText: View {
    let text: String
    let query: String

    var body: some View {
        let attributed = highlight(text: text, query: query)
        Text(attributed)
    }

    private func highlight(text: String, query: String) -> AttributedString {
        var attr = AttributedString(text)
        let q = query.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty else { return attr }
        let lower = text.lowercased()
        var searchStart = lower.startIndex
        while let range = lower.range(of: q.lowercased(), range: searchStart..<lower.endIndex) {
            if let ar = Range(range, in: attr) {
                attr[ar].backgroundColor = DS.Color.amber.opacity(0.45)
                attr[ar].inlinePresentationIntent = .stronglyEmphasized
            }
            searchStart = range.upperBound
        }
        return attr
    }
}

// Uniform sized media wrapper.
struct UniformMedia<Content: View>: View {
    var aspect: CGFloat = 16.0/9.0
    @ViewBuilder var content: () -> Content
    var body: some View {
        content()
            .frame(maxWidth: .infinity)
            .aspectRatio(aspect, contentMode: .fill)
            .clipShape(RoundedRectangle(cornerRadius: DS.Radius.card, style: .continuous))
    }
}
