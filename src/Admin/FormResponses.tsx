import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormResponses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    let q = query(collection(db, "formResponses"), orderBy("submittedAt", "desc"), limit(50));
    
    if (filterType !== "all") {
       q = query(collection(db, "formResponses"), where("formType", "==", filterType), orderBy("submittedAt", "desc"), limit(50));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setResponses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [filterType]);

  const filteredResponses = responses.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const responsesMatch = Object.values(r.responses || {}).some(v => String(v).toLowerCase().includes(searchLower));
    const eventMatch = (r.eventName || "").toLowerCase().includes(searchLower);
    return responsesMatch || eventMatch;
  });

  const getStats = () => {
    const stats = { join: 0, contact: 0, register: 0 };
    responses.forEach(r => {
      if (r.formType === "Join IEEE") stats.join++;
      else if (r.formType === "Contact Us") stats.contact++;
      else if (r.formType === "Event Registration") stats.register++;
    });
    return stats;
  };

  const stats = getStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
            Submission Logs
          </h2>
          <p className="text-sm text-slate-500">Live feed of all website form submissions.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-slate-200 hidden md:flex">
          <Download className="mr-2 h-4 w-4" /> Export All (CSV)
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Applications', value: stats.join, icon: <UserPlus className="h-4 w-4" />, color: 'blue' },
          { label: 'Inquiries', value: stats.contact, icon: <MessageSquare className="h-4 w-4" />, color: 'amber' },
          { label: 'Registrations', value: stats.register, icon: <Ticket className="h-4 w-4" />, color: 'emerald' },
        ].map(s => (
          <Card key={s.label} className="p-4 rounded-3xl border-none shadow-lg shadow-slate-200/50 dark:bg-slate-900">
            <div className={`w-8 h-8 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 flex items-center justify-center mb-2`}>
              {s.icon}
            </div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search records by name, email, or event..." 
            className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 rounded-2xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48 h-11 border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2">
               <Filter className="h-3.5 w-3.5 text-slate-400" />
               <SelectValue placeholder="All Sources" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="Join IEEE">IEEE Applications</SelectItem>
            <SelectItem value="Contact Us">Inquiries</SelectItem>
            <SelectItem value="Event Registration">Registrations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table-like List */}
      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />)
        ) : filteredResponses.length > 0 ? (
          filteredResponses.map((res) => (
            <div key={res.id} className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-lg hover:shadow-blue-500/5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  res.formType === 'Join IEEE' ? 'bg-blue-50 text-blue-600' :
                  res.formType === 'Contact Us' ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {res.formType === 'Join IEEE' ? <UserPlus className="h-5 w-5" /> : 
                   res.formType === 'Contact Us' ? <MessageSquare className="h-5 w-5" /> : 
                   <Ticket className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{res.responses?.name || 'Anonymous'}</span>
                    <Badge variant="outline" className="text-[9px] font-black uppercase px-2 bg-slate-50 border-none">{res.formType}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{res.responses?.email || 'No Email'} • {res.eventName || 'Website Form'}</div>
                </div>
              </div>

              <div className="hidden lg:block flex-1">
                 <div className="text-xs text-slate-400 line-clamp-1 italic max-w-xs font-medium">
                    "{Object.values(res.responses || {}).slice(3,6).join(', ')}..."
                 </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {res.submittedAt?.toDate().toLocaleDateString()} at {res.submittedAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 font-medium">
             No records found matching your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
