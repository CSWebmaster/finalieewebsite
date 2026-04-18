import PageLayout from "@/components/PageLayout";
import OrganizationMeta from "@/components/OrganizationMeta";
import { useTheme } from "@/lib/theme-provider";
import { LOGOS } from "@/lib/logos";

export default function IEEESOUSPSSBC() {
  const { theme } = useTheme();
  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-12 text-center">
            <div className="ieee-logo-glow ieee-logo-glow--green mx-auto">
              <img loading="lazy"
                src={LOGOS[theme === "dark" ? "DARK" : "LIGHT"].SPS}
                alt="IEEE SOU SPS Logo"
                style={{ maxHeight: '80px', maxWidth: '220px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                className="mx-auto object-contain animate-fade-in-up"
              />
            </div>
            <h1 className="sr-only">IEEE SOU SPS SBC</h1>
            <p className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in-up"></p>
            <OrganizationMeta ouCode="SBC20233" nomenclature="Silver Oak University, IEEE SPS Student Branch Chapter" />
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8 animate-fade-in-up animation-delay-300" />
          </div>

          {/* Content Section */}
          <div className="prose dark:prose-invert max-w-none">
            {/* Vision Section */}
            <section className="mb-12 theme-card theme-card-cyan animate-fade-in-up animation-delay-500">
              <h2 className="text-2xl font-semibold mb-6">Vision</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Being a one-stop source of signal processing resources.</li>
                <li>Providing a variety of high-quality resources customized to users' interests.</li>
                <li>Adapting to a rapidly changing technical community.</li>
              </ul>
            </section>

            {/* Mission Section */}
            <section className="mb-12 theme-card theme-card-cyan animate-fade-in-up animation-delay-700">
              <h2 className="text-2xl font-semibold mb-6">Mission</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Advancing and disseminating state-of-the-art scientific information.</li>
                <li>Providing a venue for people to interact and exchange ideas.</li>
                <li>Enabling collaboration among professionals, students, and academics in signal processing.</li>
              </ul>
              <p className="mt-4">
                Our mission is to enable technology for the generation, transformation, and interpretation of information in the signal processing domain.
              </p>
            </section>

            {/* About Section */}
            <section className="theme-card theme-card-cyan animate-fade-in-up animation-delay-900">
              <h2 className="text-2xl font-semibold mb-6">About IEEE SOU SPS SBC</h2>
              <p className="mb-4">
                The Signal Processing Society, founded in 1948, is the first IEEE society with a focus on advancing and spreading scientific information in signal processing.
              </p>
              <p>
                IEEE SOU SPS SBC was established in 2021. Despite the short time, we have become the largest society in the Gujarat Section with 63 members. We've organized specialized symposia on emerging technologies and worked hard to keep our members up to date with the latest in signal processing.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
