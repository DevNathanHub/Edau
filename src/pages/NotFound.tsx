
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the attempted access to non-existent route
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // For direct access to known routes, automatically redirect
    const knownRoutes = ["/products", "/dashboard", "/admin", "/gallery", "/auth"];
    const path = location.pathname.endsWith("/") 
      ? location.pathname.slice(0, -1) 
      : location.pathname;
      
    if (knownRoutes.includes(path)) {
      navigate(path);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/" className="flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
