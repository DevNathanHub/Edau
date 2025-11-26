
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, CreditCard, MapPin, Truck, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/components/Cart";
import { apiService } from "@/lib/api";
import { initiatePayment, checkPaymentStatus } from "@/integrations/payment/lipia";
import { Progress } from "@/components/ui/progress";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'whatsapp'>('mpesa');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const { getCartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const cartItems = getCartItems();
  const cartTotal = getCartTotal();

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const result = await apiService.getProduct(id);
          if (result.error) throw new Error(result.error);
          const payload: any = result.data;
          const p = payload?.data || payload;
          if (!p) throw new Error('Product not found');
          setProduct({
            id: p.id || p._id || p._id?.toString?.(),
            name: p.name,
            description: p.description || '',
            price: Number(p.price || 0),
            stock: Number(p.stock ?? 10),
            image_url: p.image_url || p.image || '',
          });
          // Get quantity from URL if available
          const urlParams = new URLSearchParams(window.location.search);
          const qtyParam = urlParams.get('quantity');
          if (qtyParam) {
            const qty = parseInt(qtyParam);
            if (!isNaN(qty) && qty > 0) {
              setQuantity(qty);
            }
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast({
            title: "Error",
            description: "Failed to load product. Please try again later.",
          });
        }
      }
    };

    fetchProduct();
    
    // Pre-fill user data if available
    if (user) {
      // User profile now comes from auth context
      if (user) {
        setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
        setPhone(user.phone || '');
        setAddress(user.address || '');
      }
    }
  }, [id, user]);

  // Function to handle payment status check
  const checkPayment = async (transactionRef: string, orderId: string) => {
    setPaymentProcessing(true);
    setPaymentProgress(30);
    
    // Set up a counter to check payment status multiple times
    let checkCount = 0;
    const maxChecks = 12; // Check for up to 1 minute (12 * 5s)
    
    const checkInterval = setInterval(async () => {
      try {
        checkCount++;
        setPaymentProgress(30 + (checkCount / maxChecks) * 60);
        
        const statusResult = await apiService.checkPaymentStatus(transactionRef);
        
        // Check if payment is successful (Lipia API returns status in data.response or data.status)
        const response = statusResult.data?.response || statusResult;
        const isSuccess = response?.Status === 'SUCCESS' || response?.status === true || (response?.ResultCode === 0 && response?.MpesaReceiptNumber);
        const isFailed = response?.Status === 'FAILED' || (response?.status === false && response?.ResultCode > 0);
        
        if (isSuccess) {
          // Payment successful
          clearInterval(checkInterval);
          setPaymentProgress(100);
          
          const amount = cartItems.length > 0 ? cartTotal : (product ? product.price * quantity : 0);
          toast({
            title: "Payment Successful!",
            description: `Your payment of KSh ${amount.toLocaleString()} has been received.`,
          });
          
          // Update order status in database
          if (orderId && user) {
            try {
              await apiService.updateOrder(orderId, {
                status: 'paid',
                mpesa_receipt_number: response?.MpesaReceiptNumber || '',
                payment_reference: transactionRef
              });
            } catch (updateError) {
              console.error('Failed to update order status:', updateError);
            }
          }
          
          // Navigate to receipt page
          clearCart();
          setPaymentProcessing(false);
          navigate(`/receipt/${orderId || 'order'}`);
        } else if (isFailed) {
          // Payment failed
          clearInterval(checkInterval);
          setPaymentProcessing(false);
          setPaymentProgress(0);
          toast({
            title: "Payment Failed",
            description: response?.ResultDesc || "Payment was not completed. Please try again.",
            variant: "destructive",
          });
        } else if (checkCount >= maxChecks) {
          // Stop checking after max attempts
          clearInterval(checkInterval);
          setPaymentProcessing(false);
          setPaymentProgress(0);
          toast({
            title: "Payment Status Unknown",
            description: "Please check your M-Pesa messages to confirm if payment was successful.",
          });
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          setPaymentProcessing(false);
          setPaymentProgress(0);
          toast({
            title: "Status Check Failed",
            description: "Could not verify payment status. Please check your M-Pesa messages.",
            variant: "destructive",
          });
        }
      }
    }, 5000); // Check every 5 seconds
  };

  const handleCheckout = async () => {
    if (loading || paymentProcessing) return;
    
    if (paymentMethod === 'mpesa' && !phone) {
      toast({
        title: "Phone number required",
        description: "Please enter your M-Pesa phone number to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (paymentMethod === 'mpesa') {
        const amount = cartItems.length > 0 ? cartTotal : (product ? product.price * quantity : 0);
        
        toast({
          title: "Processing M-Pesa Payment",
          description: "Please check your phone for the M-Pesa prompt.",
        });
        
        // Initiate payment using Lipia API
        const paymentResult = await initiatePayment(phone, amount);
        
        if (!paymentResult.data) {
          toast({
            title: "Payment Failed",
            description: paymentResult.message,
            variant: "destructive",
          });
          setLoading(false);
        } else {
          toast({
            title: "Payment Request Sent!",
            description: "Please complete the payment on your phone.",
          });
          
          // Create order first, then initiate payment with order ID as external_reference
          let orderId = '';
          if (user) {
            try {
              // Create order record first
              const createRes = await apiService.createOrder({
                user_id: user._id,
                total_amount: amount,
                status: 'pending',
                name: name || undefined,
                address: address || undefined,
                phone: phone || undefined,
                items: cartItems.length > 0 
                  ? cartItems.map(item => ({
                      product_id: item.id,
                      quantity: item.quantity,
                      unit_price: item.price,
                      product_name: item.name
                    }))
                  : [{
                      product_id: product?.id,
                      quantity: quantity,
                      unit_price: product?.price || 0,
                      product_name: product?.name || 'Product'
                    }]
              });
              if (createRes.error) throw new Error(createRes.error);
              const created: any = createRes.data;
              const createdOrder = created?.data || created;
              orderId = createdOrder?.id || createdOrder?._id || '';
                
              // Start checking payment status
              checkPayment(paymentResult.data.CheckoutRequestID, orderId);
            } catch (error) {
              console.error("Error saving order:", error);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      } else if (paymentMethod === 'whatsapp') {
        const phone = "254727690165"; // Format for WhatsApp: country code + number without leading 0
        
        // Create WhatsApp message with cart items
        let message = "Hello! I'd like to order the following items from Edau Farm:\n\n";
        
        if (cartItems.length > 0) {
          cartItems.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (KSh ${(item.price * item.quantity).toLocaleString()})\n`;
          });
          message += `\nTotal: KSh ${cartTotal.toLocaleString()}`;
          
          if (name) message += `\n\nName: ${name}`;
          if (address) message += `\nDelivery Address: ${address}`;
        } else if (product) {
          message += `- ${quantity}x ${product.name} (KSh ${(product.price * quantity).toLocaleString()})`;
          message += `\nTotal: KSh ${(product.price * quantity).toLocaleString()}`;
          
          if (name) message += `\n\nName: ${name}`;
          if (address) message += `\nDelivery Address: ${address}`;
        }
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp link
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        clearCart();
        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle case where there's no product ID but cart has items
  useEffect(() => {
    if (!id && cartItems.length === 0) {
      navigate('/products');
    }
  }, [id, cartItems, navigate]);

  if (!product && !cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalAmount = cartItems.length > 0 
    ? cartTotal
    : (product ? product.price * quantity : 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to={cartItems.length > 0 ? "/products" : `/products/${id}`} className="inline-flex items-center text-green-600 hover:text-green-800">
              <ArrowLeft className="mr-2 h-5 w-5" />
              {cartItems.length > 0 ? "Back to Products" : "Back to Product"}
            </Link>
          </div>
          
          {paymentProcessing && (
            <div className="mb-6">
              <p className="text-green-700 font-medium mb-2">Processing your payment...</p>
              <Progress value={paymentProgress} className="h-2 bg-green-100" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h1>
              
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center border-b border-gray-200 pb-4">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden mr-4">
                        <img 
                          src={item.image || `https://placehold.co/200x200?text=${encodeURIComponent(item.name.charAt(0))}`} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-500">KSh {item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="font-semibold">
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-4 font-bold">
                    <span>Total:</span>
                    <span>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : product ? (
                <div>
                  <div className="flex items-center border-b border-gray-200 pb-4">
                    <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-md mb-4 mr-4" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg">Quantity: {quantity}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 font-bold">
                    <span>Total:</span>
                    <span>KSh {(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              ) : null}
              
              <div className="mt-6 bg-green-50 p-4 rounded-md flex items-start">
                <Truck className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Free delivery on all orders!</p>
                  <p className="text-green-700 text-sm">Your items will be delivered within 2-3 business days.</p>
                </div>
              </div>
            </div>
            
            {/* Checkout Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-700">Payment Details</h2>
              
              <div className="mb-6 space-y-4">
                <div>
                  <p className="font-medium mb-2">Select Payment Method:</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`flex items-center border p-3 rounded-md ${
                        paymentMethod === 'mpesa' 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <CreditCard className={`h-5 w-5 mr-2 ${paymentMethod === 'mpesa' ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={paymentMethod === 'mpesa' ? 'text-green-700' : 'text-gray-700'}>M-Pesa</span>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`flex items-center border p-3 rounded-md ${
                        paymentMethod === 'whatsapp' 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <MessageSquare className={`h-5 w-5 mr-2 ${paymentMethod === 'whatsapp' ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={paymentMethod === 'whatsapp' ? 'text-green-700' : 'text-gray-700'}>WhatsApp Order</span>
                    </button>
                  </div>
                </div>
                
                {/* Payment method specific fields */}
                {paymentMethod === 'mpesa' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">M-Pesa Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        placeholder="07XX XXX XXX" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        placeholder="Your Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Delivery Address</label>
                      <textarea 
                        id="address" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        placeholder="Your Address" 
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      ></textarea>
                    </div>
                  </>
                )}
                
                {paymentMethod === 'whatsapp' && (
                  <>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-4">
                      <p>You'll be redirected to WhatsApp to complete your order. Please include your delivery details when chatting with us.</p>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Full Name (Optional)</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        placeholder="Your Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Delivery Address (Optional)</label>
                      <textarea 
                        id="address" 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        placeholder="Your Address" 
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center" 
                onClick={handleCheckout}
                disabled={loading || paymentProcessing || (!product && !cartItems.length)}
              >
                {paymentMethod === 'mpesa' ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {loading || paymentProcessing ? "Processing..." : `Pay KSh ${totalAmount.toLocaleString()} with M-Pesa`}
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Complete Order via WhatsApp
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-sm text-gray-600">
                <MapPin className="inline-block mr-1 h-4 w-4" /> Secure checkout guaranteed.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
