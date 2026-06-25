import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

export default function BlogPage() {
  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Resources</span>
      </div>

      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card blue" style={{ cursor: 'default' }}>
          <div>
            <div className="featured-label">Insights &amp; Tips</div>
            <div className="featured-title">The Puzzle Studio Blog</div>
          </div>
          <div>
            <div className="featured-meta">Expert strategies, brain health insights, and pro tips to help you master every puzzle in our collection.</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Latest Articles</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="group" style={{ textDecoration: 'none' }}>
            <article style={{
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              background: 'var(--white)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }} className="hover:shadow-md hover:-translate-y-0.5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{
                  background: 'var(--gray-100)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: 'var(--gray-600)'
                }}>
                  {post.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--gray-400)' }}>
                  <Clock className="h-3.5 w-3.5" /> {post.readTime}
                </span>
              </div>
              
              <h2 style={{
                fontSize: '18px',
                fontWeight: '750',
                lineHeight: '1.25',
                color: 'var(--black)',
                marginBottom: '12px',
                transition: 'color 0.15s'
              }} className="group-hover:text-blue-600">
                {post.title}
              </h2>
              
              <p style={{
                fontSize: '13.5px',
                lineHeight: '1.55',
                color: 'var(--gray-600)',
                flexGrow: 1,
                marginBottom: '24px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.excerpt}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--gray-100)',
                paddingTop: '16px',
                fontSize: '11px',
                color: 'var(--gray-400)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar className="h-3.5 w-3.5" /> {post.date}
                </span>
                <span style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Read <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  )
}
