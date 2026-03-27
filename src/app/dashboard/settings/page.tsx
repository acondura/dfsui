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
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your DataForSEO API integration.</p>
      </div>

      {/* Balance Card - Restored SVG and tweaked for better light/dark contrast */}
      <div className="bg-[#0f172a] rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Available Balance</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-5xl font-mono font-bold tracking-tighter text-white">${balance.toFixed(2)}</span>
            <span className={`text-[10px] font-black tracking-widest ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>
        
        {/* Restored SVG Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.54-.13-3.04-.84-4.13-2.02l1.39-1.39c.74.79 1.76 1.28 2.74 1.38v-2.71c-1.85-.43-3.72-1.28-3.72-3.6 0-1.78 1.31-3.23 3.11-3.6V4h2.82v1.94c1.23.15 2.41.7 3.32 1.55l-1.35 1.35c-.56-.51-1.24-.87-1.97-.96v2.54c2.01.55 3.96 1.36 3.96 3.86 0 1.95-1.42 3.38-3.65 3.81zM10.59 9.07c-.47.11-.84.45-.84.97 0 .54.49.88 1.43 1.15v-2.3c-.34.05-.59.18-.59.18zm2.82 5.92c.62-.13.98-.53.98-1.05 0-.61-.55-.99-1.63-1.3v2.54c.36-.05.65-.19.65-.19z" />
          </svg>
        </div>
      </div>

      {/* Credentials Form - Styled to look good in native Light Mode too */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest">API Credentials</h2>
        </div>
        
        <form action={updateSettings} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Username</label>
            <input 
              name="login" 
              type="text" 
              defaultValue={dfsUser || ''}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white transition-all" 
              placeholder="DataForSEO Login"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white transition-all" 
              placeholder={dfsPass ? "•••••••• (Enter new to update)" : "DataForSEO Password"}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 dark:bg-blue-700 text-white py-4 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.99]">
            Update Credentials
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 rounded-2xl p-6 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 text-sm">⚠️</span>
          <h2 className="font-bold text-red-600 dark:text-red-500 uppercase text-xs tracking-widest">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-700/60 dark:text-red-400/60 mb-6 leading-relaxed font-medium">
          Disconnecting will erase your API keys from Cloudflare KV. All SEO tools will stop working until you re-authenticate.
        </p>
        <form action={deleteCredentials}>
          <button 
            type="submit" 
            className="px-6 py-2 bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-50 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Disconnect DataForSEO
          </button>
        </form>
      </div>
    </div>
  );
}