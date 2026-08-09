import Foundation
import SwiftData

@Model
final class CalculationRecord {
    @Attribute(.unique) var id: UUID
    var kindRaw: String
    var inputsJSON: String
    var resultValue: Double
    var resultUnit: String
    var interpretation: String
    var createdAt: Date

    init(id: UUID = UUID(),
         kind: CalculatorKind,
         inputs: [String: Double],
         result: CalculationResult,
         createdAt: Date = .now) {
        self.id = id
        self.kindRaw = kind.rawValue
        let data = (try? JSONEncoder().encode(inputs)) ?? Data()
        self.inputsJSON = String(data: data, encoding: .utf8) ?? "{}"
        self.resultValue = result.value
        self.resultUnit = result.unit
        self.interpretation = result.interpretation
        self.createdAt = createdAt
    }

    var kind: CalculatorKind { CalculatorKind(rawValue: kindRaw) ?? .qtc }
    var inputs: [String: Double] {
        guard let data = inputsJSON.data(using: .utf8) else { return [:] }
        return (try? JSONDecoder().decode([String: Double].self, from: data)) ?? [:]
    }
}

struct CalculationResult: Equatable, Hashable {
    var value: Double
    var unit: String
    var interpretation: String
}
