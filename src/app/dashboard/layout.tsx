// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

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
  // Robust extraction helper
  const headersList = await headers();

  const email = (
    headersList.get('cf-access-authenticated-user-email') || 
    headersList.get('Cf-Access-Authenticated-User-Email') || 
    headersList.get('x-forwarded-user') || 
    // Fallback: If we have a JWT but no email header, Cloudflare is in 'Secure' mode
    (headersList.has('cf-access-jwt-assertion') ? 'Authenticated User' : 'User')
  ).toLowerCase(); // Normalize to lowercase for KV lookups
    
  const { env } = getRequestContext();

  // Fetch keys using the lowercase email key to stay consistent
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
        const data = await res.json() as DFUserResponse;
        balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      }
    } catch (e) {
      console.error("Header balance fetch failed");
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Polished Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Active Session:</span>
            <b className="text-sm text-slate-900">{email}</b>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Balance</span>
              <span className="text-sm font-mono font-bold">${balance}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
          
          {/* Right Activity Sidebar */}
          <aside className="hidden 2xl:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity History</h2>
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="w-1 h-1 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative pl-6 border-l border-slate-100">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />
                <p className="text-[11px] font-bold text-slate-900">System Ready</p>
                <p className="text-[11px] text-slate-500 mt-1">Waiting for user actions...</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}