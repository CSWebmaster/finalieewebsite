import { FeatureItem } from "@/types";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: "Keep Technically Up to Date",
    description:
      "Access cutting-edge research, publications, and technical information. Stay ahead with workshops, webinars, and conferences focused on the latest technological advancements and innovations.",
    image: "https://ieee.socet.edu.in/wp-content/uploads/2025/05/20240824_131811-scaled.jpg",
    alt: "Technical Knowledge",
  },
  {
    id: 2,
    title: "Join Global Network",
    description:
      "Connect with over 400,000 IEEE members worldwide. Build relationships with professionals, academics, and fellow students that can last throughout your career and open doors to collaboration and opportunities.",
    image: "https://ieee.socet.edu.in/wp-content/uploads/2025/06/IMG_4747-scaled.jpg",
    alt: "Global Network",
  },
  {
    id: 3,
    title: "Gain Expertise, Open Career Doors",
    description:
      "Develop leadership, communication, and teamwork skills. Enhance your resume with IEEE activities and certifications while gaining access to career resources, job portals, and mentorship opportunities.",
    image: "https://ieee.socet.edu.in/wp-content/uploads/2025/06/IMG_4733-scaled.jpg",
    alt: "Career Growth",
  },
];

export default function WhyJoinSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <div
      id="why-join-section"
      ref={sectionRef}
      className="section-container w-full overflow-hidden"
    >
      {/* Section heading */}
      <div className="text-center mb-16">
        <h2 className="reveal flip-up text-3xl md:text-4xl font-bold mb-4">
          Why Silver Oak University IEEE SB?
        </h2>
        <div className="heading-line reveal mx-auto" style={{ maxWidth: 96 }} />
      </div>

      <div className="space-y-24 md:space-y-32 w-full">
        {FEATURES.map((feature) => {
          const isEven = feature.id % 2 === 0;
          return (
            <div
              key={feature.id}
              className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"
                } gap-8 md:gap-20 items-center`}
            >
              {/* Image — heavy slide + rotate from outer edge */}
              <div
                className={`w-full md:w-1/2 reveal ${isEven ? "fade-right" : "fade-left"}`}
              >
                <div className="relative group">
                  {/* Glowing background accent */}
                  <div className="absolute -inset-6 bg-primary/20 rounded-2xl rotate-3 dark:bg-primary/10 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105" />
                  <div className="absolute -inset-2 bg-primary/10 rounded-xl -rotate-2 dark:bg-primary/5" />
                  <img loading="lazy"
                    src={feature.image}
                    alt={feature.alt}
                    className="relative rounded-xl w-full object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ height: "320px" }}
                  />
                </div>
              </div>

              {/* Text — slides in with blur from opposite edge */}
              <div
                className={`w-full md:w-1/2 reveal ${isEven ? "fade-left" : "fade-right"} delay-2 md:pl-8`}
              >
                {/* Number badge */}
                <span className="inline-block text-6xl font-black text-primary/15 dark:text-primary/20 leading-none mb-2 select-none">
                  0{feature.id}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-balance leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
