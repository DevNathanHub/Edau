
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import AIChatSection from "../components/AIChatSection";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Calendar, Users, Star, Award, Truck, Shield, CheckCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();
  const [buttonStates, setButtonStates] = useState({
    shopNow: false,
    orderNow: false,
    bookVisit: false,
    viewGallery: false,
    meetTeam: false
  });

  const handleButtonClick = async (buttonType: keyof typeof buttonStates, action: () => void | Promise<void>, delay = 800) => {
    setButtonStates(prev => ({ ...prev, [buttonType]: true }));
    
    try {
      await action();
      // Add a small delay to show the loading state
      setTimeout(() => {
        setButtonStates(prev => ({ ...prev, [buttonType]: false }));
      }, delay);
    } catch (error) {
      setButtonStates(prev => ({ ...prev, [buttonType]: false }));
    }
  };

    // Handle mobile viewport height
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return (
    <div className="relative">
      <Helmet>
        <title>Edau Farm - Fresh Acacia Honey & Sustainable Products from West Pokot</title>
        <meta name="description" content="Discover pure Acacia honey from West Pokot, premium seasonal fruits, Dorper sheep, and free-range poultry. Sustainable farming since 2015 with AI-powered farm assistance." />
        <meta name="keywords" content="Acacia honey, West Pokot, sustainable farming, organic products, farm fresh, Dorper sheep, free-range poultry, seasonal fruits" />
        <meta property="og:title" content="Edau Farm - Fresh Acacia Honey & Sustainable Products from West Pokot" />
        <meta property="og:description" content="Pure Acacia honey from West Pokot's rich forests. Premium sustainable farm products with AI-powered assistance." />
        <meta property="og:image" content="https://edau.loopnet.tech/images/edau-farm-og.jpg" />
        <meta property="og:url" content="https://edau.loopnet.tech" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Edau Farm - West Pokot's Premier Sustainable Farm" />
        <meta name="twitter:description" content="Pure Acacia honey and sustainable farm products from West Pokot, Kenya." />
        <link rel="canonical" href="https://edau.loopnet.tech" />
      </Helmet>

      <Navigation />
      <main className="overflow-y-auto">
        {/* Hero Section */}
        <section id="hero">
          <Hero />
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <Features />
        </section>

        {/* AI Chat Section */}
        <section id="ai-chat" className="py-16 md:py-24">
          <AIChatSection />
        </section>

        {/* Statistics Section */}
        <section id="statistics" className="py-16 md:py-24 bg-gradient-to-br from-[#9DBFA6] via-[#56704E] to-[#D69A52] text-white relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Farm Family Story</h2>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Real numbers from real people who love what we do
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-amber-300">9+</div>
                <div className="text-amber-200 text-lg">Years Farming</div>
                <div className="text-amber-300/70 text-sm mt-1">Since 2015</div>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-green-300">500+</div>
                <div className="text-amber-200 text-lg">Happy Families</div>
                <div className="text-amber-300/70 text-sm mt-1">Served</div>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-300">50+</div>
                <div className="text-amber-200 text-lg">Farm Visits</div>
                <div className="text-amber-300/70 text-sm mt-1">This Year</div>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-300">4.9★</div>
                <div className="text-amber-200 text-lg">Average Rating</div>
                <div className="text-amber-300/70 text-sm mt-1">Customer Love</div>
              </div>
            </div>
          </div>
        </section>

        {/* GIF Placeholder Section */}
        <section id="farm-gif" className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Watch Our Farm Come to Life</h2>
              <div className="bg-gray-200 rounded-2xl h-96 md:h-[500px] flex items-center justify-center shadow-xl">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-xl font-semibold">Farm Activities GIF Placeholder</p>
                  <p className="text-sm mt-2">Coming soon: Watch our chickens roam free and bees at work!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        <section id="offers" className="py-16 md:py-24 bg-gradient-to-br from-[#FCFBF8] via-[#F2D7A7] to-[#FCFBF8] relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Limited Time Harvest Offers</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Fresh from our West Pokot fields to your table — exclusive seasonal deals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-amber-500 animate-fade-in-left transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">New Customer Welcome</h3>
                </div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Start your journey with Edau Farm and receive 15% off your first order with code WELCOME15
                </p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-amber-600">Valid until Dec 31</span>
                  <div className="text-sm text-gray-500">Limited time offer</div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 text-lg" 
                  disabled={buttonStates.shopNow}
                  onClick={() => handleButtonClick('shopNow', () => navigate('/products'))}
                >
                  {buttonStates.shopNow ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    'Claim Welcome Discount'
                  )}
                </Button>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 animate-fade-in-right transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Free Farm Delivery</h3>
                </div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Free delivery on orders over KSh 3,000 within Nairobi and surrounding areas
                </p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-green-600">Always Available</span>
                  <div className="text-sm text-gray-500">No minimum order</div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg" 
                  disabled={buttonStates.orderNow}
                  onClick={() => handleButtonClick('orderNow', () => navigate('/products'))}
                >
                  {buttonStates.orderNow ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Order with Free Delivery'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-br from-[#56704E] via-[#9DBFA6] to-[#56704E] relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">What Our Happy Customers Say</h2>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Hear it straight from the families who love our farm-fresh goodness
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 italic text-lg leading-relaxed">
                  "Oh my goodness, that Acacia honey is just incredible! We've been loyal customers for 2 years now,
                  and it never disappoints. Even our kids can't get enough of those farm visits!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    SM
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">Sarah Muthoni</div>
                    <div className="text-green-200">Regular Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 italic text-lg leading-relaxed">
                  "We get fresh eggs every single week, and the fruits are always perfectly ripe. That family pack
                  is just right for our busy household of 5. I can't recommend Edau Farm enough!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    JK
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">James Kiprop</div>
                    <div className="text-green-200">Family Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 italic text-lg leading-relaxed">
                  "The farm visit was amazing! Our children learned so much about sustainable farming in West Pokot.
                  The chicken we bought was the most flavorful we've ever had."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    AW
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">Ann Wanjiku</div>
                    <div className="text-green-200">Farm Visit Customer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Gallery Section */}
        <section id="gallery" className="py-16 md:py-24 bg-gradient-to-br from-[#F2D7A7] via-[#FCFBF8] to-[#F2D7A7] relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Life at Edau Farm</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Take a glimpse into our daily operations and see how we care for our animals and crops in West Pokot
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Farm Images */}
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432130/edau_gallery/l391lo21ecais2upig2k.jpg"
                  alt="Edau Farm - Sustainable Farming"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761760810/edau_gallery/exarx2mn5qeyfmcgehak.jpg"
                  alt="Edau Farm - Fresh Produce"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432064/edau_gallery/gzmlkw1evm17yrynuphm.jpg"
                  alt="Edau Farm - Animal Husbandry"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1763397730/edau_gallery/o9zocxq3sm0z9if5omiw.jpg"
                  alt="Edau Farm - Fruits Production"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.5s' }}>
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432088/edau_gallery/q0iexqygkurq4b6xi2wt.jpg"
                  alt="Edau Farm - Community Farming"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Call to action card */}
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-amber-200 animate-fade-in-up transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.6s' }}>
                <div className="text-center text-gray-700 p-6">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-2xl font-semibold mb-3">Visit Our Farm</h3>
                  <p className="text-lg mb-6">Experience sustainable farming firsthand in West Pokot</p>
                  <Link to="/farm-visit">
                    <Button size="lg" className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-8 py-3 text-lg">
                      Book Visit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <Link to="/gallery">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                  View Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* GIF Placeholder Section 2 */}
        <section id="honey-gif" className="py-16 md:py-24 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">See Our Honey Harvest in Action</h2>
              <div className="bg-gray-200 rounded-2xl h-96 md:h-[500px] flex items-center justify-center shadow-xl">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🍯</div>
                  <p className="text-xl font-semibold">Honey Extraction GIF Placeholder</p>
                  <p className="text-sm mt-2">Coming soon: Witness the magic of turning honeycomb into liquid gold!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-choose" className="py-16 md:py-24 bg-gradient-to-br from-[#2B2B2B] via-[#56704E] to-[#2B2B2B] text-white relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Edau Farm?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                We're committed to quality, sustainability, and building lasting relationships with our West Pokot community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">100% Natural</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  No antibiotics, no hormones, no artificial additives. Just pure, natural farm products from West Pokot's rich earth.
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartHandshake className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Community Driven</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Three generations of farming expertise in West Pokot, ensuring the highest standards of care and quality.
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Fresh Delivery</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Direct from our West Pokot farm to your door within 24 hours of harvest, ensuring maximum freshness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sheep Farming Section with Image */}
        <section id="sheep-farming" className="py-16 md:py-24 bg-gradient-to-br from-[#56704E] to-[#9DBFA6]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 order-2 md:order-1">
                <div className="bg-gray-200 rounded-2xl h-80 md:h-[500px] flex items-center justify-center shadow-2xl overflow-hidden">
                  <div className="text-center text-gray-500">
                    <div className="text-7xl mb-4">🐑</div>
                    <p className="text-2xl font-bold">Dorper Sheep Farming</p>
                    <p className="text-sm mt-3 px-4">Image/GIF Placeholder: Our premium sheep grazing in West Pokot pastures</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2 text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Premium Dorper Sheep</h2>
                <p className="text-xl mb-4 leading-relaxed">
                  Our Dorper sheep are raised on the lush pastures of West Pokot, ensuring they receive the best natural diet for superior meat quality.
                </p>
                <p className="text-lg mb-6 text-green-100 leading-relaxed">
                  Free-range grazing, ethical farming practices, and expert care result in tender, flavorful lamb that's perfect for your family meals.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold text-amber-300">50+</div>
                    <div className="text-green-200">Healthy Sheep</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold text-amber-300">100%</div>
                    <div className="text-green-200">Grass-Fed</div>
                  </div>
                </div>
                <Link to="/products">
                  <Button size="lg" className="bg-white text-[#56704E] hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all">
                    Order Fresh Lamb
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Beekeeping Process GIF Section */}
        <section id="beekeeping-process" className="py-16 md:py-24 bg-gradient-to-br from-[#F2D7A7] via-[#FCFBF8] to-[#D69A52]">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">The Journey from Hive to Jar</h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Watch how we carefully extract pure Acacia honey while maintaining sustainable beekeeping practices
              </p>
              <div className="bg-gray-200 rounded-2xl h-96 md:h-[600px] flex items-center justify-center shadow-2xl">
                <div className="text-center text-gray-500 px-6">
                  <div className="text-8xl mb-6">🐝</div>
                  <p className="text-2xl font-bold mb-3">Beekeeping Process Video</p>
                  <p className="text-base mt-2">Coming soon: Step-by-step honey extraction from our West Pokot hives</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="bg-amber-100 px-4 py-2 rounded-lg">
                      <p className="text-sm text-amber-800">🔍 Hive Inspection</p>
                    </div>
                    <div className="bg-amber-100 px-4 py-2 rounded-lg">
                      <p className="text-sm text-amber-800">🍯 Honey Extraction</p>
                    </div>
                    <div className="bg-amber-100 px-4 py-2 rounded-lg">
                      <p className="text-sm text-amber-800">📦 Bottling Process</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free-Range Chicken Section */}
        <section id="poultry" className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-green-700 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Free-Range Poultry</h2>
                <p className="text-xl mb-4 leading-relaxed">
                  Our chickens roam freely across our West Pokot farm, enjoying a natural diet of grains, insects, and fresh vegetation.
                </p>
                <p className="text-lg mb-6 text-green-100 leading-relaxed">
                  This results in eggs with rich, golden yolks and chicken meat that's tender, flavorful, and packed with nutrients.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-300 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-lg">No Antibiotics or Hormones</p>
                      <p className="text-green-100">Just natural, healthy birds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-300 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-lg">Daily Fresh Eggs</p>
                      <p className="text-green-100">Collected every morning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-300 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-lg">Ethical Farming</p>
                      <p className="text-green-100">Happy chickens, better food</p>
                    </div>
                  </div>
                </div>
                <Link to="/products">
                  <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all">
                    Order Fresh Eggs & Chicken
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-200 rounded-2xl h-80 md:h-[500px] flex items-center justify-center shadow-2xl overflow-hidden">
                  <div className="text-center text-gray-500">
                    <div className="text-7xl mb-4">🐔</div>
                    <p className="text-2xl font-bold">Happy Chickens</p>
                    <p className="text-sm mt-3 px-4">GIF Placeholder: Our chickens roaming freely on the farm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Fruits Carousel */}
        <section id="fruits" className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Seasonal Orchard Fruits</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Fresh, tree-ripened fruits harvested at peak flavor from our West Pokot orchards
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8 shadow-xl">
                <div className="text-6xl mb-4">🥭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Mangoes</h3>
                <p className="text-gray-700 mb-4">Sweet, juicy mangoes perfect for smoothies and desserts</p>
                <div className="bg-white rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Image Placeholder</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-lime-200 rounded-2xl p-8 shadow-xl">
                <div className="text-6xl mb-4">🍈</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Melons</h3>
                <p className="text-gray-700 mb-4">Refreshing watermelons and sweet melons</p>
                <div className="bg-white rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Image Placeholder</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl p-8 shadow-xl">
                <div className="text-6xl mb-4">🍎</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Seasonal Mix</h3>
                <p className="text-gray-700 mb-4">Various fruits depending on harvest season</p>
                <div className="bg-white rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Image Placeholder</p>
                </div>
              </div>
            </div>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-xl shadow-xl">
                Shop Fresh Fruits
              </Button>
            </Link>
          </div>
        </section>

        {/* Farm-to-Table Timeline */}
        <section id="farm-to-table" className="py-16 md:py-24 bg-gradient-to-br from-[#2B2B2B] to-[#56704E] text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Order's Journey</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                From our farm in West Pokot to your table in under 48 hours
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🌱
                  </div>
                  <h3 className="text-xl font-bold mb-2">Day 1: Harvest</h3>
                  <p className="text-gray-300">Fresh products picked at peak quality</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    📦
                  </div>
                  <h3 className="text-xl font-bold mb-2">Day 1: Pack</h3>
                  <p className="text-gray-300">Carefully packaged with eco-friendly materials</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🚚
                  </div>
                  <h3 className="text-xl font-bold mb-2">Day 2: Ship</h3>
                  <p className="text-gray-300">Express delivery to your location</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🏠
                  </div>
                  <h3 className="text-xl font-bold mb-2">Day 2: Enjoy</h3>
                  <p className="text-gray-300">Farm-fresh goodness on your table</p>
                </div>
              </div>
              <div className="mt-12 bg-gray-200 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🚜➡️🏡</div>
                  <p className="text-xl font-semibold">Delivery Process Animation</p>
                  <p className="text-sm mt-2">GIF Placeholder: Animated journey from farm to doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Story Section */}
        <section id="story" className="py-16 md:py-24 bg-gradient-to-br from-[#FCFBF8] via-[#F2D7A7] to-[#FCFBF8] relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Our West Pokot Story</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From humble beginnings to a diversified farm built on principles of sustainability and community in West Pokot.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 animate-fade-in-left">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg"
                    alt="Edau Farm - Our Farming Story"
                    className="w-full h-96 object-cover"
                  />
                </div>
              </div>
              
              <div className="md:w-1/2 animate-fade-in-right">
                <div className="max-w-lg space-y-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Edau Farm began in 2015 when our family decided to transform our ancestral land in West Pokot 
                    into a sustainable farm that would honor traditional farming wisdom while embracing modern, 
                    eco-friendly practices.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Today, we've grown into a diversified agribusiness with four thriving product lines: 
                    our award-winning Acacia honey from the rich forests of West Pokot, premium Dorper sheep breeding program, 
                    seasonal fruit orchards, and humanely raised free-range poultry.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Every product from Edau Farm is raised with care, harvested with respect for nature, and 
                    brought to you with our commitment to quality and sustainability in West Pokot.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center bg-white/50 rounded-lg p-3">
                    <HeartHandshake className="h-6 w-6 text-red-600 mr-3" />
                    <span className="text-gray-800 font-semibold">Locally Run</span>
                  </div>
                  <div className="flex items-center bg-white/50 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-amber-600 mr-3" />
                    <span className="text-gray-800 font-semibold">Since 2015</span>
                  </div>
                  <div className="flex items-center bg-white/50 rounded-lg p-3">
                    <Users className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-gray-800 font-semibold">Community First</span>
                  </div>
                </div>
                
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-8 py-3 text-lg shadow-xl transform hover:scale-105 transition-all duration-300">
                    Meet Our Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
