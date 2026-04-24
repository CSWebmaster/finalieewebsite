import { useEffect, useRef, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "@/lib/firestore-client";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLatencyTracker } from "@/hooks/useLatencyTracker";
import { useSmartLoader } from "@/hooks/useSmartLoader";
import { SmartLoader } from "@/components/performance/SmartLoader";
import { LazyImage } from "@/components/performance/LazyImage";
import { EventCard } from "@/components/EventCard";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   SLIDE CARD â€” manages its own enter / exit classes
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface SlideCardProps {
  event: Event;
  sliding: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}

function SlideCard({ event, sliding, expanded, onToggleExpand }: SlideCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prevSliding = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (sliding && !prevSliding.current) {
      el.classList.remove("es-slide-in", "es-prepare");
      el.classList.add("es-slide-out");
    }

    if (!sliding && prevSliding.current) {
      el.classList.remove("es-slide-out", "es-slide-in");
      el.classList.add("es-prepare");
      void el.offsetWidth;
      el.classList.remove("es-prepare");
      el.classList.add("es-slide-in");
    }

    prevSliding.current = sliding;
  }, [sliding]);

  const eventName = event.title || "Untitled Event";

  return (
    <div ref={cardRef} className="es-slide-in">
      <div className="es-card">
        <div className="es-img-side">
          <LazyImage 
            src={event.image || '/placeholder-event.jpg'} 
            alt={eventName} 
            className="w-full h-full object-cover rounded-lg shadow-sm"
          />
        </div>
        <div className="es-detail-side">
          <div className="mb-2">
             <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
               Featured
             </span>
          </div>
          <h3 className="es-title">{eventName}</h3>
          <div className="es-meta">
            <div className="es-meta-row">
              <Calendar className="es-meta-icon" />
              {event.date}
            </div>
            <div className="es-meta-row">
              <Clock className="es-meta-icon" />
              {event.time}
            </div>
          </div>
          <div className={cn("es-desc-wrap", expanded && "es-desc-wrap--open")}>
            <p className="es-desc">{event.description}</p>
          </div>
          <a href={event.link} className="es-learn">
            Read More <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN COMPONENT
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function EventsSection() {
  useLatencyTracker("EventsSection");
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming'>('recent');
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const { loaderType } = useSmartLoader(loading);

  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!db) {
      console.warn("Firestore 'db' is not initialized. Events will not be loaded.");
      setLoading(false);
      return;
    }
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("date", "desc"), limit(15));
    const unsub = onSnapshot(q, (snap) => {
      const evts: Event[] = snap.docs
        .filter((d) => d.data().isUpcoming !== true)
        .slice(0, 3)
        .map((d) => ({
          id: d.id,
          title: d.data().name || d.data().title || "",
          description: d.data().description || "",
          date: d.data().date || "",
          time: d.data().time || "",
          image: d.data().image || "",
          link: `/eventdetails/${d.id}`,
        }));
      setRecentEvents(evts);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("isUpcoming", "==", true), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      const evts: Event[] = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().name || d.data().title || "",
        description: d.data().description || "",
        date: d.data().date || "",
        time: d.data().time || "",
        image: d.data().image || "",
        link: `/eventdetails/${d.id}`,
      }));

      const sortedEvts = evts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ).slice(0, 10);

      setUpcomingEvents(sortedEvts);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);


  const currentEvents = activeTab === 'recent' ? recentEvents : upcomingEvents;

  const triggerNext = (nextIdx?: number) => {
    if (sliding) return;
    setSliding(true);
    setExpanded(false);
    timeoutRef.current = setTimeout(() => {
      setActiveIdx((prev) =>
        nextIdx !== undefined ? nextIdx : (prev + 1) % Math.max(currentEvents.length, 1)
      );
      setSliding(false);
    }, 520); // matches slide-out duration
  };

  /* Reset index when tab changes */
  useEffect(() => {
    setActiveIdx(0);
    setExpanded(false);
  }, [activeTab]);

  /* Auto-advance */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => triggerNext(), expanded ? 12000 : 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sliding, expanded, activeIdx, currentEvents.length]);

  /* Cleanup */
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <>
      <style>{`
        .es-section {
          font-family: 'DM Sans', sans-serif;
          padding: 2.5rem 1rem 2rem;
          overflow: hidden;
          height: auto;
        }
        .es-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          letter-spacing: -0.03em;
          text-align: center;
          margin-bottom: 0.4rem;
        }
        .es-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .es-tab-btn {
          position: relative;
          padding: 0.6rem 1.4rem;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 999px;
        }
        .es-tab-btn.active {
          color: #6366f1;
          background: #eef2ff;
        }
        @media (prefers-color-scheme: dark) {
          .es-tab-btn.active { background: rgba(99,102,241,0.15); }
        }
        /* VIEWPORT FIX: was missing, causing 0-height container */
        .es-viewport {
          position: relative;
          min-height: 250px;
          height: auto;
          overflow: hidden;
        }
        .es-card {
          display: flex;
          flex-direction: row;
          background: var(--card, #ffffff);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 1rem;
          overflow: hidden;
          min-height: 180px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }
        .es-slide-in { transform: translateX(0); opacity: 1; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease; }
        .es-slide-out { transform: translateX(-110%); opacity: 0; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease; }
        .es-prepare { transform: translateX(110%); opacity: 0; transition: none; }
        .es-img-side { width: 38%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0.875rem; background: rgba(248, 249, 250, 0.4); backdrop-filter: blur(8px); }
        .es-img-side img, .es-img-side > div { min-height: 140px !important; max-height: 220px; }
        .es-detail-side { flex: 1; padding: 1rem 1rem 1rem 0.5rem; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        .es-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; line-height: 1.3; margin-bottom: 0.45rem; color: var(--foreground, #111827); }
        .es-meta { display: flex; flex-direction: column; gap: 0.18rem; margin-bottom: 0.55rem; }
        .es-meta-row { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: #6b7280; }
        .es-meta-icon { width: 0.7rem; height: 0.7rem; flex-shrink: 0; }
        .es-desc-wrap { max-height: 3.6rem; overflow: hidden; transition: max-height 0.45s ease; }
        .es-desc-wrap--open { max-height: 300px; }
        .es-desc { font-size: 0.74rem; line-height: 1.6; color: #6b7280; }
        .es-learn { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: auto; padding-top: 0.6rem; font-size: 0.76rem; font-weight: 600; color: #6366f1; text-decoration: none; }
        .es-dots { display: flex; justify-content: center; gap: 0.45rem; margin-top: 1rem; }
        .es-dot { height: 0.5rem; width: 0.5rem; border-radius: 99px; border: none; cursor: pointer; background: #d1d5db; transition: all 0.3s; }
        .es-dot.es-dot--active { background: #6366f1; width: 1.4rem; }
        @media (max-width: 620px) {
          .es-card { flex-direction: column; }
          .es-img-side { width: 100%; padding: 0.75rem 0.75rem 0; background: transparent; }
          .es-detail-side { padding: 0.75rem; }
        }
      `}</style>

      <div ref={sectionRef} className="es-section section-container">
        <div className="reveal flip-up">
          <h2 className="es-heading">Events</h2>
          <div className="heading-line" style={{ maxWidth: 80, margin: '0 auto 2rem' }} />
        </div>

        <div className="reveal fade-up delay-1 es-tabs">
          <button className={`es-tab-btn ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>Recent Events</button>
          <button className={`es-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming Events</button>
        </div>

        <div className="reveal zoom-fade delay-2 es-viewport">
          <SmartLoader type={loaderType}>
             {currentEvents.length > 0 ? (
                <SlideCard
                  event={currentEvents[Math.min(activeIdx, currentEvents.length - 1)]}
                  sliding={sliding}
                  expanded={expanded}
                  onToggleExpand={() => setExpanded((p) => !p)}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  No {activeTab === 'recent' ? 'recent' : 'upcoming'} events at the moment.
                </div>
              )}
          </SmartLoader>

          <div className="es-dots">
            {currentEvents.map((_, idx) => (
              <button
                key={idx}
                className={cn("es-dot", idx === activeIdx && "es-dot--active")}
                onClick={() => triggerNext(idx)}
                aria-label={`${activeTab === 'recent' ? 'Recent' : 'Upcoming'} Event ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="reveal pop delay-4 text-center mt-5 flex justify-center gap-3">
          <Button asChild>
            <a href="/events">View All Events</a>
          </Button>
          <Button asChild>
            <a href="/about/ieee-sou-sb-journey-loop">Our Journey</a>
          </Button>
        </div>
      </div>
    </>
  );
}
