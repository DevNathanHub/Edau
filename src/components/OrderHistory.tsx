
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Package, CheckCircle } from "lucide-react";
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
    <div>
      <h2 className="text-xl font-semibold mb-6">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-500">Order #{order.id.slice(0, 8)}</span>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    order.status === "delivered" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {order.status === "delivered" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Package className="h-3 w-3 mr-1" />
                    )}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name || 'Unknown Product'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">KSh {item.unit_price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      KSh {order.total_amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="p-4 flex justify-between items-center border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Payment Method: Credit Card
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {order.tracking_number && (
                    <div className="text-sm text-blue-600">
                      Tracking: {order.tracking_number}
                    </div>
                  )}
                  {order.delivery_date && (
                    <div className="text-sm text-green-600">
                      Expected Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                    </div>
                  )}
                  <Link to={`/receipt/${order.id}`}>
                    <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                      <FileText className="h-4 w-4 mr-1" />
                      View Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
