
import { Home, User, ShoppingCart, Package, Store } from "lucide-react";
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <nav className="flex justify-around items-center h-16 px-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link 
          to="/products" 
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 rounded-lg transition-colors ${
            isActive('/products') ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Store className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Products</span>
        </Link>
        
        <div className="flex flex-col items-center justify-center flex-1 h-full py-2 rounded-lg transition-colors text-gray-600">
          <Cart isIconButton />
          <span className="text-xs font-medium mt-1">Cart</span>
        </div>
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 rounded-lg transition-colors ${
              isActive('/admin') ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Package className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        )}
        
        <Link 
          to={user ? "/dashboard" : "/login"} 
          className={`flex flex-col items-center justify-center flex-1 h-full py-2 rounded-lg transition-colors ${
            isActive('/dashboard') || isActive('/login') || isActive('/signup') ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">{user ? "Account" : "Login"}</span>
        </Link>
      </nav>
    </div>
  );
};

export default MobileNavigation;
