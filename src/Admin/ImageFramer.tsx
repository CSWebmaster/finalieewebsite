import React, { useState, useRef, useEffect } from 'react';

interface ImageFramerProps {
  imageUrl: string;
  initialPosition?: string;
  onChange: (pos: string) => void;
}

const ImageFramer: React.FC<ImageFramerProps> = ({ imageUrl, initialPosition = "50% 50%", onChange }) => {
  // Ensure we start with a valid string format "X% Y%"
  const cleanInitial = initialPosition.includes('%') ? initialPosition : "50% 50%";
  const [position, setPosition] = useState(cleanInitial);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
  }, [initialPosition]);

  const handleInteract = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate percentage based on click location within the preview box
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values 0-100 to stay within image bounds
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    // We use "center Y%" or "X% Y%". "X% Y%" is most flexible.
    const newPos = `${Math.round(clampedX)}% ${Math.round(clampedY)}%`;
    setPosition(newPos);
    onChange(newPos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteract(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleInteract(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Helper to extract numeric values for styles
  const getPosValues = () => {
    const parts = position.split(' ');
    // Handle "center" or "50%"
    const x = parts[0] === 'center' ? '50%' : parts[0];
    const y = parts[1] === 'center' ? '50%' : parts[1];
    return { x, y };
  };

  const { x, y } = getPosValues();

  if (!imageUrl) return null;

  return (
    <div className="mt-6 mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Manual Photo Framer</h4>
           <p className="text-[11px] text-slate-500 font-medium">Drag the crosshair to set the focal point (e.g. eye level)</p>
        </div>
        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-mono rounded-md border border-blue-200 dark:border-blue-800">
          {position}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* INTERACTIVE TRACKER AREA */}
        <div 
          ref={containerRef}
          className="relative w-48 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden cursor-crosshair border-2 border-slate-300 dark:border-slate-700 group transition-transform active:scale-[0.98]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img 
             src={imageUrl} 
             alt="Framer control" 
             className="w-full h-full object-cover pointer-events-none opacity-50 grayscale-[50%] transition-opacity group-hover:opacity-70" 
          />
          
          {/* Visual Target Area Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 grid grid-cols-3 grid-rows-3 opacity-30">
             <div className="border border-white/10" />
             <div className="border border-white/10" />
             <div className="border border-white/10" />
             <div className="border border-white/10" />
             <div className="border border-white/10" />
             <div className="border border-white/10" />
          </div>

          {/* Crosshair / Pickup Point */}
          <div 
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{ left: x, top: y }}
          >
             {/* Glowing Pulse */}
             <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
             {/* Outer Ring */}
             <div className="absolute inset-0 border-[3px] border-white rounded-full shadow-2xl" />
             <div className="absolute inset-1 border-[2px] border-blue-500 rounded-full" />
             {/* Inner Pin */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        {/* HIGH-FIDELITY PREVIEW (Matches Member Card) */}
        <div className="flex flex-col items-center">
            <div className="relative p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-500">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-inner bg-slate-100">
                   <img 
                      src={imageUrl} 
                      className="w-full h-full object-cover transition-all duration-300 ease-out" 
                      style={{ objectPosition: position }} 
                      alt="Actual Result Preview"
                   />
                </div>
            </div>
            <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Result Preview</p>
        </div>
      </div>
    </div>
  );
};

export default ImageFramer;
