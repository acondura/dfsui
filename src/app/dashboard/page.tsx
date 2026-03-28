// src/app/dashboard/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface CloudflareEnv {
  dfsui: KVNamespace;
}

interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: { balance?: number; };
    }>;
  }>;
}

function getIdentity(headersList: Headers): string {
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  if (headerEmail) return headerEmail.toLowerCase();

  const jwt = headersList.get('cf-access-jwt-assertion');
  if (jwt) {
    try {
      const payload = jwt.split('.')[1];
      const decoded = JSON.parse(globalThis.atob(payload));
      if (decoded.email) return decoded.email.toLowerCase();
    } catch (e) { return 'user'; }
  }
  return 'user';
}

export default async function DashboardPage() {
  const headersList = await headers();
  const email = getIdentity(headersList);
  const { env } = getRequestContext() as { env: CloudflareEnv };

  let balance = "---";

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
        const data = await res.json() as DFUserResponse;
        balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      } catch (e) {
        console.error("Dashboard fetch error");
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-14 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Welcome back,<br /> 
            <span className="text-blue-600 uppercase text-4xl">{email.split('@')[0]}</span>
          </h1>
          
          {/* Focused Balance Section */}
          <div className="mt-12 p-8 bg-[#f8fafc] rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Account Resources</p>
              <h3 className="text-slate-600 font-bold text-lg">Available DataForSEO Credits</h3>
            </div>
            <div className="text-4xl font-mono font-bold text-slate-900 bg-white px-8 py-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
              <span className="text-emerald-500 mr-1">$</span>{balance}
            </div>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Keywords', 'SERP', 'Explorer'].map((item) => (
          <div key={item} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:border-slate-300 transition-all group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{item} Usage</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">0.00</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic group-hover:text-blue-500">credits</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-slate-200 w-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}