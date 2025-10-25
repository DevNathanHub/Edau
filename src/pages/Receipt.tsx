
import { useRef, useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiService } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_reference?: string;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product?: Product;
  }[];
}

const Receipt = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Hide progress bar
    const progressBarElement = document.querySelector(".progress-bar");
    if (progressBarElement) {
      progressBarElement.classList.add("hidden");
    }
    
    const fetchOrderData = async () => {
      if (!user) return;
      
      if (orderId) {
        try {
          // Fetch order from MongoDB API
          const { data, error } = await apiService.getOrders();
          
          if (error) {
            console.error("Error fetching order:", error);
            return;
          }
          
          // Find the specific order
          const ordersArr = ((data as any)?.data || []) as any[];
          const foundOrder = ordersArr.find((o: any) => o.id === orderId);
          
          if (foundOrder) {
            setOrder({
              id: foundOrder.id,
              status: foundOrder.status || 'pending',
              total_amount: foundOrder.total_amount || 0,
              created_at: foundOrder.created_at,
              payment_reference: foundOrder.payment_reference,
              items: [] // Items would need to be fetched separately if needed
            });
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        }
      }
      
      setLoading(false);
    };
    
    fetchOrderData();
  }, [orderId, user]);
  
  // Generate PDF from receipt content
  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Edau_Farm_Receipt_${order?.id || orderId || 'order'}.pdf`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Loading receipt...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Format date for receipt
  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center text-green-600 hover:text-green-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </button>
            
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <User className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Order Receipt</h1>
            <Button 
              onClick={generatePDF}
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          {/* Receipt content */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6" ref={receiptRef}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-xl font-semibold text-gray-800">Edau Farm</span>
                </div>
                <p className="text-gray-600">123 Farm Road</p>
                <p className="text-gray-600">Nairobi, Kenya</p>
                <p className="text-gray-600">info@edaufarm.com</p>
                <p className="text-gray-600">+254 712 345 678</p>
              </div>
              
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-1">RECEIPT</h2>
                <p className="text-gray-600"><span className="font-medium">Order ID:</span> #{order?.id || orderId || 'N/A'}</p>
                <p className="text-gray-600"><span className="font-medium">Date:</span> {formattedDate}</p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment Method:</span> M-Pesa
                  {order?.payment_reference && ` (${order.payment_reference})`}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> 
                  <span className={order?.status === 'completed' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                    {" " + (order?.status || 'Pending').toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 my-8 py-8">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 font-medium text-gray-600">Product</th>
                    <th className="py-2 font-medium text-gray-600 text-center">Quantity</th>
                    <th className="py-2 font-medium text-gray-600 text-center">Price</th>
                    <th className="py-2 font-medium text-gray-600 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0 mr-4">
                            <img 
                              src={item.product?.image_url || `https://placehold.co/200x200?text=${encodeURIComponent((item.product?.name || 'Product').charAt(0))}`} 
                              alt={item.product?.name || 'Product'} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.product?.name || 'Product'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">{item.quantity}</td>
                      <td className="py-4 text-center">KSh {item.unit_price.toLocaleString()}</td>
                      <td className="py-4 text-right">KSh {(item.unit_price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="w-full md:w-64 ml-auto">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>KSh {order?.total_amount.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span className="text-green-700">KSh {order?.total_amount.toLocaleString() || '0'}</span>
              </div>
            </div>
            
            <div className="mt-12 text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600">Thank you for your purchase!</p>
              <p className="text-sm text-gray-500 mt-2">For any questions, please contact us at support@edaufarm.com</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Receipt;
