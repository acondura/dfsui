// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';

// 1. Add this interface to define the DataForSEO response
interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: {
        balance?: number;
      };
    }>;
  }>;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email') || 'User';
  const { env } = getRequestContext();

  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);
  let balance = "0.00";

  if (dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 } 
      });
      
      if (res.ok) {
        // 2. Change 'as any' to your new interface
        const data = await res.json() as DFUserResponse;
        balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      }
    } catch (e) {
      console.error("Header balance fetch failed");
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Persistent Balance */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Welcome, <b className="text-slate-900">{email}</b></span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Balance</span>
              <span className="text-sm font-mono font-bold">${balance}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          
          {/* Activity Feed Sidebar */}
          <aside className="hidden xl:flex w-80 border-l border-slate-200 bg-white flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Feed</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-[11px] text-slate-500">
                Latest 10 actions will appear here.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}