import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateSettings, createTeam, addMember, deleteTeam, addAdmin, removeAdmin, getAdminList } from './actions';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function SettingsPage() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { 
    email,
    activeTeam: { id: teamId, name: teamName, isOwner }, 
    members, 
    isAdmin,
    dfsUser, 
    dfsPass, 
    isConnected 
  } = await getTeamContext(env);

  const adminList = isAdmin ? await getAdminList() : [];

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
    } catch (_e) {}
  }

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      {/* 1. Header & Workspace Status */}
      <div className="flex justify-between items-end pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-black tracking-tight">{teamName}</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Workspace ID: <span className="font-mono text-sm opacity-60 uppercase">{teamId}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">Available Funds</p>
          <p className="text-3xl font-mono font-bold text-primary tracking-tighter">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* 2. Team Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-6">Team Members</h3>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m} className="flex justify-between items-center p-4 rounded-2xl border border-border/50 group hover:border-primary/30 transition-all">
                <span className="text-base font-bold">{m}</span>
                {m === members[0] ? (
                  <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md tracking-widest uppercase border border-primary/20">OWNER</span>
                ) : (
                  <span className="text-[11px] font-black text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors uppercase tracking-widest">MEMBER</span>
                )}
              </div>
            ))}
          </div>
          {isOwner && (
            <form action={addMember} className="mt-8 flex gap-2">
              <input 
                name="email" 
                type="email" 
                placeholder="colleague@email.com" 
                className="flex-1 px-5 py-3 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-primary/30 transition-all" 
                required 
              />
              <button type="submit" className="px-6 py-3 bg-primary text-white text-xs font-black rounded-2xl hover:opacity-90 transition-all shadow-md shadow-primary/20 tracking-widest">ADD</button>
            </form>
          )}
        </div>

        <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-6">Create New Workspace</h3>
            <form action={createTeam} className="space-y-4">
              <input 
                name="teamName" 
                type="text" 
                placeholder="e.g. Content Marketing" 
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm placeholder:text-white/40 outline-none focus:bg-white/20 transition-all font-bold" 
                required 
              />
              <button type="submit" className="w-full py-4 bg-white text-primary font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-muted transition-all shadow-lg">Confirm Creation</button>
            </form>
          </div>
          {/* Decorative subtle pulse */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
        </div>
      </div>

      {/* 3. Global Administrator Management (Only for Admins) */}
      {isAdmin && (
        <div className="border-2 border-slate-900 dark:border-slate-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="text-6xl">🛡️</span>
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-6 flex items-center gap-2">
            Global Administrators
            <span className="bg-slate-950 text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-[8px] tracking-widest">ADMIN ONLY</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {adminList.map((admin) => (
                <div key={admin} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-bold truncate pr-2">{admin}</span>
                  {admin === email ? (
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest italic">YOU</span>
                  ) : (
                    <form action={async (formData) => { 'use server'; await removeAdmin(admin); }}>
                       <button type="submit" className="text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest">REVOKE</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-4">
                Administrators can manage pSEO keywords, switch teams, and control global system settings. Be careful who you authorize.
              </p>
              <form action={async (formData) => { 'use server'; await addAdmin(formData.get('newAdmin') as string); }} className="flex gap-2">
                <input 
                  name="newAdmin" 
                  type="email" 
                  placeholder="admin@email.com" 
                  className="flex-1 px-5 py-3 rounded-2xl text-sm font-medium border border-slate-200 dark:border-slate-800 focus:border-slate-900 transition-all" 
                  required 
                />
                <button type="submit" className="px-6 py-3 bg-slate-950 dark:bg-white dark:text-black text-white text-xs font-black rounded-2xl hover:opacity-80 transition-all tracking-widest">AUTHORIZE</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. API Credentials */}
      <div className="border border-border rounded-3xl p-10 shadow-sm relative overflow-hidden">
        {!isOwner && (
          <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="px-6 py-3 rounded-2xl border border-border shadow-2xl flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                ReadOnly Workspace Access
              </p>
            </div>
          </div>
        )}

        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-10">DataForSEO API Connectivity</h3>
        <form action={updateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Username (Login)</label>
            <input 
              name="login" 
              type="text" 
              defaultValue={isOwner ? (dfsUser || '') : ''} 
              disabled={!isOwner}
              className="w-full px-6 py-4 border border-border rounded-2xl outline-none font-bold focus:border-primary/50 transition-all disabled:opacity-0" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Password (API Key)</label>
            <input 
              name="password" 
              type="password" 
              disabled={!isOwner}
              placeholder={isOwner && dfsPass ? "••••••••••••" : ""} 
              className="w-full px-6 py-4 border border-border rounded-2xl outline-none font-bold focus:border-primary/50 transition-all disabled:opacity-0" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!isOwner}
            className="md:col-span-2 py-5 bg-foreground text-background rounded-2xl font-black uppercase text-sm tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-[0.99] disabled:bg-muted disabled:text-muted-foreground/30 disabled:cursor-not-allowed shadow-sm"
          >
            {isOwner ? 'Sync API Credentials' : 'Modification Restricted'}
          </button>
        </form>
      </div>

      {/* 5. Danger Zone (Delete Team) */}
      {isOwner && teamId.startsWith('team-') && (
        <div className="border border-red-500/10 rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-red-500 font-black text-xs uppercase tracking-[0.2em] mb-2">Workspace Deletion</h2>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {members.length > 1 
                ? "Restricted: You must remove all other members before deleting this workspace." 
                : "Warning: This action is destructive. All associated data and credentials will be purged permanently."}
            </p>
          </div>
          <form action={deleteTeam}>
            <button 
              disabled={members.length > 1} 
              className="px-10 py-4 border-2 border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-20"
            >
              Terminate Workspace
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
