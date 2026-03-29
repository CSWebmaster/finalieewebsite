import { useEffect, useRef, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Event } from "@/types";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";


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
      // Slide current card out to the LEFT
      el.classList.remove("es-slide-in", "es-prepare");
      el.classList.add("es-slide-out");
    }

    if (!sliding && prevSliding.current) {
      // Instantly position new card off-screen to the RIGHT (no transition)
      el.classList.remove("es-slide-out", "es-slide-in");
      el.classList.add("es-prepare");

      // Force reflow so the browser registers the snap position
      void el.offsetWidth;

      // Now animate it sliding in from right → center
      el.classList.remove("es-prepare");
      el.classList.add("es-slide-in");
    }

    prevSliding.current = sliding;
  }, [sliding]);

  return (
    <div ref={cardRef} className="es-card es-slide-in">
      {/* Left: image */}
      <div className="es-img-side">
        <img loading="lazy" src={event.image} alt={event.title} />
      </div>

      {/* Right: details */}
      <div className="es-detail-side">
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

        <a href={event.link} rel="noopener noreferrer" className="es-learn">
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
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming'>('recent');
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Firestore data
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Fetch recent events (latest 3 by date desc, client-side filtering for isUpcoming)
  useEffect(() => {
    const q = query(
      collection(db, "events"),
      orderBy("date", "desc"),
      limit(15) // fetch a bit more to ensure we get 3 past events
    );
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
    });
    return () => unsub();
  }, []);

  // Fetch upcoming events (isUpcoming === true, limit 10 sorted ascending client-side)
  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("isUpcoming", "==", true),
      limit(30)
    );
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

      // Sort ascending (earliest first) and limit to 10
      const sortedEvts = evts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ).slice(0, 10);

      setUpcomingEvents(sortedEvts);
    });
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
        // @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── section ── */
        .es-section {
          font-family: 'DM Sans', sans-serif;
          padding: 3rem 1rem 2.5rem;
          overflow: hidden;
        }

        /* ── heading ── */
        .es-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          letter-spacing: -0.03em;
          text-align: center;
          margin-bottom: 0.4rem;
        }
        
        /* ── tabs ── */
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
        
        .es-tab-btn:hover {
          color: #374151;
          background: #f3f4f6;
        }
        
        .es-tab-btn.active {
          color: #6366f1;
          background: #eef2ff;
          box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1);
        }
        
        .es-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: #6366f1;
          border-radius: 99px;
          opacity: 0;
          animation: tabUnderline 0.4s ease-out forwards;
        }
        
        @keyframes tabUnderline {
          from { opacity: 0; transform: translateX(-50%) scaleX(0); }
          to { opacity: 1; transform: translateX(-50%) scaleX(1); }
        }

        /* ── grid layout ── */
        .es-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .es-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* ── card ── */
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
        
        .es-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.15);
        }

        /* Slide states */
        .es-slide-in {
          transform: translateX(0);
          opacity: 1;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity  0.45s ease;
        }
        /* Card exits to the LEFT */
        .es-slide-out {
          transform: translateX(-110%);
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity  0.45s ease;
        }
        /* New card snaps to RIGHT instantly (no transition) */
        .es-prepare {
          transform: translateX(110%);
          opacity: 0;
          transition: none;
        }

        @media (max-width: 620px) {
          .es-card { flex-direction: column; }
        }

        /* ── image side ── */
        .es-img-side {
          width: 44%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          background: var(--muted, #f8f9fa);
          transition: background-color 0.3s ease;
        }
        
        .es-card:hover .es-img-side {
          background: #f1f5f9;
        }
        
        @media (max-width: 620px) {
          .es-img-side { width: 100%; padding: 1rem 1rem 0; background: transparent; }
        }
        .es-img-side img {
          width: 100%;
          max-height: 210px;
          object-fit: contain;
          border-radius: 0.6rem;
          display: block;
          transition: transform 0.3s ease;
        }
        
        .es-card:hover .es-img-side img {
          transform: scale(1.02);
        }

        /* ── detail side ── */
        .es-detail-side {
          flex: 1;
          padding: 1.5rem 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .es-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          line-height: 1.35;
          margin-bottom: 0.6rem;
          color: #111827;
          transition: color 0.3s ease;
        }
        
        .es-card:hover .es-title {
          color: #6366f1;
        }

        .es-meta {
          display: flex;
          flex-direction: column;
          gap: 0.22rem;
          margin-bottom: 0.75rem;
        }
        .es-meta-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          color: var(--muted-foreground, #6b7280);
        }
        .es-meta-icon { width: 0.75rem; height: 0.75rem; flex-shrink: 0; }

        .es-desc-wrap {
          max-height: 4.8rem;
          overflow: hidden;
          transition: max-height 0.45s ease;
        }
        .es-desc-wrap--open { max-height: 400px; }
        .es-desc {
          font-size: 0.78rem;
          line-height: 1.65;
          color: var(--muted-foreground, #6b7280);
        }

        .es-read-toggle {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--primary, #6366f1);
          background: none;
          border: none;
          padding: 0.25rem 0;
          cursor: pointer;
          display: inline-block;
          margin-top: 0.15rem;
          text-align: left;
          transition: color 0.3s ease;
        }
        .es-read-toggle:hover { 
          text-decoration: underline; 
          color: #4f46e5;
        }

        .es-learn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: auto;
          padding-top: 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary, #6366f1);
          text-decoration: none;
          transition: gap 0.2s ease, color 0.3s ease;
        }
        .es-learn:hover { 
          gap: 0.55rem; 
          color: #4f46e5;
        }
        .es-learn-arrow { width: 0.85rem; height: 0.85rem; }

        /* ── dots ── */
        .es-dots {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.25rem;
        }
        .es-dot {
          height: 0.5rem;
          width: 0.5rem;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          background: var(--muted, #d1d5db);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .es-dot.es-dot--active {
          background: var(--primary, #6366f1);
          width: 1.4rem;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }

        /* ── scroll reveal (uses global .reveal system) ── */
        .es-aos {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .es-aos.es-animated { opacity: 1; transform: translateY(0); }
        .es-aos:nth-child(2) { transition-delay: 0.1s; }
        .es-aos:nth-child(3) { transition-delay: 0.18s; }
        .es-aos:nth-child(4) { transition-delay: 0.24s; }
      `}</style>

      <div ref={sectionRef} className="es-section section-container">

        {/* Heading — heavy flip entrance */}
        <div className="reveal flip-up">
          <h2 className="es-heading">Events</h2>
          <div className="heading-line" style={{ maxWidth: 80, margin: '0 auto 2rem' }} />
        </div>

        {/* Tabs */}
        <div className="reveal fade-up delay-1 es-tabs">
          <button 
            className={`es-tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Events
          </button>
          <button 
            className={`es-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events
          </button>
        </div>

        {/* Single Viewport - Toggle between Recent and Upcoming */}
        <div className="reveal zoom-fade delay-2 es-viewport">
          {/* Event Card */}
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

          {/* Dots */}
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

        {/* CTA */}
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
