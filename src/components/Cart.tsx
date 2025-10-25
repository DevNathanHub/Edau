
import { useState, useEffect } from "react";
import { ShoppingCart, X, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartProps {
  isIconButton?: boolean;
}

// Store cart as a global variable to persist between component instances
let globalCart: CartItem[] = [];

export const useCart = () => {
  const { toast } = useToast();
  
  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const existingItem = globalCart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      globalCart.push({ ...item, quantity });
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${item.name} added to your cart`,
    });
    
    // Force update any cart components
    window.dispatchEvent(new Event('cart-updated'));
  };
  
  const removeFromCart = (id: string) => {
    globalCart = globalCart.filter(item => item.id !== id);
    
    // Force update any cart components
    window.dispatchEvent(new Event('cart-updated'));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    const item = globalCart.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    
    // Force update any cart components
    window.dispatchEvent(new Event('cart-updated'));
  };
  
  const clearCart = () => {
    globalCart = [];
    
    // Force update any cart components
    window.dispatchEvent(new Event('cart-updated'));
  };
  
  const getCartItems = () => {
    return [...globalCart];
  };
  
  const getCartTotal = () => {
    return globalCart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getCartItemsCount = () => {
    return globalCart.reduce((count, item) => count + item.quantity, 0);
  };
  
  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
    getCartTotal,
    getCartItemsCount
  };
};

const Cart: React.FC<CartProps> = ({ isIconButton = false }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(globalCart);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Sync cart state with global cart
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems([...globalCart]);
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);
  
  const { removeFromCart, updateQuantity, getCartTotal } = useCart();
  
  const cartTotal = getCartTotal();
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const handleCheckoutMpesa = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to complete your purchase with M-Pesa",
      });
      return;
    }
    
    setIsOpen(false);
    navigate('/checkout/cart');
  };
  
  const handleWhatsAppCheckout = () => {
    const phone = "254727690165"; // Format for WhatsApp: country code + number without leading 0
    
    // Create WhatsApp message with cart items
    let message = "Hello! I'd like to order the following items from Edau Farm:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (KSh ${(item.price * item.quantity).toLocaleString()})\n`;
    });
    message += `\nTotal: KSh ${cartTotal.toLocaleString()}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp link
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {isIconButton ? (
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart ({itemCount})
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-green-600" />
            Your Cart ({itemCount} items)
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-auto py-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Browse our products and add something to your cart</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center border-b border-gray-200 pb-4">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden mr-4">
                    <img 
                      src={item.image || `https://placehold.co/200x200?text=${encodeURIComponent(item.name.charAt(0))}`} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-500">KSh {item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center mt-2">
                      <button 
                        className="border border-gray-300 rounded-l px-2"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="border-t border-b border-gray-300 px-3">{item.quantity}</span>
                      <button 
                        className="border border-gray-300 rounded-r px-2"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <p className="font-medium">KSh {(item.price * item.quantity).toLocaleString()}</p>
                    <button 
                      className="mt-2 text-red-500 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <SheetFooter className="border-t border-gray-200 pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>KSh {cartTotal.toLocaleString()}</span>
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCheckoutMpesa}
              >
                {user ? "Pay with M-Pesa" : "Login to Checkout"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50 flex items-center justify-center"
                onClick={handleWhatsAppCheckout}
              >
                Order via WhatsApp
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              {!user && (
                <p className="text-center text-sm text-gray-500">
                  Please sign in to complete your purchase with M-Pesa
                </p>
              )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
