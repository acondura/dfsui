import Link from 'next/link';
import { ExternalLink, ShieldAlert, Award, MousePointerClick, Zap } from 'lucide-react';

export const runtime = 'edge';

export default function DisclaimerPage() {
  const affiliateLinks = {
    site: "https://dataforseo.com/?aff=163459",
    platform: "https://app.dataforseo.com/?aff=163459",
    connector: "https://dataforseo.com/google-sheets-connector?connector_aff=163459"
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20 transition-colors duration-500">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-all duration-300">
              <Zap size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">DFS UI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/dashboard" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/keyword-research" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">Strategy</Link>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <a 
              href="https://github.com/acondura/dfsui" 
              target="_blank" 
              className="group flex items-center gap-2 text-xs font-black bg-zinc-950 dark:bg-white text-dark dark:text-zinc-950 px-6 py-3 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all uppercase tracking-widest shadow-lg shadow-zinc-950/20 dark:shadow-none"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 space-y-16 animate-in fade-in duration-700">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Affiliate Disclaimer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xl max-w-2xl mx-auto">
            Transparency is at the core of our relationship with our users.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Independent Platform</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-bold">
              <strong>DFSUI.com</strong> is an independent software interface and is <strong>not affiliated with, endorsed by, or sponsored by DataForSEO.com</strong>. We provide a custom UI wrapper around the official DataForSEO API.
            </p>
          </div>

          <div className="p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Affiliate Relationship</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-bold">
              To support the project, we participate in the <a href={affiliateLinks.site} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 hover:text-emerald-700 transition-colors">DataForSEO Affiliate Program</a>. We may earn a commission if you sign up through our links.
            </p>
          </div>
        </div>

        <div className="p-12 bg-zinc-950 text-white rounded-[3rem] shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <MousePointerClick size={160} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Support DFSUI</h2>
            <p className="text-zinc-400 font-bold text-xl max-w-3xl">
              Sign up for a DataForSEO account using our referral link to start your keyword research and support this project simultaneously.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <a 
                href={affiliateLinks.site} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Sign up for DataForSEO <ExternalLink size={18} />
              </a>
              <a 
                href={affiliateLinks.connector} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-10 py-5 bg-zinc-800 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-3"
              >
                Google Sheets Connector <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 italic">
            Last Updated: April 17, 2026 • DFSUI.COM
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-primary fill-current" />
              <span className="text-lg font-black uppercase tracking-widest italic">DFS UI</span>
            </div>
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-600">The professional SEO research interface. © 2026 DFS UI Project.</p>
          </div>
          
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/keyword-research" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Strategy</Link>
            <a href="https://github.com/acondura/dfsui" target="_blank" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
