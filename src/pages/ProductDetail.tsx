
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, MessageSquare, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { useCart } from "@/components/Cart";
import { ProductDetailSkeleton } from "@/components/ui/product-skeleton";

// Product categories with their respective icons
const categoryNames: Record<string, string> = {
  "honey": "Honey Products",
  "sheep": "Dorper Sheep",
  "fruits": "Fresh Fruits",
  "poultry": "Poultry Products"
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const result = await apiService.getProduct(id);
      if (result.error) throw new Error(result.error);
      const payload: any = result.data;
      const p = payload?.data || payload;
      if (!p) throw new Error('Product not found');
      return {
        id: p.id || p._id || p._id?.toString?.(),
        name: p.name,
        description: p.description || '',
        price: Number(p.price || 0),
        stock: Number(p.stock ?? 10),
        image_url: p.image_url || p.image || '',
        category: p.category,
      } as Product;
    },
  });
  
  const handleBuyNow = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    }, quantity);
    
    if (user) {
      navigate(`/checkout/${id}?quantity=${quantity}`);
    } else {
      toast({
        title: "Login Required",
        description: "Please login to continue with your purchase",
      });
      navigate("/auth", { state: { from: `/products/${id}` } });
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    }, quantity);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${product.id}`;
    const categoryDisplay = categoryNames[category] || "Farm Products";
    const shareMessage = `Edau Farm! 🐝 *${product.name}* 🐝 Category: ${categoryDisplay} 🐝 Price: KSh ${product.price.toLocaleString()} 🐝 Stock: ${product.stock.toString().padStart(3, '0')} 🐝 View Product: ${productUrl} Order now from Edau Farm! 🐝`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(shareMessage);

    // Open WhatsApp with share message
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleShare = async () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${product.id}`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - Edau Farm`,
          text: `Check out this product from Edau Farm: ${product.name}`,
          url: productUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred, fallback to clipboard
        console.log('Error sharing:', error);
        await navigator.clipboard.writeText(productUrl);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to your clipboard.",
        });
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to your clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-green-600 hover:text-green-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </button>
            
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/products')} className="bg-green-600 hover:bg-green-700">
              Browse Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine category based on product category field or name
  let category = "poultry";
  if (product.category) {
    // Map the category field to our display categories
    const categoryMap: Record<string, string> = {
      'Honey': 'honey',
      'Dorper Sheep': 'sheep',
      'Fruits': 'fruits',
      'Poultry': 'poultry'
    };
    category = categoryMap[product.category] || 'poultry';
  } else {
    // Fallback to name-based determination
    if (product.name.toLowerCase().includes('honey')) {
      category = "honey";
    } else if (product.name.toLowerCase().includes('sheep') || product.name.toLowerCase().includes('dorper')) {
      category = "sheep";
    } else if (product.name.toLowerCase().includes('fruit') || product.name.toLowerCase().includes('apple') || product.name.toLowerCase().includes('peach')) {
      category = "fruits";
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col pb-[60px] md:pb-0">
      <Navigation />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-green-600 hover:text-green-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </button>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden bg-white shadow-md">
              <img 
                src={product.image_url || `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`} 
                alt={product.name} 
                className="w-full h-full object-cover aspect-square"
                loading="lazy"
              />
            </div>
            
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-md">
                  {categoryNames[category] || "Farm Products"}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-green-700 mb-4">KSh {product.price.toLocaleString()}</p>
              
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Availability: {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}</p>
              </div>
              
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-3 text-gray-700">Quantity:</label>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-12 text-center border-l border-r border-gray-300"
                  />
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Button 
                  onClick={handleBuyNow}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 flex-1"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
              
              <Button 
                onClick={handleWhatsAppOrder}
                className="bg-green-500 hover:bg-green-600 flex items-center justify-center"
                disabled={product.stock === 0}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Order via WhatsApp
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center mt-2"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Product
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
