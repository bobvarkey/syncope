import Foundation

enum AppError: LocalizedError {
    case invalidInput(String)
    case storageFailure(String)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidInput(let msg): "Please check your input: \(msg)"
        case .storageFailure(let msg): "We couldn't save that: \(msg)"
        case .unknown: "Something went wrong. Please try again."
        }
    }
}
