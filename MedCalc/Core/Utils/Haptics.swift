import UIKit

protocol HapticsServicing {
    func tap()
    func success()
    func warning()
}

final class HapticsService: HapticsServicing {
    func tap() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
    func warning() { UINotificationFeedbackGenerator().notificationOccurred(.warning) }
}
