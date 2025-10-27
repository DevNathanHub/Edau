
import { Droplet, Leaf, Apple, Egg, ArrowRight, MessageCircle, Zap, ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const productsList = [
  {
    title: "Edau Acacia Honey",
    description: "Pure, raw Acacia honey harvested from the pristine forests of West Pokot. Known for its light color, delicate flavor, and exceptional quality.",
    icon: <Droplet className="w-10 h-10 text-amber-500" />,
    action: "Shop Acacia Honey",
    color: "bg-amber-50",
    borderColor: "border-amber-200",
    category: "honey"
  },
  {
    title: "Dorper Breeding",
    description: "Premium quality sheep bred for excellent meat production and breeding stock. Known for adaptability and rapid growth.",
    icon: <Leaf className="w-10 h-10 text-gray-600" />,
    action: "Learn More",
    color: "bg-gray-50",
    borderColor: "border-gray-200",
    category: "sheep"
  },
  {
    title: "Fresh Fruits",
    description: "Seasonal fruits grown with care and harvested at peak ripeness for maximum flavor and nutritional value.",
    icon: <Apple className="w-10 h-10 text-red-500" />,
    action: "Seasonal Offerings",
    color: "bg-red-50",
    borderColor: "border-red-200",
    category: "fruits"
  },
  {
    title: "Free-Range Poultry",
    description: "Eggs and meat from our happy, free-range chickens raised on natural feed without antibiotics.",
    icon: <Egg className="w-10 h-10 text-yellow-500" />,
    action: "Shop Poultry",
    color: "bg-yellow-50",
    borderColor: "border-yellow-200",
    category: "poultry"
  },
  {
    title: "AI Farm Assistant",
    description: "Get instant answers about products, place orders, book farm visits, and receive personalized recommendations through our intelligent chat assistant.",
    icon: <MessageCircle className="w-10 h-10 text-blue-500" />,
    action: "Try AI Chat",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
    category: "ai-chat",
    isService: true
  }
];

const Features = () => {
  return (
    <section id="features" className="min-h-screen-mobile md:h-screen flex items-center bg-[#FFF8E1] relative py-8 md:py-0">
      {/* Honeycomb background pattern */}
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/honeycomb.svg" 
          alt="Honeycomb pattern" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Our West Pokot Products</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4 md:px-0">
            Grown naturally with care in the fertile lands of West Pokot. From our family farm to your table.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {productsList.map((product, index) => (
            <div 
              key={index} 
              className={`${product.color} p-4 md:p-6 rounded-xl border ${product.borderColor} hover:shadow-md transition-all duration-200 touch-manipulation`}
            >
              <div className="mb-3 md:mb-4 flex justify-center">{product.icon}</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 text-center">{product.title}</h3>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 text-center leading-relaxed">{product.description}</p>
              <div className="flex justify-center">
                {product.isService ? (
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 hover:text-gray-900 p-0 flex items-center text-sm md:text-base"
                    onClick={() => {
                      // Trigger chat assistant
                      const chatButton = document.querySelector('[data-chat-trigger]');
                      if (chatButton) {
                        (chatButton as HTMLElement).click();
                      }
                    }}
                  >
                    {product.action}
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                ) : (
                  <Link to={`/products?category=${product.category}`} className="w-full">
                    <Button 
                      variant="ghost" 
                      className="text-gray-700 hover:text-gray-900 p-0 flex items-center text-sm md:text-base w-full justify-center"
                    >
                      {product.action}
                      <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
