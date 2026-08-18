import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import CheckoutDialog from "@/components/CheckoutDialog";
import ScrollToTop from "@/components/ScrollToTop";
import { RefreshCw } from "lucide-react";
import Index from "./pages/Index";
import AllCatalogPage from "./pages/AllCatalogPage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import SnacksPage from "./pages/SnacksPage";
import AboutPage from "./pages/AboutPage";
import WhereToBuyPage from "./pages/WhereToBuyPage";
import CooperationPage from "./pages/CooperationPage";
import ContactsPage from "./pages/ContactsPage";
import NotFound from "./pages/NotFound";

// The admin panel pulls in recharts and the data-table primitives — around a
// third of the bundle, for three routes a shopper never visits. Split out so
// the storefront does not pay for it.
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
  </div>
);

const admin = (element: React.ReactNode) => (
  <Suspense fallback={<AdminFallback />}>{element}</Suspense>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CheckoutDialog />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/snacks" element={<SnacksPage />} />
              <Route path="/catalog" element={<AllCatalogPage />} />
              <Route path="/catalog/:category" element={<CatalogPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/where-to-buy" element={<WhereToBuyPage />} />
              <Route path="/cooperation" element={<CooperationPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/admin" element={admin(<AdminLoginPage />)} />
              <Route path="/admin/orders" element={admin(<AdminOrdersPage />)} />
              <Route path="/admin/analytics" element={admin(<AdminAnalyticsPage />)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
