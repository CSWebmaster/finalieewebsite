import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Inbox } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:  { label: 'Pending Review', icon: <Clock className="h-3.5 w-3.5" />,        cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved: { label: 'Approved',       icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected',       icon: <XCircle className="h-3.5 w-3.5" />,      cls: 'bg-red-100 text-red-800 border-red-200' },
};

export default function MySubmissions() {
  const { userData } = useAuth();
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;
    const q = query(
      collection(db, 'pendingChanges'),
      where('submittedBy', '==', userData.uid),
      orderBy('submittedAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setChanges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [userData]);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading your submissions...</div>;

  if (changes.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
        <Inbox className="h-12 w-12 opacity-40" />
        <p className="font-medium">No submissions yet</p>
        <p className="text-sm">Use "Submit a Change" to propose your first edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions</h2>
        <p className="text-gray-500 text-sm mt-1">Track the status of your proposed changes.</p>
      </div>

      <div className="space-y-3">
        {changes.map(change => {
          const st = STATUS_CONFIG[change.status] || STATUS_CONFIG.pending;
          const date = change.submittedAt?.toDate?.()?.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={change.id} className="bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className="capitalize bg-blue-100 text-blue-800 border-blue-200 border">
                      {change.section}
                    </Badge>
                    <Badge className={`capitalize border flex items-center gap-1 ${st.cls}`}>
                      {st.icon} {st.label}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{change.action}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {change.data?.title || change.data?.name || `${change.action} in ${change.section}`}
                  </h3>
                  {change.data?.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{change.data.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Submitted: {date || '—'}</p>
                </div>
              </div>

              {/* Rejection reason */}
              {change.status === 'rejected' && change.rejectionReason && (
                <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Reason for rejection:</p>
                  <p className="text-sm text-red-600 dark:text-red-300">{change.rejectionReason}</p>
                  {change.reviewedByEmail && (
                    <p className="text-xs text-red-400 mt-1">— {change.reviewedByEmail}</p>
                  )}
                </div>
              )}

              {/* Approved info */}
              {change.status === 'approved' && (
                <div className="mt-4 px-4 py-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    ✓ Approved by {change.reviewedByEmail || 'Webmaster'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
