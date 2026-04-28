import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileSpreadsheet, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlatformSettings = () => {
  const [folderId, setFolderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheets, setSheets] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [creatingSheet, setCreatingSheet] = useState(false);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "certificates");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().folderId) {
        setFolderId(docSnap.data().folderId);
        return docSnap.data().folderId;
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      toast.error("Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const fetchSheets = async (currentFolderId: string) => {
    if (!currentFolderId) return;
    setLoadingSheets(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/admin/drive", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Firebase-Api-Key": import.meta.env.VITE_FIREBASE_API_KEY
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch sheets");
      
      setSheets(data.sheets || []);
    } catch (err: any) {
      console.error("Failed to load sheets", err);
      toast.error(err.message || "Failed to load sheets from Google Drive.");
    } finally {
      setLoadingSheets(false);
    }
  };

  useEffect(() => {
    fetchSettings().then((fid) => {
      if (fid) fetchSheets(fid);
    });
  }, []);

  const handleSave = async () => {
    if (!folderId.trim()) {
      toast.error("Folder ID cannot be empty.");
      return;
    }
    
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "certificates");
      await setDoc(docRef, { folderId: folderId.trim() }, { merge: true });
      toast.success("Certificate settings updated successfully!");
      fetchSheets(folderId.trim());
    } catch (err: any) {
      console.error("Failed to save settings", err);
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSheet = async () => {
    if (!newSheetName.trim()) {
      toast.error("Spreadsheet name is required.");
      return;
    }

    setCreatingSheet(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/admin/drive", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Firebase-Api-Key": import.meta.env.VITE_FIREBASE_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sheetName: newSheetName.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create sheet");
      
      toast.success("Spreadsheet created successfully!");
      setShowCreateDialog(false);
      setNewSheetName("");
      fetchSheets(folderId); // Refresh list
    } catch (err: any) {
      console.error("Failed to create sheet", err);
      toast.error(err.message || "Failed to create spreadsheet.");
    } finally {
      setCreatingSheet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Drive Manager</h2>
        <p className="text-slate-500 mt-2">Manage global Google Drive configuration and spreadsheets for the IEEE CMS platform.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-1">Certificate Folder Configuration</h3>
          <p className="text-sm text-slate-500">
            Configure the specific Google Drive folder where official certificates are securely stored in Google Sheets.
          </p>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="folderId" className="text-slate-700 dark:text-slate-300 font-bold">
              Google Drive Folder ID
            </Label>
            <Input
              id="folderId"
              placeholder="e.g. 1oQLfMqDKVvZiAMUJqecn6Asb79MVFfVd"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 font-mono"
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              This is the unique ID found in the URL of the Google Drive folder. Ensure the folder is shared with the Service Account email.
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto mt-4"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Settings</>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Linked Spreadsheets</h3>
            <p className="text-sm text-slate-500">
              Google Sheets found inside the configured folder.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchSheets(folderId)} disabled={loadingSheets || !folderId}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSheets ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)} disabled={!folderId}>
              <Plus className="w-4 h-4 mr-2" /> Add Sheet
            </Button>
          </div>
        </div>

        {loadingSheets ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No spreadsheets found in this folder.</p>
            <p className="text-sm text-slate-400 mt-1">Make sure the folder is shared with the Service Account.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Spreadsheet Name</th>
                  <th className="px-6 py-4 font-bold hidden sm:table-cell">Created</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sheets.map((sheet: any) => (
                  <tr key={sheet.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center">
                      <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                      {sheet.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                      {new Date(sheet.createdTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={sheet.webViewLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline font-medium text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
                      >
                        Open <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Spreadsheet</DialogTitle>
            <DialogDescription>
              This will create a new Google Sheet inside the configured folder with the standard certificate headers pre-filled.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheetName">Spreadsheet Name</Label>
              <Input 
                id="sheetName" 
                placeholder="e.g. 2026 Hackathon Certificates" 
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creatingSheet}>Cancel</Button>
            <Button onClick={handleCreateSheet} disabled={creatingSheet}>
              {creatingSheet ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Sheet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformSettings;
