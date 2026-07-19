import Foundation

protocol CalculatorServicing {
    func compute(kind: CalculatorKind, inputs: [String: Double]) throws -> CalculationResult
}

protocol HistoryServicing {
    func recent(limit: Int) async -> [CalculationRecord]
    func search(_ query: String) async -> [CalculationRecord]
}
