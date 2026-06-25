export default function PrivacyPolicyPage() {
  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Legal</span>
      </div>

      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card dark" style={{ cursor: 'default' }}>
          <div>
            <div className="featured-label">Privacy &amp; Terms</div>
            <div className="featured-title">Privacy Policy</div>
          </div>
          <div>
            <div className="featured-meta">Last Updated: June 11, 2026</div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--white)',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        fontSize: '15px',
        lineHeight: '1.6',
        color: 'var(--gray-600)'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>1. Information We Collect</h2>
          <p>
            We collect minimal information to provide and improve Gizmopuzzle. This includes:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Account Information:</strong> If you sign up, we store your email address and profile name via Supabase Auth.</li>
            <li><strong>Game Progress:</strong> We store your puzzle scores, completion status, and time spent on puzzles to provide leaderboards and personal progress tracking.</li>
            <li><strong>Usage Data:</strong> We may collect anonymous data about how you interact with the site (e.g., which puzzles are most popular).</li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>2. How We Use Information</h2>
          <p>Your information is used to:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Maintain your account and track your progress.</li>
            <li>Display your scores on public leaderboards.</li>
            <li>Improve our puzzle generators and user interface.</li>
            <li>Serve personalized advertisements through Google AdSense.</li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>3. Third-Party Services</h2>
          <p>
            We use third-party services that may collect information used to identify you:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Supabase:</strong> For authentication and database management.</li>
            <li><strong>Google AdSense:</strong> To display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites.</li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>4. Cookies</h2>
          <p>
            We use cookies to keep you signed in and to analyze our traffic. You can choose to disable cookies through your browser settings, but some features of the site may not function correctly.
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>5. Data Security</h2>
          <p>
            We prioritize the security of your data but remember that no method of transmission over the internet is 100% secure. We use industry-standard practices to protect your information.
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginBottom: '12px' }}>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@gizmopuzzle.com.
          </p>
        </div>
      </div>
    </main>
  )
}
