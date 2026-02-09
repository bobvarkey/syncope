import { ReactElement } from "react";
import { useSectionProgress } from "@/hooks/useSectionProgress";

interface SectionWithProgressProps {
  sectionId: string;
  data: any;
  children: ReactElement;
  fields?: string[];
}

/**
 * Wrapper component that tracks progress for a section
 */
export function SectionWithProgress({ sectionId, data, children, fields }: SectionWithProgressProps) {
  useSectionProgress(sectionId, data, fields);
  return children;
}
