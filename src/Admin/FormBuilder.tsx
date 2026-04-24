import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Plus, Trash2, X, MoreVertical, Search, FileText,
  Image as ImageIcon, Video, AlignLeft, Type, Clock, Calendar, 
  ChevronDown, CircleDot, CheckSquare, List, Copy, SlidersHorizontal,
  FolderOpen, Star, Palette, Eye, Undo, Redo, Share, UploadCloud, LayoutGrid, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "../hooks/useAuth";
import { submitContentChange } from "../lib/cms-service";

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'file' | 'linear' | 'date' | 'time' | 'multiple_choice_grid' | 'checkbox_grid';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  hasOtherOption?: boolean;
  description?: string;
  hasDescription?: boolean;
  hasValidation?: boolean;
  hasGoToSection?: boolean;
  shuffleOptions?: boolean;
}

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: string;
  eventId?: string;
}

export default function FormBuilder({ isOpen, onClose, formId, eventId }: FormBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Untitled form");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [themeColor, setThemeColor] = useState("#673ab7"); // Default Google Forms Purple
  const [activeCardId, setActiveCardId] = useState<string | null>("header");
  const [activeTab, setActiveTab] = useState<"questions" | "responses" | "settings">("questions");
  
  const [importUrl, setImportUrl] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");

  // Auto-persist to localStorage for preview
  useEffect(() => {
    try {
      const previewData = {
        title,
        description,
        fields,
        headerImageUrl,
        themeColor,
        isPreview: true
      };
      localStorage.setItem('ieee_form_builder_preview_v2', JSON.stringify(previewData));
    } catch (e) {
      console.error("Preview save failed:", e);
    }
  }, [title, description, fields, headerImageUrl, themeColor]);
  
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [eventsList, setEventsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
       try {
          const snap = await getDocs(collection(db, "events"));
          const allEvents = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
          const upcoming = allEvents.filter(ev => 
             ev.isUpcoming === true || 
             (ev.date && new Date(ev.date).getTime() > Date.now() - 86400000)
          );
          setEventsList(upcoming);
       } catch (err) { console.error("Failed to load events", err); }
    };
    fetchEvents();
    
    if (formId) {
      loadFormData(formId);
    } else {
      setFields([
        { id: "f1", type: "text", label: "Untitled Question", required: false, placeholder: "Your answer" },
      ]);
    }
  }, [formId]);

  const loadFormData = async (id: string) => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "forms", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || "Untitled form");
        setDescription(data.description || "");
        setFields(data.fields || []);
        setIsActive(data.isActive !== false);
        setHeaderImageUrl(data.headerImageUrl || "");
        if (data.eventId) setSelectedEventId(data.eventId);
      }
    } catch (err) {
      toast.error("Failed to load form configuration");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newId = `f_${Date.now()}`;
    const newField: FormField = {
      id: newId,
      type: "radio",
      label: "",
      required: false,
      options: ["Option 1"]
    };
    
    // Insert after active or at end
    const activeIndex = fields.findIndex(f => f.id === activeCardId);
    if (activeIndex >= 0) {
      const newFields = [...fields];
      newFields.splice(activeIndex + 1, 0, newField);
      setFields(newFields);
    } else {
      setFields([...fields, newField]);
    }
    setActiveCardId(newId);
  };

  const duplicateField = (field: FormField) => {
    const newId = `f_${Date.now()}`;
    const newField = { ...field, id: newId };
    const activeIndex = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(activeIndex + 1, 0, newField);
    setFields(newFields);
    setActiveCardId(newId);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    setActiveCardId("header");
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const addSpecialField = (type: 'title' | 'image' | 'video' | 'section') => {
    let baseLabel = "Untitled title";
    if(type === 'image') baseLabel = "Image";
    if(type === 'video') baseLabel = "Video";
    if(type === 'section') baseLabel = "Untitled Section";
    
    const newField: any = {
      id: `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: type,
      label: baseLabel,
      required: false,
      options: [],
    };
    
    const activeIndex = fields.findIndex(f => f.id === activeCardId);
    let newFields = [...fields];
    if (activeIndex >= 0) {
      newFields.splice(activeIndex + 1, 0, newField);
    } else {
      newFields.push(newField);
    }
    setFields(newFields);
    setActiveCardId(newField.id);
  };

  const importFromGoogleForms = async () => {
    if (!importUrl) return toast.error("Please enter a URL");
    setLoading(true);
    setIsImportOpen(false);
    
    try {
      const proxy = 'https://corsproxy.io/?' + encodeURIComponent(importUrl);
      const res = await fetch(proxy);
      const html = await res.text();
      
      const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\s*<\/script>/s);
      if (!match) {
         toast.error("Could not extract data. Ensure it is a valid, public Google Form link.");
         return;
      }
      
      const data = JSON.parse(match[1]);
      setTitle(data[1][8] || "Imported Form");
      setDescription(data[1][0] || "");
      
      const rawItems = data[1][1] || [];
      const importedFields: FormField[] = [];
      
      rawItems.forEach((item: any) => {
         const qTitle = item[1] || "Untitled Question";
         const qTypeGoogle = item[3];
         const rawProps = item[4]?.[0];
         const qRequired = !!rawProps?.[2];
         
         let myType: FormField['type'] | null = null;
         let opts: string[] = [];
         let hasOther = false;
         
         if (qTypeGoogle === 0) myType = "text";
         else if (qTypeGoogle === 1) myType = "textarea";
         else if (qTypeGoogle === 2) { 
             myType = "radio"; 
             opts = rawProps?.[1]?.map((o:any) => o[0]) || []; 
         }
         else if (qTypeGoogle === 3) { 
             myType = "dropdown"; 
             opts = rawProps?.[1]?.map((o:any) => o[0]) || []; 
         }
         else if (qTypeGoogle === 4) { 
             myType = "checkbox"; 
             opts = rawProps?.[1]?.map((o:any) => o[0]) || []; 
         }
         else if (qTypeGoogle === 5) { myType = "linear"; }
         else if (qTypeGoogle === 9) { myType = "date"; }
         else if (qTypeGoogle === 10) { myType = "time"; }
         else if (qTypeGoogle === 13) { myType = "file" }
         
         // Identify 'Other' option hack
         if (opts.length > 0 && opts[opts.length - 1] === "") {
            opts.pop();
            hasOther = true;
         }
         
         if (myType) {
            importedFields.push({
               id: `f_${Date.now()}_${Math.floor(Math.random()*1000)}_${importedFields.length}`,
               type: myType as any,
               label: qTitle,
               required: qRequired,
               options: opts.filter(Boolean),
               hasOtherOption: hasOther
            });
         }
      });
      
      setFields(importedFields);
      if (importedFields.length > 0) setActiveCardId(importedFields[0].id);
      
      toast.success(`Successfully imported ${importedFields.length} questions!`);
    } catch(e: any) {
      toast.error("Failed to import form: " + e.message);
    } finally {
      setLoading(false);
      setImportUrl("");
    }
  };

  const { userData } = useAuth();

  const handleSave = async () => {
    if (!userData) {
      toast.error("Authentication required to save.");
      return;
    }
    setLoading(true);
    try {
      const formData = {
        title: title || "Untitled form",
        description,
        fields,
        isActive,
        headerImageUrl,
        themeColor,
        eventId: selectedEventId || null,
        updatedAt: serverTimestamp(),
      };

      await submitContentChange(
        userData.uid,
        userData.name || userData.displayName || "Unknown",
        "forms",
        formData,
        formId || null,
        userData.email,
        userData.role,
        formId ? 'update' : 'create'
      );

      const isDirect = userData.role === 'webmaster';
      if (isDirect) {
        toast.success(formId ? "Changes saved successfully!" : "Form created and published!");
      } else {
        toast.success("Form submission sent for review!");
      }
      onClose();
    } catch (err: any) {
      console.error("Save Form Error:", err);
      toast.error("Permission denied or save failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#f0ebf8] flex flex-col font-sans">
      
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div 
              className="p-2 cursor-pointer hover:bg-slate-100 rounded-full transition" 
              onClick={onClose}
              title="Forms home"
            >
              <FileText className="h-7 w-7 text-[#673ab7]" fill="#673ab7" fillOpacity="0.2" />
            </div>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none focus-visible:ring-0 text-[18px] text-slate-700 font-medium p-0 h-auto md:w-64 bg-transparent outline-none focus:border-b-2 focus:border-[#673ab7] rounded-none transition-all px-2 py-0.5"
            />
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full hidden md:block">
              <FolderOpen className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full hidden md:block">
              <Star className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            {/* PALETTE POPOVER */}
            <Popover>
               <PopoverTrigger asChild>
                 <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" title="Customize Theme">
                   <Palette className="h-6 w-6" />
                 </button>
               </PopoverTrigger>
               <PopoverContent className="w-80 p-4 z-[110]" align="end">
                 <h3 className="font-medium text-slate-800 mb-4">Theme options</h3>
                 
                 <div className="space-y-4">
                    <div>
                       <Label className="text-sm font-medium text-slate-700">Header</Label>
                       <p className="text-xs text-slate-500 mb-2">Choose an image</p>
                       <Input 
                          value={headerImageUrl}
                          onChange={e => setHeaderImageUrl(e.target.value)}
                          placeholder="Image URL..."
                          className="h-9 text-sm"
                       />
                    </div>
                    
                    <div>
                       <Label className="text-sm font-medium text-slate-700">Color</Label>
                       <div className="flex gap-2 mt-2">
                          {["#673ab7", "#db4437", "#f4b400", "#0f9d58", "#4285f4", "#FF5722"].map(color => (
                             <button
                                key={color}
                                onClick={() => setThemeColor(color)}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                                style={{ backgroundColor: color }}
                             >
                                {themeColor === color && <div className="w-3 h-3 bg-white rounded-full" />}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
               </PopoverContent>
            </Popover>

            <button 
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" 
              title="Preview" 
              onClick={() => window.open('/register/preview', '_blank')}
            >
              <Eye className="h-6 w-6" />
            </button>
            <button className="p-2 text-slate-400 opacity-50 cursor-not-allowed rounded-full hidden sm:block">
              <Undo className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 opacity-50 cursor-not-allowed rounded-full hidden sm:block">
              <Redo className="h-5 w-5" />
            </button>

            <button 
               className="p-2 text-slate-500 hover:bg-slate-100 rounded-full md:block hidden outline-none" 
               onClick={handleSave} 
               title="Save form progress"
               disabled={loading}
            >
              {loading ? <div className="h-5 w-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : <FolderOpen className="h-5 w-5" />}
            </button>

            <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="ml-2 text-white px-6 font-semibold h-9 rounded shadow-none"
                  style={{ backgroundColor: themeColor }}
                >
                  Send
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden font-sans z-[110]">
                <DialogDescription className="sr-only">Configure form publishing and sharing settings.</DialogDescription>
                <div className="bg-[#f0ebf8] px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <DialogTitle className="text-[22px] font-normal text-slate-800">Send form</DialogTitle>
                </div>
                
                <div className="p-6 space-y-6">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <Label className="text-base font-medium text-slate-800">Link</Label>
                       <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Publish Form"}</Button>
                     </div>
                     <div className="flex gap-2">
                        <Input readOnly value={`https://ieee.socet.edu.in/register/${formId || 'pending'}`} className="bg-slate-50 focus-visible:ring-0 text-slate-600" />
                        <Button variant="secondary" onClick={() => toast.success("Link copied to clipboard")}>Copy</Button>
                     </div>
                   </div>

                   <hr className="border-slate-200" />

                   <div className="space-y-3">
                     <Label className="text-base font-medium text-slate-800">Add collaborators</Label>
                     <p className="text-sm text-slate-500 leading-relaxed">
                        Provide access for other team members to edit this form. Email will only be granted access to this particular form upon Webmaster approval.
                     </p>
                     
                     <div className="flex gap-2 mt-2">
                        <Input 
                           placeholder="Add people and groups" 
                           value={collabEmail}
                           onChange={e => setCollabEmail(e.target.value)}
                           className="flex-1 focus-visible:ring-0 focus:border-[#673ab7] h-10"
                        />
                        <Button 
                           className="h-10 px-6 text-white" 
                           style={{ backgroundColor: themeColor }}
                           onClick={() => {
                              if(!collabEmail) return;
                              toast.success(`Access request for ${collabEmail} submitted to Webmaster for approval.`);
                              setCollabEmail("");
                           }}
                        >
                           Send Invite
                        </Button>
                     </div>
                   </div>
                </div>
              </DialogContent>
            </Dialog>

            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full hidden sm:block">
              <MoreVertical className="h-5 w-5" />
            </button>
            
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold ml-2">
              A
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-8 px-4 h-12">
          <button 
            onClick={() => setActiveTab("questions")}
            className={cn("px-4 font-medium transition-colors border-b-4", activeTab === "questions" ? "text-[#673ab7] border-[#673ab7]" : "text-slate-600 border-transparent hover:bg-slate-50")}
          >
            Questions
          </button>
          <button 
            onClick={() => setActiveTab("responses")}
            className={cn("px-4 font-medium transition-colors border-b-4", activeTab === "responses" ? "text-[#673ab7] border-[#673ab7]" : "text-slate-600 border-transparent hover:bg-slate-50")}
          >
            Responses
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={cn("px-4 font-medium transition-colors border-b-4", activeTab === "settings" ? "text-[#673ab7] border-[#673ab7]" : "text-slate-600 border-transparent hover:bg-slate-50")}
          >
            Settings
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[850px] mx-auto py-4 px-2 md:px-6 flex items-start gap-4 justify-center">
          
          {/* CONTENT AREA */}
          {activeTab === "questions" && (
            <div className="flex-1 space-y-3 max-w-[770px]">
              {/* Header Details Card */}
              <div 
                onClick={() => setActiveCardId("header")}
                className={cn(
                  "bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative cursor-default transition-all flex flex-col",
                  activeCardId === "header" ? "border-l-[6px] border-l-[#4285f4] ml-[-6px]" : ""
                )}
              >
                {/* Custom Image Banner */}
         {headerImageUrl ? (
            <img src={headerImageUrl} alt="Form Header" className="w-full h-32 md:h-48 object-cover" />
         ) : (
            <div className="h-2.5 w-full shrink-0" style={{ backgroundColor: themeColor }} />
         )}
                
                <div className="p-6 md:p-8 pt-6 flex flex-col gap-2">
                  <Input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Form title"
                    className="text-4xl px-0 border-t-0 border-x-0 border-b border-transparent focus-visible:ring-0 focus-visible:border-slate-300 rounded-none bg-transparent placeholder:text-slate-800 font-normal leading-tight h-auto py-1"
                  />
                  <Textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Form description"
                    className="text-[13px] px-0 mt-2 border-t-0 border-x-0 border-b border-transparent focus-visible:ring-0 focus-visible:border-slate-300 rounded-none bg-transparent placeholder:text-slate-600 min-h-[30px] resize-none h-auto py-1"
                  />
                  
                  {activeCardId === "header" && (
                     <div className="mt-4 pt-4 border-t border-dashed border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <Label className="text-xs text-slate-500 mb-1 block">Quick Header Image Update</Label>
                           <Input 
                              value={headerImageUrl}
                              onChange={e => setHeaderImageUrl(e.target.value)}
                              placeholder="Drop an Image URL..."
                              className="h-9 text-sm focus-visible:ring-0 focus-visible:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                           />
                        </div>
                        <div>
                           <Label className="text-xs text-slate-500 mb-1 block flex items-center justify-between">
                              Event Association
                           </Label>
                           <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                              <SelectTrigger className="h-9 text-sm focus:ring-0 focus:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors border-slate-200">
                                <SelectValue placeholder="Link to an event..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-64 z-[110]">
                                <SelectItem value="none" className="text-slate-400">Independent Form (No Event)</SelectItem>
                                {eventsList.length === 0 ? (
                                   <SelectItem value="empty" disabled className="text-slate-500 italic">No upcoming events found</SelectItem>
                                ) : (
                                   eventsList.map(ev => (
                                      <SelectItem key={ev.id} value={ev.id}>{ev.name || ev.title || "Unnamed Event"}</SelectItem>
                                   ))
                                )}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                  )}
                </div>
              </div>

              {/* Questions Loop */}
              {fields.map((field) => {
                const isActive = activeCardId === field.id;

                return (
                  <div 
                    key={field.id}
                    onClick={() => setActiveCardId(field.id)}
                    className={cn(
                      "bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col relative transition-all duration-200 group focus-within:shadow-md",
                      isActive ? "border-l-[6px] border-l-[#4285f4] ml-[-6px]" : "hover:border-slate-300"
                    )}
                  >
                    {/* Drag Handle */}
                    {isActive && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-30 hover:opacity-100 cursor-grab px-2">
                         <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/><div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/>
                         </div>
                         <div className="flex gap-0.5 mt-[2px]">
                            <div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/><div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/>
                         </div>
                         <div className="flex gap-0.5 mt-[2px]">
                            <div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/><div className="w-1 h-1 bg-slate-600 rounded-full bg-slate-900"/>
                         </div>
                      </div>
                    )}

                    <div className={cn("p-6", isActive ? "pt-8" : "pt-6")}>
                      
                      {/* Active Mode Elements (Edit) */}
                      {isActive ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 bg-slate-50 flex flex-col justify-center px-1 border-b border-slate-400 hover:bg-slate-100 focus-within:border-b-2 focus-within:border-b-[#673ab7] transition">
                               <div className="flex items-center w-full">
                                  <Input 
                                    value={field.label}
                                    onChange={e => updateField(field.id, { label: e.target.value })}
                                    placeholder="Question"
                                    className="border-none bg-transparent focus-visible:ring-0 text-[15px] font-medium h-12 w-full"
                                  />
                                  <Button variant="ghost" size="icon" className="text-slate-500 mr-1 hover:bg-slate-200"><ImageIcon className="h-5 w-5"/></Button>
                               </div>
                               {field.hasDescription && (
                                  <Input 
                                    value={field.description || ""}
                                    onChange={e => updateField(field.id, { description: e.target.value })}
                                    placeholder="Description"
                                    className="border-none bg-transparent focus-visible:ring-0 text-[13px] font-normal h-8 w-full placeholder:text-slate-500 rounded-none border-t border-slate-200 focus-visible:border-[#673ab7]"
                                  />
                               )}
                            </div>
                            
                            <Select 
                              value={field.type}
                              onValueChange={(val: any) => updateField(field.id, { type: val })}
                            >
                              <SelectTrigger className="w-full md:w-56 h-12 border border-slate-300 rounded text-sm text-slate-700 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[110]">
                                <SelectItem value="text"><span className="flex items-center gap-3"><AlignLeft className="h-5 w-5 text-slate-500" /> Short answer</span></SelectItem>
                                <SelectItem value="textarea"><span className="flex items-center gap-3"><AlignLeft className="h-5 w-5 text-slate-500" /> Paragraph</span></SelectItem>
                                <div className="h-[1px] bg-slate-200 my-1"/>
                                <SelectItem value="radio"><span className="flex items-center gap-3"><CircleDot className="h-5 w-5 text-slate-500" /> Multiple choice</span></SelectItem>
                                <SelectItem value="checkbox"><span className="flex items-center gap-3"><CheckSquare className="h-5 w-5 text-slate-500" /> Checkboxes</span></SelectItem>
                                <SelectItem value="dropdown"><span className="flex items-center gap-3"><ChevronDown className="h-5 w-5 text-slate-500" /> Dropdown</span></SelectItem>
                                <div className="h-[1px] bg-slate-200 my-1"/>
                                <SelectItem value="file"><span className="flex items-center gap-3"><UploadCloud className="h-5 w-5 text-slate-500" /> File upload</span></SelectItem>
                                <div className="h-[1px] bg-slate-200 my-1"/>
                                <SelectItem value="linear"><span className="flex items-center gap-3"><SlidersHorizontal className="h-5 w-5 text-slate-500" /> Linear scale</span></SelectItem>
                                <SelectItem value="multiple_choice_grid"><span className="flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-slate-500" /> Multiple choice grid</span></SelectItem>
                                <SelectItem value="checkbox_grid"><span className="flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-slate-500" /> Checkbox grid</span></SelectItem>
                                <div className="h-[1px] bg-slate-200 my-1"/>
                                <SelectItem value="date"><span className="flex items-center gap-3"><Calendar className="h-5 w-5 text-slate-500" /> Date</span></SelectItem>
                                <SelectItem value="time"><span className="flex items-center gap-3"><Clock className="h-5 w-5 text-slate-500" /> Time</span></SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Editing Options area based on Type */}
                          <div className="space-y-2 mt-4 ml-2">
                             {(field.type as any) === 'title' && <Textarea placeholder="Description (optional)" className="border-none hover:border-b hover:border-slate-300 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-b-[#673ab7] rounded-none px-0 resize-none h-8 shadow-none text-sm font-normal text-slate-600"/>}
                             {(field.type as any) === 'image' && <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-md mt-2"><ImageIcon className="h-10 w-10 text-slate-300"/></div>}
                             {(field.type as any) === 'video' && <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-md mt-2"><Video className="h-10 w-10 text-slate-300"/></div>}
                             {(field.type as any) === 'section' && <div className="py-3 border-t-2 border-[#673ab7] border-dashed w-full text-sm font-medium text-[#673ab7] flex items-center gap-2"><div className="w-4 h-2 bg-[#673ab7] rounded-sm"/> After section 1 Continue to next section</div>}

                             {(field.type === 'text') && <div className="w-[60%] border-b border-dotted border-slate-300 pb-1 text-sm text-slate-400">Short answer text</div>}
                             {(field.type === 'textarea') && <div className="w-[80%] border-b border-dotted border-slate-300 pb-1 text-sm text-slate-400 mt-4 mb-2">Long answer text</div>}

                             {field.hasValidation && (field.type === 'text' || field.type === 'textarea') && (
                                <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-dotted border-slate-300 w-full text-[13px]">
                                   <Select defaultValue={field.label.toLowerCase().includes('email') ? 'Text' : 'Length'}>
                                     <SelectTrigger className="w-24 h-9 text-slate-700 bg-transparent border-none shadow-none focus:ring-0"><SelectValue/></SelectTrigger>
                                     <SelectContent className="z-[110]">
                                        <SelectItem value="Number">Number</SelectItem>
                                        <SelectItem value="Text">Text</SelectItem>
                                        <SelectItem value="Length">Length</SelectItem>
                                        <SelectItem value="Regular expression">Regular expression</SelectItem>
                                     </SelectContent>
                                   </Select>
                                   
                                   <Select defaultValue={field.label.toLowerCase().includes('email') ? 'Email' : 'Maximum character count'}>
                                     <SelectTrigger className="w-48 h-9 text-slate-700 bg-transparent border-none shadow-none focus:ring-0"><SelectValue/></SelectTrigger>
                                     <SelectContent className="z-[110]">
                                        <SelectItem value="Maximum character count">Maximum character count</SelectItem>
                                        <SelectItem value="Contains">Contains</SelectItem>
                                        <SelectItem value="Email">Email</SelectItem>
                                     </SelectContent>
                                   </Select>

                                   <div className="flex-1 min-w-[200px] border-b border-slate-300 focus-within:border-b-2 focus-within:border-b-[#673ab7] h-9 ml-2">
                                     <Input 
                                        placeholder="Custom error text" 
                                        className="w-full h-full border-none bg-transparent shadow-none focus-visible:ring-0 px-0 rounded-none placeholder:text-slate-500" 
                                        defaultValue={field.label.toLowerCase().includes('email') ? 'Please enter a valid email address' : ''}
                                     />
                                   </div>
                                   
                                   <Button variant="ghost" size="icon" onClick={() => updateField(field.id, { hasValidation: false })} ><X className="w-4 h-4 text-slate-400"/></Button>
                                </div>
                             )}
                             {(field.type === 'file') && (
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded text-sm text-slate-500 flex flex-col items-center justify-center border-dashed">
                                   <UploadCloud className="h-6 w-6 text-slate-400 mb-2"/>
                                   Respondents will upload a file here
                                </div>
                             )}
                             {(field.type === 'date') && <div className="w-[200px] border-b border-dotted border-slate-300 pb-1 text-sm text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Month, day, year</div>}
                             {(field.type === 'time') && <div className="w-[150px] border-b border-dotted border-slate-300 pb-1 text-sm text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Time</div>}
                             
                             {/* Linear Scale Editor fake UI */}
                             {field.type === 'linear' && (
                                <div className="flex items-center gap-4 text-sm mt-4">
                                   <Select defaultValue="1">
                                      <SelectTrigger className="w-16"><SelectValue/></SelectTrigger>
                                      <SelectContent className="z-[110]"><SelectItem value="0">0</SelectItem><SelectItem value="1">1</SelectItem></SelectContent>
                                   </Select>
                                   <span>to</span>
                                   <Select defaultValue="5">
                                      <SelectTrigger className="w-16"><SelectValue/></SelectTrigger>
                                      <SelectContent className="z-[110]"><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem></SelectContent>
                                   </Select>
                                </div>
                             )}

                             {/* Multi-option Editor (Radio, Check, Dropdown) */}
                             {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
                                <div className="space-y-3">
                                   {(field.options || []).map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-3">
                                         {field.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                         {field.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                                         {field.type === 'dropdown' && <span className="text-slate-400 font-medium text-sm w-4 text-right">{oIdx + 1}.</span>}
                                         
                                         <Input 
                                            value={opt}
                                            onChange={(e) => {
                                               const newOpts = [...(field.options || [])];
                                               newOpts[oIdx] = e.target.value;
                                               updateField(field.id, { options: newOpts });
                                            }}
                                            className="border-none hover:border-b hover:border-slate-300 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-b-[#673ab7] rounded-none px-0 h-8 flex-1 placeholder:text-slate-500"
                                         />
                                         
                                         <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600 h-8 w-8"><ImageIcon className="h-4 w-4"/></Button>
                                         
                                         {field.hasGoToSection && (field.type === 'radio' || field.type === 'dropdown') && (
                                            <Select defaultValue="continue">
                                              <SelectTrigger className="w-44 h-8 ml-2 text-xs bg-white text-slate-600"><SelectValue/></SelectTrigger>
                                              <SelectContent className="z-[110]">
                                                <SelectItem value="continue">Continue to next section</SelectItem>
                                                <SelectItem value="submit">Submit form</SelectItem>
                                              </SelectContent>
                                            </Select>
                                         )}

                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-slate-400 hover:text-slate-600 h-8 w-8"
                                            onClick={() => updateField(field.id, { options: field.options?.filter((_, i) => i !== oIdx) })}
                                         ><X className="h-5 w-5"/></Button>
                                      </div>
                                   ))}

                                   {/* 'Add Option' Row */}
                                   <div className="flex items-center gap-3 text-sm pt-1">
                                      {field.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                      {field.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                                      {field.type === 'dropdown' && <span className="text-slate-400 font-medium text-sm w-4 text-right">{(field.options?.length || 0 )+ 1}.</span>}
                                      
                                      <span 
                                         className="text-slate-400 hover:underline cursor-pointer"
                                         onClick={() => updateField(field.id, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
                                      >
                                         Add option
                                      </span>
                                      
                                      {field.type !== 'dropdown' && !field.hasOtherOption && (
                                         <>
                                            <span className="text-slate-400">or</span>
                                            <span 
                                               className="text-[#4285f4] font-medium hover:underline cursor-pointer bg-blue-50/50 px-2 py-1 rounded"
                                               onClick={() => updateField(field.id, { hasOtherOption: true })}
                                            >
                                               add "Other"
                                            </span>
                                         </>
                                      )}
                                   </div>

                                   {/* 'Other' Row preview */}
                                   {(field.type !== 'dropdown' && field.hasOtherOption) && (
                                     <div className="flex items-center gap-3 pt-1">
                                        {field.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                        {field.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                                        <div className="flex-1 text-slate-500 border-b border-dotted border-slate-300 h-8 flex items-center px-1">Other...</div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-slate-400 hover:text-slate-600 h-8 w-8"
                                            onClick={() => updateField(field.id, { hasOtherOption: false })}
                                         ><X className="h-5 w-5"/></Button>
                                     </div>
                                   )}
                                </div>
                             )}
                          </div>
                        </>
                      ) : (
                        /* INACTIVE STATE (View Only) */
                        <>
                          <div className="mb-4">
                            <span className="text-base text-slate-800">{field.label || "Untitled Question"}</span>
                            {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                          </div>
                          <div className="space-y-2 select-none pointer-events-none">
                             {(field.type as any) === 'title' && <div className="text-sm font-normal text-slate-500 italic mt-2 text-left">Description</div>}
                             {(field.type as any) === 'image' && <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-md mt-2"><ImageIcon className="h-10 w-10 text-slate-300"/></div>}
                             {(field.type as any) === 'video' && <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-md mt-2"><Video className="h-10 w-10 text-slate-300"/></div>}
                             {(field.type as any) === 'section' && <div className="py-3 border-t-2 border-[#673ab7] w-full text-sm font-medium text-[#673ab7] flex items-center gap-2"><div className="w-4 h-2 bg-[#673ab7] rounded-sm"/> Continue to next section</div>}

                             {(field.type === 'text') && <div className="text-slate-400 border-b border-dotted border-slate-300 pb-1 w-[60%] text-[13px]">Short answer text</div>}
                             {(field.type === 'textarea') && <div className="text-slate-400 border-b border-dotted border-slate-300 pb-1 w-[80%] text-[13px]">Long answer text</div>}
                             {(field.type === 'file') && <div className="text-slate-400 border border-slate-200 rounded p-3 w-max bg-slate-50 text-[13px] flex items-center gap-2"><UploadCloud className="w-4 h-4"/> File upload preview</div>}
                             {(field.type === 'date') && <div className="text-slate-400 border-b border-dotted border-slate-300 pb-1 w-[200px] text-[13px] flex items-center gap-2"><Calendar className="w-4 h-4"/> Month, day, year</div>}
                             {(field.type === 'time') && <div className="text-slate-400 border-b border-dotted border-slate-300 pb-1 w-[150px] text-[13px] flex items-center gap-2"><Clock className="w-4 h-4"/> Time</div>}
                             
                             {/* Inactive Option List */}
                             {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
                                <div className="space-y-3 pl-1">
                                   {(field.options || []).map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-3">
                                         {field.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                         {field.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                                         {field.type === 'dropdown' && <span className="text-slate-400 text-[13px]">{oIdx + 1}.</span>}
                                         <span className="text-slate-700 text-[13px]">{opt || `Option ${oIdx + 1}`}</span>
                                      </div>
                                   ))}
                                   {field.hasOtherOption && (
                                     <div className="flex items-center gap-3">
                                         {field.type === 'radio' && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                         {field.type === 'checkbox' && <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                                         <span className="text-slate-500 text-[13px] border-b border-dotted border-slate-300 pb-1">Other...</span>
                                     </div>
                                   )}
                                </div>
                             )}
                          </div>
                        </>
                      )}

                    </div>

                    {/* CARD FOOTER (Only when active) */}
                    {isActive && (
                      <div className="mt-4 border-t border-slate-200 px-6 py-3 flex justify-end items-center gap-2 md:gap-4 bg-white rounded-b-lg">
                        <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full cursor-not-allowed hidden sm:block">
                          <ImageIcon className="h-5 w-5" />
                        </button>
                        <button 
                           className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition"
                           onClick={() => duplicateField(field)}
                           title="Duplicate"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                        <button 
                           className="text-slate-500 hover:bg-slate-100 p-2 rounded-full hover:text-slate-800 transition"
                           onClick={() => removeField(field.id)}
                           title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        
                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        
                        <div className="flex items-center gap-2">
                           <span className="text-[13px] text-slate-700 font-medium">Required</span>
                           <Switch 
                             checked={field.required}
                             onCheckedChange={(val) => updateField(field.id, { required: val })}
                           />
                        </div>
                        
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full outline-none">
                                <MoreVertical className="h-5 w-5" />
                              </button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-64 z-[110]">
                              <DropdownMenuItem className="py-2 cursor-pointer" onClick={() => updateField(field.id, { hasDescription: !field.hasDescription })}>
                                 <div className="flex w-full items-center justify-between">
                                     Description {field.hasDescription && <Check className="w-4 h-4 ml-2" />}
                                 </div>
                              </DropdownMenuItem>
                              
                              {(field.type === 'text' || field.type === 'textarea') && (
                                 <DropdownMenuItem className="py-2 cursor-pointer" onClick={() => updateField(field.id, { hasValidation: !field.hasValidation })}>
                                   <div className="flex w-full items-center justify-between">
                                      Response validation {field.hasValidation && <Check className="w-4 h-4 ml-2" />}
                                   </div>
                                 </DropdownMenuItem>
                              )}

                              {(field.type === 'radio' || field.type === 'dropdown') && (
                                 <DropdownMenuItem className="py-2 cursor-pointer" onClick={() => updateField(field.id, { hasGoToSection: !field.hasGoToSection })}>
                                    <div className="flex w-full items-center justify-between">
                                        Go to section based on answer {field.hasGoToSection && <Check className="w-4 h-4 ml-2" />}
                                    </div>
                                 </DropdownMenuItem>
                              )}

                              {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown' || field.type === 'multiple_choice_grid' || field.type === 'checkbox_grid') && (
                                 <DropdownMenuItem className="py-2 cursor-pointer" onClick={() => updateField(field.id, { shuffleOptions: !field.shuffleOptions })}>
                                     <div className="flex w-full items-center justify-between">
                                        Shuffle option order {field.shuffleOptions && <Check className="w-4 h-4 ml-2" />}
                                     </div>
                                 </DropdownMenuItem>
                              )}
                           </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RESPONSES TAB */}
          {activeTab === "responses" && (
            <div className="flex-1 max-w-[770px] space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-6">
                   <h2 className="text-2xl font-normal text-slate-800">0 responses</h2>
                   <div className="flex gap-2">
                     <button className="p-2 border border-slate-300 rounded hover:bg-slate-50 text-[#0f9d58] font-medium flex items-center justify-center bg-white shadow-sm h-10 w-10">
                        {/* Fake sheets icon */}
                        <div className="w-4 h-5 border-2 border-current rounded flex flex-col items-center justify-center gap-0.5">
                           <div className="w-2 h-[2px] bg-current"/>
                           <div className="w-2 h-[2px] bg-current"/>
                        </div>
                     </button>
                     <button className="p-2 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5 text-slate-600"/></button>
                   </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-slate-200">
                   <span className="text-sm font-medium text-slate-800">Accepting responses</span>
                   <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="flex-1 max-w-[770px] space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex justify-between items-center">
                 <div>
                    <h3 className="text-base text-slate-800 font-medium">Make this a quiz</h3>
                    <p className="text-sm text-slate-500">Assign point values, set answers, and automatically provide feedback</p>
                 </div>
                 <Switch checked={false} />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex justify-between items-center">
                 <div>
                    <h3 className="text-base text-slate-800 font-medium">Accepting responses</h3>
                    <p className="text-sm text-slate-500">Turn this off to immediately block new submissions</p>
                 </div>
                 <Switch checked={isActive} onCheckedChange={setIsActive} className={isActive ? "bg-[#673ab7]" : "bg-slate-300"} />
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex justify-between items-center">
                 <div>
                    <h3 className="text-base text-slate-800 font-medium">Event Association</h3>
                    <p className="text-sm text-slate-500 mb-2">Bind this form exclusively to an upcoming event</p>
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                       <SelectTrigger className="w-[300px] border-slate-200 focus:ring-0 focus:border-[#673ab7]">
                         <SelectValue placeholder="Select an event..." />
                       </SelectTrigger>
                       <SelectContent className="max-h-64 z-[110]">
                         <SelectItem value="none" className="text-slate-400">Independent Form (No Event)</SelectItem>
                         {eventsList.length === 0 ? (
                            <SelectItem value="empty" disabled className="text-slate-500 italic">No upcoming events found</SelectItem>
                         ) : (
                            eventsList.map(ev => (
                               <SelectItem key={ev.id} value={ev.id}>{ev.name || ev.title || "Unnamed Event"}</SelectItem>
                            ))
                         )}
                       </SelectContent>
                    </Select>
                 </div>
              </div>
            </div>
          )}

          {/* ── FLOATING TOOLBAR ── */}
          {activeTab === "questions" && (
            <div className="w-[50px] shrink-0 sticky top-4 mt-8 hidden sm:block">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col items-center py-2 space-y-1">
                <button 
                  onClick={addField}
                  className="p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full transition" 
                  title="Add question"
                >
                  <Plus className="h-[22px] w-[22px]" />
                </button>
                
                <button 
                   onClick={() => setIsImportOpen(true)}
                   className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition" 
                   title="Import questions"
                >
                   <div className="rotate-180 pointer-events-none"><Undo className="h-5 w-5" /></div>
                </button>

                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                  <DialogContent className="z-[110] sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Import from Google Forms</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                       <p className="text-sm text-slate-500">Paste the public URL of a Google Form. We will reverse-engineer it and clone its questions perfectly into your editor.</p>
                       <Input 
                         value={importUrl}
                         onChange={e => setImportUrl(e.target.value)}
                         placeholder="https://docs.google.com/forms/d/e/.../viewform"
                       />
                    </div>
                    <DialogFooter>
                       <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                       <Button onClick={importFromGoogleForms} className="bg-[#673ab7] hover:bg-[#5e35a6] text-white" disabled={loading}>
                         {loading ? "Extracting..." : "Import Form"}
                       </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="text-slate-300 my-1">—</div>
                <button 
                  onClick={() => addSpecialField('title')}
                  className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition" 
                  title="Add title and description"
                >
                  <Type className="h-5 w-5 pointer-events-none" />
                </button>
                <button 
                  onClick={() => addSpecialField('image')}
                  className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition" 
                  title="Add image"
                >
                  <ImageIcon className="h-5 w-5 pointer-events-none" />
                </button>
                <button 
                  onClick={() => addSpecialField('video')}
                  className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition" 
                  title="Add video"
                >
                  <Video className="h-5 w-5 pointer-events-none" />
                </button>
                <div className="text-slate-300 my-1">—</div>
                <button 
                  onClick={() => addSpecialField('section')}
                  className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition" 
                  title="Add section"
                >
                  <div className="w-5 h-[14px] border-y-2 border-slate-500 pointer-events-none" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
