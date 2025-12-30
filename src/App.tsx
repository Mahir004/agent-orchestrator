import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Workflows from "./pages/Workflows";
import Integrations from "./pages/Integrations";
import Governance from "./pages/Governance";
import Monitoring from "./pages/Monitoring";
import Audit from "./pages/Audit";
import UsersRoles from "./pages/UsersRoles";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/agents/builder" element={<Agents />} />
          <Route path="/agents/permissions" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/users" element={<UsersRoles />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
