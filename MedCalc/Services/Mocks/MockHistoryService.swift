import Foundation

final class MockHistoryService: HistoryServicing {
    func recent(limit: Int) async -> [CalculationRecord] { [] }
    func search(_ query: String) async -> [CalculationRecord] { [] }
}
