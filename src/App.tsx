import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Login removido: a tela principal (Onboarding) agora realiza o login
import Onboarding from "./pages/Onboarding";
import OrderDetails from "./pages/OrderDetails";
import Painel from "./pages/Painel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* rota de login removida */}
          <Route path="/painel" element={<Painel />} />
          <Route path="/pedido/:id" element={<OrderDetails />} />
          <Route path="/" element={<Onboarding />} />
          <Route path="*" element={<Onboarding />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
