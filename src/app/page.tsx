import Link from 'next/link';
import { ArrowRight, Zap, Database } from 'lucide-react';

export const runtime = 'edge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12">
              <Zap size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">DFS UI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/dashboard" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Dashboard</Link>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <a 
              href="https://github.com/acondura/dfsui" 
              target="_blank" 
              className="group flex items-center gap-2 text-xs font-black bg-zinc-950 dark:bg-white text-dark dark:text-zinc-950 px-6 py-3 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all uppercase tracking-widest shadow-lg shadow-zinc-950/20 dark:shadow-none"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform mr-2 inline-block" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[1.1] fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Keyword research <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-500 to-indigo-400 px-2">
            done easy
          </span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-10 text-zinc-500 dark:text-zinc-400 font-medium fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <Database size={20} className="text-primary" />
          <span>Powered directly by the <strong>DataForSEO API</strong></span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 fade-in slide-in-from-bottom-16 duration-1000 delay-300 mb-20">
          <Link 
            href="/dashboard" 
            className="group w-full sm:w-auto px-10 py-5 bg-primary text-white text-lg font-black uppercase tracking-widest rounded-2xl hover:bg-black shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-3"
          >
            Launch Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
        {/* SCREENSHOTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 fade-in slide-in-from-bottom-24 duration-1000 delay-500">
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-100 dark:bg-zinc-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/keyword-research.png" 
                alt="Keyword Research" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            <p className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-200">Keyword Research</p>
          </div>
          
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-100 dark:bg-zinc-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/keyword-research-competition.png" 
                alt="Competition Analysis" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-200">Competition Analysis</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary fill-current" />
            <span className="text-lg font-black uppercase tracking-widest italic">DFS UI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            <Link href="/keyword-research-tool-in-hindi" className="hover:text-primary transition-colors">Keyword research tool in hindi</Link>
            <a href="https://github.com/acondura/dfsui" target="_blank" className="hover:text-primary transition-colors">Github</a>
            <Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
          </div>
          
          <p className="text-sm font-bold text-zinc-400 dark:text-zinc-600">© {new Date().getFullYear()} DFS UI Project.</p>
        </div>
      </footer>
    </div>
  );
}