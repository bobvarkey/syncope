# MedCalc — SwiftUI Starter (iOS 17+, Swift 6)

Production-ready starter for a warm, premium medical calculator app.
This folder is **native Swift** — it does not run inside the Lovable web preview.

## Open in Xcode
1. Open Xcode 16+ → **File → New → Project → iOS App**
   - Product Name: `MedCalc`
   - Interface: SwiftUI · Language: Swift · Storage: SwiftData
   - Minimum Deployment: **iOS 17.0**
2. In Finder, drag every folder from this `MedCalc/` directory into the new Xcode project (create groups, copy items if needed).
3. Delete the auto-generated `ContentView.swift` and default `@main` App file — the ones here replace them.
4. Under Signing & Capabilities, pick your team. No entitlements are required for the base build.
5. **Product → Test** to run `CalculatorServiceTests`.
6. **Product → Run** on a simulator (iPhone 15 or newer).

## Architecture
- **Clean Architecture + MVVM**, Swift 6 concurrency, `@Observable`.
- `DIContainer` injects services via `.environment`.
- `SwiftData` for offline history (`CalculationRecord`).
- No Firebase, RevenueCat, Razorpay, or in-app purchases — the app is fully free.

## Design system — Sunset Blaze
Coral `#FF6B59` → Amber `#FFB83D` → Magenta `#EE3D99` → Violet `#8C4CE5`.
Reusable primitives live in `UI/DesignSystem/DesignSystem.swift`:
`GlassCard`, `SunsetButtonStyle`, `StickyGlassHeader`, `DisclaimerBanner`,
`HighlightedText`, `UniformMedia`.

## Sidebar
- Collapsible groups with colorful SF Symbol icons per section.
- Collapsed by default; state persisted in `UserDefaults`
  (key `medcalc.sidebar.openGroups.v1`).
- Search box highlights matches inline via `HighlightedText`.
- While the sidebar is open **or** a search query is active, the rest of the
  UI is blurred with `.ultraThinMaterial`.

## Safety
Every result screen and onboarding screen shows `DisclaimerBanner`:
> This app is for informational and educational purposes only and does not
> provide medical diagnosis, treatment, or emergency advice.

## Compliance artifacts (this folder)
- `Resources/PrivacyInfo.xcprivacy` — required-reason API declarations (UserDefaults only).
- `Resources/en.lproj/Localizable.strings`, `Resources/ar.lproj/Localizable.strings` — base + RTL locale.
- `Resources/InfoPlist.strings` — localizable Info.plist keys.
- `Resources/SupportInfo.md` — Support / Privacy Policy URL placeholders and Privacy Nutrition Label answers.
- `AppReviewNotes.md` — paste into App Store Connect → App Review Information.
- `ReleaseChecklist.md` — pre-archive / post-submission checklist.

## Xcode target setup for compliance files
1. Drag `Resources/` into the Xcode project (**Copy items if needed**, target = `MedCalc`).
2. Confirm `PrivacyInfo.xcprivacy` appears under **Build Phases → Copy Bundle Resources**.
3. Project → Info → **Localizations** → add every locale that has an `*.lproj` folder.
4. Info.plist → `ITSAppUsesNonExemptEncryption = NO` (uses only Apple TLS).
5. Info.plist → `CFBundleDisplayName = MedCalc`.

## What is intentionally **not** here
- No RevenueCat, no Razorpay, no StoreKit, no IAP, no paywall.
- No visible sign-in flow. (Optional Firebase Anonymous Auth can be added later
  behind a hidden Settings toggle; if you do, update the privacy manifest,
  `SupportInfo.md`, and App Store Connect privacy answers together.)
- No analytics or third-party SDKs.

## Risks / open items
- Placeholder URLs in `SupportInfo.md` must be replaced before submission.
- Arabic strings are machine-quality placeholders — review with a native medical translator.
- AppIcon set is not included; ship a real 1024×1024 icon (no alpha).

