
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, sidebar, title }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile sidebar toggle button */}
        <div className="lg:hidden p-4 flex items-center justify-between bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-0 z-40 flex lg:static lg:z-auto lg:h-auto",
            !isMobileSidebarOpen && "hidden lg:flex"
          )}
        >
          {/* Mobile sidebar backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600/75 lg:hidden" 
            aria-hidden="true"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Sidebar content */}
          <div 
            className={cn(
              "relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200 transition-all duration-200 ease-in-out",
              isSidebarCollapsed && "lg:max-w-[4.5rem]",
              "lg:max-w-[16rem]"
            )}
          >
            {/* Mobile sidebar close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2 lg:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="ml-1 text-white"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Sidebar content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="h-16 flex-shrink-0 px-4 flex items-center justify-between">
                <h2 className={cn(
                  "text-lg font-semibold transition-opacity duration-200",
                  isSidebarCollapsed && "lg:opacity-0"
                )}>
                  {title}
                </h2>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex-1">{sidebar}</div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 pb-[60px] lg:pb-0 overflow-x-hidden">
          {/* Desktop title */}
          <div className="hidden lg:block p-6 pb-0">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          
          <div className="px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;
