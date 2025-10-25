
import { Home, User, ShoppingCart, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Cart from "./Cart";

const MobileNavigation = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 mt-8">
      <nav className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/') ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/products" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/products') ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Products</span>
        </Link>
        
        <div className="flex flex-col items-center justify-center w-full h-full">
          <Cart isIconButton />
          <span className="text-xs mt-1">Cart</span>
        </div>
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/admin') ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Admin</span>
          </Link>
        )}
        
        <Link 
          to={user ? "/dashboard" : "/login"} 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/dashboard') || isActive('/login') || isActive('/signup') ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{user ? "Account" : "Login"}</span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileNavigation;
