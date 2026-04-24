import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, query, where, onSnapshot, limit, getDocs } from "firebase/firestore";
import { 
  Calendar, Trophy, Users, Zap, CheckSquare, 
  ChevronRight, Loader2, AlertCircle, Clock, 
  Plus, ArrowRight, BookOpen
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface DashboardProps {
  navigateTo: (section: string) => void;
  userRole?: string;
  userEmail?: string;
  userId?: string;
  // Legacy props from Admin.tsx that were being passed
  setSelectedEvent?: (e: any) => void;
  setSelectedAward?: (a: any) => void;
  setSelectedMember?: (m: any) => void;
}

interface Stats {
  events: number;
  members: number;
  awards: number;
  blogs: number;
  pending: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  navigateTo, 
  userRole, 
  userEmail,
  userId
}) => {
  const [stats, setStats] = useState<Stats>({ events: 0, members: 0, awards: 0, blogs: 0, pending: 0 });
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError("Database NOT initialized. Check firebase.ts");
      setLoading(false);
      return;
    }

    // 1. Fetch Published Counts (Parallel)
    const fetchPublishedCounts = async () => {
      try {
        const sections = ['events', 'members', 'awards', 'blogs'];
        const results: any = {};
        
        for (const s of sections) {
          try {
            const snap = await getDocs(collection(db, s));
            results[s] = snap.size;
          } catch (err) {
            console.warn(`[Dashboard] Could not fetch ${s} count:`, err);
            results[s] = 0;
          }
        }
        
        setStats(prev => ({ ...prev, ...results }));
      } catch (err: any) {
        console.error("[Dashboard] Stats error:", err);
      }
    };

    // 2. Listen for Pending Changes (Real-time)
    // Core members only see their OWN pending items
    let qPending;
    if (userRole === 'core_member' && userId) {
      qPending = query(
        collection(db, "pendingChanges"),
        where("submittedBy", "==", userId),
        limit(20) // Slightly larger limit to filter status client-side
      );
    } else {
      qPending = query(
        collection(db, "pendingChanges"),
        where("status", "==", "pending"),
        limit(10)
      );
    }

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      let items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filter for status if we simplified the query
      if (userRole === 'core_member') {
        items = items.filter((item: any) => item.status === 'pending').slice(0, 5);
      }

      setPendingItems(items);
      setStats(prev => ({ ...prev, pending: items.length }));
      setLoading(false);
    }, (err) => {
      console.error("[Dashboard] Pending listener error:", err);
      // Fallback: If listening to all fails (maybe role changed), just show 0
      if (userRole === 'core_member') {
        setError("Failed to sync your pending changes. Please try logging out and back in.");
      } else {
        setError("Failed to sync pending changes. Role permission might be missing.");
      }
      setLoading(false);
    });

    fetchPublishedCounts();
    return () => unsubscribePending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6 flex items-start gap-4 mx-auto max-w-2xl mt-10">
        <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Dashboard Synchronisation Failed</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Management overview for IEEE Silver Oak University SB</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigateTo('events')} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> New Event
          </Button>
          <Button onClick={() => navigateTo('blogs')} variant="outline" className="rounded-xl border-slate-200">
            <BookOpen className="h-4 w-4 mr-2" /> Write Blog
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Published Events', value: stats.events, icon: <Calendar />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Team Members', value: stats.members, icon: <Users />, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Achievements', value: stats.awards, icon: <Trophy />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Blogs', value: stats.blogs, icon: <BookOpen />, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, idx) => (
          <Card key={idx} className="p-6 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                {React.cloneElement(s.icon as React.ReactElement, { className: 'h-6 w-6' })}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold">
                {userRole === 'core_member' ? "My Pending Submissions" : "Pending Approvals"}
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                {stats.pending} Items
              </Badge>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo(userRole === 'core_member' ? 'my-submissions' : 'approvals')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {pendingItems.length === 0 ? (
              <Card className="p-12 border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Inbox is clear!</p>
                <p className="text-slate-400 text-sm mt-1">No pending content awaits review.</p>
              </Card>
            ) : (
              pendingItems.map((item) => (
                <Card key={item.id} className="p-4 border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {item.type === 'event' && <Calendar className="h-5 w-5" />}
                        {item.type === 'blog' && <BookOpen className="h-5 w-5" />}
                        {item.type === 'member' && <Users className="h-5 w-5" />}
                        {item.type === 'award' && <Trophy className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white capitalize leading-tight">
                          {item.data?.title || item.data?.name || "Untitled Submission"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-4">
                            {item.section || item.type || 'content'}
                          </Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            By: {item.submittedByEmail || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => navigateTo(userRole === 'core_member' ? 'my-submissions' : 'approvals')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {userRole === 'core_member' ? 'View Status' : 'Process'} <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Help / System Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            System Status
          </h2>
          <Card className="p-5 border-none bg-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Database Live</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold">CMS Integrity</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        All modules are operating on the dual-write validated pipeline.
                    </p>
                </div>
                <div className="pt-2">
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-tighter"
                        onClick={() => navigateTo(userRole === 'core_member' ? 'my-submissions' : 'history')}
                    >
                        {userRole === 'core_member' ? 'My Recent Propoasls' : 'View Audit History'}
                    </Button>
                </div>
            </div>
            {/* Background Blob */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 blur-[50px] rounded-full" />
          </Card>

          <Card className="p-5 border-slate-100 shadow-sm leading-relaxed">
             <h4 className="font-bold text-sm text-slate-800 mb-2">Need Assistance?</h4>
             <p className="text-xs text-slate-500">
               If you encounter any platform issues or need permissions updated, please contact the 
               <span className="text-blue-600 font-bold ml-1 cursor-pointer">Webmaster Team</span>.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
