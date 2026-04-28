import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const PlatformSettings = () => {
  const [folderId, setFolderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "certificates");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().folderId) {
          setFolderId(docSnap.data().folderId);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
        toast.error("Failed to load platform settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
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
    } catch (err: any) {
      console.error("Failed to save settings", err);
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Settings</h2>
        <p className="text-slate-500 mt-2">Manage global configuration for the IEEE CMS platform.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-1">Certificate Portal</h3>
          <p className="text-sm text-slate-500">
            Configure the Google Drive folder where official certificates are securely stored in Google Sheets.
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
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
