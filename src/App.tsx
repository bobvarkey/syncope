import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Disclaimer from "./pages/Disclaimer";
import AccountDeletion from "./pages/AccountDeletion";
import { NavigationFab } from "./components/NavigationFab";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AssessmentProgressProvider } from "./contexts/AssessmentProgressContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AssessmentProgressProvider>
          <BrowserRouter>
            <NavigationFab />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/account-deletion" element={<AccountDeletion />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AssessmentProgressProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
