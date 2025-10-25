
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ImageIcon,
  MessageSquare,
  LogOut,
  Mail,
  Calendar,
  Settings,
  Menu,
  X,
  Tag,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useState } from "react";

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tag
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart
    },
    {
      name: "Create Order",
      path: "/admin/create-order",
      icon: Plus
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users
    },
    {
      name: "Farm Visits",
      path: "/admin/farm-visits",
      icon: Calendar
    },
    {
      name: "Newsletter",
      path: "/admin/newsletter",
      icon: Mail
    },
    {
      name: "Feedback",
      path: "/admin/feedback",
      icon: MessageSquare
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3
    },
    {
      name: "Gallery",
      path: "/admin/gallery",
      icon: ImageIcon
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings
    }
  ];

  const SidebarContent = () => (
    <>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EF</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-white">Edau Farm</h2>
                <p className="text-xs text-gray-300">Admin Panel</p>
              </div>
            )}
          </div>
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block text-gray-400 hover:text-white transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto">
        <div className="px-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ?
              location.pathname === item.path :
              isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
                {active && !isCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className={`w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors ${
            isCollapsed ? 'justify-center px-3' : 'justify-start'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex md:flex-col bg-gray-900 shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-2xl transform transition-transform duration-300 md:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Edau Farm</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default AdminSidebar;
