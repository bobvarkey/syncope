import SwiftUI
import SwiftData

struct HistoryView: View {
    @Query(sort: \CalculationRecord.createdAt, order: .reverse) private var records: [CalculationRecord]
    @Environment(\.modelContext) private var context
    @State private var query: String = ""

    var body: some View {
        VStack(spacing: DS.Spacing.s) {
            HStack {
                Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
                TextField("Search history", text: $query)
                    .font(.system(size: 16))
                if !query.isEmpty {
                    Button { query = "" } label: {
                        Image(systemName: "xmark.circle.fill").foregroundStyle(.secondary)
                    }.buttonStyle(.plain)
                }
            }
            .padding(10)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            .padding(.horizontal, DS.Spacing.m)

            if filtered.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(filtered) { r in
                        VStack(alignment: .leading, spacing: 4) {
                            HighlightedText(text: r.kind.title, query: query)
                                .font(.system(size: 16, weight: .semibold))
                            HStack {
                                Text("\(r.resultValue.formatted(.number.precision(.fractionLength(0...2)))) \(r.resultUnit)")
                                    .foregroundStyle(DS.Color.magenta)
                                Spacer()
                                Text(r.createdAt, style: .relative)
                                    .font(.footnote).foregroundStyle(.secondary)
                            }
                            HighlightedText(text: r.interpretation, query: query)
                                .font(.footnote).foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { indexSet in
                        for i in indexSet { context.delete(filtered[i]) }
                    }
                }
                .listStyle(.plain)
            }
        }
    }

    private var filtered: [CalculationRecord] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return records }
        return records.filter {
            $0.kind.title.lowercased().contains(q) ||
            $0.interpretation.lowercased().contains(q)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles")
                .font(.system(size: 44)).foregroundStyle(DS.sunset)
            Text("No history yet").font(.headline)
            Text("Run a calculation and it'll show up here — private and offline.")
                .font(.footnote).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, DS.Spacing.l)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct HistoryDetailView: View {
    let id: UUID
    var body: some View {
        Text("Record \(id.uuidString.prefix(6))")
            .navigationTitle("Details")
    }
}
