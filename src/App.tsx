import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RestaurantSetup from "./pages/RestaurantSetup";
import Dashboard from "./pages/Dashboard";
import PriceManagement from "./pages/PriceManagement";
import SupplierManagement from "./pages/SupplierManagement";
import InventoryManagement from "./pages/InventoryManagement";
import MenuManagement from "./pages/MenuManagement";
import WasteManagement from "./pages/WasteManagement";
import ChainManagement from "./pages/ChainManagement";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/restaurant-setup" element={<RestaurantSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/price-management" element={<PriceManagement />} />
          <Route path="/supplier-management" element={<SupplierManagement />} />
          <Route path="/chain-management" element={<ChainManagement />} />
          <Route path="/inventory-management" element={<InventoryManagement />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/waste-management" element={<WasteManagement />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
