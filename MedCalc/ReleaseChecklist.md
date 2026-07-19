# MedCalc — Release Checklist

## Before archiving
- [ ] Bump `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in the Xcode target.
- [ ] Replace placeholder URLs in `Resources/SupportInfo.md` and `SettingsView`.
- [ ] Replace the AppIcon set with the final 1024×1024 (no alpha, no rounded corners).
- [ ] Verify `PrivacyInfo.xcprivacy` is included in the app target's Copy Bundle Resources.
- [ ] Verify `Localizable.strings` is included for every shipped locale.
- [ ] `xcodebuild -scheme MedCalc -destination "generic/platform=iOS" clean archive` passes with **zero warnings**.
- [ ] `swiftlint` passes with zero violations (or documented disables).
- [ ] Run all unit + UI tests on latest iOS simulator; coverage ≥ 80 %.
- [ ] Manual smoke test on a physical iPhone (latest iOS) and one iPad.
- [ ] VoiceOver pass on Home, Calculator detail, and Sidebar.
- [ ] Dynamic Type XXL pass — no clipped labels.
- [ ] Dark mode pass — contrast verified on hero, cards, and result panels.
- [ ] Reduce Motion pass — no essential info conveyed by motion alone.

## App Store Connect
- [ ] Age rating: 17+ (Frequent/Intense Medical/Treatment Information).
- [ ] Primary category: Medical.
- [ ] Privacy nutrition label answers match `Resources/SupportInfo.md`.
- [ ] Privacy Policy URL live and reachable.
- [ ] Support URL live and reachable.
- [ ] App Review Notes: paste from `AppReviewNotes.md`.
- [ ] Screenshots: 6.9", 6.7", 6.5", and iPad 13" sets.
- [ ] Export compliance: uses only Apple-provided cryptography (`ITSAppUsesNonExemptEncryption` = NO).

## Post-submission
- [ ] Monitor Xcode Organizer for crashes and metrics for the first 72 h.
- [ ] Have a rollback plan (previous build kept in TestFlight).
