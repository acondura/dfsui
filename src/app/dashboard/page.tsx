// src/app/dashboard/page.tsx
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

export default async function DashboardPage() {
  const headersList = await headers();
  const email = headersList.get('cf-access-authenticated-user-email') || 'User';
  const { env } = getRequestContext();

  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);
  let balance = "---";

  if (dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 }
      });
      const data = await res.json() as DFUserResponse;
      balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
    } catch (e) { /* Fallback to --- */ }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-40" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{email.split('@')[0]}</span>
          </h1>
          
          <div className="mt-10 p-8 bg-[#f8fafc] rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Current Account Power</p>
              <span className="text-slate-600 font-bold text-lg">DataForSEO Available Budget:</span>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-600 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
              ${balance}
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm font-medium italic">
              Select a tool from the sidebar to begin your research.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Keywords', 'SERP', 'Explorer'].map((item) => (
          <div key={item} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm opacity-50 grayscale">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item} Usage</p>
            <p className="text-xl font-bold text-slate-900 mt-1">0 credits</p>
          </div>
        ))}
      </div>
    </div>
  );
}