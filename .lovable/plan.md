# Plan - Implementation of Progress Bar and Completion Checklist

Add a real-time progress bar and a visual completion checklist to the assessment dashboard and the collapsed sections to track clinical evaluation progress.

## Proposed Changes

### Context Enhancement (`src/contexts/AssessmentProgressContext.tsx`)
- Ensure all relevant sections (Investigations, Management, Drop Attacks) are tracked in the progress state.
- Add logic to handle completion status for non-questionnaire sections (like AI Diagnosis or anti-arrhythmics if possible).

### Dashboard Upgrade (`src/components/AssessmentDashboard.tsx`)
- Redesign the `AssessmentDashboard` to include all section groups:
    - Clinical History
    - Clinical Investigations
    - Differential Diagnosis
    - Interventions
    - Drop Attacks
- Add a visual checklist (using `CheckCircle2` icons) for all subsections.
- Ensure the progress bar reflects the real weight of completed fields.

### Section Integration (`src/pages/Index.tsx`)
- Add a mini-progress indicator to the accordion triggers so users can see progress without expanding.
- Update the "Investigations" group in the dashboard to include missing sections like `syncope-medications`, `ecg-scoring`, etc.

### Technical Details
- Update `sectionGroups` mapping in `AssessmentDashboard.tsx` to match the new structure in `Index.tsx`.
- Use a "Sunset Blaze" themed progress bar.
- Ensure the checklist items are clickable to scroll to the respective section.
