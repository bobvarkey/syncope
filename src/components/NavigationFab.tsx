import React, { useState, useEffect } from "react";
import { ArrowUp, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NavigationFab = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    if (location.pathname === "/") {
      scrollToTop();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "pointer-events-auto rounded-full shadow-lg transition-all duration-300 bg-background/80 backdrop-blur-md border border-border/50 hover:bg-background",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        className={cn(
          "pointer-events-auto rounded-full shadow-glow transition-all duration-300 bg-gradient-sunset border-0 text-white",
          location.pathname !== "/" || showScrollTop ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
        onClick={goHome}
        aria-label="Back to home"
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};
