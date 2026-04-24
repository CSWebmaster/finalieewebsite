import React, { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, addDoc, getDoc, setDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Eye, EyeOff, Inbox, AlertTriangle } from 'lucide-react';

// ── Diff display ────────────────────────────────────────────────────────────
function DiffView({ before, after }: { before: any; after: any }) {
  const allKeys = Array.from(new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]));

  return (
    <div className="font-mono text-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-2">
        <div className="bg-red-50 dark:bg-red-950/20 px-3 py-2 font-semibold text-red-700 border-b border-slate-200 dark:border-slate-700">
          Before
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 px-3 py-2 font-semibold text-green-700 border-b border-l border-slate-200 dark:border-slate-700">
          After
        </div>
        {allKeys.map(key => {
          const bVal = JSON.stringify(before?.[key] ?? '—');
          const aVal = JSON.stringify(after?.[key] ?? '—');
          const changed = bVal !== aVal;
          return (
            <React.Fragment key={key}>
              <div className={`px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 ${changed ? 'bg-red-50/50 dark:bg-red-950/10 text-red-800 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
                <span className="text-gray-400">{key}:</span> {bVal}
              </div>
              <div className={`px-3 py-1.5 border-b border-l border-slate-100 dark:border-slate-800 ${changed ? 'bg-green-50/50 dark:bg-green-950/10 text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                <span className="text-gray-400">{key}:</span> {aVal}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PendingApprovals() {
  const { userData } = useAuth();
  const [changes, setChanges]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [filter, setFilter]         = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const q = query(
      collection(db, 'pendingChanges'),
      where('status', '==', filter)
    );
    const unsub = onSnapshot(q, snap => {
      setChanges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("[PendingApprovals] Listener error:", err.message);
      setLoading(false);
    });
    return unsub;
  }, [filter]);

  // ── Approve ─────────────────────────────────────────────────────────────
  const handleApprove = async (change: any) => {
    if (!window.confirm(`Approve this ${change.action} on ${change.section}?`)) return;
    setProcessing(change.id);
    try {
      const { section, action, docId, data } = change;
      
      // ── Write back to legacy collection ──
      const liveItemsColl = collection(db, section as string);

      // Apply change to the live collection
      if (action === 'create') {
        await addDoc(liveItemsColl, { ...data, updatedAt: serverTimestamp() });
      } else if (action === 'update' && docId) {
        const itemDocRef = doc(db, section as string, docId);
        await setDoc(itemDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      } else if (action === 'delete' && docId) {
        const itemDocRef = doc(db, section as string, docId);
        await deleteDoc(itemDocRef);
      }

      // Mark as approved
      await updateDoc(doc(db, 'pendingChanges', change.id), {
        status: 'approved',
        reviewedBy: userData!.uid,
        reviewedByEmail: userData!.email,
        reviewedAt: serverTimestamp(),
      });

      // Write audit log
      await addDoc(collection(db, 'auditLogs'), {
        action: 'content_approved',
        section,
        docId: docId || null,
        changeId: change.id,
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        submittedBy: change.submittedBy,
        submittedByEmail: change.submittedByEmail,
        timestamp: serverTimestamp(),
        before: change.before || null,
        after: data,
      });
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────
  const handleReject = async (change: any) => {
    const reason = window.prompt('Enter reason for rejection (visible to submitter):');
    if (reason === null) return;
    if (!reason.trim()) { alert('Please provide a rejection reason.'); return; }

    setProcessing(change.id);
    try {
      await updateDoc(doc(db, 'pendingChanges', change.id), {
        status: 'rejected',
        rejectionReason: reason.trim(),
        reviewedBy: userData!.uid,
        reviewedByEmail: userData!.email,
        reviewedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'auditLogs'), {
        action: 'content_rejected',
        section: change.section,
        changeId: change.id,
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        submittedBy: change.submittedBy,
        submittedByEmail: change.submittedByEmail,
        rejectionReason: reason.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const pending  = changes.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Approvals</h2>
          <p className="text-gray-500 text-sm mt-1">Review and publish changes submitted by Core Members.</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{pending} awaiting review</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : changes.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-gray-400 border-2 border-dashed rounded-2xl">
          <Inbox className="h-12 w-12 opacity-40" />
          <p className="font-medium">No {filter} changes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {changes.map(change => {
            const isExpanded = expanded === change.id;
            const date = change.submittedAt?.toDate?.()?.toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={change.id} className="bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 p-5 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="capitalize bg-blue-100 text-blue-800 border-blue-200 border">{change.section}</Badge>
                      <Badge variant="outline" className="capitalize">{change.action}</Badge>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {change.data?.title || change.data?.name || `${change.action} in ${change.section}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{change.submittedByEmail}</span>
                      {' · '}{date}
                    </p>
                    {change.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">Rejected: {change.rejectionReason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(isExpanded ? null : change.id)}
                      className="gap-1.5 text-xs"
                    >
                      {isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {isExpanded ? 'Hide' : 'View Diff'}
                    </Button>

                    {change.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                          onClick={() => handleReject(change)}
                          disabled={processing !== null}
                        >
                          <XCircle className="h-4 w-4" />
                          {processing === change.id ? '...' : 'Reject'}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          onClick={() => handleApprove(change)}
                          disabled={processing !== null}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {processing === change.id ? 'Processing...' : 'Approve & Publish'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Diff viewer */}
                {isExpanded && (
                  <div className="border-t px-5 py-4 bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Change Diff</p>
                    <DiffView before={change.before || {}} after={change.data || {}} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
