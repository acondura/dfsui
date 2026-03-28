// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, teamId, dfsUser, dfsPass, isConnected, isPersonal } = await getTeamContext(env);

  let balance = "0.00";

  if (isConnected && dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 } 
      });
      
      if (res.ok) {
        const data = await res.json() as DFUserResponse;
        balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      }
    } catch (e) {
      console.error("Balance fetch failed");
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace:</span>
            <div className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-bold text-slate-700">
              {isPersonal ? 'Personal' : teamId.split('@')[0]}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Balance</span>
              <span className="text-sm font-mono font-bold">${balance}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
          
          <aside className="hidden 2xl:flex w-80 border-l border-slate-200 bg-white p-6">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Environment</h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">User Identity</p>
                <p className="text-xs font-mono font-bold text-slate-900 truncate lowercase">{email}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}