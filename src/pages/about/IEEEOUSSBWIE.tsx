import PageLayout from "@/components/PageLayout";
import OrganizationMeta from "@/components/OrganizationMeta";
import { useTheme } from "@/lib/theme-provider";
import { LOGOS } from "@/lib/logos";

export default function IEEEOUSSBWIE() {
  const { theme } = useTheme();
  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-12 text-center">
            <div className="ieee-logo-glow ieee-logo-glow--purple mx-auto">
              <img loading="lazy"
                src={LOGOS[theme === "dark" ? "DARK" : "LIGHT"].WIE}
                alt="IEEE SOU WIE Logo"
                style={{ maxHeight: '80px', maxWidth: '220px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                className="mx-auto object-contain animate-fade-in-up"
              />
            </div>
            <h1 className="sr-only">IEEE SOU WIE SB AG</h1>
            <p className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in-up"></p>
            <OrganizationMeta ouCode="SBA20233" nomenclature="Silver Oak University, IEEE WIE Affinity Group" />
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8 animate-fade-in-up animation-delay-300" />
          </div>

          {/* Content Section */}
          <div className="prose dark:prose-invert max-w-none">
            {/* Vision Section */}
            <section className="mb-12 theme-card theme-card-purple animate-fade-in-up animation-delay-500">
              <h2 className="text-2xl font-semibold mb-6">Vision</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Equal access to knowledge.</li>
                <li>Encourage women in the potency of engineering.</li>
                <li>Enhance the share of women's voices.</li>
              </ul>
            </section>

            {/* Mission Section */}
            <section className="mb-12 theme-card theme-card-purple animate-fade-in-up animation-delay-700">
              <h2 className="text-2xl font-semibold mb-6">Mission</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Betterment of society.</li>
                <li>Empower women in leadership roles.</li>
                <li>Technical enhancement of women.</li>
              </ul>
              <p className="mt-4">
                Our goal is to facilitate the recruitment and retention of women in technical disciplines globally. We envision a vibrant community of IEEE women and men collectively using their diverse talents to innovate for the benefit of humanity.
              </p>
            </section>

            {/* About Section */}
            <section className="theme-card theme-card-purple animate-fade-in-up animation-delay-900">
              <h2 className="text-2xl font-semibold mb-6">About IEEE SOU WIE SB AG</h2>
              <p className="mb-4">
                IEEE WIE is a global network of IEEE members and volunteers dedicated to promoting women engineers and scientists, and inspiring girls around the world to follow their academic interests in a career in engineering and science. It envisions a vibrant community of IEEE women and men by collectively using their diverse talents to innovate for the benefit of humanity.
              </p>
              <p>
                With the same vision and mission, IEEE SOU WIE SB AG was established in 2019, and today, it is the largest affinity group in the Gujarat Section with 32 members. Starting from its inception, IEEE SOU WIE SB AG has carried out multiple campaigns and initiatives emphasizing the betterment of society. Alongside this, the AG has organized various technical and non-technical events & talks, that have helped many students to uplift their technical and interpersonal skills.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
