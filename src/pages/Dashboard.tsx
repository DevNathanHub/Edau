
import { useState, Suspense, lazy, useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { Loader, User, Package, CreditCard, MessageSquare, ShoppingBag, Calendar, MapPin, Star, TrendingUp, Bell, Settings, Heart, Truck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DashboardSidebar from "../components/DashboardSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    reviewsGiven: 0,
    ordersChange: 0,
    spentChange: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoadingStats(true);
    try {
      // Fetch orders
      const ordersResult = await apiService.getOrders(user._id);
      const orders = ordersResult.data || [];
      
      // Fetch user feedback/reviews
      const feedbackResult = await apiService.getUserFeedback(user._id);
      const feedback = feedbackResult.data || [];
      
      // Calculate stats
      const ordersArray = Array.isArray(orders) ? orders : [];
      const totalOrders = ordersArray.length;
      const totalSpent = ordersArray.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      const pendingOrders = ordersArray.filter((order: any) => order.status === 'pending' || order.status === 'processing').length;
      const reviewsGiven = Array.isArray(feedback) ? feedback.length : 0;
      
      // Calculate changes (mock data for now - in real app, compare with previous month)
      const ordersChange = 2; // +2 from last month
      const spentChange = 15; // +15% from last month
      
      setDashboardStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        reviewsGiven,
        ordersChange,
        spentChange
      });
      
      // Generate recent activity from orders and feedback
      const activities = generateRecentActivity(ordersArray, Array.isArray(feedback) ? feedback : []);
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const generateRecentActivity = (orders: any[], feedback: any[]) => {
    const activities = [];
    
    // Add recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
    
    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        title: order.status === "delivered" ? "Order Delivered" : "Order Placed",
        description: `Order #${order.id.slice(0, 8)} - ${order.status}`,
        time: formatTimeAgo(order.created_at),
        icon: order.status === "delivered" ? Truck : Package,
        color: order.status === "delivered" ? "text-green-600" : "text-blue-600"
      });
    });
    
    // Add recent feedback
    const recentFeedback = feedback
      .sort((a, b) => new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime())
      .slice(0, 2);
    
    recentFeedback.forEach(review => {
      activities.push({
        id: `review-${review.id}`,
        type: "review",
        title: "Review Submitted",
        description: `You gave ${review.rating || 5} stars - "${review.feedback_text?.slice(0, 50)}..."`,
        time: formatTimeAgo(review.created_at || review.timestamp),
        icon: Star,
        color: "text-yellow-600"
      });
    });
    
    // Sort by time and take top 5
    return activities
      .sort((a, b) => {
        // Simple sort - in real app, parse actual dates
        const timeOrder = { 'hours': 1, 'days': 2, 'weeks': 3 };
        const aUnit = a.time.split(' ')[1];
        const bUnit = b.time.split(' ')[1];
        return timeOrder[aUnit as keyof typeof timeOrder] - timeOrder[bUnit as keyof typeof timeOrder];
      })
      .slice(0, 5);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Quick actions for dashboard
  const quickActions = [
    {
      icon: ShoppingBag,
      title: "Shop Now",
      description: "Browse our fresh products",
      action: () => navigate('/products'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: Calendar,
      title: "Book Visit",
      description: "Schedule a farm tour",
      action: () => navigate('/farm-visit'),
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      icon: MessageSquare,
      title: "Ask AI",
      description: "Get farming advice",
      action: () => navigate('/ai'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Package,
      title: "Track Orders",
      description: "View order status",
      action: () => navigate('/dashboard/orders'),
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  // Dashboard overview component
  const DashboardOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section with User Avatar */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'User')}&background=10b981&color=fff&size=80`;
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.first_name || 'Farmer'}! 🌱
              </h1>
              <p className="text-green-100 text-lg">
                Ready to discover fresh, sustainable products from West Pokot?
              </p>
              <div className="flex items-center mt-3 space-x-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  West Pokot, Kenya
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since 2024
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Button
              onClick={() => navigate('/products')}
              className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl shadow-lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Fresh Products
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {isLoadingStats ? '...' : dashboardStats.totalOrders}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +{dashboardStats.ordersChange} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {isLoadingStats ? '...' : `KSh ${dashboardStats.totalSpent.toLocaleString()}`}
            </div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +{dashboardStats.spentChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pending Orders</CardTitle>
            <Truck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {isLoadingStats ? '...' : dashboardStats.pendingOrders}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {dashboardStats.pendingOrders > 0 ? 'Expected delivery: Tomorrow' : 'No pending orders'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Reviews Given</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {isLoadingStats ? '...' : dashboardStats.reviewsGiven}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              <Heart className="w-3 h-3 inline mr-1" />
              {dashboardStats.reviewsGiven > 5 ? 'Community favorite' : 'Keep reviewing!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md"
              onClick={action.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {isLoadingStats ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">Your recent orders and reviews will appear here.</p>
              </div>
            )}
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="Account Dashboard"
      sidebar={<DashboardSidebar />}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardOverview />
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
    </DashboardLayout>
  );
};

export default Dashboard;
