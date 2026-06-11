import Link from 'next/link'
import PageMotion from '@/components/PageMotion'
import { blogPosts } from '@/lib/blog-data'
import { BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react'

export default function BlogPage() {
  return (
    <PageMotion>
      <div className="mx-auto max-w-5xl space-y-10 py-10">
        <section className="rounded-[34px] border border-black/10 bg-white/60 px-6 py-12 shadow-sm backdrop-blur md:px-12 text-center">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/35">Insights & Tips</p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-6xl">
            The Puzzle Studio Blog
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-black/50 md:text-base">
            Expert strategies, brain health insights, and pro tips to help you master every puzzle in our collection.
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group">
              <article className="flex h-full flex-col rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black/40">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-black/30">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                
                <h2 className="mb-3 text-xl font-semibold leading-tight text-black group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                
                <p className="mb-6 flex-grow text-sm leading-relaxed text-black/50 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-black/40">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Read More <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </PageMotion>
  )
}
