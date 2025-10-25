
import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const statusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    const res = await apiService.getOrders();
    if (res.error) setError(res.error);
    const ordersArr = (res.data && (res.data as any).data) || [];
    setOrders(ordersArr as Order[]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await apiService.getUsers();
    if (res.data) {
      const usersArr = (res.data as any).data || [];
      setUsers(usersArr);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setStatus(order.status || "pending");
    setTrackingNumber((order as any).tracking_number || "");
    setDeliveryDate((order as any).delivery_date ? new Date((order as any).delivery_date).toISOString().split('T')[0] : "");
    setShowEditDialog(true);
  };

  const handleView = (order: Order) => {
    setViewOrder(order);
    setShowViewDialog(true);
  };

  const handleGenerateReceipt = (orderId: string) => {
    // Open receipt in new tab
    window.open(`/receipt?orderId=${orderId}`, '_blank');
  };

  const handleUpdate = async () => {
    if (!editOrder?.id) return;
    setLoading(true);
    setError("");
    const updateData: any = { status };
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (deliveryDate) updateData.delivery_date = new Date(deliveryDate).toISOString();
    const res = await apiService.updateOrder(editOrder.id as string, updateData);
    if (res.error) setError(res.error);
    setShowEditDialog(false);
    setEditOrder(null);
    setTrackingNumber("");
    setDeliveryDate("");
    await fetchOrders();
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError("");
    const res = await apiService.deleteOrder(deleteId);
    if (res.error) setError(res.error);
    setShowDeleteDialog(false);
    setDeleteId(null);
    await fetchOrders();
    setLoading(false);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : userId;
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : '';
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Order Management</h2>
      <p>Here you can view, update status, and delete orders.</p>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const oid = (order as any).id || (order as any)._id || '';
                return (
                  <TableRow key={oid}>
                    <TableCell>{getUserName(order.user_id)}</TableCell>
                    <TableCell>{order.user_id}</TableCell>
                    <TableCell>{getUserEmail(order.user_id)}</TableCell>
                    <TableCell>KSh {order.total_amount}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{(order as any).tracking_number || '-'}</TableCell>
                    <TableCell>{(order as any).delivery_date ? new Date((order as any).delivery_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString() : ""}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleView(order)}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => handleEdit(order)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" className="ml-2" onClick={() => handleGenerateReceipt(oid)}>
                        Receipt
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(oid)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order Status</DialogTitle>
            <DialogDescription>
              Update the status for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <label className="block mb-1">Status</label>
            <select
              className="border px-2 py-1 w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Tracking Number (Optional)</label>
            <input
              type="text"
              className="border px-2 py-1 w-full"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Expected Delivery Date (Optional)</label>
            <input
              type="date"
              className="border px-2 py-1 w-full"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order #{viewOrder?.id || viewOrder?._id}
            </DialogDescription>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Order ID:</label>
                  <p>{viewOrder.id || viewOrder._id}</p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p className="capitalize">{viewOrder.status}</p>
                </div>
                <div>
                  <label className="font-semibold">User ID:</label>
                  <p>{viewOrder.user_id}</p>
                </div>
                <div>
                  <label className="font-semibold">User Name:</label>
                  <p>{getUserName(viewOrder.user_id)}</p>
                </div>
                <div>
                  <label className="font-semibold">User Email:</label>
                  <p>{getUserEmail(viewOrder.user_id)}</p>
                </div>
                <div>
                  <label className="font-semibold">Total Amount:</label>
                  <p>KSh {viewOrder.total_amount}</p>
                </div>
                <div>
                  <label className="font-semibold">Created:</label>
                  <p>{viewOrder.created_at ? new Date(viewOrder.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Payment Method:</label>
                  <p>{viewOrder.payment_method || 'N/A'}</p>
                </div>
                {(viewOrder as any).tracking_number && (
                  <div>
                    <label className="font-semibold">Tracking Number:</label>
                    <p>{(viewOrder as any).tracking_number}</p>
                  </div>
                )}
                {(viewOrder as any).delivery_date && (
                  <div>
                    <label className="font-semibold">Delivery Date:</label>
                    <p>{new Date((viewOrder as any).delivery_date).toLocaleDateString()}</p>
                  </div>
                )}
                {viewOrder.shipping_address && (
                  <div className="col-span-2">
                    <label className="font-semibold">Shipping Address:</label>
                    <p>{viewOrder.shipping_address}</p>
                  </div>
                )}
                {viewOrder.notes && (
                  <div className="col-span-2">
                    <label className="font-semibold">Notes:</label>
                    <p>{viewOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
            </DialogClose>
            {viewOrder && (
              <Button onClick={() => handleGenerateReceipt((viewOrder as any).id || (viewOrder as any)._id)}>
                Generate Receipt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
