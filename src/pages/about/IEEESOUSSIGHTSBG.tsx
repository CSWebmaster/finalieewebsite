import PageLayout from "@/components/PageLayout";
import OrganizationMeta from "@/components/OrganizationMeta";
import { useTheme } from "@/lib/theme-provider";
import { LOGOS } from "@/lib/logos";

export default function IEEESOUSSIGHTSBG() {
  const { theme } = useTheme();
  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-12 text-center">
            <div className="ieee-logo-glow ieee-logo-glow--orange mx-auto inline-block mb-4">
              <img loading="lazy"
                src={LOGOS[theme === "dark" ? "DARK" : "LIGHT"].SIGHT}
                alt="IEEE SOU SIGHT Logo"
                style={{ maxHeight: '80px', maxWidth: '220px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                className="mx-auto object-contain animate-fade-in-up"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold animate-fade-in-up px-4">
            </h1>
            <OrganizationMeta ouCode="SBA20233S" nomenclature="Silver Oak University, IEEE SIGHT Student Branch Group" />
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8 animate-fade-in-up animation-delay-300" />
          </div>

          {/* Sections */}
          <div className="prose dark:prose-invert max-w-none">
            {/* Vision */}
            <section className="mb-12 theme-card theme-card-orange animate-fade-in-up animation-delay-500">
              <h2 className="text-2xl font-semibold mb-6">Vision</h2>
              <p>
                To leverage technology for humanitarian causes and create lasting, impactful change in underserved communities by improving access to basic resources, education, and healthcare.
              </p>
            </section>

            {/* Mission */}
            <section className="mb-12 theme-card theme-card-orange animate-fade-in-up animation-delay-700">
              <h2 className="text-2xl font-semibold mb-6">Mission</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Utilize technology and engineering to address real-world challenges faced by communities in need.</li>
                <li>Raise awareness about social issues and inspire IEEE members to engage in impactful projects.</li>
                <li>Promote sustainable solutions aligned with IEEE's commitment to humanitarian advancement.</li>
                <li>Provide hands-on experience in humanitarian projects that develop skills and social responsibility.</li>
                <li>Build partnerships with other organizations to amplify social impact.</li>
              </ul>
            </section>

            {/* About */}
            <section className="theme-card theme-card-orange animate-fade-in-up animation-delay-900">
              <h2 className="text-2xl font-semibold mb-6">About IEEE SOU SIGHT SBG</h2>
              <p className="mb-4">
                IEEE SOU SIGHT SBG (Special Interest Group on Humanitarian Technology) was formed to serve society using technology for the betterment of underserved communities. It focuses on solving social issues through engineering innovations.
              </p>
              <p>
                Despite being a relatively new group, IEEE SOU SIGHT SBG has launched impactful projects targeting education, healthcare, and sustainability. Students and professionals are encouraged to participate and create positive change through technology.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
