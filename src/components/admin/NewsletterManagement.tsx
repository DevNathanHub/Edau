import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { NewsletterSubscriber } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Users, Download } from "lucide-react";

const NewsletterManagement: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubscribers = async () => {
    setLoading(true);
    setError("");
    const res = await apiService.getNewsletterSubscribers();
    if (res.error) setError(res.error);
    const subsArr = res.data || [];
    setSubscribers(subsArr as NewsletterSubscriber[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const exportToCSV = () => {
    const headers = ["Email", "Name", "Subscribed Date"];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.name || "N/A",
      sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "N/A"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2F2F2F] mb-2">Newsletter Management</h2>
        <p className="text-gray-600">Manage your email subscribers for seasonal updates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
                <p className="text-2xl font-bold text-[#2F2F2F]">{subscribers.length}</p>
              </div>
              <div className="bg-[#F4B400] bg-opacity-20 p-3 rounded-full">
                <Users className="w-6 h-6 text-[#F4B400]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-[#2F2F2F]">
                  {subscribers.filter(s => {
                    const subDate = s.subscribedAt ? new Date(s.subscribedAt) : null;
                    const now = new Date();
                    return subDate && 
                      subDate.getMonth() === now.getMonth() && 
                      subDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Button 
              className="w-full bg-[#4CAF50] hover:bg-[#45a049]"
              onClick={exportToCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && <div className="text-red-600 mb-2 p-3 bg-red-50 rounded">{error}</div>}
      
      {loading ? (
        <div>Loading subscribers...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Subscribed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber._id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || "N/A"}</TableCell>
                  <TableCell>
                    {subscriber.subscribedAt 
                      ? new Date(subscriber.subscribedAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {subscribers.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No subscribers yet</p>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;
