import PageLayout from "@/components/PageLayout";
import OrganizationMeta from "@/components/OrganizationMeta";
import { useTheme } from "@/lib/theme-provider";

export default function IEEESOUSSB() {
  const { theme } = useTheme();
  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="ieee-logo-glow ieee-logo-glow--blue mx-auto inline-block mb-4">
              <img
                loading="lazy"
                src="https://ieee.socet.edu.in/wp-content/uploads/2025/06/IEEE-SOU-SB-Logo-scaled.png"
                alt="IEEE SOU SB Logo"
                style={{ maxHeight: '80px', maxWidth: '220px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                className={`mx-auto object-contain animate-fade-in-up ${theme !== "dark" ? "mix-blend-multiply" : ""}`}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up"></h1>
            <OrganizationMeta ouCode="STB20233" nomenclature="Silver Oak University, IEEE Student Branch" />
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8 animate-fade-in-up animation-delay-300" />
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {/* Vision Section */}
            <section className="mb-12 theme-card theme-card-blue reveal fade-up">
              <h2 className="text-2xl font-semibold mb-6">Vision</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To be a leading hub for developing globally competitive professionals.</li>
                <li>To nurture academic excellence and enhance analytical, experimental, and problem-solving abilities.</li>
                <li>To strengthen collaborations between academia and industry, driving innovation and career growth.</li>
                <li>To provide purpose-driven education and promote research that addresses real-world challenges.</li>
                <li>To contribute to the technological, social, and infrastructural advancement of the region.</li>
              </ul>
            </section>

            {/* Mission Section */}
            <section className="mb-12 theme-card theme-card-blue reveal fade-up delay-2">
              <h2 className="text-2xl font-semibold mb-6">Mission</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Equip students with cutting-edge technical skills and a problem-solving mindset.</li>
                <li>Bridge the gap between academia and industry through real-world projects, workshops, and mentorship programs.</li>
                <li>Build a strong professional network by collaborating with industries, research organizations, and professional societies.</li>
                <li>Encourage innovation, leadership, and ethical engineering practices among members.</li>
                <li>Foster an environment that promotes continuous learning, teamwork, and career development.</li>
              </ul>
            </section>

            {/* About Section */}
            <section className="theme-card theme-card-blue reveal fade-up delay-3">
              <h2 className="text-2xl font-semibold mb-6">About IEEE SOU SB</h2>
              <p className="mb-4">
                Founded in 2017 with just 17 members, IEEE SOU SB has grown into a thriving community of over 260 members, providing a platform for students to connect, learn, and grow alongside faculty and industry experts. We foster technical excellence and professional development, bridging the gap between academia and industry through workshops, expert sessions, and hands-on training.
              </p>
              <p className="mb-4">
                With our motto, "360° Development: 180° Inner, 180° Outer", we emphasize both technical mastery and personal growth, ensuring that members develop practical expertise, leadership skills, and ethical engineering values.
              </p>
              <p>
                Since its inception, IEEE SOU SB has organized numerous impactful events, creating an intellectually stimulating environment where students engage with cutting-edge technologies, research opportunities, and industry-driven insights. Our commitment to innovation, collaboration, and professional excellence continues to empower students to excel in their careers and shape the future of technology.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
