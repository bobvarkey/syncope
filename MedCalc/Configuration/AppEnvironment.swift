import Foundation

enum AppEnvironment {
    case debug, release

    static var current: AppEnvironment {
        #if DEBUG
        return .debug
        #else
        return .release
        #endif
    }
}
