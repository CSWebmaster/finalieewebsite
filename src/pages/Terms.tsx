import PageLayout from "@/components/PageLayout";

export default function Terms() {
  return (
    <PageLayout showFooter>
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 shadow-sm border border-border/50">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
            <p>
              Welcome to the IEEE Silver Oak University Student Branch (IEEE SOU SB) website. By accessing or using our
              website and services, you agree to comply with and be bound by the following Terms and Conditions.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing this website, you accept these Terms and Conditions in full. If you disagree with
              these Terms and Conditions or any part of them, you must not use this website or our services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Membership Rules</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Membership is open to all students, academicians, and professionals interested in the fields of engineering, technology, and applied sciences.</li>
              <li>Members are expected to adhere to the IEEE Code of Ethics and conduct themselves professionally during all IEEE events and interactions.</li>
              <li>Membership fees (if applicable) are non-refundable unless stated otherwise by the core committee under exceptional circumstances.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Event Participation</h2>
            <p>
              Registration for events, workshops, or hackathons organized by IEEE SOU SB does not guarantee participation unless explicitly confirmed by the organizing committee. We reserve the right to decline or cancel registrations at our discretion. Participants are expected to follow event-specific rules and guidelines.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              All content published on this website, including but not limited to articles, images, logos, and graphics, is the property of IEEE SOU SB unless stated otherwise. Unauthorized use, reproduction, or distribution of this material without explicit permission is strictly prohibited.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. User-Submitted Content</h2>
            <p>
              If you submit content to us (such as blog posts, project showcases, or event photos), you grant IEEE SOU SB a non-exclusive, royalty-free license to use, publish, and distribute that content on our website and social media platforms. You must ensure you have the right to submit such content and that it does not violate any third-party rights. All blog submissions are subject to admin moderation and approval.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              IEEE SOU SB, its faculty advisors, and its executive committee members shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, this website or your participation in our events.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Amendments</h2>
            <p>
              We may revise these Terms and Conditions at any time without prior notice. By continuing to use the website after any revisions become effective, you agree to be bound by the revised terms.
            </p>

            <div className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
              <p className="text-sm text-muted-foreground">If you have any questions about these Terms, please contact us.</p>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
