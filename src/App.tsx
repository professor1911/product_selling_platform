
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Manufacturer from "./pages/Manufacturer";
import Auth from "./pages/Auth";
import ManufacturerPortal from "./pages/ManufacturerPortal";
import AdminAuth from "./pages/AdminAuth";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/manufacturer/:id" element={<Manufacturer />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/manufacturer-portal" element={<ManufacturerPortal />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
