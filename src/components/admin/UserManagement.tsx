import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { User } from "@/lib/types";
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
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    const res = await apiService.getUsers();
    if (res.error) setError(res.error);
    const usersArr = (res.data && (res.data as any).data) || [];
    setUsers(usersArr as User[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setShowEditDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!editUser?._id) return;
    setLoading(true);
    setError("");
    const res = await apiService.updateUser(editUser._id as string, form);
    if (res.error) setError(res.error);
    setShowEditDialog(false);
    setEditUser(null);
    setForm({});
    await fetchUsers();
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
    const res = await apiService.deleteUser(deleteId);
    if (res.error) setError(res.error);
    setShowDeleteDialog(false);
    setDeleteId(null);
    await fetchUsers();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">User Management</h2>
      <p>Here you can view, edit, and delete users.</p>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(user._id!)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium">First Name</label>
              <input
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Last Name</label>
              <input
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Phone</label>
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Address</label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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
    </div>
  );
};

export default UserManagement;
