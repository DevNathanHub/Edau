
import { User, Package, LogOut, CreditCard, Shield, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => {
  return (
    <button
      className={cn(
        "flex items-center w-full py-2 px-3 mb-1 rounded-md text-left transition-colors",
        active 
          ? "bg-green-50 text-green-700 font-medium" 
          : "text-gray-600 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className={cn(
        "ml-3 transition-opacity duration-200",
        collapsed && "lg:opacity-0 lg:hidden"
      )}>
        {label}
      </span>
    </button>
  );
};

interface DashboardSidebarProps {
  collapsed?: boolean;
}

const DashboardSidebar = ({ collapsed = false }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
      });
    }
  };

  // Get current active path
  const currentPath = location.pathname;

  // Define sidebar items based on user role
  const userItems = [
    { icon: User, label: 'Profile', path: '/dashboard' },
    { icon: Package, label: 'Orders', path: '/dashboard/orders' },
    { icon: CreditCard, label: 'Payments', path: '/dashboard/payments' },
    { icon: MessageSquare, label: 'Feedback', path: '/dashboard/feedback' },
  ];

  const adminItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="space-y-1">
        {userItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={currentPath === item.path}
            onClick={() => navigate(item.path)}
            collapsed={collapsed}
          />
        ))}
        
        {isAdmin && (
          <>
            <div className={cn(
              "my-3 border-t border-gray-200",
              collapsed && "mx-2"
            )} />
            
            {adminItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={currentPath.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </div>
      
      <div className={cn(
        "mt-6 border-t border-gray-200 pt-4",
        collapsed && "mx-2"
      )}>
        <SidebarItem
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
};

export default DashboardSidebar;
