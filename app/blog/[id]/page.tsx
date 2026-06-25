import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ChevronLeft, User } from 'lucide-react'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = blogPosts.find(p => p.id === id)

  if (!post) notFound()

  return (
    <main className="main" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href="/blog" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--gray-600)',
            textDecoration: 'none'
          }}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>

      <article style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'var(--gray-100)',
          padding: '40px 40px 32px 40px',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{
              background: 'var(--accent)',
              color: 'var(--white)',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {post.category}
            </span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar className="h-4 w-4" /> {post.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock className="h-4 w-4" /> {post.readTime}
              </span>
            </div>
          </div>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
            color: 'var(--black)',
            margin: 0
          }}>
            {post.title}
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px',
            borderTop: '1px solid var(--gray-200)',
            paddingTop: '24px'
          }}>
            <div style={{
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              background: 'var(--black)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              <User className="h-5 w-5" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)', margin: 0 }}>{post.author}</p>
              <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Editorial Team</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '40px', fontSize: '16px', lineHeight: '1.75', color: 'var(--gray-900)' }}>
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.trim().startsWith('###')) {
              return (
                <h3 key={i} style={{ fontSize: '20px', fontWeight: '800', color: 'var(--black)', marginTop: '32px', marginBottom: '16px' }}>
                  {paragraph.replace('###', '').trim()}
                </h3>
              )
            }
            return (
              <p key={i} style={{ marginBottom: '24px' }}>
                {paragraph.trim()}
              </p>
            )
          })}
        </div>
      </article>

      <section style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '850', color: 'var(--black)', margin: '0 0 8px 0' }}>Want more puzzles?</h3>
        <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: '0 0 24px 0' }}>Put these tips to the test with our daily challenges.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            Play Now
          </Link>
          <Link href="/puzzles/sudoku" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Daily Sudoku
          </Link>
        </div>
      </section>
    </main>
  )
}
