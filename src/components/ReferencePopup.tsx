import React from "react";
import { Info, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReferencePopupProps {
  title?: string;
  triggerLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const ReferencePopup = ({
  title = "References & source citations",
  triggerLabel = "View References",
  children,
  className,
}: ReferencePopupProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
          >
            <Info className="h-3.5 w-3.5" />
            {triggerLabel}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="start" 
          className="max-w-[400px] p-4 bg-popover border-border shadow-xl rounded-xl"
        >
          <div className="space-y-3">
            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              {title}
            </h4>
            <div className="text-xs space-y-2 leading-relaxed text-popover-foreground">
              {children}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
