import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { journeyItems, type JourneyItem } from "@/data/journeyData";
import { collection, onSnapshot, query, orderBy } from "@/lib/firestore-client";
import { db } from "../../firebase";
import { useSmartLoader } from "@/hooks/useSmartLoader";
import { SmartLoader } from "@/components/performance/SmartLoader";
import { LazyImage } from "@/components/performance/LazyImage";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";

function JourneySectionBackground({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-background">
      {imageUrl ? (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000 bg-background">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 dark:opacity-20 scale-110 blur-3xl transition-all duration-1000"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-10 transition-all duration-1000">
          <img loading="lazy" src="/images/logo.png" alt="bg-logo" className="w-[60%] max-w-[500px] min-w-[200px] scale-[2]" />
        </div>
      )}
    </div>
  );
}

export default function IEEESOUSSBJRNYLoop() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigateRouter = useNavigate();
  const lastScrollTime = useRef(0);
  const scrollCooldown = 900; // Calibrated for smooth deck transitions

  const [loopItems, setLoopItems] = useState<JourneyItem[]>(journeyItems);
  const [loading, setLoading] = useState(true);
  const { loaderType } = useSmartLoader(loading);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;

      // Map both vertical and horizontal scroll to deck navigation
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 30) {
        if (delta > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastScrollTime.current = now;
      }
    };

    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;

      const currentX = e.touches[0].clientX;
      const deltaX = startX - currentX;

      if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastScrollTime.current = now;
        startX = currentX;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [currentIndex, loopItems.length, navigateRouter]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "journey")),
      (snapshot) => {
        const journeyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as JourneyItem[];
        
        const sortedJourney = journeyData.sort((a: any, b: any) => {
          if (a.order !== undefined && b.order !== undefined) {
             return a.order - b.order;
          }
          const yearA = parseInt(a.year || "0");
          const yearB = parseInt(b.year || "0");
          return yearB - yearA;
        });
        
        if (sortedJourney.length > 0) {
          setLoopItems(sortedJourney);
        } else {
          setLoopItems(journeyItems);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching journey data for loop:", error);
        setLoopItems(journeyItems);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    if (currentIndex >= loopItems.length - 1) {
      navigateRouter("/");
      return;
    }
    setCurrentIndex((prev) => Math.min(loopItems.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const JourneyCard = ({ item, index }: { item: JourneyItem, index: number }) => {
    const diff = index - currentIndex;

    // Horizontal transformation logic
    let scale = 1, translateX = 0, opacity = 1, zIndex = 40;
    if (diff < 0) {
      scale = 0.94; translateX = -45; opacity = 0; zIndex = 30;
    } else if (diff === 0) {
      scale = 1; translateX = 0; opacity = 1; zIndex = 40;
    } else {
      scale = 0.94; translateX = 45; opacity = 0; zIndex = 20;
    }

    return (
      <div
        className="absolute w-[95vw] max-w-5xl transition-all duration-800 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] origin-center flex flex-col items-center"
        style={{ 
          transform: `translateX(${translateX}%) scale(${scale})`, 
          opacity, 
          zIndex, 
          pointerEvents: diff === 0 ? "auto" : "none",
          visibility: Math.abs(diff) > 1 ? "hidden" : "visible"
        }}
      >
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 dark:border-white/5 bg-card/25 backdrop-blur-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] h-[70vh] max-h-[calc(100vh-280px)] min-h-[450px] w-full flex flex-col md:flex-row transition-all duration-500 hover:shadow-[0_60px_150px_rgba(0,0,0,0.4)]">
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_30s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(255,255,255,0.03)_50%,rgba(0,0,0,0)_100%)] mix-blend-soft-light pointer-events-none" />
          </div>

          <div className="relative z-10 w-full md:w-[58%] h-[35%] md:h-full flex items-center justify-center p-8 md:p-14 border-b md:border-b-0 md:border-r border-border/10 bg-white/[0.02]">
            <LazyImage
              src={item.imageUrl}
              alt={item.title}
              containerClassName="w-full h-full flex items-center justify-center"
              className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-1000 group-hover:scale-[1.03]"
            />
          </div>

          <div className="relative z-10 w-full md:w-[42%] h-[65%] md:h-full p-8 md:p-14 flex flex-col justify-center bg-gradient-to-br from-card/80 to-transparent">
            <div className={`transition-all duration-1000 delay-250 ease-out ${diff === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <div className="flex items-center gap-4 mb-8">
                 {item.year && (
                    <div className="px-4 py-1.5 bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black rounded-full tracking-[2px] border border-primary/20 shadow-inner">
                      {item.year}
                    </div>
                  )}
                 <div className="h-[2px] w-12 bg-primary/50 rounded-full group-hover:w-24 transition-all duration-700" />
                 <span className="text-[9px] uppercase tracking-[0.4em] text-primary/60 font-black hidden sm:block">History Loop</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-[1.05] tracking-tighter text-foreground drop-shadow-md">
                {item.title}
              </h3>
              
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-[1.7] line-clamp-6 md:line-clamp-none font-medium opacity-90 mb-10">
                {item.details}
              </p>

              <Link
                to={`/about/ieee-sou-sb-journey-loop/${item.id}`}
                className="mt-4 flex items-center gap-4 text-primary font-black group/link"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-[1rem] bg-primary/10 border border-primary/10 group-hover/link:bg-primary group-hover/link:text-primary-foreground group-hover/link:rotate-12 transition-all duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">Deep Dive</span>
                  <span className="text-xs uppercase tracking-widest font-black">Chapter Details</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex flex-col items-center justify-center font-sans text-foreground">
      <JourneySectionBackground imageUrl={loopItems[currentIndex]?.imageUrl} />
      
      {/* Dynamic Header */}
      <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-center pointer-events-none">
        <Link 
          to="/"
          className="group pointer-events-auto flex items-center gap-3 px-6 py-3 bg-white/5 dark:bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-5 text-[9px] font-black uppercase tracking-[0.5em] opacity-30 select-none">
           <span>{loopItems.length} Milestones</span>
           <div className="flex gap-1">
             <Clock className="w-3 h-3" />
             <span>Chronicle</span>
           </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 flex flex-col py-10 md:py-16">
        <div className="flex-grow flex items-center justify-center relative w-full h-full overflow-visible">
          <SmartLoader type={loaderType} containerClassName="w-full h-full flex items-center justify-center">
             {loopItems.map((item, index) => <JourneyCard key={item.id} item={item} index={index} />)}
          </SmartLoader>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 mt-auto mb-6 z-50">
          {/* Navigation Tracks */}
          <div className="flex gap-3 px-6 py-2 bg-black/5 dark:bg-white/5 backdrop-blur-3xl rounded-full border border-white/5">
            {loopItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-700 ${idx === currentIndex ? "w-16 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "w-4 bg-primary/10 hover:bg-primary/30"}`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] text-muted-foreground animate-pulse tracking-[0.6em] uppercase font-black opacity-40">
              Scroll Left â€¢ Scroll Right
            </p>
            <div className="flex items-center gap-6">
               <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/30" />
               <p className="text-lg font-black tabular-nums tracking-tighter opacity-80">
                {String(currentIndex + 1).padStart(2, '0')}<span className="mx-1 text-xs opacity-30 font-normal">/</span>{String(loopItems.length).padStart(2, '0')}
               </p>
               <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
