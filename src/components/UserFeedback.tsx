import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { UserFeedback } from "@/lib/types";
import { MessageSquare, Star, Send, Clock, CheckCircle, Reply } from "lucide-react";

const UserFeedbackComponent: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    feedback_text: "",
    rating: "",
    category: ""
  });

  const categories = [
    "General",
    "Products",
    "Orders",
    "Farm Visits",
    "Website",
    "Customer Service"
  ];

  const fetchUserFeedback = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await apiService.getUserFeedback(user.id);
      if (res.data) {
        const feedbackArr = res.data || [];
        setFeedback(feedbackArr as UserFeedback[]);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFeedback();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.feedback_text.trim()) {
      toast({
        title: "Please enter your feedback",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const feedbackData = {
        feedback_text: formData.feedback_text,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        category: formData.category || "General",
        user_id: user?.id
      };

      const result = await apiService.createFeedback(feedbackData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your feedback! We'll review it and get back to you.",
      });

      // Reset form
      setFormData({
        feedback_text: "",
        rating: "",
        category: ""
      });

      // Refresh feedback list
      fetchUserFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
      case 'resolved': return <Reply className="w-4 h-4" />;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">Share your thoughts and see our responses</p>
      </div>

      {/* Submit Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Submit Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (Optional)
              </label>
              <Select value={formData.rating} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate your experience (1-5)" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback *
              </label>
              <Textarea
                value={formData.feedback_text}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback_text: e.target.value }))}
                placeholder="Tell us what you think..."
                rows={4}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Your Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-500">Share your thoughts above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
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

                  <div className="mb-3">
                    <p className="text-gray-800">{item.feedback_text}</p>
                  </div>

                  {/* Display threaded conversation */}
                  {item.replies && item.replies.length > 0 && (
                    <div className="space-y-3">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserFeedbackComponent;