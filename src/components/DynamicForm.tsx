import React, { useState } from "react";
import { SHEETS_WEBHOOK_URL, SHEETS_SECRET } from "@/config/sheets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  hasOtherOption?: boolean;
  description?: string;
  validation?: {
     enabled: boolean;
     type: string;      // e.g., 'Length', 'Regular expression', 'Number'
     condition: string; // e.g., 'Maximum character count', 'Matches'
     value: string;
     errorText: string;
  };
  hasDescription?: boolean;
  shuffleOptions?: boolean;
}

interface DynamicFormProps {
  formConfig: {
    id: string;
    title: string;
    description?: string;
    headerImageUrl?: string;
    fields: FormField[];
  };
  formType: string;
  eventId?: string;
  eventName?: string;
  isPreview?: boolean;
  onSuccess?: () => void;
}

export default function DynamicForm({ formConfig, formType, eventName, isPreview, onSuccess }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [otherData, setOtherData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const current = Array.isArray(prev[id]) ? prev[id] : [];
      if (checked) {
        return { ...prev, [id]: [...current, value] };
      } else {
        return { ...prev, [id]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleOtherChange = (id: string, value: string) => {
    setOtherData(prev => ({ ...prev, [id]: value }));
    // Automatically select "Other" if they type in the box
    if (value && formData[id] !== '__OTHER__') {
       const field = formConfig.fields.find(f => f.id === id);
       if (field?.type === 'radio') {
          handleChange(id, '__OTHER__');
       } else if (field?.type === 'checkbox') {
          const current = Array.isArray(formData[id]) ? formData[id] : [];
          if (!current.includes('__OTHER__')) {
            handleChange(id, [...current, '__OTHER__']);
          }
       }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields explicitly (especially array boxes like checkboxes)
    const missingFields: string[] = [];
    formConfig.fields.forEach(f => {
       if (f.required) {
          const val = formData[f.id];
          if (val === undefined || val === null || val === '') {
             missingFields.push(f.label);
          } else if (Array.isArray(val) && val.length === 0) {
             missingFields.push(f.label);
          }
       }
    });

    if (missingFields.length > 0) {
      toast.error(`Please fill out required fields: ${missingFields[0]}`);
      setLoading(false);
      return;
    }

    try {
      if (isPreview) {
        toast.success("This is a preview. Form validation successful.");
        setSubmitted(true);
        if (onSuccess) onSuccess();
        return;
      }

      const processedData = { ...formData };
      
      // Inject the 'Other' text into the final payload
      formConfig.fields.forEach(f => {
        if (f.type === 'checkbox' && Array.isArray(processedData[f.id])) {
          const arr = processedData[f.id] as string[];
          if (arr.includes('__OTHER__')) {
             processedData[f.id] = arr.map(item => item === '__OTHER__' ? `Other: ${otherData[f.id] || ''}` : item).join(', ');
          } else {
             processedData[f.id] = arr.join(', ');
          }
        }
        if (f.type === 'radio' && processedData[f.id] === '__OTHER__') {
          processedData[f.id] = `Other: ${otherData[f.id] || ''}`;
        }
      });

      await fetch(SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: SHEETS_SECRET,
          type: formType,
          eventName: eventName || formConfig.title,
          values: processedData
        }),
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Submission Error:", err);
      toast.error("Failed to submit. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return null;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 animate-in fade-in duration-500">
      
      {isPreview && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center gap-3 font-medium">
           <AlertCircle className="h-5 w-5" />
           You are viewing this form in preview mode. Submissions are not recorded.
        </div>
      )}

      {/* ── GOOGLE FORMS STYLE: Section Title Header ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col">
         {formConfig.headerImageUrl ? (
            <img src={formConfig.headerImageUrl} alt="Form Header" className="w-full h-32 md:h-48 object-cover" />
         ) : (
            <div className="h-2.5 w-full shrink-0" style={{ backgroundColor: formConfig.themeColor || '#673ab7' }} />
         )}
         
         <div className="px-6 pt-6 pb-6 space-y-3">
            <h1 className="text-3xl font-normal text-slate-900 dark:text-white pb-2 leading-tight">
               {formConfig.title}
            </h1>
            {formConfig.description && (
               <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                 {formConfig.description}
               </p>
            )}
            <div className="text-xs text-slate-500 font-medium pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-red-500 font-bold">* Indicates required question</span>
            </div>
         </div>
      </div>

      {/* ── QUESTIONS AS MATERIAL CARDS ── */}
      {formConfig.fields.map((field) => (
         <div 
           key={field.id} 
           className="bg-white dark:bg-slate-900/80 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900 focus-within:border-l-8 focus-within:border-l-[#4285f4] focus-within:pl-4"
         >
            <div className="mb-4 text-base font-normal text-slate-800 dark:text-slate-200 leading-snug">
               {field.label} {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
            </div>

            <div className="mt-2">
               {/* TEXT & NUMBER & EMAIL */}
               {(field.type === "text" || field.type === "number" || field.type === "email") && (
                 <Input 
                   type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                   required={field.required}
                   placeholder="Your answer"
                   className="w-full max-w-sm border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-b-[#673ab7] px-0 shadow-none"
                   value={formData[field.id] || ""}
                   onChange={e => handleChange(field.id, e.target.value)}
                 />
               )}

               {/* TEXTAREA (Paragraph) */}
               {field.type === "textarea" && (
                 <Textarea 
                   required={field.required}
                   placeholder="Your answer"
                   className="w-full border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-b-[#673ab7] px-0 shadow-none min-h-[40px] resize-y"
                   value={formData[field.id] || ""}
                   onChange={e => handleChange(field.id, e.target.value)}
                 />
               )}

               {/* DATE */}
               {field.type === "date" && (
                 <Input 
                   type="date"
                   required={field.required}
                   className="w-[200px] border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus-visible:ring-1 focus-visible:ring-[#673ab7]"
                   value={formData[field.id] || ""}
                   onChange={e => handleChange(field.id, e.target.value)}
                 />
               )}

               {/* TIME */}
               {field.type === "time" && (
                 <Input 
                   type="time"
                   required={field.required}
                   className="w-[150px] border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus-visible:ring-1 focus-visible:ring-[#673ab7]"
                   value={formData[field.id] || ""}
                   onChange={e => handleChange(field.id, e.target.value)}
                 />
               )}

               {/* DROPDOWN */}
               {field.type === "dropdown" && (
                 <Select 
                   required={field.required}
                   onValueChange={val => handleChange(field.id, val)}
                   value={formData[field.id] || ""}
                 >
                   <SelectTrigger className="w-full max-w-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#673ab7]">
                     <SelectValue placeholder="Choose" />
                   </SelectTrigger>
                   <SelectContent>
                     {field.options?.map(opt => (
                       <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               )}

               {/* RADIO */}
               {field.type === "radio" && (
                 <RadioGroup 
                   required={field.required && !formData[field.id]} 
                   value={formData[field.id] || ""}
                   onValueChange={val => handleChange(field.id, val)}
                   className="space-y-3"
                 >
                   {field.options?.map(opt => (
                     <div key={opt} className="flex items-center space-x-3">
                       <RadioGroupItem value={opt} id={`${field.id}-${opt}`} className="text-[#673ab7] focus-visible:ring-[#673ab7]" />
                       <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer flex-1 py-1">{opt}</Label>
                     </div>
                   ))}
                   {field.hasOtherOption && (
                     <div className="flex items-center space-x-3">
                       <RadioGroupItem value="__OTHER__" id={`${field.id}-other`} className="text-[#673ab7]" />
                       <Label htmlFor={`${field.id}-other`} className="font-normal cursor-pointer py-1">Other:</Label>
                       <Input 
                         value={otherData[field.id] || ""}
                         onChange={e => handleOtherChange(field.id, e.target.value)}
                         className={cn(
                           "h-8 flex-1 max-w-[200px] border-t-0 border-x-0 border-b border-slate-300 rounded-none bg-transparent focus-visible:ring-0 px-1 shadow-none transition-all",
                           formData[field.id] === "__OTHER__" ? "border-b-[#673ab7]" : ""
                         )}
                       />
                     </div>
                   )}
                 </RadioGroup>
               )}

               {/* CHECKBOX */}
               {field.type === "checkbox" && (
                 <div className="space-y-3">
                   {field.options?.map(opt => {
                      const isChecked = Array.isArray(formData[field.id]) && formData[field.id].includes(opt);
                      return (
                        <div key={opt} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`${field.id}-${opt}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(field.id, opt, checked as boolean)}
                            className="data-[state=checked]:bg-[#673ab7] data-[state=checked]:border-[#673ab7]"
                          />
                          <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer flex-1 py-1">{opt}</Label>
                        </div>
                      );
                   })}
                   {field.hasOtherOption && (
                     <div className="flex items-center space-x-3">
                       <Checkbox 
                         id={`${field.id}-other`}
                         checked={Array.isArray(formData[field.id]) && formData[field.id].includes("__OTHER__")}
                         onCheckedChange={(checked) => handleCheckboxChange(field.id, "__OTHER__", checked as boolean)}
                         className="data-[state=checked]:bg-[#673ab7] data-[state=checked]:border-[#673ab7]"
                       />
                       <Label htmlFor={`${field.id}-other`} className="font-normal cursor-pointer py-1">Other:</Label>
                       <Input 
                         value={otherData[field.id] || ""}
                         onChange={e => handleOtherChange(field.id, e.target.value)}
                         className="h-8 flex-1 max-w-[200px] border-t-0 border-x-0 border-b border-slate-300 rounded-none bg-transparent focus-visible:ring-0 px-1 shadow-none"
                       />
                     </div>
                   )}
                 </div>
               )}
            </div>
         </div>
      ))}
      
      {/* ── SUBMIT SECTION ── */}
      <div className="flex items-center justify-between pt-4">
         <Button 
           type="submit" 
           disabled={loading}
           className="text-white px-8 h-10 rounded shadow-md transition-all font-medium opacity-100 hover:opacity-90"
           style={{ backgroundColor: formConfig.themeColor || '#673ab7' }}
         >
           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
         </Button>

         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
           Clear form
         </div>
      </div>

      <div className="pt-8 text-center text-xs text-slate-400">
         <p>Never submit passwords through Google Forms.</p>
         <p className="mt-2 text-[10px]">This content is neither created nor endorsed by Google. Report Abuse - Terms of Service - Privacy Policy</p>
         <div className="mt-4 text-xl font-bold text-slate-300 dark:text-slate-700 tracking-tighter">Google Forms</div>
      </div>
    </form>
  );
}
