// src/app/dashboard/settings/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, deleteCredentials } from './actions';

export const runtime = 'edge';

// Define the shape of your Cloudflare Environment to satisfy the linter
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

// Robust identity helper for build stability
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
    } catch (e) {
      return 'user';
    }
  }
  return 'user';
}

export default async function SettingsPage() {
  const headersList = await headers();
  const email = getIdentity(headersList);
  
  const context = getRequestContext();
  // Use the interface instead of 'any' to fix the lint error
  const env = context?.env as CloudflareEnv;

  // Binding Guard
  if (!env || !env.dfsui) {
    return (
      <div className="max-w-2xl p-12 bg-white border border-red-100 rounded-[2.5rem] shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Binding Missing</h1>
        <p className="mt-4 text-slate-500 font-medium">
          The KV namespace <code className="bg-slate-100 px-2 py-1 rounded text-red-600">dfsui</code> is not bound to this environment.
        </p>
      </div>
    );
  }

  const dfsUser = await env.dfsui.get(`${email}:credentials:dfs-user`);
  const dfsPass = await env.dfsui.get(`${email}:credentials:dfs-pass`);

  let balance = 0;
  let status = 'NOT CONNECTED';

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
      }
    } catch (e) {
      status = 'ERROR';
    }
  }

  return (
    <div className="max-w-2xl space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Identification: {email}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {status}
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white border border-slate-800">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Total Available Credits</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-6xl font-mono font-bold tracking-tighter leading-none">${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-1">
        <div className="bg-[#f8fafc] rounded-[2.2rem] p-10">
           <form action={updateSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Username</label>
                  <input name="login" type="text" defaultValue={dfsUser || ''} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-slate-900 font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Password</label>
                  <input name="password" type="password" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-slate-900 font-bold" placeholder={dfsPass ? "••••••••" : ""} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all">
                Update Credentials
              </button>
           </form>
        </div>
      </div>

      {/* Danger Zone Restored */}
      <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-md">
           <h2 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Danger Zone</h2>
           <p className="text-xs text-red-700/60 font-semibold leading-relaxed">Disconnecting removes Edge cache keys. All SEO tools will deactivate immediately.</p>
        </div>
        <form action={deleteCredentials}>
          <button type="submit" className="px-8 py-4 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
            Disconnect
          </button>
        </form>
      </div>
    </div>
  );
}