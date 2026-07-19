import XCTest
@testable import MedCalc

final class CalculatorServiceTests: XCTestCase {
    let svc = CalculatorService()

    func testBMI() throws {
        let r = try svc.compute(kind: .bmi, inputs: ["weightKg": 70, "heightCm": 175])
        XCTAssertEqual(r.value, 22.9, accuracy: 0.1)
    }

    func testMAP() throws {
        let r = try svc.compute(kind: .map, inputs: ["sbp": 120, "dbp": 80])
        XCTAssertEqual(r.value, 93, accuracy: 1)
    }

    func testQTcBazett() throws {
        let r = try svc.compute(kind: .qtc, inputs: ["qtMs": 400, "rrSec": 0.8])
        XCTAssertEqual(r.value, 447, accuracy: 2)
    }

    func testMissingInputThrows() {
        XCTAssertThrowsError(try svc.compute(kind: .bmi, inputs: ["weightKg": 70]))
    }
}
