
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ProductManagement from "@/components/admin/ProductManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import UserManagement from "@/components/admin/UserManagement";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import SalesAnalytics from "@/components/admin/SalesAnalytics";
import GalleryManagement from "@/components/admin/GalleryManagement";
import FarmVisitsManagement from "@/components/admin/FarmVisitsManagement";
import NewsletterManagement from "@/components/admin/NewsletterManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import CreateOrderForUser from "@/components/admin/CreateOrderForUser";
import { Helmet } from "react-helmet-async";

const Admin = () => {
  return (
    <AdminRoute>
      <Helmet>
        <title>Admin Dashboard - Edau Farm Management</title>
        <meta name="description" content="Edau Farm administrative dashboard for managing products, orders, users, and farm operations." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="create-order" element={<CreateOrderForUser />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="farm-visits" element={<FarmVisitsManagement />} />
              <Route path="newsletter" element={<NewsletterManagement />} />
              <Route path="feedback" element={<FeedbackManagement />} />
              <Route path="analytics" element={<SalesAnalytics />} />
              <Route path="gallery" element={<GalleryManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
};

export default Admin;
