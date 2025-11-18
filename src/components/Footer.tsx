
import { Leaf, Mail, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const location = useLocation();
  
  // Hide footer on dashboard routes
  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) {
    return null;
  }
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail("");
    }
  };
  
  // Helper function to scroll to section if on homepage or navigate if not
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on homepage, navigate to homepage with section anchor
      window.location.href = `/#${sectionId}`;
    }
  };
  
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Leaf className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Edau Farm</h3>
            </div>
            <p className="text-gray-600 max-w-xs">
              Sustainable farming focused on quality products, ethical practices, and community connection.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div>
              <h4 className="font-semibold mb-4 text-gray-800">Products</h4>
              <ul className="space-y-3">
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Edau Honey</Link></li>
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Dorper Sheep</Link></li>
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Seasonal Fruits</Link></li>
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Free-Range Poultry</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-800">Farm</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection("about")} className="text-gray-600 hover:text-green-600 text-left smooth-hover transition-colors">Our Story</button></li>
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Sustainability</Link></li>
                <li><Link to="/farm-visit" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Farm Tours</Link></li>
                <li><Link to="/products" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Farming Tips</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-800">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 text-green-600 mr-2" />
                  <a href="mailto:info@edaufarm.com" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">info@edaufarm.com</a>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 text-green-600 mr-2" />
                  <Link to="/farm-visit" className="text-gray-600 hover:text-green-600 smooth-hover transition-colors">Book a Visit</Link>
                </li>
                <li><button onClick={() => scrollToSection("contact")} className="text-gray-600 hover:text-green-600 text-left smooth-hover transition-colors">Send Message</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Edau Farm. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-green-600 text-sm">Terms</Link>
            <Link to="/" className="text-gray-600 hover:text-green-600 text-sm">Privacy</Link>
            <Link to="/" className="text-gray-600 hover:text-green-600 text-sm">Shipping</Link>
          
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
