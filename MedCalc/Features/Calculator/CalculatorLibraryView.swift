import SwiftUI

struct CalculatorLibraryView: View {
    var onOpen: (CalculatorKind) -> Void
    @State private var query: String = ""

    var body: some View {
        VStack(spacing: DS.Spacing.m) {
            HStack {
                Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
                TextField("Search calculators", text: $query)
                    .font(.system(size: 16))
            }
            .padding(10)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            .padding(.horizontal, DS.Spacing.m)

            ScrollView {
                LazyVStack(alignment: .leading, spacing: DS.Spacing.l) {
                    ForEach(CalculatorGroup.allCases) { group in
                        let items = filtered(in: group)
                        if !items.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Label(group.title, systemImage: group.systemImage)
                                    .font(.system(size: 17, weight: .bold))
                                    .foregroundStyle(group.accent.color)
                                ForEach(items) { k in
                                    Button { onOpen(k) } label: {
                                        HStack {
                                            Image(systemName: k.systemImage)
                                                .foregroundStyle(group.accent.color)
                                                .frame(width: 28)
                                            VStack(alignment: .leading, spacing: 2) {
                                                HighlightedText(text: k.title, query: query)
                                                    .font(.system(size: 16, weight: .semibold))
                                                Text(k.summary).font(.footnote).foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Image(systemName: "chevron.right").foregroundStyle(.secondary)
                                        }
                                        .padding(12)
                                        .background(RoundedRectangle(cornerRadius: 14).fill(DS.Color.card))
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, DS.Spacing.m)
                .padding(.bottom, DS.Spacing.xl)
            }
        }
    }

    private func filtered(in group: CalculatorGroup) -> [CalculatorKind] {
        let base = CalculatorKind.allCases.filter { $0.group == group }
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return base }
        return base.filter { $0.title.lowercased().contains(q) || $0.summary.lowercased().contains(q) }
    }
}
