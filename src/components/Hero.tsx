
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, User } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Leaf className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-green-600 font-medium">Welcome to Edau Farm</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-800">
              Fresh from our farm <br />
              <span className="text-amber-600">to your family</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover our natural honey, premium Dorper sheep, seasonal fruits, 
              and free-range poultry — all raised with care on our sustainable farm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Shop Products <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => scrollToSection("about")}
              >
                Our Farm Story
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
              <div className="aspect-video bg-gradient-to-br from-green-100 to-amber-100 relative flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-xl font-semibold mb-2">Edau Farm Landscape</h3>
                  <p className="text-sm">Beautiful farm scenery</p>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Sustainable farming since 2015</p>
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
