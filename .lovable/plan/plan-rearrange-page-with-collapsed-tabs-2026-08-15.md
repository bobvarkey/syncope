# Plan - Rearrange Page with Collapsed Tabs

Rearrange the `Index` page layout so that most assessment sections are collapsed by default and only visible when clicked. This will declutter the clinical interface while maintaining easy access via the sidebar and direct clicks.

## Proposed Changes

### Core UI Component
- Implement a reusable `CollapsibleSection` component using Radix UI `Accordion` or `Collapsible` primitives to ensure consistent styling and animation.

### Index Page Refactoring (`src/pages/Index.tsx`)
- Group individual sections into logical, collapsible containers:
    - **Clinical History** (Circumstances, Onset, Attack, End, Background, Clinical Features)
    - **Investigations** (High-Risk ECG Checklist, ABCDE Screen, Medications, Lab Tests, Initial Evaluation, Tilt Test, Risk Score, Subclavian Steal, Carotid Massage, Orthostatic Intolerance, Autonomic Testing)
    - **Differential Diagnosis** (Differential Diagnosis, Diagnostic Criteria, AI Assistant)
    - **Interventions** (Interventions & Management)
    - **Drop Attacks** (Drop Attacks Workup)
- Keep "Patient Info" and "Assessment Dashboard" visible or minimally styled.
- Keep the "Syncope Mini App" and "HUTT Mini App" at the top as they are primary triage tools.

### Component Updates
- Update the `AssessmentSidebar` to ensure clicking a section automatically expands its parent collapsible group on the main page.

## Technical Details
- Use `lucide-react` icons for section headers.
- Maintain existing `formData` and `onUpdate` props for all sections.
- Preserve the "Sunset Blaze" palette in the headers of collapsible sections.
- Ensure the "Summary Report" remains accessible at the bottom.
