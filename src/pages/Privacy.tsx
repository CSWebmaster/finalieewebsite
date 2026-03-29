import PageLayout from "@/components/PageLayout";

export default function Privacy() {
  return (
    <PageLayout showFooter>
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 shadow-sm border border-border/50">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
            <p>
              At IEEE SOU SB, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              and protect your personal information when you use our website or participate in our events and programs.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>
              When you join IEEE SOU SB, register for an event, or contact us through our website, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>College and Department</li>
              <li>Enrollment Number</li>
              <li>Academic Year and Semester</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process your membership application.</li>
              <li>To communicate with you regarding events, workshops, and branch updates.</li>
              <li>To issue certificates for event participation.</li>
              <li>To respond to your inquiries through the contact form.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Protection and Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. Access to your personal data is restricted exclusively to the authorized executive committee members of IEEE SOU SB who require it for administrative purposes.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share necessary information with the core IEEE organization for official membership processing and verification purposes only.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
            <p>
              You have the right to request access to the personal data we hold about you, to request corrections to any inaccurate data, and to request the deletion of your data from our systems (subject to our legal and administrative obligations). To exercise these rights, please contact us at our official email addresses.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the effective date.
            </p>

            <div className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
              <p className="text-sm text-muted-foreground">If you have any questions about this Privacy Policy, please contact us.</p>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
