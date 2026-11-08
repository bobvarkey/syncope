import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Consistent page navigation: one button returns to the previous page via
 * browser history, the other always returns to the app home route.
 */
export function PageNav({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Page navigation"
      className={cn("mb-6 flex flex-wrap items-center gap-2 print:hidden", className)}
    >
      <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </Button>
    </nav>
  );
}

export default PageNav;
