import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { UserFeedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageSquare, Star, Reply, CheckCircle, Clock, AlertCircle } from "lucide-react";

const FeedbackManagement: React.FC = () => {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    const res = await apiService.getFeedback();
    if (res.error) setError(res.error);
    const feedbackArr = (res.data && (res.data as any).data) || [];
    setFeedback(feedbackArr as UserFeedback[]);
    setFilteredFeedback(feedbackArr as UserFeedback[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    let filtered = feedback;

    if (filterStatus !== "all") {
      filtered = filtered.filter(f => f.status === filterStatus);
    }

    setFilteredFeedback(filtered);
  }, [filterStatus, feedback]);

  const handleRespond = (feedbackItem: UserFeedback) => {
    setSelectedFeedback(feedbackItem);
    setResponseText(feedbackItem.admin_response || "");
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setLoading(true);
    try {
      // Add reply to feedback thread
      const replyResult = await fetch(`/api/feedback/${selectedFeedback._id || selectedFeedback.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reply_text: responseText }),
      });

      if (!replyResult.ok) {
        throw new Error('Failed to add reply');
      }

      // Refresh feedback list
      await fetchFeedback();
      setShowResponseDialog(false);
      setSelectedFeedback(null);
      setResponseText("");
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'responded': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'responded': return <CheckCircle className="w-4 h-4" />;
      case 'resolved': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-shadow">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Review and respond to user feedback</p>
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {feedback.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Responded</p>
                <p className="text-2xl font-bold text-green-600">
                  {feedback.filter(f => f.status === 'responded').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {feedback.length > 0
                    ? (feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) /
                       feedback.filter(f => f.rating).length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              All ({feedback.length})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pending ({feedback.filter(f => f.status === 'pending').length})
            </Button>
            <Button
              variant={filterStatus === "responded" ? "default" : "outline"}
              onClick={() => setFilterStatus("responded")}
              size="sm"
            >
              Responded ({feedback.filter(f => f.status === 'responded').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map(item => (
          <Card key={item._id} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(item.status || 'pending')}`}>
                    {getStatusIcon(item.status || 'pending')}
                    <span className="ml-1 capitalize">{item.status || 'pending'}</span>
                  </Badge>
                  <Badge variant="outline">{item.category || 'General'}</Badge>
                  {renderStars(item.rating)}
                </div>
                <div className="text-sm text-gray-500">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">{item.feedback_text}</p>
              </div>

              {/* Display threaded conversation */}
              {item.replies && item.replies.length > 0 && (
                <div className="mb-4 space-y-3">
                  {item.replies.map((reply: any, index: number) => (
                    <div key={reply.id || index} className="bg-blue-50 border-l-4 border-blue-400 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Admin Response</span>
                        <span className="text-xs text-blue-600">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-700">{reply.reply_text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRespond(item)}
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {item.replies && item.replies.length > 0 ? 'Add Reply' : 'Reply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Provide a helpful response to the user's feedback
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Original Feedback:</h4>
              <p className="text-gray-700">{selectedFeedback?.feedback_text}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResponseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;
