// src/app/dashboard/settings/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, deleteCredentials } from './actions';

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

export default async function SettingsPage() {
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email') || '';
  const { env } = getRequestContext();

  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);

  let balance = 0;
  let status = 'NOT CONNECTED';
  let statusColor = 'text-slate-500';

  if (dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 0 } 
      });
      
      if (res.ok) {
        const data = await res.json() as DFUserResponse;
        balance = data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0;
        status = 'CONNECTED';
        statusColor = 'text-emerald-500';
      } else {
        status = `ERROR ${res.status}`;
        statusColor = 'text-red-500';
      }
    } catch (e) {
      status = 'CONNECTION ERROR';
      statusColor = 'text-orange-500';
    }
  }

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">DataForSEO API Management</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {status}
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group border border-slate-800">
        <div className="relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Total Available Credits</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-6xl font-mono font-bold tracking-tighter leading-none">${balance.toFixed(2)}</span>
            <div className="h-10 w-[2px] bg-slate-800 mx-2" />
            <span className="text-slate-400 text-xs font-bold leading-tight">USD<br/>BALANCE</span>
          </div>
        </div>
        <div className="absolute top-[-20px] right-[-20px] opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:rotate-0">
          <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.54-.13-3.04-.84-4.13-2.02l1.39-1.39c.74.79 1.76 1.28 2.74 1.38v-2.71c-1.85-.43-3.72-1.28-3.72-3.6 0-1.78 1.31-3.23 3.11-3.6V4h2.82v1.94c1.23.15 2.41.7 3.32 1.55l-1.35 1.35c-.56-.51-1.24-.87-1.97-.96v2.54c2.01.55 3.96 1.36 3.96 3.86 0 1.95-1.42 3.38-3.65 3.81zM10.59 9.07c-.47.11-.84.45-.84.97 0 .54.49.88 1.43 1.15v-2.3c-.34.05-.59.18-.59.18zm2.82 5.92c.62-.13.98-.53.98-1.05 0-.61-.55-.99-1.63-1.3v2.54c.36-.05.65-.19.65-.19z" />
          </svg>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-1">
        <div className="bg-slate-50/80 rounded-[1.4rem] p-8">
           <form action={updateSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Username</label>
                  <input name="login" type="text" defaultValue={dfsUser || ''} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-900 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Password</label>
                  <input name="password" type="password" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-900 transition-all font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]">
                Sync Credentials
              </button>
           </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-md">
           <h2 className="text-red-600 font-black text-xs uppercase tracking-widest mb-1">Danger Zone</h2>
           <p className="text-xs text-red-700/60 font-medium leading-relaxed">Disconnecting removes Edge cache keys. All SEO tools will deactivate immediately.</p>
        </div>
        <form action={deleteCredentials}>
          <button type="submit" className="px-6 py-3 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">
            Disconnect
          </button>
        </form>
      </div>
    </div>
  );
}