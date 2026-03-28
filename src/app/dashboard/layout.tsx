// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: { balance?: number; };
    }>;
  }>;
}

// Helper to extract identity from standard headers or JWT
function getIdentity(headersList: Headers): string {
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email') ||
                      headersList.get('x-forwarded-user');
  
  if (headerEmail) return headerEmail.toLowerCase();

  // Bulletproof fallback: Decode JWT if headers are stripped
  const jwt = headersList.get('cf-access-jwt-assertion');
  if (jwt) {
    try {
      const payload = jwt.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      if (decoded.email) return decoded.email.toLowerCase();
    } catch (e) {
      console.error("JWT Decode failed");
    }
  }

  return 'user';
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const email = getIdentity(headersList);
  const { env } = getRequestContext();

  let balance = "0.00";

  // Safeguard: only fetch if KV is bound (Production check)
  if (env.dfsui && email !== 'user') {
    const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
    const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);

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
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Active Session:</span>
            <b className="text-sm text-slate-900 lowercase">{email}</b>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 transition-transform active:scale-95">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Balance</span>
              <span className="text-sm font-mono font-bold">${balance}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
          
          <aside className="hidden 2xl:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity History</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative pl-6 border-l border-slate-100">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white shadow-sm" />
                <p className="text-[11px] font-bold text-slate-900">System Ready</p>
                <p className="text-[11px] text-slate-500 mt-1">Authenticated via {email.includes('@') ? 'Cloudflare Access' : 'Default'}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}