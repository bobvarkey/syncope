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
    const targetId = "ecg-scoring-checklist";

    // Ensure the parent accordion group opens (Index listens on hashchange)
    if (window.location.hash === `#${targetId}`) {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = targetId;
    }

    // The section may still be mounting/expanding — retry until it's on screen
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el && el.getBoundingClientRect().height > 0) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts++ < 25) setTimeout(tryScroll, 80);
    };
    tryScroll();
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