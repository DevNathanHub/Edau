
import { Droplet, Leaf, Apple, Egg, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const productsList = [
  {
    title: "Edau Honey",
    description: "Pure, natural honey harvested directly from our farm apiaries. Rich in flavor and packed with natural benefits.",
    icon: <Droplet className="w-10 h-10 text-amber-500" />,
    action: "Shop Honey",
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
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Farm Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Grown naturally with care for quality and sustainability. From our family farm to your table.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {productsList.map((product, index) => (
            <div 
              key={index} 
              className={`${product.color} p-6 rounded-xl border ${product.borderColor} hover:shadow-md transition-all`}
            >
              <div className="mb-4">{product.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.title}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <Link to={`/products?category=${product.category}`}>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-gray-900 p-0 flex items-center"
                >
                  {product.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
