
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { LoadingProgress } from "@/components/ui/loading-progress";
import MobileNavigation from "./components/MobileNavigation";
import ChatAssistant from "./components/ChatAssistant";
import SocialFAB from "./components/SocialFAB";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Loader } from "lucide-react";

// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Receipt = lazy(() => import("./pages/Receipt"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Admin = lazy(() => import("./pages/Admin"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FarmVisit = lazy(() => import("./pages/FarmVisit"));

const App = () => {
  // Create a client inside the component to avoid issues with hot module reloading
  const queryClient = new QueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LoadingProgress />
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-12 w-12 text-green-600 animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/receipt/:id" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
                <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/farm-visit" element={<FarmVisit />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <MobileNavigation />
            <ChatAssistant />
            <SocialFAB />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
