
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "lucide-react";
import { useEffect } from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  // Hide the progress bar after authentication is done
  useEffect(() => {
    if (!loading) {
      const progressBarElement = document.querySelector(".progress-bar");
      if (progressBarElement) {
        progressBarElement.classList.add("hidden");
      }
    }
    
    return () => {
      // Make progress bar visible again when component unmounts
      const progressBarElement = document.querySelector(".progress-bar");
      if (progressBarElement) {
        progressBarElement.classList.remove("hidden");
      }
    };
  }, [loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-12 w-12 text-green-600 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
