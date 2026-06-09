// src/app/blog/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/articles';
import type { Metadata } from 'next';

export const runtime = 'edge';

// Inline SVG components to resolve lucide-react edge sandbox import issues
const ArrowLeftIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const ZapIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CalendarIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const UserIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowRightIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Type definitions for page params
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata matching the '75% SEO' guidelines
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | DFSUI"
    };
  }

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: 'article',
      url: `https://dfsui.com/blog/${article.slug}`,
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  // Fallback if the article slug does not match any items in articles data collection
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-500">
      
      {/* Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform">
              <ZapIcon size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
              DFS UI
            </span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/blog" className="text-sm font-bold text-slate-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Blog</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-105 transition-all">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Article Container */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-12">
        
        {/* Back Link */}
        <div className="no-print">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 dark:hover:text-white border-2 border-slate-200 dark:border-slate-800 hover:border-slate-950 dark:hover:border-slate-600 px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeftIcon size={14} /> Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase">
              {article.category}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={14} /> {article.publishedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <UserIcon size={14} /> By DFSUI Team
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon size={14} /> {article.readTime}
            </span>
          </div>

          {/* H1 Heading - must contain the exact target keyword */}
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white leading-[1.05] tracking-tight uppercase">
            {article.h1}
          </h1>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* First Paragraph - must contain the exact target keyword in context */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-l-4 border-primary/50 pl-6 py-2">
            {article.firstParagraph}
          </p>

          {/* Main content sections */}
          <div className="space-y-10 pt-4">
            {article.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
                  {section.heading}
                </h2>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Dynamic CTA Footer Section */}
        <section className="bg-slate-950 dark:bg-white rounded-[2.5rem] p-10 md:p-14 text-white dark:text-slate-950 relative overflow-hidden shadow-2xl border border-slate-800 dark:border-slate-200 mt-16">
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-none">
              Ready to Optimize Your Keywords?
            </h3>
            <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-xl">
              Connect your DataForSEO API keys directly with DFSUI to run raw, uncached keyword ideas and check competitor optimization in real-time.
            </p>
            <div className="pt-2">
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-2"
              >
                Go to Dashboard <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          {/* Background orbs */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-72 h-72 bg-primary/20 rounded-full blur-[70px] pointer-events-none" />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950 mt-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-950 dark:bg-white rounded flex items-center justify-center font-black text-white dark:text-black">D</div>
            <span className="font-black tracking-tighter text-xl">DFSUI</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            © 2026 DATAFORSEO UI • ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
