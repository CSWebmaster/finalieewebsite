import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DynamicForm from '@/components/DynamicForm';

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [formConfig, setFormConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventAndForm = async () => {
      if (!id) return;
      
      if (id === 'preview') {
        try {
          setLoading(true);
          const savedPreview = localStorage.getItem('ieee_form_builder_preview_v2');
          if (savedPreview) {
            const previewData = JSON.parse(savedPreview);
            setFormConfig(previewData);
            setEvent({
              id: 'preview',
              name: 'Preview Mode',
              title: previewData.title || 'Preview Form',
              date: new Date().toLocaleDateString(),
              time: '10:00 AM - 12:00 PM',
              venue: 'Virtual Platform (Preview)',
              registrationEnabled: true
            });
          } else {
            // Fallback for missing preview data: Load a default preview
            setFormConfig({
              ...defaultForm,
              title: "Default Preview (No Data Found)",
              isPreview: true
            });
            setEvent({
              id: 'preview',
              name: 'Preview Mode (Degraded)',
              title: 'Form Preview',
              date: new Date().toLocaleDateString(),
              time: '10:00 AM - 12:00 PM',
              venue: 'Preview Platform',
              registrationEnabled: true
            });
            toast.error("Form preview data not found. Showing default layout.");
          }
        } catch (err: any) {
          setError(`Failed to load preview: ${err.message || 'JSON Parse Error'}`);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const eventSnap = await getDoc(doc(db, 'events', id));
        if (!eventSnap.exists()) {
          setError("Event not found");
          return;
        }
        
        const eventData = { id: eventSnap.id, ...eventSnap.data() };
        setEvent(eventData);

        if (!eventData.registrationEnabled) {
          setError("Registration is disabled for this event.");
          return;
        }

        // Fetch custom form if linked
        if (eventData.registrationFormId) {
          const formSnap = await getDoc(doc(db, 'forms', eventData.registrationFormId));
          if (formSnap.exists()) {
            setFormConfig({ id: formSnap.id, ...formSnap.data() });
          }
        }
      } catch (err) {
        console.error("Error fetching registration data:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndForm();
  }, [id]);

  // Default fallback form schema
  const defaultForm = {
    id: 'default',
    title: 'Standard Registration',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
      { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'email@example.com' },
      { id: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '+91 XXXXX XXXXX' },
      { id: 'college', type: 'text', label: 'College / Institution', required: true, placeholder: 'Silver Oak University' },
      { id: 'reason', type: 'textarea', label: 'Why do you want to join?', required: false, placeholder: 'Let us know your interest...' }
    ]
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      <div className="min-h-screen pt-24 pb-16 bg-[#f0ebf8] dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Details
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-blue-500" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <Clock className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                    {event.time}
                  </div>
                  {event.venue && (
                    <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      <MapPin className="mr-2 h-3.5 w-3.5 text-red-500" />
                      {event.venue}
                    </div>
                  )}
                </div>

                {submitted ? (
                  <div className="text-center py-12 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Thank you for registering. You will receive a confirmation email shortly.</p>
                    <Button onClick={() => navigate('/events')} variant="outline" className="rounded-xl">Browse More Events</Button>
                  </div>
                ) : event.registrationLink ? (
                  <div className="py-10 text-center space-y-6">
                     <p className="text-slate-600 dark:text-slate-400">
                       Registration for this event is handled externally. Please click the button below to complete your registration.
                     </p>
                    <Button 
                      className="w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                      onClick={() => window.open(event.registrationLink, '_blank')}
                    >
                      Complete Registration on External Portal
                    </Button>
                  </div>
                ) : (
                  <DynamicForm 
                    formConfig={formConfig || defaultForm} 
                    formType="Event Registration"
                    eventId={event.id}
                    eventName={event.name || event.title}
                    isPreview={id === 'preview'}
                    onSuccess={() => setSubmitted(true)}
                  />
                )}
            </div>

            <div className="space-y-6">
               <Card className="p-6 rounded-3xl border-none shadow-lg dark:bg-slate-900">
                 <h4 className="font-bold mb-4 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-blue-500" />
                   Event Benefits
                 </h4>
                 <ul className="space-y-3">
                   {['Certificate of Completion', 'Networking Session', 'Hands-on Workshop', 'Technical Q&A'].map(benefit => (
                     <li key={benefit} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                       {benefit}
                     </li>
                   ))}
                 </ul>
               </Card>

               <Card className="p-6 rounded-3xl border-none shadow-lg bg-indigo-600 text-white">
                 <h4 className="font-bold mb-2">Need Help?</h4>
                 <p className="text-xs text-indigo-100 mb-4 tracking-wide leading-relaxed">If you face any issues during registration, please contact our support team.</p>
                 <Button variant="secondary" className="w-full rounded-xl h-10 text-xs font-bold text-indigo-600 shadow-lg">Contact Support</Button>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
