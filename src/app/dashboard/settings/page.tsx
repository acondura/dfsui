// src/app/dashboard/settings/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, deleteCredentials } from './actions';

export const runtime = 'edge';

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

  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);

  let balance = 0;
  let status = 'Not Connected';
  let statusColor = 'text-slate-400';

  if (dfsUser && dfsPass) {
    try {
      // Use the standard Buffer-style encoding for Basic Auth at the Edge
      const authString = `${dfsUser}:${dfsPass}`;
      const encodedAuth = btoa(authString);
      
      const res = await fetch('https://api.dataforseo.com/v3/admin/user', {
        method: 'GET',
        headers: { 
          'Authorization': `Basic ${encodedAuth}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 0 } 
      });
      
      // DEBUG: This will show up in your Cloudflare dashboard logs
      console.log(`DFS Auth Status for ${email}: ${res.status} ${res.statusText}`);

      if (res.ok) {
        const data = await res.json() as DFUserResponse;
        balance = data.tasks?.[0]?.result?.[0]?.money ?? 0;
        status = 'Connected';
        statusColor = 'text-emerald-400';
      } else if (res.status === 401) {
        status = 'Invalid Credentials (401)';
        statusColor = 'text-red-400';
      } else {
        status = `Error: ${res.status}`;
        statusColor = 'text-orange-400';
      }
    } catch (error) {
      status = 'Fetch Failed';
      statusColor = 'text-red-600';
    }
  }

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your DataForSEO API integration.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Available Balance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-mono font-bold tracking-tighter">${balance.toFixed(2)}</span>
            <span className={`text-sm font-bold uppercase tracking-widest ${statusColor}`}>
              {status}
            </span>
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
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <input 
              name="login" 
              type="text" 
              defaultValue={dfsUser || ''}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" 
              placeholder="DataForSEO Login"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              defaultValue="" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" 
              placeholder={dfsPass ? "•••••••• (Keys set, enter new to change)" : "DataForSEO Password"}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
            Update Credentials
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
        <h2 className="font-bold text-red-700 mb-4">Danger Zone</h2>
        <form action={deleteCredentials}>
          <button 
            type="submit" 
            className="px-6 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Disconnect DataForSEO
          </button>
        </form>
      </div>
    </div>
  );
}