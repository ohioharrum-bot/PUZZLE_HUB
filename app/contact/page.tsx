import { Mail, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Support</span>
      </div>

      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card dark" style={{ cursor: 'default' }}>
          <div>
            <div className="featured-label">Get in touch</div>
            <div className="featured-title" style={{ maxWidth: '600px' }}>How can we help?</div>
          </div>
          <div>
            <div className="featured-meta">Have a question, feedback, or found a bug? We&apos;d love to hear from you. Our team typically responds within 24-48 hours.</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Contact Channels</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2" style={{ marginBottom: 48 }}>
        <ContactCard 
          icon={Mail} 
          title="Email Support" 
          description="For general inquiries and technical support."
          link="mailto:support@gizmopuzzle.com"
          linkText="support@gizmopuzzle.com"
        />
        <ContactCard 
          icon={MessageSquare} 
          title="Feedback" 
          description="Tell us what you love or what we can improve."
          link="mailto:feedback@gizmopuzzle.com"
          linkText="Send Feedback"
        />
        <ContactCard 
          icon={ShieldCheck} 
          title="Privacy" 
          description="Questions regarding your data and privacy."
          link="mailto:privacy@gizmopuzzle.com"
          linkText="Contact Privacy Team"
        />
        <ContactCard 
          icon={HelpCircle} 
          title="FAQ" 
          description="Quick answers to common questions."
          link="/blog/benefits-of-puzzles"
          linkText="Visit Blog"
          isInternal
        />
      </div>

      <div className="section-header">
        <span className="section-title">Frequently Asked Questions</span>
      </div>

      <div style={{
        background: 'var(--white)',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <FAQItem 
          question="Are the puzzles really free?" 
          answer="Yes! All puzzles on Gizmopuzzle are 100% free to play. We support the site through minimal advertisements so we can keep the content free for everyone." 
        />
        <FAQItem 
          question="How often are daily puzzles updated?" 
          answer="Daily puzzles for Sudoku, Word Search, and Jigsaw are refreshed every day at midnight US Eastern time." 
        />
        <FAQItem 
          question="Do I need an account to save my progress?" 
          answer="Guest progress is saved locally in your browser. However, to track your progress across multiple devices and compete on the global leaderboards, we recommend creating a free account." 
        />
      </div>
    </main>
  )
}

function ContactCard({ icon: Icon, title, description, link, linkText, isInternal }: { icon: any, title: string, description: string, link: string, linkText: string, isInternal?: boolean }) {
  return (
    <div style={{
      background: 'var(--white)',
      padding: '32px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '220px'
    }}>
      <div>
        <div style={{
          marginBottom: '16px',
          display: 'flex',
          height: '48px',
          width: '48px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: 'var(--accent-soft)',
          color: 'var(--accent)'
        }}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '750', marginBottom: '8px', color: 'var(--black)' }}>{title}</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--gray-600)', marginBottom: '24px' }}>{description}</p>
      </div>
      <div>
        {isInternal ? (
          <Link href={link} style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', textDecoration: 'none' }}>
            {linkText} →
          </Link>
        ) : (
          <a href={link} style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', textDecoration: 'none' }}>
            {linkText} →
          </a>
        )}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '20px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--black)', marginBottom: '8px' }}>{question}</h4>
      <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>{answer}</p>
    </div>
  )
}
