
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, CheckCircle, Clock, Truck, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  tracking_number?: string;
  delivery_date?: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(null);
  const [txnId, setTxnId] = useState<string>("");
  const [txnPhone, setTxnPhone] = useState<string>("");
  const [txnAmount, setTxnAmount] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      if (!user?._id) {
        setOrders([]);
        return;
      }

      // Get user orders from backend
  const result = await apiService.getOrders(user._id);
      if (result.error) throw new Error(result.error);
      const payload: any = result.data;
      const list = (payload?.data || payload || []) as any[];
      // Filter by current user on client if server didn't filter
      const byUser = list.filter(o => (o.user_id || o.userId) === user._id);
      const mapped: Order[] = byUser.map((order: any) => ({
        id: order.id || order._id || order._id?.toString?.(),
        created_at: order.created_at || new Date().toISOString(),
        status: order.status || 'pending',
        total_amount: Number(order.total_amount || 0),
        tracking_number: order.tracking_number,
        delivery_date: order.delivery_date,
        items: (order.items || []).map((item: any) => ({
          id: item.id || item._id || `${order._id}-${item.product_id}`,
          product_id: item.product_id,
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price || 0),
          product_name: item.product_name || 'Product'
        }))
      }));

      setOrders(mapped);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load order history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <p className="text-gray-600">Track your purchases and delivery status</p>
        </div>
        <Link to="/products">
          <Button className="bg-green-600 hover:bg-green-700">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop More
          </Button>
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
            <Link to="/products">
              <Button className="bg-green-600 hover:bg-green-700">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="w-5 h-5 mr-2 text-green-600" />
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge 
                      variant={order.status === "delivered" ? "default" : "secondary"}
                      className={`${
                        order.status === "delivered" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      {order.status === "delivered" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        KSh {order.total_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.product_name || 'Unknown Product'}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          KSh {(item.unit_price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          KSh {item.unit_price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Details */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {order.tracking_number && (
                      <div className="flex items-center text-sm">
                        <Truck className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-gray-600">Tracking:</span>
                        <span className="ml-1 font-medium text-blue-600">{order.tracking_number}</span>
                      </div>
                    )}
                    
                    {order.delivery_date && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-gray-600">Expected:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {new Date(order.delivery_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Link to={`/receipt/${order.id}`}>
                      <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        <FileText className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                    </Link>
                    {user && (
                      <div className="ml-3">
                        {order.status !== 'paid' && (
                          <>
                            <Button size="sm" className="ml-2" onClick={() => setSubmittingOrderId(submittingOrderId === order.id ? null : order.id)}>
                              Submit MPesa Transaction
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {/* Inline MPesa submission form */}
              {submittingOrderId === order.id && (
                <CardContent className="pt-0 border-t">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium">MPesa Transaction ID</label>
                      <input type="text" className="mt-1 block w-full border px-2 py-1" value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="Enter transaction id (10 chars)" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Phone (optional)</label>
                      <input type="text" className="mt-1 block w-full border px-2 py-1" value={txnPhone} onChange={(e) => setTxnPhone(e.target.value)} placeholder="2547... or 07..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Amount (optional)</label>
                      <input type="number" className="mt-1 block w-full border px-2 py-1" value={txnAmount} onChange={(e) => setTxnAmount(e.target.value)} placeholder="Amount paid" />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2" onClick={() => { setSubmittingOrderId(null); setTxnId(''); setTxnPhone(''); setTxnAmount(''); }}>Cancel</Button>
                      <Button onClick={async () => {
                        if (!txnId || txnId.trim().length < 6) {
                          toast({ title: 'Invalid', description: 'Please enter a valid transaction id', variant: 'destructive' });
                          return;
                        }
                        try {
                          const payload: any = { transaction_id: txnId.trim() };
                          if (txnPhone) payload.phone = txnPhone.trim();
                          if (txnAmount) payload.amount = Number(txnAmount);
                          const res = await apiService.submitMpesaTransaction(order.id, payload);
                          if (res.error) throw new Error(res.error);
                          toast({ title: 'Submitted', description: 'Transaction submitted for verification', variant: 'default' });
                          setSubmittingOrderId(null);
                          setTxnId(''); setTxnPhone(''); setTxnAmount('');
                          loadOrders();
                        } catch (err) {
                          toast({ title: 'Error', description: (err as any).message || 'Failed to submit', variant: 'destructive' });
                        }
                      }}>Submit</Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
