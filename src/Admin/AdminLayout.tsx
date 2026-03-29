import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Calendar, 
  Award, 
  Users, 
  LogOut,
  CalendarDays,
  Landmark,
  Layers,
  BookOpen
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface AdminLayoutProps {
  children?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pendingBlogCount, setPendingBlogCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "blogs"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingBlogCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);
  
  // Debug tab changes
  useEffect(() => {
    console.log("AdminLayout: activeTab changed to:", activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect happens via the AuthProvider/ProtectedRoute
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="flex flex-col lg:flex-row min-h-screen h-screen bg-slate-50 dark:bg-slate-900">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-slate-200 dark:border-slate-800 p-3 xl:p-4 sticky top-0 h-screen overflow-hidden">
            {/* Top section with logo */}
            <div className="flex items-center mb-4 xl:mb-6">
              <LayoutDashboard className="h-5 w-5 xl:h-6 xl:w-6 mr-1.5 xl:mr-2" />
              <h1 className="text-lg xl:text-xl font-bold">IEEE Admin</h1>
            </div>
            
            {/* Navigation links - adding overflow for scroll */}
            <nav className="space-y-1.5 xl:space-y-2 overflow-y-auto flex-shrink-0">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <Button
                variant={activeTab === "events" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("events")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
              
              <Button
                variant={activeTab === "awards" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("awards")}
              >
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </Button>
              
              <Button
                variant={activeTab === "members" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("members")}
              >
                <Users className="h-4 w-4 mr-2" />
                Team
              </Button>
              
              <Button
                variant={activeTab === "journey" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("journey")}
              >
                <Landmark className="h-4 w-4 mr-2" />
                Our Journey
              </Button>
              
              <Button
                variant={activeTab === "blogs" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("blogs")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Blogs
                {pendingBlogCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingBlogCount}
                  </span>
                )}
              </Button>

              <Button
                variant={activeTab === "sigs" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("sigs")}
              >
                <Layers className="h-4 w-4 mr-2" />
                SIGs
              </Button>
              
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start h-9 xl:h-10 text-sm"
                onClick={() => onTabChange("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
            </nav>
            
            {/* Spacer that pushes the logout button to the bottom */}
            <div className="flex-grow min-h-0"></div>
            
            {/* Bottom section with logout */}
            <div className="mt-auto flex-shrink-0">
              <Separator className="mb-3 xl:mb-4" />
              
              {confirmLogout ? (
                <div className="space-y-1.5 xl:space-y-2">
                  <p className="text-xs xl:text-sm">Are you sure you want to log out?</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleLogout}
                      className="flex-1 h-8 xl:h-9 text-xs xl:text-sm"
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setConfirmLogout(false)}
                      className="flex-1 h-8 xl:h-9 text-xs xl:text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9 xl:h-10 text-sm"
                  onClick={() => setConfirmLogout(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </aside>

          {/* Mobile Navigation */}
          <div className="block lg:hidden w-full">
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 mr-1.5 sm:mr-2" />
                  <h1 className="text-lg sm:text-xl font-bold">IEEE Admin</h1>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setConfirmLogout(true)}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              {confirmLogout && (
                <Card className="mt-2 p-2 sm:p-3">
                  <p className="text-xs sm:text-sm mb-2">Are you sure you want to log out?</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleLogout}
                      className="flex-1 text-xs sm:text-sm h-8"
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setConfirmLogout(false)}
                      className="flex-1 text-xs sm:text-sm h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Simple navigation buttons for mobile instead of tabs to avoid conflicts */}
              <div className="grid grid-cols-6 gap-1 mt-3 sm:mt-4">
                <button
                  onClick={() => onTabChange("dashboard")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "dashboard" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Dashboard</span>
                </button>
                <button
                  onClick={() => onTabChange("events")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "events" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Events</span>
                </button>
                <button
                  onClick={() => onTabChange("upcoming")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "upcoming" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Upcoming</span>
                </button>
                <button
                  onClick={() => onTabChange("awards")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "awards" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Achieve</span>
                </button>
                <button
                  onClick={() => onTabChange("members")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "members" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Members</span>
                </button>
                <button
                  onClick={() => onTabChange("blogs")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "blogs" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                    {pendingBlogCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center rounded-full">
                        {pendingBlogCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1">Blogs</span>
                </button>
                <button
                  onClick={() => onTabChange("sigs")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "sigs" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">SIGs</span>
                </button>
                <button
                  onClick={() => onTabChange("users")}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                    activeTab === "users" 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-1">Users</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden w-full">
            <div className="h-full overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 lg:p-6">
              <div className="w-full max-w-7xl mx-auto pb-16">
                {children}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default AdminLayout;
