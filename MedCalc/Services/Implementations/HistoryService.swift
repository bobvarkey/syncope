import Foundation
import SwiftData

@MainActor
final class HistoryService: HistoryServicing {
    private var container: ModelContainer? {
        try? ModelContainer(for: CalculationRecord.self)
    }

    func recent(limit: Int) async -> [CalculationRecord] {
        guard let ctx = container?.mainContext else { return [] }
        var descriptor = FetchDescriptor<CalculationRecord>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        descriptor.fetchLimit = limit
        return (try? ctx.fetch(descriptor)) ?? []
    }

    func search(_ query: String) async -> [CalculationRecord] {
        let all = await recent(limit: 500)
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return all }
        let q = query.lowercased()
        return all.filter {
            $0.kind.title.lowercased().contains(q) ||
            $0.interpretation.lowercased().contains(q)
        }
    }
}
