// src/app/blog/page.tsx
import Link from 'next/link';
import { articles } from '@/lib/articles';
import type { Metadata } from 'next';

export const runtime = 'edge';

// Inline SVG components to resolve lucide-react bundler/sandbox issues in edge runtime
const ZapIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ArrowRightIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ClockIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookOpenIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const BookmarkIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

// Static SEO metadata for the blog listing page
export const metadata: Metadata = {
  title: "DFSUI Blog: Free SEO Guides & Keyword Research Strategies",
  description: "Learn how to optimize your search rankings, analyze competitor SERPs, and save 90% on API costs with our self-hosted, pay-as-you-go SEO guides.",
  alternates: {
    canonical: '/blog',
  }
};

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-500">
      
      {/* Decorative Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform">
              <ZapIcon size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
              DFS UI
            </span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Home</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-105 transition-all">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24">
        
        {/* Blog Hero Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <BookOpenIcon size={14} className="fill-current text-primary" /> DFSUI Learning Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-950 dark:text-white">
            SEO & Keyword <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-500 to-indigo-400">
              Research Resource
            </span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Explore our custom tutorials and articles. Discover how you can build, host, and optimize your own SEO platforms with pay-as-you-go architecture.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article 
              key={article.slug} 
              className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/30 transition-all group"
            >
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5 text-primary">
                      <BookmarkIcon size={12} /> {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon size={12} /> {article.readTime}
                    </span>
                  </div>

                  {/* Title & Short Excerpt */}
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase group-hover:text-primary transition-colors leading-tight mb-4">
                    <Link href={`/blog/${article.slug}`}>
                      {article.h1}
                    </Link>
                  </h2>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed">
                    {article.firstParagraph}
                  </p>
                </div>

                {/* Read More Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link 
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
                  >
                    Read Guide <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Banner */}
        <section className="mt-24">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                Connect Your API Credentials Now
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                Unlock full SEO metrics, competitor content audits, and real-time organic search values directly in the user-owned dashboard.
              </p>
              <Link 
                href="/dashboard"
                className="px-10 py-5 bg-slate-950 text-white rounded-2xl text-base font-black uppercase tracking-[0.15em] shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                Go to Dashboard <ZapIcon size={18} className="fill-current text-primary" />
              </Link>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-36 -mt-36 w-80 h-80 bg-white/10 rounded-full blur-[90px]" />
            <div className="absolute bottom-0 left-0 -ml-36 -mb-36 w-80 h-80 bg-white/10 rounded-full blur-[90px]" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ZapIcon size={20} className="text-primary fill-current" />
            <span className="text-lg font-black uppercase tracking-widest italic">DFS UI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
            <Link href="/keyword-research-tool-in-hindi" className="hover:text-primary transition-colors">Hindi Keyword Tool</Link>
            <a href="https://github.com/acondura/dfsui" target="_blank" className="hover:text-primary transition-colors">Github</a>
            <Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} DFS UI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
