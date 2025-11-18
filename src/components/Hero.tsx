
import { Button } from "@/components/ui/button";
import { ArrowRight, User, MessageCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { motion, AnimatePresence } from "framer-motion";

interface GalleryImage {
  id: string;
  _id?: string;
  url: string;
  public_id: string;
  original_name: string;
  uploaded_by?: string;
  created_at: string;
  isPublic?: boolean;
}

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [transitionType, setTransitionType] = useState<'fade' | 'slide' | 'zoom' | 'rotate'>('fade');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch gallery images for hero carousel
  const { data: galleryImages = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['heroGalleryImages'],
    queryFn: async (): Promise<GalleryImage[]> => {
      try {
        const response = await apiService.getGallery();
        if (response.error) {
          // Fallback to hardcoded images if API fails
          return [
            { id: '1', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432130/edau_gallery/l391lo21ecais2upig2k.jpg", public_id: "l391lo21ecais2upig2k", original_name: "Farm Landscape", created_at: new Date().toISOString() },
            { id: '2', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg", public_id: "dfhnrsmuteqhheghiema", original_name: "Produce Display", created_at: new Date().toISOString() },
            { id: '3', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432064/edau_gallery/gzmlkw1evm17yrynuphm.jpg", public_id: "gzmlkw1evm17yrynuphm", original_name: "Animal Husbandry", created_at: new Date().toISOString() },
            { id: '4', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432109/edau_gallery/tb0utizepynaszqajuu6.jpg", public_id: "tb0utizepynaszqajuu6", original_name: "Honey Production", created_at: new Date().toISOString() },
            { id: '5', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432088/edau_gallery/q0iexqygkurq4b6xi2wt.jpg", public_id: "q0iexqygkurq4b6xi2wt", original_name: "Community Farming", created_at: new Date().toISOString() }
          ];
        }
        // Take up to 8 random images from gallery
        const images = (response.data as GalleryImage[]) || [];
        const shuffled = images.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(8, images.length));
      } catch (error) {
        // Fallback images
        return [
          { id: '1', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432130/edau_gallery/l391lo21ecais2upig2k.jpg", public_id: "l391lo21ecais2upig2k", original_name: "Farm Landscape", created_at: new Date().toISOString() },
          { id: '2', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg", public_id: "dfhnrsmuteqhheghiema", original_name: "Produce Display", created_at: new Date().toISOString() },
          { id: '3', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432064/edau_gallery/gzmlkw1evm17yrynuphm.jpg", public_id: "gzmlkw1evm17yrynuphm", original_name: "Animal Husbandry", created_at: new Date().toISOString() },
          { id: '4', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432109/edau_gallery/tb0utizepynaszqajuu6.jpg", public_id: "tb0utizepynaszqajuu6", original_name: "Honey Production", created_at: new Date().toISOString() },
          { id: '5', url: "https://res.cloudinary.com/dt05sixza/image/upload/v1761432088/edau_gallery/q0iexqygkurq4b6xi2wt.jpg", public_id: "q0iexqygkurq4b6xi2wt", original_name: "Community Farming", created_at: new Date().toISOString() }
        ];
      }
    },
    enabled: true,
  });

  const transitionTypes: ('fade' | 'slide' | 'zoom' | 'rotate')[] = ['fade', 'slide', 'zoom', 'rotate'];

  // Track per-image load state so we can show skeletons until each image loads
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    // initialize loaded flags when images change
    setImageLoaded(new Array(galleryImages.length).fill(false));
  }, [galleryImages.length]);

  useEffect(() => {
    if (galleryImages.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Change transition type randomly
      setTransitionType(transitionTypes[Math.floor(Math.random() * transitionTypes.length)]);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getTransitionClasses = (index: number) => {
    const isActive = index === currentImageIndex;
    const baseClasses = "absolute inset-0 transition-all duration-1000 ease-in-out";
    
    if (!isActive) return `${baseClasses} opacity-0`;
    
    switch (transitionType) {
      case 'slide':
        return `${baseClasses} opacity-100 transform translate-x-0`;
      case 'zoom':
        return `${baseClasses} opacity-100 transform scale-100`;
      case 'rotate':
        return `${baseClasses} opacity-100 transform rotate-0`;
      default:
        return `${baseClasses} opacity-100`;
    }
  };

  const getInactiveTransitionClasses = (index: number) => {
    const isActive = index === currentImageIndex;
    if (isActive) return "";
    
    switch (transitionType) {
      case 'slide':
        return "transform -translate-x-full";
      case 'zoom':
        return "transform scale-110";
      case 'rotate':
        return "transform rotate-3";
      default:
        return "";
    }
  };

  // Note: we intentionally render the full hero layout even while gallery images are loading.
  // Per-image skeletons are shown in the image area instead of a global loader.

  return (
    <section className="min-h-screen-mobile md:h-screen flex items-center bg-gradient-to-b from-[#FCFBF8] via-[#F2D7A7] to-[#D69A52] relative overflow-hidden">
      {/* Clean minimal background with subtle patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(214, 154, 82, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(157, 191, 166, 0.1) 0%, transparent 50%)`,
            backgroundSize: '100% 100%'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-0">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="md:w-1/2 md:pr-8 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
          
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: '#56704E' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              From West Pokot Soil <br />
              <span className="text-[#D69A52]">to Your Table</span>
            </motion.h1>
            <motion.p 
              className="text-base md:text-lg mb-8 leading-relaxed text-[#2B2B2B]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Three generations of Edau family beekeepers and shepherds—bringing golden acacia honey, 
              pasture-raised lamb, and orchard-fresh fruit straight from our homestead to your kitchen.
            </motion.p>
            
            {/* Authentic Farm Story Highlight */}
            <div className="bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-6 shadow-lg scale-hover">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-900 font-bold">Our AI Farm Assistant</span>
              </div>
              <p className="text-amber-800 mb-4 leading-relaxed text-sm md:text-base">
                Meet your digital guide to Edau Farm! Get instant answers about our products, place custom orders,
                book farm visits, and discover the stories behind our sustainable farming practices.
              </p>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="bg-amber-100 text-amber-800 px-2 md:px-3 py-1 rounded-full border border-amber-200">24/7 Support</span>
                <span className="bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full border border-green-200">Local Knowledge</span>
                <span className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full border border-blue-200">Expert Advice</span>
              </div>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link to="/products">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-[#D69A52] hover:bg-[#C98B7D] text-white shadow-lg rounded-xl w-full sm:w-auto">
                    <ShoppingCart className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                    Shop Honey
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-[#9DBFA6] text-[#56704E] hover:bg-[#9DBFA6]/10 shadow-md rounded-xl w-full sm:w-auto"
                  onClick={() => {
                    const chatButton = document.querySelector('[data-chat-trigger]');
                    if (chatButton) {
                      (chatButton as HTMLElement).click();
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  Ask Edau AI
                </Button>
              </motion.div>
              <Link to="/farm-visit">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-[#9DBFA6] text-[#56704E] hover:bg-[#9DBFA6]/10 shadow-md rounded-xl w-full sm:w-auto"
                  >
                    Book Farm Visit
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="md:w-1/2 relative w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <div className="relative w-full h-72 sm:h-80 md:h-80 lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl border-4 border-white/50 backdrop-blur-sm">
              {/* Creative Sliding Images */}
              {(isLoading || galleryImages.length === 0) ? (
                // Show 3 skeleton slides while loading
                [0,1,2].map((i) => (
                  <div key={`skeleton-${i}`} className={`absolute inset-0 transition-all duration-1000 ease-in-out opacity-100`}>
                    <div className={`w-full h-full`}>
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={getTransitionClasses(index)}
                  >
                    <div className={`w-full h-full ${getInactiveTransitionClasses(index)}`}>
                      {/* Image element with per-image skeleton */}
                      <img
                        src={image.url}
                        alt={image.original_name || `Edau Farm - Image ${index + 1}`}
                        className={`w-full h-full object-cover ${imageLoaded[index] ? '' : 'hidden'}`}
                        onLoad={() => {
                          setImageLoaded(prev => {
                            const copy = [...prev];
                            copy[index] = true;
                            return copy;
                          });
                        }}
                      />

                      {/* Skeleton placeholder shown until image loads */}
                      {!imageLoaded[index] && (
                        <div className="w-full h-full bg-gray-200 animate-pulse" aria-hidden="true"></div>
                      )}

                      {/* Dynamic overlay based on transition */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent ${
                        transitionType === 'zoom' ? 'animate-pulse' : ''
                      } ${!imageLoaded[index] ? 'pointer-events-none' : ''}`}></div>
                    </div>
                  </div>
                ))
              )}

              {/* Transition indicator */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/70 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                <span className="text-white text-xs md:text-sm font-medium capitalize">{transitionType} Transition</span>
              </div>

              {/* Image indicators with thumbnails */}
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 md:py-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  >
                    {/* Mini thumbnail on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 md:mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <img
                        src={image.url}
                        alt="thumbnail"
                        className="w-12 md:w-16 h-8 md:h-12 object-cover rounded border-2 border-white shadow-lg"
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Authentic farm overlay text */}
               <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-gradient-to-r from-amber-900/90 to-red-900/90 backdrop-blur-sm px-2 md:px-4 py-1 md:py-3 rounded-lg border border-amber-600/30">
                 <p className="text-white font-semibold text-xs md:text-sm">Edau Farm's Finest</p>
                 <p className="text-amber-100 text-xs">Sustainable farming since 2015</p>
               </div>

              {/* Cultural pattern overlay */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 w-12 md:w-16 h-12 md:h-16 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
