import Foundation
import Observation

@Observable
final class DIContainer {
    let calculatorService: CalculatorServicing
    let historyService: HistoryServicing
    let hapticsService: HapticsServicing

    init(calculator: CalculatorServicing,
         history: HistoryServicing,
         haptics: HapticsServicing) {
        self.calculatorService = calculator
        self.historyService = history
        self.hapticsService = haptics
    }

    static func live() -> DIContainer {
        DIContainer(
            calculator: CalculatorService(),
            history: HistoryService(),
            haptics: HapticsService()
        )
    }

    static func preview() -> DIContainer {
        DIContainer(
            calculator: CalculatorService(),
            history: MockHistoryService(),
            haptics: HapticsService()
        )
    }
}
