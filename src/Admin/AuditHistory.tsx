import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText, Search } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  content_approved:          'bg-green-100 text-green-800 border-green-200',
  content_rejected:          'bg-red-100 text-red-800 border-red-200',
  content_submitted:         'bg-blue-100 text-blue-800 border-blue-200',
  user_created:              'bg-purple-100 text-purple-800 border-purple-200',
  user_deactivated:          'bg-orange-100 text-orange-800 border-orange-200',
  user_reactivated:          'bg-teal-100 text-teal-800 border-teal-200',
  password_reset_sent:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  password_changed_by_user:  'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function AuditHistory() {
  const [logs, setLogs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');

  useEffect(() => {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(200)
    );
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = !search
      || log.performedByEmail?.toLowerCase().includes(search.toLowerCase())
      || log.submittedByEmail?.toLowerCase().includes(search.toLowerCase())
      || log.targetEmail?.toLowerCase().includes(search.toLowerCase())
      || log.action?.toLowerCase().includes(search.toLowerCase());
    const matchSection = sectionFilter === 'all' || log.section === sectionFilter;
    return matchSearch && matchSection;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-blue-600" />
          Audit History
        </h2>
        <p className="text-gray-500 text-sm mt-1">Complete log of all actions. Visible to Webmasters only.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by email or action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {['events', 'members', 'awards', 'blogs', 'sigs', 'journey'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading audit logs...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-2xl">
          No audit logs found.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Performed By</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Subject</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Section</th>
                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(log => {
                const date = log.timestamp?.toDate?.()?.toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: '2-digit',
                  hour: '2-digit', minute: '2-digit'
                });

                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border capitalize ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                      {log.performedByEmail || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {log.submittedByEmail || log.targetEmail || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {log.section ? (
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{log.section}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{date || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
