import React, { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

interface ForcePasswordChangeProps {
  uid: string;
  email: string;
  onComplete: () => void;
}

export default function ForcePasswordChange({ uid, email, onComplete }: ForcePasswordChangeProps) {
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');

  const strength = newPassword.length >= 10 ? 4
    : newPassword.length >= 8 ? 3
    : newPassword.length >= 6 ? 2
    : newPassword.length > 0  ? 1
    : 0;

  const strengthColor = ['bg-white/10', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const strengthLabel = ['', 'Too weak', 'Weak', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Session expired. Please log in again.');

      // Update Firebase Auth password (no reauthentication needed — session is fresh)
      await updatePassword(user, newPassword);

      // Clear the mustChangePassword flag in Firestore
      await updateDoc(doc(db, 'users', uid), {
        mustChangePassword: false,
      });

      onComplete();
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('Session timed out. Please log out and log in again with your temporary password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30">
              <ShieldCheck className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Set Your Password
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8">
            This is your first login. Create a personal password to continue.
          </p>

          <div className="mb-5 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 text-center">
            Logging in as <span className="font-semibold text-blue-200">{email}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  placeholder="Min. 6 characters"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          strength >= i ? strengthColor[strength] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-orange-400' : strength === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 ${
                    confirmPassword && confirmPassword !== newPassword ? 'border-red-500/60' : ''
                  }`}
                  placeholder="Repeat new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-6 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all mt-2"
            >
              {loading ? 'Updating...' : 'Set Password & Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
