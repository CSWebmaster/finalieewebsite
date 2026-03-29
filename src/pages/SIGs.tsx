import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigateRouter = useNavigate();
  const lastScrollTime = useRef(0);
  const scrollCooldown = 1200;

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
      if (Math.abs(e.deltaY) > 40) {
        if (e.deltaY > 0) handleNext();
        else handlePrev();
        lastScrollTime.current = now;
      }
    };

    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;
      if (Math.abs(deltaY) > 40) {
        if (deltaY > 0) handleNext();
        else handlePrev();
        lastScrollTime.current = now;
        startY = currentY;
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%2300629B;stop-opacity:1'/><stop offset='100%' style='stop-color:%23004d7a;stop-opacity:1'/></linearGradient></defs><rect width='800' height='600' fill='url(%23grad)'/><circle cx='400' cy='300' r='150' fill='rgba(255,255,255,0.1)'/><text x='400' y='300' font-family='Arial' font-size='48' font-weight='bold' text-anchor='middle' fill='rgba(255,255,255,0.8)' dy='-10'>IEEE</text><text x='400' y='300' font-family='Arial' font-size='24' text-anchor='middle' fill='rgba(255,255,255,0.6)' dy='30'>SIG Image Not Available</text></svg>";
  };

  const SIGCard = ({ item, index }: { item: SIGItem, index: number }) => {
    const diff = index - currentIndex;

    let scale = 1, translateY = 0, opacity = 1, zIndex = 40;
    if (diff < 0) {
      scale = 1.1; translateY = -20; opacity = 0; zIndex = 30;
    } else if (diff === 0) {
      scale = 1; translateY = 0; opacity = 1; zIndex = 40;
    } else {
      scale = 0.9; translateY = 20; opacity = 0; zIndex = 20;
    }

    return (
      <div
        className="absolute w-[90vw] max-w-5xl transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center flex flex-col items-center"
        style={{ transform: `translateY(${translateY}px) scale(${scale})`, opacity, zIndex, pointerEvents: diff === 0 ? "auto" : "none" }}
      >
        <div className="relative group overflow-hidden rounded-3xl border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] h-[65vh] max-h-[calc(100vh-280px)] min-h-[400px] w-full flex flex-col md:flex-row transition-all duration-500">
          
          {/* Subtle Live Ambient Sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_15s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,98,155,0.06)_50%,rgba(0,0,0,0)_100%)] dark:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0)_100%)] mix-blend-plus-lighter pointer-events-none" />
          </div>

          {/* Image Canvas (Left) */}
          <div className="relative z-10 w-full md:w-[55%] h-1/2 md:h-full flex items-center justify-center p-6 md:p-10 border-b md:border-b-0 md:border-r border-border/30 bg-black/[0.02] dark:bg-white/[0.02]">
            <img
              loading="lazy"
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)] transition-transform duration-700 group-hover:scale-105"
              onError={handleImageError}
            />
          </div>

          {/* Details Column (Right) */}
          <div className="relative z-10 w-full md:w-[45%] h-1/2 md:h-full p-6 md:p-12 flex flex-col justify-center bg-gradient-to-br from-card/80 to-transparent">
            <div className={`transition-all duration-1000 delay-150 ease-out ${diff === 0 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="flex items-center gap-3 mb-5">
                 <div className="h-1 w-8 bg-primary rounded-full transition-all duration-700 ease-out group-hover:w-16" />
                 <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold hidden sm:block">Featured SIG</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight tracking-tight text-foreground">{item.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-4 md:line-clamp-6">
                {item.details}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="absolute top-6 left-6 z-50">
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="relative z-10 w-[90vw] max-w-5xl h-[65vh] max-h-[calc(100vh-280px)] min-h-[400px] flex flex-col md:flex-row bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm">
           <Skeleton className="w-full md:w-[55%] h-1/2 md:h-full rounded-none" />
           <div className="w-full md:w-[45%] h-1/2 md:h-full p-6 md:p-12 flex flex-col justify-center space-y-6 bg-card/50">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-[80%]" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
           </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 mt-8">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (sigItems.length === 0) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">No SIGs found. Add some from the admin panel.</p>
        <Link to="/" className="text-sm text-[#00629B] hover:underline">← Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex flex-col items-center justify-center font-sans text-foreground">
      <SIGsSectionBackground imageUrl={sigItems[currentIndex]?.imageUrl} />

      {/* Top Left Go Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-md border border-border shadow-sm rounded-full text-sm font-medium transition-all hover:bg-card hover:scale-105"
        >
          &larr; Go to Home
        </Link>
      </div>

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 flex flex-col py-6 md:py-10">
        <div className="flex-grow flex items-center justify-center relative w-full h-full">
          {sigItems.map((item, index) => <SIGCard key={item.id} item={item} index={index} />)}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mt-auto mb-2 md:mb-6 z-50">
          <Link
            to={`/sigs/${sigItems[currentIndex]?.id}`}
            className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95"
          >
            Learn More
          </Link>

          <div className="flex gap-2">
            {sigItems.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? "w-8 bg-black dark:bg-white" : "w-2 bg-gray-400 dark:bg-gray-500"}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase font-semibold">
            Scroll Down • Scroll Up
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {currentIndex + 1} / {sigItems.length}
          </p>
        </div>
      </div>
    </div>
  );
}