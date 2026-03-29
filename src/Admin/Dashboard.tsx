import React, { useState, useEffect, useRef } from 'react';
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import {
  Bell, Calendar, ChevronRight, Plus, Loader2,
  Trophy, Users, Zap, BarChart3, Activity,
  GraduationCap, UserCheck, Briefcase, Layers,
  Sparkles, Star, Rocket, Target, TrendingUp
} from "lucide-react";

interface DashboardProps {
  navigateTo: (section: string) => void;
  setSelectedEvent?: (event: any) => void;
  setSelectedAward?: (award: any) => void;
  setSelectedMember?: (member: any) => void;
}

const BLUE = { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800', bar: '#2563eb' };
const SKY  = { bg: 'bg-sky-500',  text: 'text-sky-600',  light: 'bg-sky-50 dark:bg-sky-950/40',   border: 'border-sky-200 dark:border-sky-800',   bar: '#0ea5e9' };
const INDIGO = { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800', bar: '#4f46e5' };
const VIOLET = { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-200 dark:border-violet-800', bar: '#7c3aed' };
const TEAL   = { bg: 'bg-teal-600',   text: 'text-teal-600',   light: 'bg-teal-50 dark:bg-teal-950/40',     border: 'border-teal-200 dark:border-teal-800',     bar: '#0d9488' };
const CYAN   = { bg: 'bg-cyan-600',   text: 'text-cyan-600',   light: 'bg-cyan-50 dark:bg-cyan-950/40',     border: 'border-cyan-200 dark:border-cyan-800',     bar: '#0891b2' };
const SLATE  = { bg: 'bg-slate-600',  text: 'text-slate-600',  light: 'bg-slate-50 dark:bg-slate-900/60',   border: 'border-slate-200 dark:border-slate-800',   bar: '#475569' };

interface Counts {
  events: number; techEvents: number; nonTechEvents: number;
  members: number; executive: number; faculty: number; advisory: number; core: number;
  awards: number; branchAward: number; studentAward: number;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  console.log("🟢 Dashboard component rendered");
  
  const [counts, setCounts]         = useState<Counts>({ events: 0, techEvents: 0, nonTechEvents: 0, members: 0, executive: 0, faculty: 0, advisory: 0, core: 0, awards: 0, branchAward: 0, studentAward: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topLatestEvents, setTopLatestEvents] = useState<any[]>([]);
  const [topUpcomingEvents, setTopUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    console.log("🟡 useEffect starting data fetch");
    let eventsList: any[] = [];
    let membersList: any[] = [];
    let awardsList: any[] = [];
    let loaded = 0;

    const tryFinish = () => { 
      if (++loaded >= 3) {
        console.log("✅ All data loaded, setting loading to false");
        setLoading(false); 
      }
    };

    const updateActivity = () => {
      const all = [...eventsList, ...membersList, ...awardsList].sort((a, b) => {
        const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      setRecentActivity(all.slice(0, 8));
    };

    const buildCounts = () => {
      console.log("🔄 Building counts - events:", eventsList.length, "members:", membersList.length, "awards:", awardsList.length);
      
      // Sort events by date (newest first)
      const sortedEvents = eventsList.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
      
      // Get top 5 latest events
      const latestEvents = sortedEvents.slice(0, 5);
      // Get top 3 upcoming events
      const upcomingEvents = sortedEvents.filter(e => e.isUpcoming).slice(0, 3);
      
      setTopLatestEvents(latestEvents);
      setTopUpcomingEvents(upcomingEvents);
      
      setCounts({
        events: eventsList.length,
        techEvents: eventsList.filter(e => e.category === 'Technical Event').length,
        nonTechEvents: eventsList.filter(e => e.category === 'Non Technical Event').length,
        members: membersList.length,
        executive: membersList.filter(m => m.type === 'executive').length,
        faculty: membersList.filter(m => m.type === 'faculty').length,
        advisory: membersList.filter(m => m.type === 'advisory').length,
        core: membersList.filter(m => m.type === 'core').length,
        awards: awardsList.length,
        branchAward: awardsList.filter(a => a.type === 'branch').length,
        studentAward: awardsList.filter(a => a.type === 'student').length,
      });
    };

    const u1 = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc')),
      snap => { 
        console.log("📅 Events data received:", snap.docs.length);
        eventsList = snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'event' })); 
        buildCounts(); 
        updateActivity(); 
        tryFinish(); 
      },
      err => { 
        console.error("❌ Events error:", err.message);
        setError(err.message); 
        tryFinish(); 
      }
    );
    const u2 = onSnapshot(
      query(collection(db, 'members'), orderBy('createdAt', 'desc')),
      snap => { 
        console.log("👥 Members data received:", snap.docs.length);
        membersList = snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'member' })); 
        buildCounts(); 
        updateActivity(); 
        tryFinish(); 
      },
      err => { 
        console.error("❌ Members error:", err.message);
        setError(err.message); 
        tryFinish(); 
      }
    );
    const u3 = onSnapshot(
      query(collection(db, 'awards'), orderBy('createdAt', 'desc')),
      snap => { 
        console.log("🏆 Awards data received:", snap.docs.length);
        awardsList = snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'award' })); 
        buildCounts(); 
        updateActivity(); 
        tryFinish(); 
      },
      err => { 
        console.error("❌ Awards error:", err.message);
        setError(err.message); 
        tryFinish(); 
      }
    );

    return () => { u1(); u2(); u3(); };
  }, []);

  const getActivityMeta = (item: any) => {
    switch (item._type) {
      case 'event':  return { label: item.name  || item.title || 'Event',       icon: <Calendar className="h-3.5 w-3.5" />, cls: BLUE.light,   badge: item.category || 'Event' };
      case 'award':  return { label: item.title || 'Achievement',               icon: <Trophy   className="h-3.5 w-3.5" />, cls: INDIGO.light, badge: item.type === 'branch' ? 'Branch Achievement' : 'Student Achievement' };
      case 'member': return { label: item.name  || 'Member',                    icon: <Users    className="h-3.5 w-3.5" />, cls: TEAL.light,   badge: item.type || 'Member' };
      default:       return { label: 'Item',                                    icon: <Bell     className="h-3.5 w-3.5" />, cls: SLATE.light,  badge: 'Item' };
    }
  };

  console.log("📊 Dashboard rendering with loading:", loading, "error:", error, "counts:", counts);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-72 gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="absolute -inset-2 rounded-full bg-blue-200/30 animate-ping" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-200/50 animate-pulse" />
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Initializing Dashboard</p>
        <p className="text-sm text-gray-400">Syncing with IEEE SOU SB database...</p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
      <p className="text-red-600 font-medium">Error loading dashboard</p>
      <p className="text-sm text-red-400 mt-1">{error}</p>
    </div>
  );

  const total = counts.events + counts.awards + counts.members || 1;

  const StatCard = ({ label, count, sub, icon, accent, onClick }: {
    label: string; count: number; sub: string; icon: React.ReactNode;
    accent: string; onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-2xl border p-5 text-left w-full
                  bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300 overflow-hidden border-gray-100 dark:border-gray-800
                  hover:scale-[1.02] hover:border-gray-200 dark:hover:border-gray-700`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />
      
      <div className="flex items-start justify-between">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center
                         bg-gradient-to-br from-blue-500/10 to-indigo-500/10
                         border border-blue-200/50 dark:border-blue-800/30`}
             style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.14))' }}>
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </button>
  );

  const DistRow = ({ label, count, total, barColor, icon }: {
    label: string; count: number; total: number; barColor: string; icon?: React.ReactNode;
  }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="flex items-center gap-3">
        {icon && <span className="flex-shrink-0 text-gray-400">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-300">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full" 
                 style={{ 
                   width: `${pct}%`, 
                   backgroundColor: barColor
                 }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">IEEE SOU Student Branch — Control Panel</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Live Sync</span>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Events"      count={counts.events}  sub={`${counts.techEvents} Technical · ${counts.nonTechEvents} Non-Technical`} icon={<Calendar className="h-5 w-5" />}  accent="bg-blue-600"   onClick={() => navigateTo('events')} />
        <StatCard label="Achievements"      count={counts.awards}  sub={`${counts.branchAward} Branch · ${counts.studentAward} Student`}           icon={<Trophy   className="h-5 w-5" />}  accent="bg-indigo-600" onClick={() => navigateTo('awards')} />
        <StatCard label="Team Members"      count={counts.members} sub={`${counts.faculty} Faculty · ${counts.executive} Executive · ${counts.advisory} Advisory`} icon={<Users className="h-5 w-5" />}   accent="bg-teal-600"   onClick={() => navigateTo('members')} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Quick Actions</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'Add New Event',       action: 'addEvent',  icon: <Calendar className="h-4 w-4" />, dot: 'bg-blue-600' },
            { label: 'Add Achievement',     action: 'addAward',  icon: <Trophy   className="h-4 w-4" />, dot: 'bg-indigo-600' },
            { label: 'Add Team Member',     action: 'addMember', icon: <Users    className="h-4 w-4" />, dot: 'bg-teal-600' },
          ].map(({ label, action, icon, dot }) => (
            <button
              key={action}
              onClick={(e) => {
                e.stopPropagation();
                navigateTo(action);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <div className={`h-8 w-8 rounded-lg ${dot} bg-opacity-10 flex items-center justify-center`}>
                <span className="text-gray-600">{icon}</span>
              </div>
              <span className="font-medium text-sm flex-1 text-left text-gray-700 dark:text-gray-300">{label}</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Distribution ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Content Distribution</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Events */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-bold uppercase text-gray-500">Events <span className="text-blue-600">({counts.events})</span></p>
            </div>
            <div className="space-y-3">
              <DistRow label="Technical" count={counts.techEvents} total={counts.events || 1} barColor="#2563eb" />
              <DistRow label="Non-Technical" count={counts.nonTechEvents} total={counts.events || 1} barColor="#7c3aed" />
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-teal-500" />
              <p className="text-xs font-bold uppercase text-gray-500">Members <span className="text-teal-600">({counts.members})</span></p>
            </div>
            <div className="space-y-3">
              <DistRow label="Faculty" count={counts.faculty} total={counts.members || 1} barColor="#0d9488" icon={<GraduationCap className="h-3 w-3" />} />
              <DistRow label="Executive" count={counts.executive} total={counts.members || 1} barColor="#6366f1" icon={<UserCheck className="h-3 w-3" />} />
            </div>
          </div>

          {/* Awards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-indigo-500" />
              <p className="text-xs font-bold uppercase text-gray-500">Achievements <span className="text-indigo-600">({counts.awards})</span></p>
            </div>
            <div className="space-y-3">
              <DistRow label="Branch" count={counts.branchAward} total={counts.awards || 1} barColor="#4338ca" />
              <DistRow label="Student" count={counts.studentAward} total={counts.awards || 1} barColor="#7c3aed" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Latest Events ── */}
      {topLatestEvents.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Top 5 Latest Events</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topLatestEvents.map((event) => (
                <div key={event.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{event.name || event.title || 'Event'}</h4>
                      <p className="text-xs text-gray-500 mt-1">{event.date ? new Date(event.date).toLocaleDateString() : 'No date'}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.category || 'Event'}</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full ${event.category === 'Technical Event' ? 'bg-blue-100' : 'bg-violet-100'} flex items-center justify-center`}>
                      <Calendar className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Top Upcoming Events ── */}
      {topUpcomingEvents.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="h-7 w-7 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Rocket className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Top 3 Upcoming Events</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topUpcomingEvents.map((event) => (
                <div key={event.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{event.name || event.title || 'Event'}</h4>
                      <p className="text-xs text-gray-500 mt-1">{event.date ? new Date(event.date).toLocaleDateString() : 'No date'}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.category || 'Event'}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Rocket className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
