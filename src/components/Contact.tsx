import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ShoppingCart, Calendar, Tractor } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api";

const contactOptions = [
  {
    icon: <ShoppingCart className="h-5 w-5 text-amber-600" />,
    title: "Product Orders",
    description: "Place an order for our farm products"
  },
  {
    icon: <Calendar className="h-5 w-5 text-green-600" />,
    title: "Farm Visits",
    description: "Schedule a tour or experience day"
  },
  {
    icon: <Tractor className="h-5 w-5 text-red-600" />,
    title: "Bulk Orders",
    description: "Business inquiries and wholesale"
  },
  {
    icon: <Mail className="h-5 w-5 text-blue-600" />,
    title: "General Inquiries",
    description: "Questions and other information"
  }
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    message: ""
  });
  const [emailSubscribe, setEmailSubscribe] = useState("");
  const [nameSubscribe, setNameSubscribe] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      inquiryType: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save message to database
      await apiService.createContactMessage({
        name: formData.name,
        email: formData.email,
        inquiry_type: formData.inquiryType,
        message: formData.message
      });
      
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible!",
      });
      
      setFormData({
        name: "",
        email: "",
        inquiryType: "",
        message: ""
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailSubscribe) return;
    
    setIsSubscribing(true);
    try {
      // Save subscription to database
      const result = await apiService.subscribeNewsletter(emailSubscribe, nameSubscribe || undefined);
      
      if (result.error) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
        });
      } else {
        toast({
          title: "Subscription successful",
          description: "Thank you for subscribing to our newsletter!",
        });
      }
      
      setEmailSubscribe("");
      setNameSubscribe("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section id="contact" className="h-full flex items-center bg-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or interested in placing an order? Reach out to us!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="space-y-6">
              {contactOptions.map((option, index) => (
                <Card key={index} className="border-none shadow-sm hover:shadow transition-shadow">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-gray-100">
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{option.title}</h3>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-none shadow-sm bg-green-600 text-white">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Newsletter</h3>
                  <p className="text-sm mb-4">Subscribe to receive seasonal updates and farming tips</p>
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <Input 
                      placeholder="Your name (optional)" 
                      className="bg-white text-gray-900" 
                      value={nameSubscribe}
                      onChange={(e) => setNameSubscribe(e.target.value)}
                    />
                    <div className="flex">
                      <Input 
                        placeholder="Your email" 
                        className="bg-white text-gray-900 rounded-r-none flex-1" 
                        value={emailSubscribe}
                        onChange={(e) => setEmailSubscribe(e.target.value)}
                        required
                      />
                      <Button 
                        type="submit" 
                        className="rounded-l-none bg-amber-600 hover:bg-amber-700 px-4"
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? "Processing..." : "Subscribe"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Your Name</label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Your Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="inquiryType" className="block mb-2 text-sm font-medium text-gray-700">Inquiry Type</label>
                <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select inquiry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product-order">Product Order</SelectItem>
                    <SelectItem value="farm-visit">Farm Visit Booking</SelectItem>
                    <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                    <SelectItem value="general">General Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">Message</label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us what you're interested in..." 
                  rows={4} 
                  required
                  className="min-h-[120px]"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
