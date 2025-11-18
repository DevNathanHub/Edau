
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Bot } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import Cart from "./Cart";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sessionUser] = useState<any>(null); // No longer used; keep minimal change footprint
  
  // Helper function to scroll to section if on homepage or navigate if not
  const handleNavigation = (sectionId: string) => {
    setMobileMenuOpen(false);
    
    if (location.pathname === '/') {
      // If on homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on homepage, navigate to homepage with section anchor
      window.location.href = `/#${sectionId}`;
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Octagonal EF Logo */}
            <motion.div 
              className="relative w-10 h-10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Octagon shape */}
                <polygon 
                  points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" 
                  fill="#D69A52"
                  className="group-hover:fill-[#C98B7D] transition-colors duration-300"
                />
                {/* EF Text */}
                <text 
                  x="50" 
                  y="60" 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="36" 
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                >
                  EF
                </text>
              </svg>
            </motion.div>
            <span className="text-2xl font-extrabold text-[#2d5a34]">
              Edau Farm
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/products" 
            className={`text-sm font-medium transition-colors smooth-hover relative ${
              isActive('/products') 
                ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                : 'text-gray-600 hover:text-[#D69A52]'
            }`}
          >
            Products
          </Link>
          <Link 
            to="/gallery" 
            className={`text-sm font-medium transition-colors smooth-hover relative ${
              isActive('/gallery') 
                ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                : 'text-gray-600 hover:text-[#D69A52]'
            }`}
          >
            Gallery
          </Link>
          <Link 
            to="/ai" 
            className={`text-sm font-medium transition-colors flex items-center smooth-hover relative ${
              isActive('/ai') 
                ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                : 'text-gray-600 hover:text-[#D69A52]'
            }`}
          >
            <Bot className="h-4 w-4 mr-1" />
            AI Assistant
          </Link>
          <button 
            onClick={() => handleNavigation("features")} 
            className="text-sm font-medium text-gray-600 hover:text-[#D69A52] transition-colors smooth-hover"
          >
            Features
          </button>
          <Link 
            to="/farm-visit" 
            className={`text-sm font-medium transition-colors smooth-hover relative ${
              isActive('/farm-visit') 
                ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                : 'text-gray-600 hover:text-[#D69A52]'
            }`}
          >
            Farm Visit
          </Link>
          <button 
            onClick={() => handleNavigation("contact")} 
            className="text-sm font-medium text-gray-600 hover:text-[#D69A52] transition-colors smooth-hover"
          >
            Contact
          </button>
          {user && user.email ? (
            <>
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors relative ${
                  isActive('/dashboard') 
                    ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                    : 'text-gray-600 hover:text-[#D69A52]'
                }`}
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-[#9DBFA6] text-[#56704E] hover:bg-[#9DBFA6]/10 hover:text-[#56704E]"
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-colors relative ${
                isActive('/login') 
                  ? 'text-[#D69A52] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D69A52]' 
                  : 'text-gray-600 hover:text-[#D69A52]'
              }`}
            >
              Login
            </Link>
          )}
          <Cart isIconButton />
          <Link to="/products">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="bg-[#D69A52] hover:bg-[#C98B7D] text-white flex items-center shadow-md">
                <ShoppingCart className="mr-1 h-3 w-3" />
                Shop
              </Button>
            </motion.div>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <Cart isIconButton />
          <button 
            className="text-gray-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <motion.div 
        initial={false}
        animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
      >
        <div className="flex flex-col space-y-3 py-4 px-6">
          <Link 
            to="/products" 
            className={`font-medium py-2 transition-colors ${
              isActive('/products') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link 
            to="/gallery" 
            className={`font-medium py-2 transition-colors ${
              isActive('/gallery') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link 
            to="/ai" 
            className={`font-medium py-2 flex items-center transition-colors ${
              isActive('/ai') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Link>
          <button 
            onClick={() => handleNavigation("features")}
            className="font-medium text-gray-600 hover:text-[#D69A52] py-2 text-left pl-3 transition-colors"
          >
            Features
          </button>
          <Link 
            to="/farm-visit" 
            className={`font-medium py-2 transition-colors ${
              isActive('/farm-visit') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Farm Visit
          </Link>
          <button 
            onClick={() => handleNavigation("contact")}
            className="font-medium text-gray-600 hover:text-[#D69A52] py-2 text-left pl-3 transition-colors"
          >
            Contact
          </button>
          {user && user.email ? (
            <>
              <Link 
                to="/dashboard" 
                className={`font-medium py-2 transition-colors ${
                  isActive('/dashboard') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-[#9DBFA6] text-[#56704E] hover:bg-[#9DBFA6]/10 w-full"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`font-medium py-2 transition-colors ${
                isActive('/login') ? 'text-[#D69A52] border-l-2 border-[#D69A52] pl-3' : 'text-gray-600 hover:text-[#D69A52] pl-3'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
          <Link 
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button 
              size="sm"
              className="bg-[#D69A52] hover:bg-[#C98B7D] text-white flex items-center justify-center w-full shadow-md"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Shop Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navigation;
