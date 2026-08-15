# Plan: ECG Measurement Input and Auto-Highlighting

Add a new input form for ECG measurements (QTc, PR, QRS, lead abnormalities) to the `EcgScoringChecklist` component. This form will automatically trigger relevant findings in the checklist based on quantitative clinical thresholds.

## Proposed Changes

### Logic & Data
1.  **Update `src/lib/ecgChecklistData.ts`**:
    *   Add a `EcgMeasurements` interface (PR, QRS, QTc).
    *   Add a function `analyzeMeasurements` that returns a list of checklist item IDs to auto-select based on measurement values:
        *   PR > 200ms -> `first_degree_av_block`
        *   QRS > 120ms (and specific logic for bifascicular) -> `bifascicular_block` or `wpw_preexcitation` (if PR short)
        *   QTc >= 480ms -> `long_qtc`
        *   QTc <= 330ms -> `short_qtc`
    *   Export these thresholds as constants for UI reuse.

### UI Components
2.  **Modify `src/components/questionnaire/EcgScoringChecklist.tsx`**:
    *   Add state for measurements: `prInterval`, `qrsDuration`, `qtcInterval`.
    *   Add state for lead abnormalities (multi-select or checkboxes).
    *   Create a new section "Quantitative Measurements" at the top of the checklist.
    *   Use an `useEffect` to watch measurements and auto-toggle checklist items.
    *   Display visual indicators (e.g., "Auto-filled from measurements") next to checklist items that were triggered by the form.

### Refinement
3.  **Visual Integration**:
    *   Ensure the input form fits the "Sunset Blaze" aesthetic.
    *   Add validation/tooltips for normal vs. abnormal ranges.

## Technical Details
*   **PR Interval**: 120-200ms normal. >200ms = 1st degree block.
*   **QRS Duration**: <120ms normal. >=120ms = conduction delay/BBB.
*   **QTc**: 360-460ms (men) / 470ms (women) normal. >=480ms high risk. <=330ms short QT.
*   **Lead Abnormalities**: Checklist mappings for V1-V3 (Brugada, Wellens, RV strain).

## Verification Plan
1.  **Manual Test**: Enter PR = 250ms. Verify "First-degree AV block" is checked and score updates.
2.  **Manual Test**: Enter QTc = 510ms. Verify "Long QTc" is checked, score updates, and "Urgent Flag" appears.
3.  **Manual Test**: Toggle Brugada pattern manually vs through lead abnormality selection.
