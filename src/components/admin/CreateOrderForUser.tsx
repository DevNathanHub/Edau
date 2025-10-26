import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { User, Product, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, User as UserIcon, Package, DollarSign, Search } from "lucide-react";

interface OrderItem {
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const CreateOrderForUser: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Order details
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    const res = await apiService.getUsers();
    if (res.data) {
      const usersArr = res.data || [];
      setUsers(Array.isArray(usersArr) ? usersArr : []);
    }
  };

  const fetchProducts = async () => {
    const res = await apiService.getProducts();
    if (res.data) {
      const productsArr = res.data || [];
      setProducts(Array.isArray(productsArr) ? productsArr : []);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === (product._id || product.id));
    if (existingItem) {
      updateQuantity(product._id || product.id!, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        product_id: product._id || product.id!,
        product,
        quantity: 1,
        unit_price: product.price,
        subtotal: product.price
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    setOrderItems(orderItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity, subtotal: item.unit_price * quantity }
        : item
    ));
  };

  const removeProductFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: selectedUser._id,
        customerName: `${selectedUser.first_name} ${selectedUser.last_name}`,
        email: selectedUser.email,
        phone: selectedUser.phone,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product_name: item.product.name
        })),
        total_amount: getTotalAmount(),
        status: "pending",
        payment_method: paymentMethod,
        shipping_address: shippingAddress || selectedUser.address,
        notes,
        orderType: "Product"
      };

      const res = await apiService.createOrder(orderData);
      if (res.error) {
        throw new Error(res.error);
      }

      toast({
        title: "Order Created",
        description: `Order created successfully for ${selectedUser.first_name} ${selectedUser.last_name}`,
      });

      // Reset form
      setSelectedUser(null);
      setOrderItems([]);
      setShippingAddress("");
      setNotes("");
      setPaymentMethod("cash");

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-shadow">Create Order for User</h1>
          <p className="text-gray-600 mt-1">Create orders on behalf of customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userSearch">Search Users</Label>
              <Input
                id="userSearch"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser?._id === user._id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.phone && (
                    <div className="text-sm text-gray-600">{user.phone}</div>
                  )}
                </div>
              ))}
            </div>

            {selectedUser && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">Selected User:</div>
                <div className="text-sm text-green-700">
                  {selectedUser.first_name} {selectedUser.last_name}
                </div>
                <div className="text-sm text-green-700">{selectedUser.email}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Add Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productSearch">Search Products</Label>
              <Input
                id="productSearch"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors"
                  onClick={() => addProductToOrder(product)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{product.name}</div>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Stock: {product.stock} {product.unit}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">
                      KSh {product.price.toLocaleString()}
                    </span>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-600">
                      KSh {item.unit_price.toLocaleString()} each
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold">KSh {item.subtotal.toLocaleString()}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeProductFromOrder(item.product_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">KSh {getTotalAmount().toLocaleString()}</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Leave empty to use user's address"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCreateOrder}
                disabled={loading || !selectedUser}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Creating Order..." : "Create Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateOrderForUser;