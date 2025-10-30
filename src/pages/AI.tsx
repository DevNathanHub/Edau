import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, ShoppingCart, Calendar, Phone, Star, CheckCircle, ArrowRight, Bot, Sparkles, Users, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";

const AI = () => {
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

  const capabilities = [
    {
      icon: <Bot className="h-8 w-8 text-blue-600" />,
      title: "Intelligent Conversations",
      description: "Natural language processing for human-like interactions about our farm products and services."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-600" />,
      title: "Product Expertise",
      description: "Deep knowledge of Acacia honey varieties, seasonal fruits, Dorper sheep, and free-range poultry."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Customer Support",
      description: "Handles inquiries, complaints, and special requests with empathy and efficiency."
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Always Available",
      description: "No waiting times, no business hours - instant responses whenever you need assistance."
    }
  ];

  const quickActions = [
    "Tell me about your honey products",
    "I'd like to book a farm visit",
    "What fruits are in season?",
    "How do I place an order?",
    "What's the difference between your honey varieties?",
    "Do you offer delivery in my area?"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>AI Farm Assistant - Edau Farm | 24/7 Intelligent Chat Support</title>
        <meta name="description" content="Meet your AI farm assistant at Edau Farm. Get instant answers about products, place orders, book farm visits, and receive personalized recommendations through intelligent chat." />
        <meta name="keywords" content="AI assistant, farm chat, intelligent support, Edau Farm AI, chat bot, farm products help" />
        <meta property="og:title" content="AI Farm Assistant - Edau Farm" />
        <meta property="og:description" content="24/7 intelligent chat support for all your farm product needs" />
        <meta property="og:url" content="https://edau.loopnet.tech/ai" />
        <link rel="canonical" href="https://edau.loopnet.tech/ai" />
      </Helmet>
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center py-6 pt-0 bg-gradient-to-r from-[#FFF8E1] to-[#81C784]/10 relative">
          <div className="container mx-auto px-4 relative z-10 py-0">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-[#4CAF50] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-2" />
                Powered by AI
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                Your AI Farm Assistant
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Experience the future of farm shopping with our intelligent AI assistant.
                Get instant answers, personalized recommendations, and seamless ordering — all through natural conversation.
              </p>
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
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">What Can Our AI Do?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI assistant combines farm expertise with modern technology to provide you with exceptional service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">AI Capabilities</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Advanced AI technology trained specifically for farm products and customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {capabilities.map((capability, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="mb-4">{capability.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{capability.title}</h3>
                  <p className="text-gray-600">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Try It Out</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Click any question below to see how our AI assistant responds instantly.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-4 px-6 hover:bg-blue-50 hover:border-blue-200 transition-colors"
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

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Sample Conversation</h3>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm flex-1">
                      <p className="text-gray-800">Tell me about your honey products</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg flex-1">
                      <p className="text-blue-800">
                        "I'd be happy to help you discover our premium honey collection! We have raw Acacia honey, citrus-infused varieties, and medicinal herbal honey. Which type interests you most?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
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
      </main>

      <Footer />
    </div>
  );
};

export default AI;