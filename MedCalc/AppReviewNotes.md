# MedCalc — App Review Notes

Paste (trimmed) into App Store Connect → App Review Information → Notes.

## What the app does
MedCalc is an offline medical calculator reference for clinicians, residents, and
medical students. It performs manual, user-entered calculations (BMI, MAP, QTc,
Cockcroft–Gault CrCl, corrected calcium, anion gap) and stores results locally.

## Demo account
Not required. The app has **no sign-in flow**, no paywall, no subscription, no
in-app purchase, and no server calls. All features are reachable on first launch
after tapping through the one-screen onboarding.

## Medical safety posture
- A persistent disclaimer appears on every result screen: *"This app is for
  informational and educational purposes only and does not provide medical
  diagnosis, treatment, or emergency advice."*
- The app never claims diagnosis, treatment, triage, or emergency capability.
- No dosage calculators are shipped in this build. If added later, each will
  cite a recognized authoritative source (FDA label, hospital formulary, or
  peer-reviewed guideline) inside the calculator's detail view.
- App is rated 17+ (Frequent/Intense Medical/Treatment Information).

## Privacy posture
- No personal data collected. No analytics. No tracking. No third-party SDKs.
- History is stored only on-device via SwiftData; users can clear it from
  Settings. Uninstalling the app removes all data.
- `PrivacyInfo.xcprivacy` declares only `NSPrivacyAccessedAPICategoryUserDefaults`
  (reason `CA92.1`) for sidebar/theme persistence.

## Reviewer walkthrough
1. Launch → tap "Get started" on onboarding.
2. Home → tap any calculator card → enter values → "Calculate" → observe result,
   disclaimer, and optional interpretation disclosure.
3. History tab → previous calculation appears; use the search field to filter.
4. Settings → verify Privacy Policy and Support links open in Safari.
5. Sidebar (top-left menu) → tap group headers to collapse/expand; use the
   in-sidebar search to jump to a section (matches are highlighted, background
   blurs while search is active); state persists across relaunch.
