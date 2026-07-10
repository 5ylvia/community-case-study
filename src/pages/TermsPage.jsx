export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper px-4 py-12">
      <div className="max-w-120 mx-auto">
        <h1 className="text-heading font-bold text-ink mb-6">Terms of Service</h1>
        <div className="space-y-6 text-body text-ink leading-relaxed">

          <section>
            <h2 className="text-title font-bold text-ink mb-2">1. About the Service</h2>
            <p>Dajeong is a community food-sharing platform for Korean communities in New Zealand and Australia. We connect neighbors who want to eat together at restaurants, buy groceries together, and share home-cooked meals.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old, or have parental/guardian consent, to use this service.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">3. Prohibited Activities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Selling or trading food for profit is prohibited.</b> Dajeong is a platform for sharing, Pumasi (potluck-style exchange), and group buying — not for commercial food sales. Providing food in exchange for cash, bank transfers, or any equivalent payment is not allowed. Under the NZ Food Act 2014, food provided for sale requires separate registration, which is the individual's responsibility.</li>
              <li>Posting false information, spam, harassment, or discriminatory language</li>
              <li>Unauthorized collection or sharing of others' personal information</li>
              <li>Using the service for commercial advertising or promotion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">4. Food Safety Disclaimer</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dajeong is a platform that connects users for food sharing only. We do not guarantee the safety, hygiene, or quality of any food.</li>
              <li>Dajeong does not verify ingredients, allergens, or cooking methods.</li>
              <li>It is each participant's responsibility to directly confirm allergies, dietary restrictions, and other concerns with the food provider.</li>
              <li>We recommend that food providers list major allergens (gluten, nuts, dairy, eggs, etc.) in their posts.</li>
              <li>Dajeong is not liable for any health issues caused by food shared through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">5. Accounts and Ember Score</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Each account is for one person only.</li>
              <li>Your Ember score reflects your community trust level. It may decrease due to no-shows, broken commitments, or other violations.</li>
              <li>If your Ember score drops to 5 or below, your access to the service may be restricted.</li>
              <li>Administrators may restrict or delete accounts that abuse the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">6. Content</h2>
            <p>Copyright for user-generated content — including meetups, food recommendations, and comments — belongs to the author. By posting, you grant Dajeong a license to display the content within the service. Authors are responsible for their content. Dajeong may remove inappropriate content without prior notice.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">7. Limitation of Liability</h2>
            <p>Dajeong serves as a bulletin board connecting users for meetups. We are not directly responsible for any issues that arise during meetups.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">8. Service Changes and Termination</h2>
            <p>Dajeong may modify, suspend, or terminate the service at any time. We are not liable for any damages resulting from such changes.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">9. Governing Law</h2>
            <p>These terms shall be governed by and interpreted in accordance with the laws of New Zealand.</p>
          </section>

          <p className="text-meta text-ink-soft pt-4">Last updated: July 2026</p>
        </div>

        <h1 className="text-heading font-bold text-ink mb-6 mt-16">Privacy Policy</h1>
        <div className="space-y-6 text-body text-ink leading-relaxed">

          <section>
            <h2 className="text-title font-bold text-ink mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Account information:</b> Email, nickname</li>
              <li><b>Profile information:</b> City, suburb (optional)</li>
              <li><b>Activity information:</b> Meetup participation history, reviews, comments, food recommendations</li>
              <li><b>Automatically collected:</b> Access logs, device information (anonymous statistics via Vercel Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Providing and improving the service</li>
              <li>Connecting meetups and sending notifications</li>
              <li>Calculating Ember scores and managing community trust</li>
              <li>Analyzing service usage statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">3. Information Sharing</h2>
            <p>Dajeong does not sell your personal information to third parties. Information is shared only in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your nickname is visible to other participants when you join a meetup</li>
              <li>The host's address is shared with confirmed Home Meal participants (24 hours before the meetup)</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">4. Data Retention and Deletion</h2>
            <p>Personal information will be deleted within a reasonable period upon account deletion request. Under the NZ Privacy Act 2020, you may request to access, correct, or delete your personal information.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">5. Data Storage</h2>
            <p>Data is stored via cloud infrastructure with appropriate security measures applied for service delivery.</p>
          </section>

          <section>
            <h2 className="text-title font-bold text-ink mb-2">6. Contact</h2>
            <p>For privacy-related inquiries, please reach out through in-app notifications or contact the administrator.</p>
          </section>

          <p className="text-meta text-ink-soft pt-4">Last updated: July 2026</p>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => window.history.back()} className="text-body-sm text-ink-soft underline cursor-pointer">
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
