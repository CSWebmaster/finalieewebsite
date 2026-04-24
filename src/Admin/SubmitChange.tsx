import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { SECTIONS, SectionId } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle2 } from 'lucide-react';

export default function SubmitChange() {
  const { userData } = useAuth();
  const [section, setSection] = useState<SectionId | ''>('');
  const [action, setAction]   = useState<'create' | 'update' | 'delete'>('create');
  const [docId, setDocId]     = useState('');
  const [title, setTitle]     = useState('');
  const [description, setDescription] = useState('');
  const [jsonData, setJsonData]       = useState('');
  const [jsonError, setJsonError]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const validateJson = (val: string) => {
    if (!val.trim()) { setJsonError(''); return true; }
    try { JSON.parse(val); setJsonError(''); return true; }
    catch { setJsonError('Invalid JSON — check your formatting.'); return false; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;
    if (!validateJson(jsonData)) return;

    setLoading(true);
    try {
      let parsedData: any = {};
      if (jsonData.trim()) parsedData = JSON.parse(jsonData);
      if (title) parsedData.title = title;
      if (description) parsedData.description = description;

      await addDoc(collection(db, 'pendingChanges'), {
        section,
        action,
        docId: (action !== 'create' && docId) ? docId : null,
        data: parsedData,
        status: 'pending',
        submittedBy: userData!.uid,
        submittedByEmail: userData!.email,
        submittedByName: userData!.displayName,
        submittedAt: serverTimestamp(),
        reviewedBy: null,
        reviewedByEmail: null,
        reviewedAt: null,
        rejectionReason: null,
      });

      setSubmitted(true);
    } catch (err: any) {
      alert('Error submitting: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="p-5 bg-green-100 dark:bg-green-900/30 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submitted!</h2>
        <p className="text-gray-500 max-w-sm text-center">
          Your change has been sent to Webmasters for review. You'll see the status update in "My Submissions".
        </p>
        <Button onClick={() => { setSubmitted(false); setSection(''); setTitle(''); setDescription(''); setJsonData(''); setDocId(''); }}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit a Change</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Propose an addition or edit. A Webmaster will review and approve/reject it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Section *</label>
          <Select value={section} onValueChange={(v) => setSection(v as SectionId)}>
            <SelectTrigger><SelectValue placeholder="Choose a section" /></SelectTrigger>
            <SelectContent>
              {SECTIONS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Action *</label>
          <div className="flex gap-3">
            {(['create', 'update', 'delete'] as const).map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAction(a)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                  action === a
                    ? a === 'delete'
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Doc ID for update/delete */}
        {action !== 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Document ID (Firestore ID of the item to {action}) *
            </label>
            <Input
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. abc123XYZ"
              required
            />
          </div>
        )}

        {/* Title */}
        {action !== 'delete' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title / Name *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI Workshop 2025"
                required={action === 'create'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Additional Data (JSON — optional)
              </label>
              <Textarea
                value={jsonData}
                onChange={(e) => { setJsonData(e.target.value); validateJson(e.target.value); }}
                placeholder={'{\n  "date": "2025-09-01",\n  "imageUrl": "https://..."\n}'}
                rows={5}
                className={`font-mono text-xs ${jsonError ? 'border-red-400' : ''}`}
              />
              {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
              <p className="text-gray-400 text-xs mt-1">
                Title and description above are merged into this data automatically.
              </p>
            </div>
          </>
        )}

        {action === 'delete' && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-700 dark:text-red-400">
            ⚠ You are requesting the <strong>deletion</strong> of document <code>{docId || '...'}</code> from <strong>{section || '...'}</strong>. 
            A Webmaster must approve this before any data is removed.
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !section}
          className="w-full py-5 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit for Webmaster Review'}
        </Button>
      </form>
    </div>
  );
}
