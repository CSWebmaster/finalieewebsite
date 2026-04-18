import HeroSection from "@/components/HeroSection";
import WhyJoinSection from "@/components/WhyJoinSection";
import FAQButtonSection from "@/components/FAQButtonSection";
import CountUpSection from "@/components/CountUpSection";
import FounderMessage from "@/components/FounderMessage";
import EventsSection from "@/components/EventsSection";
import PageLayout from "@/components/PageLayout";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    try {
      // Smooth scroll to element when hash is in URL
      const hash = window.location.hash;
      if (hash && hash.startsWith('#')) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    } catch (err) {}
  }, []);

  return (
    <div className="w-full">
      <PageLayout showFooter hasHero>
        <HeroSection />
        <WhyJoinSection />
        <FAQButtonSection />
        <CountUpSection />
        <FounderMessage />
        <EventsSection />
      </PageLayout>
    </div>
  );
}
