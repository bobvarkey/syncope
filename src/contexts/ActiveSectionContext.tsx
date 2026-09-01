import { createContext, useContext, useState, ReactNode } from "react";

interface ActiveSectionContextType {
  /** id of the sidebar link currently focused; null = show the full page. */
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  clearActiveId: () => void;
}

const ActiveSectionContext = createContext<ActiveSectionContextType | undefined>(undefined);

export const ActiveSectionProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <ActiveSectionContext.Provider
      value={{ activeId, setActiveId, clearActiveId: () => setActiveId(null) }}
    >
      {children}
    </ActiveSectionContext.Provider>
  );
};

export const useActiveSection = () => {
  const ctx = useContext(ActiveSectionContext);
  if (!ctx) throw new Error("useActiveSection must be used within an ActiveSectionProvider");
  return ctx;
};
