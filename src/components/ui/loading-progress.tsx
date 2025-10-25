
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "react-router-dom";

export function LoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start loading when location changes
    setIsLoading(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        // Speed up as we get closer to 100%
        const increment = prevProgress < 30 ? 10 : prevProgress < 60 ? 5 : prevProgress < 90 ? 2 : 0.5;
        const nextProgress = Math.min(prevProgress + increment, 98);
        
        return nextProgress;
      });
    }, 150);

    // Complete the progress bar and hide it
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [location.pathname]);

  // Don't render anything when not loading or fully loaded
  if (!isLoading) return null;

  return (
    <div className="fixed top-[72px] sm:top-[76px] w-full z-50">
      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  );
}
