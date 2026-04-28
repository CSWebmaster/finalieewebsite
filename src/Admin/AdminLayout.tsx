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
  BookOpen,
  Activity,
  FormInput,
  ClipboardList,
  Settings
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import GlobalSearch from "./GlobalSearch";

interface AdminLayoutProps {
  children?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  visibleTabs?: string[];   // if provided, only show these tabs
  userRole?: 'webmaster' | 'core_member' | 'admin' | 'writer';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children, activeTab, onTabChange,
  visibleTabs,
  userRole = 'webmaster',
}) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  // 1. Unified Pending changes listener (for both Sidebar and Mobile)
  useEffect(() => {
    if (!db || !auth.currentUser) return;
    
    let q;
    if (userRole === 'core_member') {
      q = query(
        collection(db, "pendingChanges"), 
        where("submittedBy", "==", auth.currentUser.uid)
      );
    } else {
      q = query(
        collection(db, "pendingChanges"), 
        where("status", "==", "pending")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (userRole === 'core_member') {
        const pendingCount = snapshot.docs.filter(d => d.data().status === 'pending').length;
        setPendingChangesCount(pendingCount);
      } else {
        setPendingChangesCount(snapshot.size);
      }
    }, (err) => {
      console.warn("[AdminLayout] Pending changes listener error:", err.message);
    });
    return () => unsubscribe();
  }, [userRole]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="flex flex-col lg:flex-row min-h-screen h-screen bg-slate-50 dark:bg-slate-900">
          {/* ────── SIDEBAR (Desktop) ────── */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-slate-200 dark:border-slate-800 p-3 xl:p-4 sticky top-0 h-screen overflow-hidden">
            <div className="flex items-center mb-6">
              <LayoutDashboard className="h-6 w-6 mr-2 text-blue-600" />
              <h1 className="text-xl font-bold tracking-tight">IEEE Admin</h1>
            </div>
            
            <nav className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => onTabChange("dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>

              {/* ── Dynamic Content Sections ── */}
              {(!visibleTabs || visibleTabs.includes('events')) && (
                <Button
                  variant={activeTab === "events" ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  onClick={() => onTabChange("events")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
              )}
              
              {(!visibleTabs || visibleTabs.includes('awards')) && (
                <Button
                  variant={activeTab === "awards" ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  onClick={() => onTabChange("awards")}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Achievements
                </Button>
              )}
              
              {(!visibleTabs || visibleTabs.includes('members')) && (
                <Button
                  variant={activeTab === "members" ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  onClick={() => onTabChange("members")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </Button>
              )}
              
              {(!visibleTabs || visibleTabs.includes('blogs')) && (
                <Button
                  variant={activeTab === "blogs" ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  onClick={() => onTabChange("blogs")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Blogs
                </Button>
              )}

              {/* ── Form Management (Webmaster/Admin) ── */}
              {userRole === 'webmaster' && (
                <>
                  <Button
                    variant={activeTab === "forms" ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => onTabChange("forms")}
                  >
                    <FormInput className="h-4 w-4 mr-2" />
                    Forms
                  </Button>
                  <Button
                    variant={activeTab === "submissions" ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => onTabChange("submissions")}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Submissions
                  </Button>
                </>
              )}

              {/* ── Webmaster Control Zone ── */}
              {userRole === 'webmaster' && (
                <>
                  <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Administration
                  </div>
                  <Button
                    variant={activeTab === "approvals" ? "default" : "ghost"}
                    className="w-full justify-start h-10 relative"
                    onClick={() => onTabChange("approvals")}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Approvals
                    {pendingChangesCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                        {pendingChangesCount}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => onTabChange("users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Core Members
                  </Button>

                  <Button
                    variant={activeTab === "history" ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => onTabChange("history")}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>

                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => onTabChange("settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Settings
                  </Button>
                </>
              )}

              {/* ── Core Member Zone ── */}
              {userRole === 'core_member' && (
                <Button
                  variant={activeTab === "my-submissions" ? "default" : "ghost"}
                  className="w-full justify-start h-10"
                  onClick={() => onTabChange("my-submissions")}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  My Submissions
                </Button>
              )}
            </nav>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {confirmLogout ? (
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                  <p className="text-[11px] text-center mb-2 font-medium">Log out of Admin?</p>
                  <div className="flex gap-1.5">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleLogout}
                      className="flex-1 h-7 text-[10px]"
                    >
                      Logout
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setConfirmLogout(false)}
                      className="flex-1 h-7 text-[10px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmLogout(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </aside>

          {/* ────── MOBILE HEADER & NAV ────── */}
          <div className="lg:hidden w-full flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-2 shadow-lg shadow-blue-500/20">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">IEEE Admin</h1>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => setConfirmLogout(true)}
              >
                <LogOut className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
            
            {/* Scrollable Mobile Nav Row */}
            <div className="flex items-center gap-1 px-2 pb-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Home' },
                { id: 'events', icon: <Calendar className="h-4 w-4" />, label: 'Events' },
                { id: 'awards', icon: <Award className="h-4 w-4" />, label: 'Awards' },
                { id: 'members', icon: <Users className="h-4 w-4" />, label: 'Team' },
                { id: 'blogs', icon: <BookOpen className="h-4 w-4" />, label: 'Blogs' },
                ...(userRole === 'webmaster' ? [
                  { id: 'forms', icon: <FormInput className="h-4 w-4" />, label: 'Forms' },
                  { id: 'submissions', icon: <ClipboardList className="h-4 w-4" />, label: 'Data' },
                  { id: 'approvals', icon: <CheckSquare className="h-4 w-4" />, label: 'Approvals', badge: pendingChangesCount },
                  { id: 'users', icon: <Users className="h-4 w-4" />, label: 'Users' },
                  { id: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' }
                ] : []),
                ...(userRole === 'core_member' ? [
                  { id: 'my-submissions', icon: <CheckSquare className="h-4 w-4" />, label: 'Subs' }
                ] : [])
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
                    activeTab === item.id 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white ml-0.5 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            
            {confirmLogout && (
              <div className="absolute top-16 left-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                <p className="text-center font-bold mb-3">Sign out of Admin Portal?</p>
                <div className="flex gap-2">
                  <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleLogout}>Logout</Button>
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmLogout(false)}>Stay</Button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden w-full">
            <div className="h-full overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 lg:p-6">
              <div className="w-full max-w-7xl mx-auto pb-16">
                {/* Top Header with Search */}
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <GlobalSearch onNavigate={onTabChange} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{auth.currentUser?.displayName || auth.currentUser?.email || "Admin"}</span>
                      <span className="text-[10px] text-slate-500 font-medium capitalize">{userRole}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                      {(auth.currentUser?.displayName || auth.currentUser?.email || "A").charAt(0).toUpperCase()}
                    </div>
                  </div>
                </header>

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
