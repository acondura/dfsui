import Link from 'next/link';
import { ArrowRight, Zap, Shield, Code, ChevronRight, BarChart, Globe, Sparkles } from 'lucide-react';

export const runtime = 'edge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20 transition-colors duration-500">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-all duration-300">
              <Zap size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">DFS UI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/dashboard" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Platform</Link>
            <Link href="/keyword-research" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Strategy</Link>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <a 
              href="https://github.com/acondura/dfsui" 
              target="_blank" 
              className="group flex items-center gap-2 text-xs font-black bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-2xl shadow-zinc-900/20 dark:shadow-none"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 container mx-auto px-6 pt-24 md:pt-40 pb-40 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Advanced Keyword Intelligence Engine</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-12 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Dominate the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-500 to-indigo-400 px-2">
            SERP Universe
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 mb-16 max-w-3xl mx-auto leading-relaxed font-bold animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          The high-performance open-source interface for DataForSEO. Built for speed, precision, and actionable SEO insights.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <Link 
            href="/dashboard" 
            className="group w-full sm:w-auto px-10 py-5 bg-primary text-white text-lg font-black uppercase tracking-widest rounded-2xl hover:bg-black shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-3"
          >
            Launch Terminal
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link 
            href="/keyword-research" 
            className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-800 text-lg font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            Explore Strategy
          </Link>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="relative z-10 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800 py-32 md:py-48">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
            
            {/* Feature 1 */}
            <div className="group text-center md:text-left">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-10 mx-auto md:mx-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-blue-500/5">
                <Zap size={32} className="fill-current" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white mb-6 tracking-tight uppercase italic">Edge Caching</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-lg">
                Stop paying twice. We cache search results at the edge for instant retrieval and zero redundant API costs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center md:text-left">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-primary rounded-2xl flex items-center justify-center mb-10 mx-auto md:mx-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-emerald-500/5">
                <Shield size={32} className="fill-current" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white mb-6 tracking-tight uppercase italic">Zero-Trust</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-lg">
                Enterprise security by default. Isolated environments and secure authentication via Cloudflare Access.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center md:text-left">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-10 mx-auto md:mx-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-indigo-500/5">
                <Code size={32} className="fill-current" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white mb-6 tracking-tight uppercase italic">Cloud-Native</h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-lg">
                Optimized for Cloudflare Workers. Scale to millions of requests with globally distributed infrastructure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative z-10 py-32 md:py-56 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl text-center">
           <h2 className="text-4xl md:text-7xl font-black text-zinc-950 dark:text-white mb-24 md:mb-32 tracking-tighter uppercase italic leading-[1.1]">Professional <br className="md:hidden" /> Capabilities</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-left group hover:border-primary/50 transition-colors">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-8">
                    <BarChart size={24} />
                 </div>
                 <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Trend Analytics</h4>
                 <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Visualize seasonality and volatility with interactive monthly charts and chronological demand forecasting.</p>
              </div>

              <div className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-left group hover:border-primary/50 transition-colors">
                 <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-8">
                    <Globe size={24} />
                 </div>
                 <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Global Reach</h4>
                 <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Target specific regions and languages with pinpoint accuracy across Google, Bing, and major search engines.</p>
              </div>

              <div className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-left group hover:border-primary/50 transition-colors">
                 <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-8">
                    <Sparkles size={24} />
                 </div>
                 <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Competition Deep-Dive</h4>
                 <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Instantly audit competitor URLs for H1 tags, meta descriptions, and keyword density to identify gaps.</p>
              </div>

              <div className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-left group hover:border-primary/50 transition-colors">
                 <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-8">
                    <ChevronRight size={24} />
                 </div>
                 <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Smart Fallbacks</h4>
                 <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Intelligent suggestions for niche terms and automatic retry logic for international research failures.</p>
              </div>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-primary fill-current" />
              <span className="text-lg font-black uppercase tracking-widest italic">DFS UI</span>
            </div>
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-600">The professional SEO research interface. © 2026 DFS UI Project.</p>
          </div>
          
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Launch</Link>
            <Link href="/keyword-research" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Strategy</Link>
            <a href="https://github.com/acondura/dfsui" target="_blank" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}