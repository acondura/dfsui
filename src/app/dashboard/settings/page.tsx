// src/app/dashboard/settings/page.tsx
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, deleteCredentials } from './actions';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function SettingsPage() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { teamId, dfsUser, dfsPass, isConnected } = await getTeamContext(env);

  let balance = 0;
  let status = 'NOT CONNECTED';

  if (isConnected && dfsUser && dfsPass) {
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
    } catch (e) { status = 'ERROR'; }
  }

  return (
    <div className="max-w-2xl space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic lowercase">Workspace: {teamId.split('@')[0]}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
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

      <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-md">
           <h2 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Danger Zone</h2>
           <p className="text-xs text-red-700/60 font-semibold leading-relaxed">Disconnecting removes Edge cache keys immediately.</p>
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