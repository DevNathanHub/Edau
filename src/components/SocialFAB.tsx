
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

// Custom WhatsApp icon as SVG
const WhatsAppIcon = () => (
  <svg
    className="h-6 w-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.463 3.488C18.217 1.24 15.231 0 12.05 0 5.495 0 0.16 5.334 0.157 11.892c0 2.096.546 4.142 1.588 5.946L0 24l6.304-1.654a11.881 11.881 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.894-11.893 0-3.181-1.237-6.167-3.484-8.413zm-8.413 18.306h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.732.979.996-3.648-.235-.374a9.861 9.861 0 01-1.511-5.268c.002-5.45 4.437-9.884 9.891-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.892 6.994c-.003 5.45-4.437 9.884-9.894 9.884zm5.43-7.403c-.3-.15-1.77-.873-2.045-.973-.274-.099-.474-.149-.673.15-.2.3-.774.973-.949 1.173-.174.2-.349.224-.65.075-.3-.15-1.265-.466-2.411-1.485-.892-.794-1.495-1.776-1.669-2.075-.175-.3-.019-.462.131-.612.135-.134.3-.35.449-.524.15-.175.2-.3.3-.498.099-.2.05-.374-.026-.524-.074-.15-.672-1.62-.922-2.22-.243-.582-.49-.503-.673-.513a12.12 12.12 0 00-.573-.01c-.2 0-.524.074-.798.374-.274.3-1.048.873-1.048 2.127 0 1.253.91 2.463 1.036 2.662.124.2 1.753 2.676 4.25 3.756 1.995.862 2.463.936 3.344.787.538-.08 1.77-.723 2.02-1.422.247-.7.247-1.297.173-1.423-.074-.124-.273-.198-.573-.347z"
    />
  </svg>
);

const SocialFAB = () => {
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Save feedback to database
      const result = await apiService.createFeedback({
        feedback_text: feedbackText.trim(),
        category: 'Website/Product Feedback'
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Feedback received",
        description: "Thank you for your feedback! We appreciate your input.",
      });
      setFeedbackText('');
      return true; // Will close the dialog
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false; // Will keep the dialog open
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* WhatsApp button - fixed at bottom left */}
      <a 
        href="https://wa.me/254727690165" 
        target="_blank" 
        rel="noopener noreferrer"
        
        className="fixed bottom-12 left-2 h-10 w-10 flex items-center justify-center rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white z-40"
        aria-label="Contact us on WhatsApp"
      >
        <WhatsAppIcon />
      </a>

      {/* Feedback button - fixed at right side, vertically aligned */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
          
            className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 shadow-lg z-40 rounded-l-md rounded-r-none h-auto w-6 opacity-80"
            aria-label="Give feedback"
          >
            <div className="flex flex-col items-center py-2">
              <ThumbsUp size={18} className="mb-2" />
              <span className="text-xs whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)'}}>
                Feedback
              </span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by sharing your thoughts about our website and products.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Tell us what you think about our website or products..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button 
              onClick={handleFeedbackSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !feedbackText.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialFAB;
