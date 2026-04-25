import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { notFound } from 'next/navigation';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';
import { Globe, ShieldCheck, Activity, BarChart3, Info } from 'lucide-react';

export const runtime = 'edge';

// Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { env } = (getRequestContext() as any).env ? getRequestContext() : { env: (globalThis as any).process?.env };
  const { slug } = await params;
  const raw = await (env as any).dfsui?.get(`pseo:analysis:${slug}`);
  
  if (!raw) return { title: 'Analysis Not Found | DFSUI' };
  
  const data = JSON.parse(raw);
  const keyword = data.keyword || slug.replace(/-/g, ' ');

  return {
    title: `${keyword.toUpperCase()} SEO Audit & Winning Strategy | DFSUI`,
    description: `Complete SEO analysis for "${keyword}". Check real-time SERP competition, keyword difficulty, and domain authority for the top 10 search results.`,
    openGraph: {
        title: `${keyword.toUpperCase()} | SEO Analysis`,
        description: `Winning strategy for ${keyword}.`,
        type: 'article',
    }
  };
}

export default async function AnalysisPage({ params }: { params: Promise<{ slug: string }> }) {
  const { env } = (getRequestContext() as any).env ? getRequestContext() : { env: (globalThis as any).process?.env };
  const { slug } = await params;
  const raw = await (env as any).dfsui?.get(`pseo:analysis:${slug}`);
  
  if (!raw) notFound();

  const { keyword, analysis, publishedAt } = JSON.parse(raw);
  const date = new Date(publishedAt).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Premium Header/Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} /> Verified SEO Analysis
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                {keyword}
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                A comprehensive data-driven breakdown of the search landscape for <span className="text-slate-900 dark:text-slate-200 font-bold underline decoration-primary/30">&quot;{keyword}&quot;</span>. Generated on {date}.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Activity className="text-white" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Score</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">100% RAW DATA</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/50 transition-all">
                <BarChart3 className="text-primary mb-4" size={32} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Analysis Scope</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Top 10 Google Results</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/50 transition-all">
                <Globe className="text-primary mb-4" size={32} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Location</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Global (English)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/50 transition-all">
                <div className="w-8 h-8 bg-slate-950 dark:bg-white rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white dark:text-black font-black text-sm">G</span>
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Search Engine</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Google Organic</p>
            </div>
        </div>

        {/* The Deep Dive Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="px-10 py-12 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full" />
                        Competitor Deep Dive
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Real-time keyword optimization analysis for current top ranking domains.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <Info size={16} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug / Title / Desc / H1 Matches</span>
                </div>
            </div>
            
            <div className="p-4 md:p-10">
                <CompetitionDeepDive data={analysis} keyword={keyword} />
            </div>
        </div>

        {/* Call to Action Footer */}
        <div className="py-24 text-center space-y-8 bg-slate-950 dark:bg-white rounded-[3rem] text-white dark:text-slate-950 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] pointer-events-none" />
            <div className="relative z-10 space-y-6 px-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none max-w-2xl mx-auto">
                    Want to run your own custom audits?
                </h2>
                <p className="text-lg md:text-xl font-medium text-slate-400 dark:text-slate-500 max-w-xl mx-auto">
                    Join DFSUI today and unlock deep insights for any keyword in any location worldwide.
                </p>
                <div className="pt-6">
                    <a href="/dashboard" className="px-12 py-5 bg-primary text-white dark:text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/30 inline-block">
                        GET STARTED FOR FREE
                    </a>
                </div>
            </div>
        </div>

      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-950 dark:bg-white rounded flex items-center justify-center font-black text-white dark:text-black">D</div>
                <span className="font-black tracking-tighter text-xl">DFSUI</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                © 2024 DATAFORSEO UI • ALL RIGHTS RESERVED
            </p>
        </div>
      </footer>
    </div>
  );
}
