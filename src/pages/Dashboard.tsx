
import { useState, Suspense, lazy } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DashboardSidebar from "../components/DashboardSidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components
const ProfileInfo = lazy(() => import("../components/ProfileInfo"));
const OrderHistory = lazy(() => import("../components/OrderHistory"));
const UserFeedback = lazy(() => import("../components/UserFeedback"));

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const location = useLocation();
  
  // Determine current active tab based on route
  const isProfileTab = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isOrdersTab = location.pathname === '/dashboard/orders';
  const isPaymentsTab = location.pathname === '/dashboard/payments';
  const isFeedbackTab = location.pathname === '/dashboard/feedback';
  
  // Dashboard content
  const renderContent = () => (
    <div className="space-y-6">
      <Routes>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">My Profile</h2>
                <ProfileInfo />
              </div>
            </Suspense>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">My Orders</h2>
                <OrderHistory />
              </div>
            </Suspense>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium mb-6">Payment Methods</h2>
                <div className="text-center py-12 text-gray-500">
                  <p>Coming soon! Payment methods management will be available in a future update.</p>
                </div>
              </div>
            </Suspense>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <UserFeedback />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
  
  return (
    <DashboardLayout 
      title="Account Dashboard" 
      sidebar={<DashboardSidebar />}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
