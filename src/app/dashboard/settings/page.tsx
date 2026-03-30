// src/app/dashboard/settings/page.tsx
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, createTeam, addMember, deleteTeam } from './actions';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function SettingsPage() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { 
    activeTeam: { id: teamId, name: teamName, isOwner }, 
    members, 
    dfsUser, 
    dfsPass, 
    isConnected 
  } = await getTeamContext(env);

  let balance = 0;
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
      }
    } catch (e) {}
  }

  return (
    <div className="max-w-3xl space-y-10 pb-20">
      {/* 1. Header & Workspace Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{teamName}</h1>
          <p className="text-slate-500 font-medium italic">Workspace ID: {teamId}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Balance</p>
          <p className="text-2xl font-mono font-bold text-slate-900">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* 2. Team Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Team Members</h3>
          <div className="space-y-4">
            {members.map((m) => (
              <div key={m} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">{m}</span>
                {m === members[0] && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">OWNER</span>}
              </div>
            ))}
          </div>
          {isOwner && (
            <form action={addMember} className="mt-6 flex gap-2">
              <input name="email" type="email" placeholder="user@email.com" className="flex-1 px-4 py-2 bg-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20" required />
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition-colors">ADD</button>
            </form>
          )}
        </div>

        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-200 mb-6">Create New Workspace</h3>
          <form action={createTeam} className="space-y-4">
            <input name="teamName" type="text" placeholder="e.g. Marketing Team" className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm placeholder:text-white/40 outline-none focus:bg-white/20 transition-all" required />
            <button type="submit" className="w-full py-3 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors">Create Team</button>
          </form>
        </div>
      </div>

      {/* 3. API Credentials (Targeting Active Team) */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
        {/* The "Locked" Overlay */}
        {!isOwner && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-md z-20 flex items-center justify-center">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                🔒 View Only Mode
              </p>
            </div>
          </div>
        )}

        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">DataForSEO API Credentials</h3>
        <form action={updateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              name="login" 
              type="text" 
              // THE FIX: If not owner, defaultValue is always an empty string
              defaultValue={isOwner ? (dfsUser || '') : ''} 
              disabled={!isOwner}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:border-blue-500 transition-colors disabled:opacity-0" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              disabled={!isOwner}
              // THE FIX: No dots placeholder if not owner
              placeholder={isOwner && dfsPass ? "••••••••" : ""} 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:border-blue-500 transition-colors disabled:opacity-0" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!isOwner}
            className="md:col-span-2 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isOwner ? 'Update Team Credentials' : 'Only Team Owners can modify credentials'}
          </button>
        </form>
      </div>

      {/* 4. Danger Zone (Delete Team) */}
      {isOwner && teamId.startsWith('team-') && (
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-md">
            <h2 className="text-red-600 font-black text-xs uppercase tracking-widest mb-1">Delete Workspace</h2>
            <p className="text-xs text-red-700/60 font-semibold leading-relaxed">
              {members.length > 1 
                ? "You cannot delete a workspace that still has members. Please remove all other users first." 
                : "This action is permanent. All credentials and cached data for this workspace will be deleted."}
            </p>
          </div>
          <form action={deleteTeam}>
            <button 
              disabled={members.length > 1} 
              className="px-8 py-4 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-red-600"
            >
              Delete Team
            </button>
          </form>
        </div>
      )}
    </div>
  );
}