import { useEffect } from "react";
import { useAssessmentProgress } from "@/contexts/AssessmentProgressContext";

/**
 * Hook to track and report section completion progress
 * @param sectionId - Unique identifier for the section
 * @param data - The form data object for the section
 * @param fields - Array of field names to track (optional - if not provided, all data keys are tracked)
 */
export function useSectionProgress(sectionId: string, data: any, fields?: string[]) {
  const { updateSectionProgress } = useAssessmentProgress();

  useEffect(() => {
    if (!data) return;

    const fieldsToTrack = fields || Object.keys(data);
    const totalFields = fieldsToTrack.length;
    
    const completedFields = fieldsToTrack.filter((field) => {
      const value = data[field];
      
      // Check if field has meaningful content
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "boolean" && value === false) return false;
      
      return true;
    }).length;

    updateSectionProgress(sectionId, completedFields, totalFields);
  }, [data, sectionId, fields, updateSectionProgress]);
}
