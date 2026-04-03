import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useSmartLoader } from "@/hooks/useSmartLoader";
import { SmartLoader } from "@/components/performance/SmartLoader";
import { LazyImage } from "@/components/performance/LazyImage";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

export interface SIGItem {
  id: string;
  title: string;
  imageUrl: string;
  images?: string[];
  details: string;
  order?: number;
}

function SIGsSectionBackground({ imageUrl }: { imageUrl?: string }) {
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

export default function SIGs() {
  const [sigItems, setSigItems] = useState<SIGItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { loaderType } = useSmartLoader(loading);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigateRouter = useNavigate();
  const lastScrollTime = useRef(0);
  const scrollCooldown = 800; // Slightly reduced for better responsiveness

  // Fetch SIGs from Firestore
  useEffect(() => {
    const fetchSIGs = async () => {
      try {
        const q = query(collection(db, "sigs"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SIGItem[];
        setSigItems(data);
      } catch (err) {
        console.error("Error fetching SIGs:", err);
        setSigItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSIGs();
  }, []);

  useEffect(() => {
    if (sigItems.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;
      
      // Use both deltaX and deltaY to trigger horizontal traversal
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      if (Math.abs(delta) > 30) {
        if (delta > 0) handleNext();
        else handlePrev();
        lastScrollTime.current = now;
      }
    };

    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;
      const currentX = e.touches[0].clientX;
      const deltaX = startX - currentX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) handleNext();
        else handlePrev();
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
  }, [currentIndex, sigItems]);

  const handleNext = () => {
    if (currentIndex === sigItems.length - 1) {
      navigateRouter("/");
      return;
    }
    setCurrentIndex((prev) => Math.min(sigItems.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const SIGCard = ({ item, index }: { item: SIGItem, index: number }) => {
    const diff = index - currentIndex;

    // Redesigned for Horizontal transitions (Scroll Left/Right)
    let scale = 1, translateX = 0, opacity = 1, zIndex = 40;
    if (diff < 0) {
      scale = 0.95; translateX = -40; opacity = 0; zIndex = 30;
    } else if (diff === 0) {
      scale = 1; translateX = 0; opacity = 1; zIndex = 40;
    } else {
      scale = 0.95; translateX = 40; opacity = 0; zIndex = 20;
    }

    return (
      <div
        className="absolute w-[95vw] max-w-5xl transition-all duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] origin-center flex flex-col items-center"
        style={{ 
          transform: `translateX(${translateX}%) scale(${scale})`, 
          opacity, 
          zIndex, 
          pointerEvents: diff === 0 ? "auto" : "none",
          visibility: Math.abs(diff) > 1 ? "hidden" : "visible" // Performance optimization: hide non-adjacent cards
        }}
      >
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 dark:border-white/5 bg-card/30 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.2)] h-[70vh] max-h-[calc(100vh-280px)] min-h-[450px] w-full flex flex-col md:flex-row transition-all duration-500 hover:shadow-[0_50px_120px_rgba(0,98,155,0.15)]">
          
          {/* Ambient Sweep Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,98,155,0.08)_50%,rgba(0,0,0,0)_100%)] dark:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)] mix-blend-overlay pointer-events-none" />
          </div>

          {/* Image Canvas (Left) */}
          <div className="relative z-10 w-full md:w-[60%] h-[40%] md:h-full flex items-center justify-center p-8 md:p-14 border-b md:border-b-0 md:border-r border-border/20 bg-black/[0.03] dark:bg-white/[0.03]">
            <LazyImage
              src={item.imageUrl}
              alt={item.title}
              containerClassName="w-full h-full flex items-center justify-center"
              className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1"
            />
          </div>

          {/* Details Column (Right) */}
          <div className="relative z-10 w-full md:w-[40%] h-[60%] md:h-full p-8 md:p-14 flex flex-col justify-center bg-gradient-to-br from-card/90 to-transparent">
            <div className={`transition-all duration-1000 delay-200 ease-out ${diff === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-1 w-10 bg-[#00629B] rounded-full transition-all duration-700 ease-out group-hover:w-20" />
                 <span className="text-[10px] uppercase tracking-[0.3em] text-[#00629B] font-black">SIG Spotlight</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-foreground drop-shadow-sm">
                {item.title}
              </h3>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed line-clamp-5 md:line-clamp-none font-medium opacity-80 mb-8">
                {item.details}
              </p>
              
              <Link
                to={`/sigs/${item.id}`}
                className="mt-4 flex items-center gap-3 text-[#00629B] font-bold group/link"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00629B]/10 group-hover/link:bg-[#00629B] group-hover/link:text-white transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="text-sm uppercase tracking-widest group-hover/link:translate-x-2 transition-transform duration-300">Explore Group</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex flex-col items-center justify-center font-sans text-foreground">
      <SIGsSectionBackground imageUrl={sigItems[currentIndex]?.imageUrl} />

      {/* Navigation Layer */}
      <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-center">
        <Link
          to="/"
          className="group flex items-center gap-3 px-6 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl text-sm font-bold transition-all hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
           <span>{sigItems.length} Groups</span>
           <div className="w-1 h-1 bg-foreground rounded-full" />
           <span>2024 Edition</span>
        </div>
      </div>

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 flex flex-col py-10 md:py-16">
        <div className="flex-grow flex items-center justify-center relative w-full h-full overflow-visible">
          <SmartLoader type={loaderType} containerClassName="w-full h-full flex items-center justify-center">
            {sigItems.length > 0 ? (
              sigItems.map((item, index) => <SIGCard key={item.id} item={item} index={index} />)
            ) : (
              <div className="text-center p-12 bg-card/50 backdrop-blur-xl rounded-3xl border border-border/50">
                <Info className="w-12 h-12 mx-auto mb-4 text-[#00629B] opacity-50" />
                <p className="text-muted-foreground font-bold tracking-tight">No groups available in this cycle.</p>
                <Link to="/" className="text-sm text-[#00629B] mt-4 inline-block hover:underline">Return Home</Link>
              </div>
            )}
          </SmartLoader>
        </div>

        {/* Index & Scroll Indicator */}
        <div className="flex flex-col items-center justify-center gap-6 mt-auto mb-6 z-50">
          <div className="flex gap-3">
            {sigItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentIndex ? "w-12 bg-[#00629B]" : "w-3 bg-[#00629B]/20 hover:bg-[#00629B]/50"}`}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-muted-foreground animate-pulse tracking-[0.5em] uppercase font-black">
              Scroll Left • Scroll Right
            </p>
            <div className="h-0.5 w-4 bg-[#00629B]/30 rounded-full" />
            <p className="text-[14px] font-black tabular-nums tracking-tighter">
              {String(currentIndex + 1).padStart(2, '0')} / {String(sigItems.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}