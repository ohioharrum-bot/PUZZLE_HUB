import Link from 'next/link'
import PageMotion from '@/components/PageMotion'
import { blogPosts } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ChevronLeft, User } from 'lucide-react'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = blogPosts.find(p => p.id === id)

  if (!post) notFound()

  return (
    <PageMotion>
      <div className="mx-auto max-w-3xl space-y-8 py-10">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
        >
          <ChevronLeft className="h-3 w-3" /> Back to Blog
        </Link>

        <article className="overflow-hidden rounded-[40px] border border-black/10 bg-white/70 shadow-sm backdrop-blur">
          <div className="border-b border-black/5 bg-black/[0.02] px-6 py-10 md:px-12 md:py-16">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-indigo-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {post.category}
              </span>
              <div className="flex items-center gap-4 text-xs font-medium text-black/40">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {post.readTime}
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-black md:text-5xl">
              {post.title}
            </h1>
            
            <div className="mt-8 flex items-center gap-3 border-t border-black/5 pt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-black">{post.author}</p>
                <p className="text-[10px] font-medium text-black/30">Editorial Team</p>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none px-6 py-12 md:px-12 md:py-16">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.trim().startsWith('###')) {
                return (
                  <h3 key={i} className="mt-10 mb-4 text-xl font-bold text-black">
                    {paragraph.replace('###', '').trim()}
                  </h3>
                )
              }
              return (
                <p key={i} className="mb-6 text-base leading-relaxed text-black/70">
                  {paragraph.trim()}
                </p>
              )
            })}
          </div>
        </article>

        <section className="rounded-[30px] border border-black/10 bg-white/60 p-8 text-center shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold text-black">Want more puzzles?</h3>
          <p className="mt-2 text-sm text-black/50">Put these tips to the test with our daily challenges.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-black px-6 py-3 text-xs font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5">
              Play Now
            </Link>
            <Link href="/puzzles/sudoku" className="rounded-full border border-black/10 bg-white px-6 py-3 text-xs font-bold text-black transition hover:bg-black/5">
              Daily Sudoku
            </Link>
          </div>
        </section>
      </div>
    </PageMotion>
  )
}
