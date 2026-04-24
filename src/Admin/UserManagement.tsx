import React, { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, addDoc, setDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth
} from 'firebase/auth';
import { db, auth } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus, ShieldOff, ShieldCheck, KeyRound, Search,
  Users, Eye, EyeOff, X, Check, Trash2
} from 'lucide-react';
import { SECTIONS } from '@/lib/roles';

const WEBMASTER_EMAILS = [
  "ieee.wm@socet.edu.in",
  "ieeewie.wm@silveroakuni.ac.in",
  "ieeecs.wm@silveroakuni.ac.in",
  "ieeesps.wm@silveroakuni.ac.in",
  "ieeesight.wm@silveroakuni.ac.in",
];

// ── Add Member Modal ─────────────────────────────────────────────────────────
function AddMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { userData } = useAuth();
  const [email, setEmail]             = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const togglePerm = (id: string) =>
    setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPassword.length < 6) { setError('Temp password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');

    const secondaryApp = initializeApp(
      {
        apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId:             import.meta.env.VITE_FIREBASE_APP_ID,
      },
      `secondary-${Date.now()}`
    );
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), tempPassword);
      const newUid = cred.user.uid;

      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      // Firestore doc ID = Firebase Auth UID (required by security rules)
      await setDoc(doc(db, 'users', newUid), {
        email: email.trim(),
        displayName: displayName.trim() || email.trim(),
        role: 'core_member',
        isActive: true,
        mustChangePassword: true,
        createdBy: userData!.uid,
        createdByEmail: userData!.email,
        createdAt: serverTimestamp(),
        permissions: permissions.length > 0 ? permissions : SECTIONS.map(s => s.id),
      });

      await addDoc(collection(db, 'auditLogs'), {
        action: 'user_created',
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        targetEmail: email.trim(),
        targetUid: newUid,
        timestamp: serverTimestamp(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      await deleteApp(secondaryApp).catch(() => {});
      if (err.code === 'auth/email-already-in-use') {
        setError('This email already has a Firebase account.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Add Core Member
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email *</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@silveroakuni.ac.in" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Display Name</label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Temporary Password *</label>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={tempPassword}
                onChange={e => setTempPassword(e.target.value)}
                placeholder="Share this with the member"
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Section Permissions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.length === 0 || permissions.includes(s.id)}
                    onChange={() => {
                      if (permissions.length === 0) {
                        setPermissions(SECTIONS.map(x => x.id).filter(x => x !== s.id));
                      } else {
                        togglePerm(s.id);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { userData } = useAuth();
  const [users, setUsers]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // ← Never show webmaster accounts in this list
      setUsers(all.filter(u => !WEBMASTER_EMAILS.includes(u.email?.toLowerCase()?.trim())));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };

  // ── Deactivate / Reactivate ────────────────────────────────────────────────
  const handleDeactivate = async (u: any) => {
    if (!window.confirm(`${u.isActive ? 'Deactivate' : 'Reactivate'} ${u.email}?`)) return;
    try {
      await updateDoc(doc(db, 'users', u.id), { isActive: !u.isActive });
      await addDoc(collection(db, 'auditLogs'), {
        action: u.isActive ? 'user_deactivated' : 'user_reactivated',
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        targetEmail: u.email,
        targetUid: u.id,
        timestamp: serverTimestamp(),
      });
      showSuccess(`${u.email} ${u.isActive ? 'deactivated' : 'reactivated'}.`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // ── Permanent delete (Firestore only — Firebase Auth must be done manually) ─
  const handleDelete = async (u: any) => {
    if (!window.confirm(
      `⚠ Permanently DELETE ${u.email}?\n\nThis removes their system access immediately.\nNote: Their Firebase Auth login must also be removed manually from the Firebase Console.`
    )) return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
      await addDoc(collection(db, 'auditLogs'), {
        action: 'user_deleted',
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        targetEmail: u.email,
        targetUid: u.id,
        timestamp: serverTimestamp(),
      });
      showSuccess(`${u.email} deleted.`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // ── Force password reset via Firebase email ────────────────────────────────
  // Webmasters are NOT listed here, so this only ever targets core members.
  const handlePasswordReset = async (u: any) => {
    if (!window.confirm(`Send password reset email to ${u.email}?`)) return;
    try {
      await sendPasswordResetEmail(auth, u.email);
      await addDoc(collection(db, 'auditLogs'), {
        action: 'password_reset_sent',
        performedBy: userData!.uid,
        performedByEmail: userData!.email,
        targetEmail: u.email,
        timestamp: serverTimestamp(),
      });
      showSuccess(`Password reset email sent to ${u.email}.`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Core Member Accounts
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage who can submit content proposals. Webmaster accounts are not shown here.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <UserPlus className="h-4 w-4" /> Add Core Member
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <Check className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-2xl">
          No core members yet. Click "Add Core Member" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <div
              key={u.id}
              className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm transition-all ${!u.isActive ? 'opacity-60 border-dashed' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 uppercase">
                    {(u.displayName || u.email)?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {u.displayName || u.email}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <Badge className={
                  u.isActive
                    ? 'bg-green-100 text-green-800 border-green-200 border'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Pending first login badge */}
              {u.mustChangePassword && (
                <div className="mb-3 text-xs px-2 py-1 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
                  ⚠ Awaiting first login & password change
                </div>
              )}

              {/* Section permissions */}
              {u.permissions && u.permissions.length < 6 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {u.permissions.map((p: string) => (
                    <span
                      key={p}
                      className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded capitalize"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  size="sm" variant="ghost"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => handlePasswordReset(u)}
                >
                  <KeyRound className="h-3.5 w-3.5" /> Force Password Reset (Email)
                </Button>

                <Button
                  size="sm" variant="ghost"
                  className={`w-full justify-start gap-2 text-xs ${
                    u.isActive
                      ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                      : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                  onClick={() => handleDeactivate(u)}
                >
                  {u.isActive
                    ? <><ShieldOff className="h-3.5 w-3.5" /> Deactivate Account</>
                    : <><ShieldCheck className="h-3.5 w-3.5" /> Reactivate Account</>
                  }
                </Button>

                <Button
                  size="sm" variant="ghost"
                  className="w-full justify-start gap-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(u)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Member
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => showSuccess('Core member account created!')}
        />
      )}
    </div>
  );
}
