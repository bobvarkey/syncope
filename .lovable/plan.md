# Plan: Combine ECG Checklist and Syncope ECG High-Risk Checklist

Consolidate all ECG assessment tools into a single, comprehensive "ECG High-Risk Checklist & Findings" component to streamline the clinical workflow.

## User Review Required

> [!IMPORTANT]
> The original "ECG Findings" section had some overlap with the new "High-Risk Checklist". I will merge them so that selecting a finding in one place updates the overall clinical risk.

- **Consolidated Component**: The new tool will replace both the `ECGFindingsSection` and the existing `EcgScoringChecklist`.
- **Merged Functionality**:
    - Quantitative measurements (PR, QRS, QTc) from both sections.
    - QTc calculation logic.
    - Detailed WOBBLER/High-risk criteria and scoring.
    - Free-text interpretation and findings areas.
- **Navigation**: The sidebar will be updated to reflect this single, unified section.

## Technical Details

- **State Management**: Update `Index.tsx` to handle the combined form data structure.
- **Component Refactor**: `EcgScoringChecklist.tsx` will be expanded to include the "ECG Findings" fields (e.g., bifascicular block, sinus bradycardia, pacemaker malfunction) that weren't already represented, ensuring no clinical data is lost.
- **Cleanup**: Remove `ECGFindingsSection.tsx` after its fields are migrated to the checklist.
- **Data Persistence**: Map the `formData.ecgFindings` and `formData.ecgScoring` into a unified schema if possible, or maintain compatibility for existing reports.
- **Sidebar Update**: Remove the "ECG Findings" sub-item from the "Investigations" group in `AssessmentSidebar.tsx`.
