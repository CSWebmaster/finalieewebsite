import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    name?: string;
    title?: string;
    description: string;
    date: string;
    time: string;
    image: string;
    venue?: string;
    speakers?: string;
    registrationEnabled?: boolean;
    registrationFormId?: string;
    isUpcoming?: boolean;
  };
  variant?: 'grid' | 'list' | 'slide';
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'grid' }) => {
  const eventName = event.name || event.title || "Untitled Event";
  
  // Logic for Status Badge
  const getStatus = () => {
    try {
      const now = new Date();
      const eventDate = new Date(event.date);
      
      // If same day, check time (simplified)
      const isToday = eventDate.toDateString() === now.toDateString();
      
      if (eventDate > now && !isToday) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
      if (isToday) return { label: 'Ongoing', cls: 'bg-green-100 text-green-700 border-green-200 animate-pulse' };
      return { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    } catch (e) {
      return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const status = getStatus();

  // Formatting Date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (variant === 'slide') {
    // This variant is for the home page slider
    return (
      <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl group">
        <div className="w-full md:w-[40%] aspect-video md:aspect-auto overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative">
          <img src={event.image} alt={eventName} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 z-10" />
          {/* Backdrop Glow */}
          <div className="absolute inset-0 blur-3xl opacity-20 scale-150">
             <img src={event.image} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", status.cls)}>
              {status.label}
            </Badge>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{formatDate(event.date)}</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tighter">{eventName}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed font-medium">{event.description}</p>
          
          <div className="flex flex-wrap gap-4 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
            <Button asChild className="rounded-xl px-6 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
              <Link to={`/eventdetails/${event.id}`}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            {event.registrationEnabled && (
              <Button asChild variant="outline" className="rounded-xl px-6 h-12 border-blue-200 text-blue-600 hover:bg-blue-50">
                <Link to={`/register/${event.id}`}>Register Now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative">
      {/* Neon Glow Background (Dust Glow) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center p-2">
        <img 
          src={event.image} 
          alt={eventName} 
          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 z-10" 
        />
        
        {/* Subtle Backdrop Glow */}
        <div className="absolute inset-0 blur-2xl opacity-20 scale-110">
          <img src={event.image} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <Badge className={cn("rounded-md px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest shadow-sm border", status.cls)}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <Calendar className="h-3 w-3 text-blue-500" />
            {formatDate(event.date)}
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
          {eventName}
        </h3>
        
        <div className="space-y-2 mb-4">
          {event.venue && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>{event.time}</span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed font-medium">
          {event.description}
        </p>
        
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-slate-50">
          <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-bold text-xs uppercase tracking-tight">
            <Link to={`/eventdetails/${event.id}`}>Read Details <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
          
          {event.registrationEnabled && (
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 h-8 text-[11px] font-bold shadow-md shadow-blue-500/20">
              <Link to={`/register/${event.id}`}>Register</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
