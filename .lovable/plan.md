## Three additions: front-page search, richer Ivabradine detail, Class 0 dosing

### 1. Front-page search bar to filter/jump to mini-apps and tabs
**File:** `src/pages/Index.tsx` (new small component `SectionQuickSearch` inline or in `src/components/`).

- Sticky search input placed just below the glass header, above the hero (or under the hero on mobile so it doesn't push the image down). Icon + `Cmd/Ctrl+K` shortcut hint.
- Data source: reuse the same `sections` list already defined in `AssessmentSidebar.tsx`. To avoid duplication, extract it into a new `src/components/assessmentSections.ts` module (id, title, subsections, group, icon, gradient) and import from both the sidebar and the new search.
- Behaviour:
  - Live-filters as the user types (matches section title, subsections, and mini-app tags: "HUTT", "ABCDE", "Syncope triage", "Anti-arrhythmics", "Class 0", "Ivabradine", etc.).
  - Results appear in a dropdown panel with a blurred backdrop (matches the existing sidebar search styling).
  - Each result shows the section's colored icon, title, and matching subsection line with highlighted match text.
  - Selecting a result: closes the panel, calls `element.scrollIntoView({ behavior: "smooth", block: "start" })` on the matching `#section-id`, and briefly flashes a ring around the target (temporary `ring-2 ring-primary` for ~1.2s).
  - `Esc` closes; `↑/↓` navigate; `Enter` selects; `Cmd/Ctrl+K` focuses.
- Empty-state message when no matches, plus a "Clear" button.
- No routing changes — all sections already live on the same page.

### 2. Enrich Ivabradine in the drug detail drawer
**File:** `src/components/questionnaire/AntiArrhythmicsSection.tsx`.

The current `Drug` type carries `mechanism`, `ecgEffects`, `contraindications`, `dosing`. Extend the type (optional fields, backward-compatible) with:
```ts
cautions?: string[];
adverseEffects?: string[];
```
and render two new sections in the `Sheet` drawer, only when present:
- **Major cautions** (amber card, `AlertTriangle` icon)
- **Common adverse effects** (muted card, `Activity` icon)

Populate for Ivabradine:
- **Contraindications** (replaces current shorter list):
  - Resting HR < 70 bpm before treatment (per SmPC)
  - Sick sinus syndrome / SA block / 2° or 3° AV block without a functioning pacemaker
  - Atrial fibrillation or any non-sinus rhythm dependent on SA node
  - Acute decompensated heart failure, cardiogenic shock, unstable angina, acute MI
  - Severe hypotension (< 90/50 mmHg)
  - Severe hepatic impairment (Child-Pugh C)
  - Congenital long QT syndrome
  - Pregnancy, breastfeeding, women of child-bearing potential without contraception
  - Co-administration with strong CYP3A4 inhibitors (e.g. ketoconazole, itraconazole, clarithromycin, ritonavir, nefazodone)
  - Co-administration with non-DHP CCBs (verapamil, diltiazem)
- **Major cautions**:
  - Risk of atrial fibrillation — monitor rhythm; discontinue if AF develops
  - Bradycardia — hold/reduce dose if HR persistently < 50 bpm or symptomatic
  - Moderate CYP3A4 inhibitors/inducers (grapefruit juice, St John's wort) — avoid or halve dose
  - Retinal disease / retinitis pigmentosa
  - Chronic bradyarrhythmias, recent stroke, moderate hepatic impairment
  - QT-prolonging drug combinations
- **Common adverse effects**:
  - Luminous phenomena / phosphenes (transient bright spots) — up to ~15%
  - Symptomatic and asymptomatic bradycardia
  - New-onset atrial fibrillation
  - Headache, dizziness
  - Blurred vision
  - First-degree AV block / PR prolongation
  - Nausea, constipation, diarrhoea

### 3. Class 0 dosing block
Class 0 currently contains only Ivabradine. Update its `dosing` in the same file to make ranges and admin notes explicit (the `DoseCalculator` will pick these up automatically):

```ts
dosing: {
  route: "PO",
  fixed: { mgMin: 2.5, mgMax: 7.5, frequencyHrs: 12 },
  maxDailyMg: 15,
  notes:
    "Adults: start 5 mg BD with food. After 2 weeks assess resting HR — " +
    "titrate to 7.5 mg BD if HR > 60 bpm, keep at 5 mg BD if 50–60 bpm, " +
    "reduce to 2.5 mg BD or stop if HR < 50 bpm or symptomatic bradycardia. " +
    "Start 2.5 mg BD if ≥ 75 y, frail, or moderate hepatic impairment. " +
    "Take morning and evening with meals; do not combine with verapamil/diltiazem or strong CYP3A4 inhibitors; avoid grapefruit juice.",
},
```

Also add a short **Class 0 overview line** rendered when the Class 0 card is expanded (uses existing `notes` slot on the class):
> "Class 0 = HCN/If ('funny current') channel blockers. Only licensed member: Ivabradine. Investigational agents: zatebradine, cilobradine (not clinically available)."

No new files beyond `assessmentSections.ts`, no dependency changes, no backend work.
