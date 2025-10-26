
import { Button } from "@/components/ui/button";
// ...existing code...
import { Leaf, ShoppingCart, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
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

  return (
    <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Leaf className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-lg font-semibold text-gray-800">Edau Farm</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/products" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Products</Link>
          <Link to="/gallery" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Gallery</Link>
          <button onClick={() => handleNavigation("features")} className="text-sm text-gray-600 hover:text-green-600 transition-colors">Features</button>
          <Link to="/farm-visit" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Farm Visit</Link>
          <button onClick={() => handleNavigation("contact")} className="text-sm text-gray-600 hover:text-green-600 transition-colors">Contact</button>
          {user && user.email ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Dashboard</Link>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={async () => {
                  await signOut();
                  // user state cleared by signOut
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors">Login</Link>
          )}
          <Cart isIconButton />
          <Link to="/products">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center">
              <ShoppingCart className="mr-1 h-3 w-3" />
              Shop
            </Button>
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
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t border-gray-100 bg-white">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-green-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/gallery" 
              className="text-gray-600 hover:text-green-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <button 
              onClick={() => handleNavigation("features")}
              className="text-gray-600 hover:text-green-600 py-2 text-left"
            >
              Features
            </button>
            <Link 
              to="/farm-visit" 
              className="text-gray-600 hover:text-green-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Farm Visit
            </Link>
            <button 
              onClick={() => handleNavigation("contact")}
              className="text-gray-600 hover:text-green-600 py-2 text-left"
            >
              Contact
            </button>
            {user && user.email ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-green-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-green-600 text-green-600 hover:bg-green-50 w-full"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                    // user state cleared by signOut
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-green-600 py-2"
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
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
