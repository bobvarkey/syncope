import { createContext, useContext, useState, ReactNode } from "react";

interface SectionProgress {
  [sectionId: string]: {
    completed: number;
    total: number;
  };
}

interface AssessmentProgressContextType {
  sectionProgress: SectionProgress;
  updateSectionProgress: (sectionId: string, completed: number, total: number) => void;
  getCompletionPercentage: (sectionId: string) => number;
}

const AssessmentProgressContext = createContext<AssessmentProgressContextType | undefined>(undefined);

export function AssessmentProgressProvider({ children }: { children: ReactNode }) {
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>({});

  const updateSectionProgress = (sectionId: string, completed: number, total: number) => {
    setSectionProgress((prev) => ({
      ...prev,
      [sectionId]: { completed, total },
    }));
  };

  const getCompletionPercentage = (sectionId: string): number => {
    const progress = sectionProgress[sectionId];
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  return (
    <AssessmentProgressContext.Provider
      value={{ sectionProgress, updateSectionProgress, getCompletionPercentage }}
    >
      {children}
    </AssessmentProgressContext.Provider>
  );
}

export function useAssessmentProgress() {
  const context = useContext(AssessmentProgressContext);
  if (!context) {
    throw new Error("useAssessmentProgress must be used within AssessmentProgressProvider");
  }
  return context;
}
