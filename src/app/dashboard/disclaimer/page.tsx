// src/app/dashboard/disclaimer/page.tsx
import { ExternalLink, ShieldAlert, Award, MousePointerClick } from 'lucide-react';

export const runtime = 'edge';

export default function DisclaimerPage() {
  const affiliateLinks = {
    site: "https://dataforseo.com/?aff=163459",
    platform: "https://app.dataforseo.com/?aff=163459",
    connector: "https://dataforseo.com/google-sheets-connector?connector_aff=163459"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter uppercase">
          Affiliate Disclaimer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          Transparency is at the core of our relationship with our users.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Independent Platform</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
            <strong>DFSUI.com</strong> is an independent software interface and is <strong>not affiliated with, endorsed by, or sponsored by DataForSEO.com</strong>. We provide a custom UI wrapper around the official DataForSEO API to help you visualize and manage your research data more efficiently.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Affiliate Relationship</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
            To support the development and maintenance of this open-source tool, we participate in the <a href={affiliateLinks.site} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 hover:text-emerald-700 font-bold transition-colors">DataForSEO Affiliate Program</a>. This means we may earn a commission if you sign up through our referral links, at no additional cost to you.
          </p>
        </div>
      </div>

      <div className="p-10 bg-slate-950 text-white rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <MousePointerClick size={120} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Support DFSUI</h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">
            Sign up for a DataForSEO account using our referral link to start your keyword research and support this project simultaneously.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a 
              href={affiliateLinks.site} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              Sign up for DataForSEO <ExternalLink size={16} />
            </a>
            <a 
              href={affiliateLinks.connector} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
            >
              Google Sheets Connector <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
          Last Updated: April 17, 2026 • DFSUI.COM
        </p>
      </div>
    </div>
  );
}
