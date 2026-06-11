import PageMotion from '@/components/PageMotion'
import { Mail, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <PageMotion>
      <div className="mx-auto max-w-4xl space-y-10 py-10">
        <section className="rounded-[34px] border border-black/10 bg-white/60 px-6 py-12 shadow-sm backdrop-blur md:px-12 text-center">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/35">Get in touch</p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-6xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-black/50 md:text-base">
            Have a question, feedback, or found a bug? We&apos;d love to hear from you. Our team typically responds within 24-48 hours.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
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
          />
        </div>

        <section className="rounded-[30px] border border-black/10 bg-white/70 p-8 md:p-12 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-black mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="Are the puzzles really free?" 
              answer="Yes! All puzzles on Gizmopuzzle are 100% free to play. We support the site through minimal advertisements so we can keep the content free for everyone." 
            />
            <FAQItem 
              question="How often are daily puzzles updated?" 
              answer="Daily puzzles for Sudoku, Word Search, and Jigsaw are refreshed every day at midnight UTC." 
            />
            <FAQItem 
              question="Do I need an account to save my progress?" 
              answer="Guest progress is saved locally in your browser. However, to track your progress across multiple devices and compete on the global leaderboards, we recommend creating a free account." 
            />
          </div>
        </section>
      </div>
    </PageMotion>
  )
}

function ContactCard({ icon: Icon, title, description, link, linkText }: { icon: any, title: string, description: string, link: string, linkText: string }) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-black">{title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-black/50">{description}</p>
      <a href={link} className="text-sm font-bold text-indigo-600 hover:underline">
        {linkText}
      </a>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div>
      <h4 className="text-base font-bold text-black mb-2">{question}</h4>
      <p className="text-sm text-black/60 leading-relaxed">{answer}</p>
    </div>
  )
}
