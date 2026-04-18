import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import App from "../../App.tsx";
import "../../App.css";
import { journeyItems } from "@/data/journeyData";
export default function IEEESOUSSBJRNY() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <main className="flex-grow pt-32 pb-16 bg-white dark:bg-[#0F172A] relative">
        <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden w-full m-0 p-0">
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-10">
            <img loading="lazy" src="/images/logo.png" alt="bg-logo" className="w-[60%] max-w-[500px] min-w-[200px] scale-[2]" />
          </div>

          <div className="relative z-10 w-full max-w-2xl bg-card border text-card-foreground rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Journey</h2>
            <p className="text-lg text-muted-foreground mb-10 text-center">
              A look back at our remarkable growth, achievements, and the community we've built
            </p>
            <button
              onClick={() => navigate("/about/ieee-sou-sb-journey-loop")}
              className="mt-2 px-10 py-4 rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-md hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
