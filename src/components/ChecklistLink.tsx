import React from "react";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

interface ChecklistLinkProps {
  label?: string;
  className?: string;
  variant?: "link" | "outline" | "ghost" | "default";
}

const ChecklistLink = ({ 
  label = "View High-Risk ECG Checklist", 
  className = "", 
  variant = "link" 
}: ChecklistLinkProps) => {
  const scrollTo = () => {
    document.getElementById("ecg-scoring-checklist")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start" 
    });
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={scrollTo}
      className={`h-auto p-0 flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${className}`}
    >
      <Activity className="h-3 w-3 shrink-0" />
      {label}
    </Button>
  );
};

export default ChecklistLink;