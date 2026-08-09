import XCTest
@testable import MedCalc

final class CalculatorServiceTests: XCTestCase {
    let svc = CalculatorService()

    func testQTcBazett() throws {
        let r = try svc.compute(kind: .qtc, inputs: ["qtMs": 400, "rrSec": 0.8])
        XCTAssertEqual(r.value, 447, accuracy: 2)
        XCTAssertEqual(r.unit, "ms (Bazett)")
    }

    func testQTcMissingInputThrows() {
        XCTAssertThrowsError(try svc.compute(kind: .qtc, inputs: ["qtMs": 400]))
    }

    func testQTcZeroRRThrows() {
        XCTAssertThrowsError(try svc.compute(kind: .qtc, inputs: ["qtMs": 400, "rrSec": 0]))
    }

    func testSyncopeRiskLow() throws {
        let r = try svc.compute(kind: .syncopeRisk, inputs: ["age": 40])
        XCTAssertEqual(r.value, 0, accuracy: 0)
        XCTAssertTrue(r.interpretation.contains("OESIL"))
    }

    func testSyncopeRiskHigh() throws {
        let r = try svc.compute(kind: .syncopeRisk, inputs: [
            "age": 70, "noCvHistory": 1, "noProdrome": 1, "abnormalEcg": 1
        ])
        XCTAssertEqual(r.value, 4, accuracy: 0)
    }

    func testHuttNegative() throws {
        let r = try svc.compute(kind: .hutt, inputs: ["responseType": 0])
        XCTAssertEqual(r.unit, "Negative")
    }

    func testHuttVasovagalReproduced() throws {
        let r = try svc.compute(kind: .hutt, inputs: ["responseType": 1, "symptomsReproduced": 1])
        XCTAssertEqual(r.unit, "Vasovagal (mixed)")
        XCTAssertTrue(r.interpretation.contains("reproduced"))
    }
}
