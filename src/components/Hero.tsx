
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, User, MessageCircle, Zap, ShoppingCart, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center py-16 md:py-24 bg-gradient-to-b from-[#FFF8E1] to-white relative overflow-hidden">
      {/* Animated Farm Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Honeycomb pattern background */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/honeycomb.svg" 
            alt="Honeycomb pattern" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Animated clouds */}
        <div className="absolute top-10 left-10 w-20 h-12 bg-white/30 rounded-full animate-float-slow opacity-60"></div>
        <div className="absolute top-20 right-20 w-16 h-10 bg-white/40 rounded-full animate-float-medium opacity-50"></div>
        <div className="absolute top-32 left-1/3 w-24 h-14 bg-white/35 rounded-full animate-float-fast opacity-55"></div>
        
        {/* Animated bees */}
        <div className="absolute top-40 right-10 animate-bee-flight">
          <div className="text-2xl animate-bounce">🐝</div>
        </div>
        <div className="absolute top-60 left-20 animate-bee-flight-delayed">
          <div className="text-xl animate-bounce">🐝</div>
        </div>
        
        {/* Floating pollen particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FFC107] rounded-full animate-float-particles opacity-70"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-float-particles-delayed opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-[#FFC107] rounded-full animate-float-particles-slow opacity-50"></div>
        
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#81C784]/10 via-transparent to-[#4CAF50]/5 animate-gradient-shift"></div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Leaf className="h-6 w-6 text-[#4CAF50] mr-2" />
              <span className="text-[#4CAF50] font-medium">Welcome to Edau Farm - West Pokot</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-800">
              Fresh from West Pokot <br />
              <span className="text-amber-600">Acacia Honey & More</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover our pure Acacia honey from the rich forests of West Pokot, premium seasonal fruits,
              Dorper sheep, and free-range poultry — all raised with care on our sustainable farm.
            </p>
            
            {/* AI Chat Assistant Highlight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-semibold">Meet Your AI Farm Assistant</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Get instant answers about our products, place orders, book farm visits, and get personalized recommendations — all through our intelligent chat assistant!
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">24/7 Support</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Instant Orders</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Expert Advice</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Products <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  // Trigger chat assistant
                  const chatButton = document.querySelector('[data-chat-trigger]');
                  if (chatButton) {
                    (chatButton as HTMLElement).click();
                  }
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Ask AI Assistant
              </Button>
              <Link to="/farm-visit">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  Book Farm Visit
                </Button>
              </Link>
             
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-[#81C784] to-[#FFC107] relative flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-xl font-semibold mb-2">West Pokot Farm Landscape</h3>
                  <p className="text-sm">Home of premium Acacia honey</p>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Sustainable farming in West Pokot since 2015</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
