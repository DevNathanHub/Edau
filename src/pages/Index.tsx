
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import AIChatSection from "../components/AIChatSection";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Calendar, Users, Star, Award, Truck, Shield, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const sections = [
    { id: 'hero', name: 'Home' },
    { id: 'features', name: 'Features' },
    { id: 'ai-chat', name: 'AI Assistant' },
    { id: 'statistics', name: 'Our Impact' },
    { id: 'offers', name: 'Special Offers' },
    { id: 'testimonials', name: 'Testimonials' },
    { id: 'gallery', name: 'Farm Gallery' },
    { id: 'why-choose', name: 'Why Choose Us' },
    { id: 'story', name: 'Our Story' },
    { id: 'contact', name: 'Contact' }
  ];

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

  // Handle scroll navigation
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isScrolling) return;
      
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = Math.max(0, Math.min(sections.length - 1, currentSection + direction));
      
      if (nextSection !== currentSection) {
        e.preventDefault();
        scrollToSection(sections[nextSection].id, nextSection);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (isScrolling) return;
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextSection = Math.min(sections.length - 1, currentSection + 1);
        scrollToSection(sections[nextSection].id, nextSection);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevSection = Math.max(0, currentSection - 1);
        scrollToSection(sections[prevSection].id, prevSection);
      }
    };

    // Intersection Observer to track current section
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionIndex = sections.findIndex(section => section.id === entry.target.id);
          if (sectionIndex !== -1) {
            setCurrentSection(sectionIndex);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
      observer.disconnect();
    };
  }, [currentSection, isScrolling]);

  const scrollToSection = (sectionId: string, sectionIndex?: number) => {
    setIsScrolling(true);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      if (sectionIndex !== undefined) {
        setCurrentSection(sectionIndex);
      }
    }
    
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const navigateSection = (direction: 'up' | 'down') => {
    const nextSection = direction === 'down' 
      ? Math.min(sections.length - 1, currentSection + 1)
      : Math.max(0, currentSection - 1);
    
    scrollToSection(sections[nextSection].id, nextSection);
  };

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

      {/* Section Navigation */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 flex flex-col space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id, index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSection
                  ? 'bg-amber-600 scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              title={section.name}
            />
          ))}
        </div>
      </div>      {/* Navigation arrows */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
        <button
          onClick={() => navigateSection('up')}
          disabled={currentSection === 0}
          className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${
            currentSection === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/30 hover:scale-110'
          }`}
        >
          <ChevronUp className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => navigateSection('down')}
          disabled={currentSection === sections.length - 1}
          className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${
            currentSection === sections.length - 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/30 hover:scale-110'
          }`}
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </button>
      </div>

      <Navigation />
      <main className="snap-y snap-mandatory overflow-y-auto h-screen">
        {/* Hero Section */}
        <section id="hero" className="min-h-screen snap-start">
          <Hero />
        </section>

        {/* Features Section */}
        <section id="features" className="min-h-screen snap-start flex items-center">
          <Features />
        </section>

        {/* AI Chat Section */}
        <section id="ai-chat" className="min-h-screen snap-start flex items-center">
          <AIChatSection />
        </section>

        {/* Statistics Section */}
        <section id="statistics" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-amber-900 via-red-900 to-amber-800 text-white relative">
          {/* Authentic Maasai patterns background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Impact in West Pokot</h2>
              <p className="text-xl text-amber-100 max-w-2xl mx-auto">
                Numbers that tell the story of sustainable farming and community growth
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

        {/* Special Offers Section */}
        <section id="offers" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
          {/* Traditional farm tools pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='0.1'%3E%3Cpath d='M20 20 L60 20 L60 60 L20 60 Z M30 30 L50 30 M40 20 L40 60'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }}></div>
          </div>
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
        <section id="testimonials" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 relative">
          {/* Acacia tree silhouettes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 10 L30 40 L70 40 Z M50 40 L25 70 L75 70 Z M50 70 L20 100 L80 100 Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Voices from Our Community</h2>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Real stories from families who choose Edau Farm for their authentic, farm-fresh products
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
                  "The Acacia honey is absolutely incredible! We've been buying from Edau Farm for 2 years now,
                  and the quality never disappoints. Our kids love the farm visits too!"
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
                  "Fresh eggs every week and the fruits are always perfectly ripe. The family pack
                  is perfect for our household of 5. Highly recommend!"
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
        <section id="gallery" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 relative">
          {/* Honeycomb pattern with earth tones */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='0.1'%3E%3Cpath d='M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 52px'
            }}></div>
          </div>
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
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg"
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
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432109/edau_gallery/tb0utizepynaszqajuu6.jpg"
                  alt="Edau Farm - Honey Production"
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

        {/* Why Choose Us Section */}
        <section id="why-choose" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative">
          {/* Maasai shield pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='100' viewBox='0 0 80 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M40 10 L60 30 L60 70 L40 90 L20 70 L20 30 Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 100px'
            }}></div>
          </div>
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
                <h3 className="text-2xl font-semibold mb-4">Family Owned</h3>
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

        {/* Farm Story Section */}
        <section id="story" className="min-h-screen snap-start flex items-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
          {/* Traditional West Pokot patterns */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='0.1'%3E%3Ccircle cx='60' cy='60' r='50' fill='none' stroke='currentColor' stroke-width='2'/%3E%3Ccircle cx='60' cy='60' r='30' fill='none' stroke='currentColor' stroke-width='2'/%3E%3Cpath d='M60 10 L60 110 M10 60 L110 60' stroke='currentColor' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px'
            }}></div>
          </div>
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
                    <span className="text-gray-800 font-semibold">Family Owned</span>
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
        <section id="contact" className="min-h-screen snap-start">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
