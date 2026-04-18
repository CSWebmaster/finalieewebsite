import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function FAQButtonSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <div
      ref={sectionRef}
      className="section-container w-full pt-2 pb-8"
    >
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="reveal">
          <Button asChild size="lg" className="bg-[#00629B] hover:bg-[#005a8a] text-white px-8 py-3 text-lg font-semibold">
            <Link to="/faq">
              WHY JOIN IEEE?
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}