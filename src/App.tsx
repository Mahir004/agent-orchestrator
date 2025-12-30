import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/agents/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
          <Route path="/agents/builder" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/agents/permissions" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersRoles /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
