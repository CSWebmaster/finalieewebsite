import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, User, Calendar, Clock, ArrowRight, X, Loader2, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'user' | 'event' | 'pending' | 'submission';
  title: string;
  subtitle?: string;
  section?: string;
}

interface GlobalSearchProps {
  onNavigate: (tab: string, id?: string) => void;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!queryText.trim() || queryText.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(queryText);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryText]);

  const performSearch = async (text: string) => {
    setLoading(true);
    const searchLower = text.toLowerCase();
    const allResults: SearchResult[] = [];

    try {
      // 1. Search Users
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
      usersSnap.docs.forEach(doc => {
        const d = doc.data();
        if (
          d.name?.toLowerCase().includes(searchLower) ||
          d.email?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: doc.id,
            type: 'user',
            title: d.name || 'Unknown User',
            subtitle: d.email,
          });
        }
      });

      // 2. Search Events
      const eventsSnap = await getDocs(query(collection(db, 'events'), limit(50)));
      eventsSnap.docs.forEach(doc => {
        const d = doc.data();
        if (
          d.name?.toLowerCase().includes(searchLower) ||
          d.title?.toLowerCase().includes(searchLower) ||
          d.description?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: doc.id,
            type: 'event',
            title: d.name || d.title || 'Untitled Event',
            subtitle: d.date,
          });
        }
      });

      // 3. Search Pending Changes
      const pendingSnap = await getDocs(query(collection(db, 'pendingChanges'), limit(50)));
      pendingSnap.docs.forEach(doc => {
        const d = doc.data();
        if (
          d.section?.toLowerCase().includes(searchLower) ||
          d.submittedByEmail?.toLowerCase().includes(searchLower) ||
          d.data?.title?.toLowerCase().includes(searchLower) ||
          d.data?.name?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: doc.id,
            type: 'pending',
            title: d.data?.title || d.data?.name || `Change in ${d.section}`,
            subtitle: `By: ${d.submittedByEmail}`,
            section: d.section
          });
        }
      });

      // 4. Search Form Responses
      const responsesSnap = await getDocs(query(collection(db, 'formResponses'), limit(50)));
      responsesSnap.docs.forEach(doc => {
        const d = doc.data();
        const searchValues = Object.values(d.responses || {}).join(' ').toLowerCase();
        if (
          searchValues.includes(searchLower) ||
          d.eventName?.toLowerCase().includes(searchLower) ||
          d.formType?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: doc.id,
            type: 'submission',
            title: d.responses?.name || 'Anonymous Submission',
            subtitle: `${d.formType} • ${d.eventName || 'Website'}`,
          });
        }
      });

      // Categorize and limit
      setResults(allResults.slice(0, 20));
    } catch (err) {
      console.error("[Search] Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (res: SearchResult) => {
    setIsOpen(false);
    setQueryText('');
    setResults([]);
    
    if (res.type === 'user') onNavigate('users');
    else if (res.type === 'event') onNavigate('events');
    else if (res.type === 'pending') onNavigate('approvals');
    else if (res.type === 'submission') onNavigate('submissions');
  };

  const categories = {
    user: results.filter(r => r.type === 'user'),
    event: results.filter(r => r.type === 'event'),
    pending: results.filter(r => r.type === 'pending'),
    submission: results.filter(r => r.type === 'submission'),
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto lg:mx-0">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Global search (Users, Events, Approvals)..."
          className="pl-10 pr-10 bg-slate-100 dark:bg-slate-800 border-none rounded-xl h-10 w-full focus-visible:ring-2 focus-visible:ring-blue-500 transition-all shrink-0"
          value={queryText}
          onChange={(e) => {
            setQueryText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {queryText && (
          <button 
            onClick={() => setQueryText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && (queryText.length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium tracking-wide">Searching Securely...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400 font-medium">No results found for "{queryText}"</p>
              </div>
            ) : (
              <div className="p-2 space-y-4">
                {(Object.entries(categories) as [keyof typeof categories, SearchResult[]][]).map(([type, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="px-3 py-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {type === 'user' ? 'People' : type === 'event' ? 'Current Events' : type === 'pending' ? 'Pending Requests' : 'Direct Data'}
                        </span>
                        <Badge variant="outline" className="text-[9px] h-4">{items.length}</Badge>
                      </div>
                      
                      <div className="space-y-0.5">
                        {items.map(res => (
                          <button
                            key={res.id}
                            onClick={() => handleSelect(res)}
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                res.type === 'user' ? "bg-teal-50 text-teal-600" : 
                                res.type === 'event' ? "bg-blue-50 text-blue-600" : 
                                "bg-amber-50 text-amber-600"
                              )}>
                                {res.type === 'user' && <User className="h-4 w-4" />}
                                {res.type === 'event' && <Calendar className="h-4 w-4" />}
                                {res.type === 'pending' && <Clock className="h-4 w-4" />}
                                {res.type === 'submission' && <ClipboardList className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {res.title}
                                </p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                                  {res.subtitle}
                                  {res.section && <Badge variant="secondary" className="text-[8px] h-3 px-1">{res.section}</Badge>}
                                </p>
                              </div>
                              <ArrowRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[9px] text-slate-400">Press Esc to close</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Global CNS Index</span>
          </div>
        </div>
      )}
    </div>
  );
}
