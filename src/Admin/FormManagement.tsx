import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Plus, 
  Search, 
  FormInput, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ClipboardList,
  Eye,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FormBuilder from "./FormBuilder";
import { toast } from "sonner";

export default function FormManagement() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>();

  useEffect(() => {
    const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setForms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "forms", id));
      toast.success("Form deleted");
    } catch (err) {
      toast.error("Failed to delete form");
    }
  };

  const toggleStatus = async (form: any) => {
    try {
      await updateDoc(doc(db, "forms", form.id), { isActive: !form.isActive });
      toast.success(`Form ${!form.isActive ? 'activated' : 'paused'}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredForms = forms.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FormInput className="h-6 w-6 text-blue-600" />
            Dynamic Form Management
          </h2>
          <p className="text-sm text-slate-500">Create and manage custom registration forms for events.</p>
        </div>
        <Button 
          onClick={() => { setSelectedFormId(undefined); setIsBuilderOpen(true); }}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Form
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search forms by title..." 
          className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))
        ) : filteredForms.length > 0 ? (
          filteredForms.map((form) => (
            <Card key={form.id} className="group overflow-hidden rounded-3xl border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900 transition-all duration-300 hover:translate-y-[-4px]">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                      <DropdownMenuItem onClick={() => { setSelectedFormId(form.id); setIsBuilderOpen(true); }} className="gap-2 rounded-lg">
                        <Edit2 className="h-4 w-4 text-amber-500" /> Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(form)} className="gap-2 rounded-lg">
                        <Settings className="h-4 w-4 text-blue-500" /> {form.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(form.id)} className="gap-2 rounded-lg text-red-600">
                        <Trash2 className="h-4 w-4" /> Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{form.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{form.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Badge variant={form.isActive ? 'default' : 'secondary'} className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${form.isActive ? 'bg-emerald-500' : ''}`}>
                    {form.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {form.fields?.length || 0} Fields
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 rounded-xl text-[11px] font-bold hover:bg-white" disabled>
                  <Eye className="mr-2 h-3.5 w-3.5" /> View Responses
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-xl text-[11px] font-bold hover:bg-white" asChild>
                   <a href={`/register/${form.eventId || 'preview'}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" /> Preview Form
                   </a>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FormInput className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-slate-400">No forms found.</h3>
            <p className="text-sm text-slate-500 mt-1">Start by creating your first registration template.</p>
          </div>
        )}
      </div>

      <FormBuilder 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        formId={selectedFormId} 
      />
    </div>
  );
}
