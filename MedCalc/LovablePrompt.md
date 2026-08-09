# MedCalc — Lovable Build Prompt (refined)

> Build a production-ready React + TypeScript medical calculator app for clinicians,
> residents, and medical students. This prompt is the single source of truth for the
> build. Follow it exactly, in the order given.

---

## 0. Distribution wrapper (IMPORTANT — read first)

This app ships to the App Store / Google Play via the **AppBuild.diy** wrapper
(Advanced No-Wrapper mode). The web project needs **only one** integration:

- Add this script tag to the `<head>` of the root HTML template:

```html
<script src="https://appbuild.diy/snippets/appbuild-wrapper-sdk.js" defer></script>
```

**Do NOT** add Capacitor, Cordova, Ionic, RevenueCat, HealthKit, or any other
native-plugin client code. AppBuild compiles native plugins into the wrapper itself.
The SDK snippet is the only web-side integration required. It no-ops in normal browsers.

The app is **fully offline** and **manual-entry only**. No sensors, no HealthKit, no
device imports, no native permissions required.

---

## 1. Product summary

Goals:
- First meaningful result in under 30 seconds.
- Progressive disclosure: show only essential fields first; reveal advanced options later.
- Demo-first: users can try core calculators before any sign-up.
- One screen = one idea + one primary CTA.
- Optional/skippable fields wherever possible.
- Manual entry only. No sensors, no HealthKit, no device imports.
- Local-only processing for calculations and lab parsing.
- History persists locally.
- No diagnosis, triage, or treatment-direction language.
- Every result screen must show a prominent disclaimer.

Non-goals for v1:
- No backend.
- No payments.
- No analytics SDKs.
- No cloud sync.
- No live content updates.
- No network dependency for core app behavior.

---

## 2. Target stack

- React 18+
- TypeScript (strict)
- Vite
- Feature-first folder structure
- Local persistence via IndexedDB or localStorage
- React Router
- Pure TypeScript calculator services
- Unit tests, golden vector tests, snapshot tests, contrast checks

---

## 3. Primary screens

1. Home
2. Calculator Library
3. History
4. Settings
5. Lab Import

Global UI:
- Responsive drawer/sidebar
- Collapsible sections
- Global search in drawer/sidebar
- Sticky header
- Clear route back to Home from every screen
- Scroll-to-top affordance on long screens

---

## 4. UX principles

- Progressive disclosure.
- Time-to-value focus.
- Permission pre-sell before any optional request.
- One screen, one idea, one CTA.
- Optional fields first; advanced fields collapsed by default.
- Benefit-focused microcopy.
- Inline validation with immediate, terse feedback.
- Warm, conversational, professional tone.
- Empty states must never be blank.
- Results should appear instantly with a brief fade/scale-in only.

---

## 5. Safety / content rules

- All calculator outputs are informational and educational only.
- Interpretation text must be descriptive, never directive.
- No diagnosis, triage, treatment advice, or emergency advice.
- Add a prominent disclaimer on every results screen:

> "This app is for informational and educational purposes only and does not provide
> medical diagnosis, treatment, or emergency advice. Always consult a doctor before
> making medical decisions."

- Include source and licensing status for every calculator.
- Exclude any calculator with unclear or restrictive licensing.

---

## 6. Design system

Create reusable tokens in a dedicated design system layer:
- **Sunset Blaze palette**: coral → amber → magenta → violet.
- Glassmorphism surfaces with strong readability.
- Clear typography scale.
- Consistent spacing and radius system.
- Accessible contrast in light and dark modes.
- Motion only when it supports clarity.

Core reusable components:
- `GlassCard`
- `GradientCTAButton`
- `SectionHeader`
- `EmptyStateView`
- `InlineValidationMessage`
- `ResultPill`
- `DrawerSearchField`
- `HighlightedText`

---

## 7. Folder structure

```
src/
  app/
  components/
  features/
    onboarding/
    home/
    calculators/
    history/
    settings/
    lab-import/
  services/
  hooks/
  store/
  utils/
  styles/
  types/
  tests/
```

Rules:
- Features own their UI and logic.
- Shared UI lives in `components`.
- Shared logic lives in `services` or `utils`.
- Keep feature code isolated.
- Avoid duplicate helpers and duplicate components.

---

## 8. Core services

Create typed service interfaces first:
- `CalculatorService`
- `HistoryStore`
- `LabParsingService`
- `SettingsStore`
- `SearchIndexingService`

Implementation rules:
- Calculator logic must be pure and deterministic.
- Lab parsing must be local-only.
- History persistence must be local-first.
- Use mock implementations for tests and development.
- Keep errors typed and user-friendly.

---

## 9. Launch scope

Build exactly these launch capabilities:
1. Home screen with hero and one CTA.
2. Calculator library with a small initial set.
3. One end-to-end calculator flow.
4. History with local persistence and search.
5. Lab Import with paste-to-parse.
6. Settings with legal and accessibility options.
7. Short onboarding flow.
8. Global search in drawer/sidebar.

---

## 10. Prompting strategy

- Build in small increments only.
- Do not combine unrelated features in one pass.
- Keep prompts component-first, not page-first.
- When a screen can be simpler, simplify it.
- When a branch or helper is unused, remove it.
- Prefer reuse over new one-off code.

---

## 11. Build sequence

**Phase 1:** App shell and routing. Design system. Home screen.
**Phase 2:** Calculator framework. One calculator end to end. Validation and result rendering.
**Phase 3:** History. Lab Import.
**Phase 4:** Settings and legal screens. Onboarding. Global search.
**Phase 5:** Tests. Cleanup pass.

---

## 12. Calculator requirements

Each calculator must include:
- Name.
- Category.
- Manual input fields.
- Unit labels.
- Inline validation.
- Published source.
- Licensing status.
- Formula reference.
- Computed result.
- Descriptive interpretation.
- Save to history.

Golden tests are mandatory for every formula. Every calculator must ship with worked
test vectors.

---

## 13. Lab import requirements

Build a paste-to-parse panel:
- Input raw lab text.
- Parse Hb, WBC, platelets, creatinine, Na, K, Ca, INR, glucose.
- Highlight extracted values and units before autofill.
- Never silently overwrite manual input.
- Provide a clear success state and a graceful failure state.
- Keep all parsing on-device only.

---

## 14. Settings / legal

Add screens for:
- Privacy Policy
- Terms of Use
- Disclaimer
- Support / Contact
- App version
- Theme and accessibility options
- Delete all data

Legal screens must be versioned with an effective date and editable without changing
app logic.

---

## 15. Testing

Add:
- Golden formula tests for every calculator.
- Unit tests for validation and parser behavior.
- Snapshot tests for key screens.
- Contrast checks for light and dark modes.
- Tests for local persistence behavior.

---

## 16. Cleanup rules

After the first working build:
- Remove unused components.
- Delete stale branches.
- Remove duplicate helpers.
- Remove dead feature-flag paths.
- Collapse oversized forms.
- Hide uncommon options behind Advanced.
- Keep only code that supports the main user flow.

---

## 17. Definition of done

The app is ready for the next phase when:
- Home works.
- One calculator works end to end.
- History saves locally.
- Lab import works on pasted text.
- Settings and disclaimer screens exist.
- Tests pass.
- Contrast is acceptable.
- No unused code is obviously accumulating.
- The UI feels fast, clear, and calm.
