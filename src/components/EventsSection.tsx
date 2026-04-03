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

/* ─────────────────────────────────────────────
   SLIDE CARD — manages its own enter / exit classes
 ───────────────────────────────────────────── */
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

  return (
    <div ref={cardRef} className="es-card es-slide-in relative">
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.35] pointer-events-none"
        style={{ 
          backgroundImage: `url(${event.image})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: 'blur(50px)' 
        }}
      />
      <div 
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-[0.25] pointer-events-none"
        style={{ 
          backgroundImage: `url(${event.image})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: 'blur(45px)' 
        }}
      />

      {/* Left: image */}
      <div className="es-img-side relative z-10 w-full md:w-auto">
        <LazyImage 
          src={event.image || ""} 
          alt={event.title || ""} 
          className="w-full object-contain rounded-lg"
          containerClassName="w-full h-full min-h-[200px]"
        />
      </div>

      {/* Right: details */}
      <div className="es-detail-side relative z-10">
        <h3 className="es-title">{event.title}</h3>
        <div className="es-meta">
          <span className="es-meta-row">
            <Calendar className="es-meta-icon" />
            {event.date}
          </span>
          <span className="es-meta-row">
            <Clock className="es-meta-icon" />
            {event.time}
          </span>
        </div>
        <div className={cn("es-desc-wrap", expanded && "es-desc-wrap--open")}>
          <p className="es-desc">{event.description}</p>
        </div>
        <a href={event.link || "#"} rel="noopener noreferrer" className="es-learn">
          Learn more <ArrowRight className="es-learn-arrow" />
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
 ───────────────────────────────────────────── */
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
    const q = query(collection(db, "events"), orderBy("date", "desc"), limit(15));
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
    const q = query(collection(db, "events"), where("isUpcoming", "==", true), limit(30));
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
          padding: 3rem 1rem 2.5rem;
          overflow: hidden;
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
          padding: 0.75rem 1.5rem;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
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
        .es-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .es-card {
          display: flex;
          flex-direction: row;
          background: var(--card, #ffffff);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 1.25rem;
          overflow: hidden;
          min-height: 270px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .es-slide-in { transform: translateX(0); opacity: 1; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease; }
        .es-slide-out { transform: translateX(-110%); opacity: 0; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease; }
        .es-prepare { transform: translateX(110%); opacity: 0; transition: none; }
        .es-img-side { width: 44%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(248, 249, 250, 0.4); backdrop-filter: blur(8px); }
        .es-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; line-height: 1.35; margin-bottom: 0.6rem; color: #111827; }
        .es-meta { display: flex; flex-direction: column; gap: 0.22rem; margin-bottom: 0.75rem; }
        .es-meta-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; color: #6b7280; }
        .es-meta-icon { width: 0.75rem; height: 0.75rem; flex-shrink: 0; }
        .es-desc-wrap { max-height: 4.8rem; overflow: hidden; transition: max-height 0.45s ease; }
        .es-desc-wrap--open { max-height: 400px; }
        .es-desc { font-size: 0.78rem; line-height: 1.65; color: #6b7280; }
        .es-learn { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: auto; padding-top: 0.85rem; font-size: 0.8rem; font-weight: 600; color: #6366f1; text-decoration: none; }
        .es-dots { display: flex; justify-content: center; gap: 0.45rem; margin-top: 1.25rem; }
        .es-dot { height: 0.5rem; width: 0.5rem; border-radius: 99px; border: none; cursor: pointer; background: #d1d5db; transition: all 0.3s; }
        .es-dot.es-dot--active { background: #6366f1; width: 1.4rem; }
        @media (max-width: 620px) { .es-card { flex-direction: column; } .es-img-side { width: 100%; padding: 1rem 1rem 0; background: transparent; } }
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
          <SmartLoader type={loaderType} containerClassName="min-h-[300px]">
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
