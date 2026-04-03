import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function FounderMessage() {
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <div
      ref={sectionRef}
      className="section-container pt-12 pb-4 w-full overflow-hidden"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="reveal flip-up text-3xl md:text-4xl font-bold mb-4">
            A Message From Our Founder
          </h2>
          <div className="heading-line reveal mx-auto" style={{ maxWidth: 96 }} />
        </div>

        {/* Outer card zooms in with blur */}
        <div className="reveal zoom-fade delay-1">
          <div
            className={cn(
              "relative p-4 md:p-8 glass rounded-3xl overflow-hidden",
              "border border-primary/20 shadow-xl",
              "transition-shadow duration-300 hover:shadow-2xl"
            )}
          >
            {/* Decorative gradient blob */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              {/* Photo — slides in from left with scale */}
              <div className="md:col-span-4 flex justify-center md:justify-start reveal fade-left delay-2">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-primary/20 rounded-2xl rotate-3 transition-transform duration-500 group-hover:rotate-0" />
                  <img loading="lazy"
                    src="https://ieee.socet.edu.in/wp-content/uploads/2025/03/satviksir.jpg"
                    alt="Dr. Satvik Khara"
                    className="relative rounded-xl shadow-lg max-w-[220px] w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>

              {/* Quote — slides in from right with blur */}
              <div className="md:col-span-8 reveal fade-right delay-3">
                {/* Big decorative quote mark */}
                <div
                  className="text-8xl font-black text-primary/15 leading-none select-none -mb-4"
                  aria-hidden
                >
                  "
                </div>
                <blockquote className="text-base md:text-lg italic mb-5 text-balance leading-relaxed">
                  My message to everyone considering joining Silver Oak
                  University IEEE Student Branch is that here you will
                  experience 360° Development: 180° Comprehensive
                  Development and 180° Personal Inner Development. You
                  will stay up-to-date with various new inventions and
                  research emerging worldwide by building a strong
                  network with other students and experts. You will have
                  excellent opportunities for your career by attending
                  various seminars, conferences, activities, etc. You can
                  build your confidence and foster all-around development.
                </blockquote>
                <div className="flex items-center gap-3 justify-end">
                  <div className="h-px flex-1 bg-border" />
                  <div className="text-right">
                    <p className="font-bold text-lg">Dr. Satvik Khara</p>
                    <p className="text-muted-foreground text-sm">Dean, College of Technology</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
