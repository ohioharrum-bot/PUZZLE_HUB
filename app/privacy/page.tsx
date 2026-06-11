import PageMotion from '@/components/PageMotion'

export default function PrivacyPolicyPage() {
  return (
    <PageMotion>
      <div className="mx-auto max-w-3xl space-y-8 py-10">
        <section className="rounded-[34px] border border-black/10 bg-white/60 px-6 py-12 shadow-sm backdrop-blur md:px-12">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-black md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-black/50">Last Updated: June 11, 2026</p>
        </section>

        <section className="rounded-[30px] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur space-y-6 text-sm leading-relaxed text-black/70">
          <div>
            <h2 className="text-xl font-bold text-black mb-3">1. Information We Collect</h2>
            <p>
              We collect minimal information to provide and improve Gizmopuzzle. This includes:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> If you sign up, we store your email address and profile name via Supabase Auth.</li>
              <li><strong>Game Progress:</strong> We store your puzzle scores, completion status, and time spent on puzzles to provide leaderboards and personal progress tracking.</li>
              <li><strong>Usage Data:</strong> We may collect anonymous data about how you interact with the site (e.g., which puzzles are most popular).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">2. How We Use Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Maintain your account and track your progress.</li>
              <li>Display your scores on public leaderboards.</li>
              <li>Improve our puzzle generators and user interface.</li>
              <li>Serve personalized advertisements through Google AdSense.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">3. Third-Party Services</h2>
            <p>
              We use third-party services that may collect information used to identify you:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Supabase:</strong> For authentication and database management.</li>
              <li><strong>Google AdSense:</strong> To display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">4. Cookies</h2>
            <p>
              We use cookies to keep you signed in and to analyze our traffic. You can choose to disable cookies through your browser settings, but some features of the site may not function correctly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">5. Data Security</h2>
            <p>
              We prioritize the security of your data but remember that no method of transmission over the internet is 100% secure. We use industry-standard practices to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-black mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@gizmopuzzle.com.
            </p>
          </div>
        </section>
      </div>
    </PageMotion>
  )
}
