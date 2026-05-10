import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import Facilities from "./pages/Facilities";
import Gallery from "./pages/Gallery";
import Notices from "./pages/Notices";
import Contact from "./pages/Contact";
import Faculty from "./pages/Faculty";
import Alumni from "./pages/Alumni";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import ConnectLogin from "./pages/ConnectLogin";
import ConnectDashboard from "./pages/ConnectDashboard";
import AdminConsole from "./pages/AdminConsole";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PORTAL_PREFIXES = ["/staff", "/connect", "/admin"];

function AppShell() {
  const loc = useLocation();
  const isPortal = PORTAL_PREFIXES.some((p) => loc.pathname.startsWith(p));

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/academics" element={<Academics />} />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/facilities" element={<Facilities />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/notices" element={<Notices />} />
      <Route path="/faculty" element={<Faculty />} />
      <Route path="/alumni" element={<Alumni />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff/reset-password" element={<ResetPassword />} />
      <Route path="/staff" element={<StaffDashboard />} />

      <Route path="/connect/login" element={<ConnectLogin />} />
      <Route path="/connect/reset-password" element={<ResetPassword />} />
      <Route path="/connect" element={<ConnectDashboard />} />

      <Route path="/admin" element={<AdminConsole />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return isPortal ? routes : <Layout>{routes}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
