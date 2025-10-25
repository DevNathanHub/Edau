
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
import { useState } from "react";

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

  return (
    <div className="min-h-screen flex flex-col">
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
      <main>
        <Hero />
        <Features />
        <AIChatSection />

        {/* Statistics Section */}
        <section className="min-h-screen flex items-center py-16 bg-[#4CAF50] text-white relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-10">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">9+</div>
                <div className="text-green-100">Years Farming</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                <div className="text-green-100">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
                <div className="text-green-100">Farm Visits</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">4.9★</div>
                <div className="text-green-100">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="min-h-screen flex items-center py-16 bg-[#FFF8E1] relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Limited Time Offers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't miss these exclusive deals on our farm-fresh products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#FFC107]">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-[#FFC107] mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">First Order Discount</h3>
                </div>
                <p className="text-gray-600 mb-6">Get 15% off your first purchase with code WELCOME15</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#4CAF50]">Valid until Dec 31</span>
                  <Button 
                    className="bg-[#4CAF50] hover:bg-[#388E3C]" 
                    disabled={buttonStates.shopNow}
                    onClick={() => handleButtonClick('shopNow', () => navigate('/products'))}
                  >
                    {buttonStates.shopNow ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Shop Now'
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#4CAF50]">
                <div className="flex items-center mb-4">
                  <Truck className="h-8 w-8 text-[#4CAF50] mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Free Delivery</h3>
                </div>
                <p className="text-gray-600 mb-6">Free delivery on orders over KSh 3,000 within Nairobi</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#4CAF50]">Always Available</span>
                  <Button 
                    className="bg-[#4CAF50] hover:bg-[#388E3C]" 
                    disabled={buttonStates.orderNow}
                    onClick={() => handleButtonClick('orderNow', () => navigate('/products'))}
                  >
                    {buttonStates.orderNow ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Order Now'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="min-h-screen flex items-center py-16 bg-[#8D6E63]/5 relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">What Our Customers Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from families who choose Edau Farm for their fresh, natural products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-[#FFF8E1] rounded-xl p-6 shadow-md border border-[#81C784]/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFC107] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The Acacia honey is absolutely incredible! We've been buying from Edau Farm for 2 years now,
                  and the quality never disappoints. Our kids love the farm visits too!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold mr-3">
                    SM
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Sarah Muthoni</div>
                    <div className="text-sm text-gray-600">Regular Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8E1] rounded-xl p-6 shadow-md border border-[#81C784]/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFC107] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Fresh eggs every week and the fruits are always perfectly ripe. The family pack
                  is perfect for our household of 5. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold mr-3">
                    JK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">James Kiprop</div>
                    <div className="text-sm text-gray-600">Family Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8E1] rounded-xl p-6 shadow-md border border-[#81C784]/20">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFC107] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The farm visit was amazing! Our children learned so much about sustainable farming in West Pokot.
                  The chicken we bought was the most flavorful we've ever had."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold mr-3">
                    AW
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Ann Wanjiku</div>
                    <div className="text-sm text-gray-600">Farm Visit Customer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Gallery Section */}
        <section className="min-h-screen flex items-center py-16 bg-[#81C784]/10 relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Life at Edau Farm</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Take a glimpse into our daily operations and see how we care for our animals and crops
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Farm Images */}
              <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432130/edau_gallery/l391lo21ecais2upig2k.jpg"
                  alt="Edau Farm - Sustainable Farming"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg"
                  alt="Edau Farm - Fresh Produce"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432064/edau_gallery/gzmlkw1evm17yrynuphm.jpg"
                  alt="Edau Farm - Animal Husbandry"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432109/edau_gallery/tb0utizepynaszqajuu6.jpg"
                  alt="Edau Farm - Honey Production"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://res.cloudinary.com/dt05sixza/image/upload/v1761432088/edau_gallery/q0iexqygkurq4b6xi2wt.jpg"
                  alt="Edau Farm - Community Farming"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Call to action card */}
              <div className="aspect-square bg-gradient-to-br from-green-50 to-amber-50 rounded-xl flex flex-col items-center justify-center shadow-md border border-green-100">
                <div className="text-center text-gray-700 p-6">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-semibold mb-2">Visit Our Farm</h3>
                  <p className="text-sm mb-4">Experience sustainable farming firsthand</p>
                  <Link to="/farm-visit">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Book Visit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/gallery">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  View Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="min-h-screen flex items-center py-16 bg-white relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Why Choose Edau Farm?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're committed to quality, sustainability, and building lasting relationships with our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#81C784] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">100% Natural</h3>
                <p className="text-gray-600">
                  No antibiotics, no hormones, no artificial additives. Just pure, natural farm products from West Pokot.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Family Owned</h3>
                <p className="text-gray-600">
                  Three generations of farming expertise in West Pokot, ensuring the highest standards of care and quality.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Fresh Delivery</h3>
                <p className="text-gray-600">
                  Direct from our West Pokot farm to your door within 24 hours of harvest, ensuring maximum freshness.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="min-h-screen flex items-center py-16 bg-[#FFF8E1] relative">
          {/* Honeycomb background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/honeycomb.svg" 
              alt="Honeycomb pattern" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Farm Story</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From humble beginnings to a diversified farm built on principles of sustainability and community.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="https://res.cloudinary.com/dt05sixza/image/upload/v1761431588/edau_gallery/dfhnrsmuteqhheghiema.jpg"
                    alt="Edau Farm - Our Farming Story"
                    className="w-full h-96 object-cover"
                  />
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="max-w-lg space-y-4">
                  <p className="text-gray-700">
                    Edau Farm began in 2015 when our family decided to transform our ancestral land in West Pokot 
                    into a sustainable farm that would honor traditional farming wisdom while embracing modern, 
                    eco-friendly practices.
                  </p>
                  <p className="text-gray-700">
                    Today, we've grown into a diversified agribusiness with four thriving product lines: 
                    our award-winning Acacia honey from the rich forests of West Pokot, premium Dorper sheep breeding program, 
                    seasonal fruit orchards, and humanely raised free-range poultry.
                  </p>
                  <p className="text-gray-700">
                    Every product from Edau Farm is raised with care, harvested with respect for nature, and 
                    brought to you with our commitment to quality and sustainability in West Pokot.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <HeartHandshake className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Family Owned</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Since 2015</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-gray-700 font-medium">Community First</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="bg-green-600 hover:bg-green-700">Meet Our Team</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
