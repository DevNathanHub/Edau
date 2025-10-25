import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, ShoppingCart, Calendar, Phone, Star, CheckCircle, ArrowRight } from "lucide-react";

const AIChatSection = () => {
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-[#4CAF50]" />,
      title: "24/7 Instant Support",
      description: "Get answers to your questions anytime, day or night"
    },
    {
      icon: <ShoppingCart className="h-6 w-6 text-[#FFC107]" />,
      title: "Easy Order Placement",
      description: "Place orders, check availability, and track deliveries"
    },
    {
      icon: <Calendar className="h-6 w-6 text-[#8D6E63]" />,
      title: "Farm Visit Booking",
      description: "Schedule tours and special farm experiences"
    },
    {
      icon: <Star className="h-6 w-6 text-[#81C784]" />,
      title: "Personalized Recommendations",
      description: "Get tailored product suggestions based on your preferences"
    }
  ];

  const quickActions = [
    "Tell me about your honey products",
    "I'd like to book a farm visit",
    "What fruits are in season?",
    "How do I place an order?"
  ];

  return (
    <section id="ai-chat" className="min-h-screen flex items-center py-16 bg-gradient-to-r from-[#FFF8E1] to-[#81C784]/10 relative">
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
          <div className="inline-flex items-center bg-[#4CAF50] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Powered by AI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Meet Your AI Farm Assistant
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the future of farm shopping with our intelligent AI assistant.
            Get instant answers, personalized recommendations, and seamless ordering — all through natural conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Try It Now</h3>
              <p className="text-gray-600">Click any question below to see how our AI assistant responds</p>
            </div>

            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => {
                    // Trigger chat assistant with this message
                    const chatButton = document.querySelector('[data-chat-trigger]');
                    if (chatButton) {
                      (chatButton as HTMLElement).click();
                      // Could also pre-fill the message, but for now just open chat
                    }
                  }}
                >
                  <span className="text-gray-700">{action}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                </Button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    "I'd be happy to help you discover our premium honey collection! We have raw honey, citrus-infused varieties, and medicinal herbal honey. Which type interests you most?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Our AI Assistant?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI assistant combines farm expertise with modern technology to provide you with the best possible experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Expert Knowledge</h4>
              <p className="text-gray-600 text-sm">
                Trained on years of farm experience and product knowledge to give you accurate, helpful information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Lightning Fast</h4>
              <p className="text-gray-600 text-sm">
                Get instant responses without waiting. No phone queues, no busy signals — just immediate assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Sales Focused</h4>
              <p className="text-gray-600 text-sm">
                Designed to help you find the perfect products and complete purchases with ease and confidence.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white"
              onClick={() => {
                const chatButton = document.querySelector('[data-chat-trigger]');
                if (chatButton) {
                  (chatButton as HTMLElement).click();
                }
              }}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Chatting Now
            </Button>
            <p className="text-sm text-gray-500 mt-2">Available 24/7 • No signup required</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChatSection;