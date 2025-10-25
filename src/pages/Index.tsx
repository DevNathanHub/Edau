
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Calendar, Users, Star, Award, Truck, Shield, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main>
        <Hero />
        <Features />

        {/* Statistics Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4">
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
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Limited Time Offers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't miss these exclusive deals on our farm-fresh products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-amber-500">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-amber-500 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">First Order Discount</h3>
                </div>
                <p className="text-gray-600 mb-6">Get 15% off your first purchase with code WELCOME15</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">Valid until Dec 31</span>
                  <Link to="/products">
                    <Button className="bg-amber-600 hover:bg-amber-700">Shop Now</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
                <div className="flex items-center mb-4">
                  <Truck className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Free Delivery</h3>
                </div>
                <p className="text-gray-600 mb-6">Free delivery on orders over KSh 3,000 within Nairobi</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">Always Available</span>
                  <Link to="/products">
                    <Button className="bg-green-600 hover:bg-green-700">Order Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">What Our Customers Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from families who choose Edau Farm for their fresh, natural products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The honey is absolutely incredible! We've been buying from Edau Farm for 2 years now,
                  and the quality never disappoints. Our kids love the farm visits too!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    SM
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Sarah Muthoni</div>
                    <div className="text-sm text-gray-600">Regular Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Fresh eggs every week and the fruits are always perfectly ripe. The family pack
                  is perfect for our household of 5. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    JK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">James Kiprop</div>
                    <div className="text-sm text-gray-600">Family Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The farm visit was amazing! Our children learned so much about sustainable farming.
                  The chicken we bought was the most flavorful we've ever had."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
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
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Life at Edau Farm</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Take a glimpse into our daily operations and see how we care for our animals and crops
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Placeholder for Farm Images/GIFs */}
              <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center shadow-md">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🐝</div>
                  <p className="font-medium">Bee Keeping</p>
                  <p className="text-sm">GIF/Image Placeholder</p>
                </div>
              </div>

              <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center shadow-md">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🐔</div>
                  <p className="font-medium">Free-Range Poultry</p>
                  <p className="text-sm">GIF/Image Placeholder</p>
                </div>
              </div>

              <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center shadow-md">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🍎</div>
                  <p className="font-medium">Fruit Harvest</p>
                  <p className="text-sm">GIF/Image Placeholder</p>
                </div>
              </div>

              <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center shadow-md">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🐑</div>
                  <p className="font-medium">Dorper Sheep</p>
                  <p className="text-sm">GIF/Image Placeholder</p>
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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Why Choose Edau Farm?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're committed to quality, sustainability, and building lasting relationships with our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">100% Natural</h3>
                <p className="text-gray-600">
                  No antibiotics, no hormones, no artificial additives. Just pure, natural farm products.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Family Owned</h3>
                <p className="text-gray-600">
                  Three generations of farming expertise, ensuring the highest standards of care and quality.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Fresh Delivery</h3>
                <p className="text-gray-600">
                  Direct from farm to your door within 24 hours of harvest, ensuring maximum freshness.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Farm Story</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From humble beginnings to a diversified farm built on principles of sustainability and community.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-gray-600">
                    <div className="text-8xl mb-6">👨‍🌾</div>
                    <h3 className="text-2xl font-semibold mb-3">Our Farming Story</h3>
                    <p className="text-lg">Dedicated to sustainable agriculture</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="max-w-lg space-y-4">
                  <p className="text-gray-700">
                    Edau Farm began in 2015 when our family decided to transform our ancestral land into a 
                    sustainable farm that would honor traditional farming wisdom while embracing modern, 
                    eco-friendly practices.
                  </p>
                  <p className="text-gray-700">
                    Today, we've grown into a diversified agribusiness with four thriving product lines: 
                    our award-winning honey, premium Dorper sheep breeding program, seasonal fruit orchards, 
                    and humanely raised free-range poultry.
                  </p>
                  <p className="text-gray-700">
                    Every product from Edau Farm is raised with care, harvested with respect for nature, and 
                    brought to you with our commitment to quality and sustainability.
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
