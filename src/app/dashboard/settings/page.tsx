// src/app/dashboard/settings/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, deleteCredentials } from './actions';

export const runtime = 'edge';

// Define the shape of the DataForSEO Admin User response to satisfy the linter
interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: number;
    }>;
  }>;
}

export default async function SettingsPage() {
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email') || '';
  const { env } = getRequestContext();

  // Fetch individual keys from KV
  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);

  let balance = 0;
  let status = 'Not Connected';
  let statusColor = 'text-slate-400';

  if (dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/admin/user', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 0 } 
      });
      
      if (res.ok) {
        const data = await res.json() as DFUserResponse;
        balance = data.tasks?.[0]?.result?.[0]?.money ?? 0;
        status = 'Connected';
        statusColor = 'text-emerald-400';
      } else {
        status = 'Invalid Credentials';
        statusColor = 'text-red-400';
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      status = 'Connection Error';
      statusColor = 'text-orange-400';
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure your DataForSEO API integration and manage your stored credentials.
        </p>
      </div>

      {/* Modern Balance Card */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.54-.13-3.04-.84-4.13-2.02l1.39-1.39c.74.79 1.76 1.28 2.74 1.38v-2.71c-1.85-.43-3.72-1.28-3.72-3.6 0-1.78 1.31-3.23 3.11-3.6V4h2.82v1.94c1.23.15 2.41.7 3.32 1.55l-1.35 1.35c-.56-.51-1.24-.87-1.97-.96v2.54c2.01.55 3.96 1.36 3.96 3.86 0 1.95-1.42 3.38-3.65 3.81zM10.59 9.07c-.47.11-.84.45-.84.97 0 .54.49.88 1.43 1.15v-2.3c-.34.05-.59.18-.59.18zm2.82 5.92c.62-.13.98-.53.98-1.05 0-.61-.55-.99-1.63-1.3v2.54c.36-.05.65-.19.65-.19z" />
          </svg>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Available Balance</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-mono font-bold tracking-tighter">${balance.toFixed(2)}</span>
              <span className={`text-sm font-bold uppercase tracking-widest ${statusColor}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800">API Credentials</h2>
        </div>
        
        <form action={updateSettings} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              DataForSEO Username / Login
            </label>
            <input 
              name="login" 
              type="text" 
              defaultValue={dfsUser || ''}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-900" 
              placeholder="e.g. your-email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              API Password
            </label>
            <input 
              name="password" 
              type="password" 
              defaultValue={dfsPass ? '********' : ''}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-900" 
              placeholder="Your DataForSEO password"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98]">
            Update Credentials
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/30 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-red-100 rounded-md text-red-600">
            ⚠️
          </div>
          <h2 className="font-bold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-600/70 mb-6 leading-relaxed">
          Disconnecting will erase your API keys from Cloudflare KV. All SEO tools will stop working until you re-authenticate.
        </p>
        
        <form action={deleteCredentials}>
          <button 
            type="submit" 
            className="w-full md:w-auto px-6 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
          >
            Disconnect DataForSEO
          </button>
        </form>
      </div>
    </div>
  );
}