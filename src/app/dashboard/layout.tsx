// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { 
    email, 
    activeTeam, 
    allTeams, 
    dfsUser, 
    dfsPass, 
    isConnected 
  } = await getTeamContext(env);

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
    // Outer frame with dark background
    <div className="flex h-screen bg-slate-950 text-slate-900 font-sans antialiased overflow-hidden">
      <Sidebar allTeams={allTeams} activeTeamId={activeTeam.id} />
      
      {/* Inner container with rounded corners and shadow */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 rounded-tl-[3rem] my-2 mr-2 shadow-2xl">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Context</span>
            <span className="text-sm font-bold text-slate-900 lowercase">{activeTeam.name}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 transition-transform active:scale-95">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Balance</span>
              <span className="text-base font-mono font-bold">${balance}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
            
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-black text-xs">
              {email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-10 lg:p-16">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
          
          <aside className="hidden 2xl:flex w-80 border-l border-slate-200 bg-white p-8 flex-col gap-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Environment</h2>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Identity</p>
                  <p className="text-xs font-mono font-bold text-slate-900 truncate lowercase mt-1">{email}</p>
                </div>
                <div className="pt-3 border-t border-slate-200/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Workspace ID</p>
                  <p className="text-[10px] font-mono font-medium text-slate-500 truncate mt-1">{activeTeam.id}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}