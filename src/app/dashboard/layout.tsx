import Sidebar from '@/components/Sidebar';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { 
    email, 
    activeTeam, 
    allTeams, 
    dfsUser, 
    dfsPass, 
    isConnected 
  } = await getTeamContext(env);

  let balance = "0.00";

  if (isConnected && dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 } 
      });
      
      if (res.ok) {
        const data = await res.json() as DFUserResponse;
        balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      }
    } catch (_e) {
      console.error("Balance fetch failed");
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
      {/* Main Navigation Sidebar (Left) */}
      <Sidebar allTeams={allTeams} activeTeamId={activeTeam.id} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Workspace</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-foreground">
                {activeTeam.id === email ? 'Personal Workspace' : activeTeam.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Balance</span>
              <span className="text-sm font-mono font-bold">${balance}</span>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold">
              {email[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area + Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto px-8 py-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          
          {/* Environment Sidebar (Right) - Hidden on smaller screens */}
          <aside className="hidden xl:flex w-72 border-l border-border bg-muted/20 p-8 flex-col gap-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Environment</h2>
              <div className="p-5 bg-background border border-border rounded-2xl space-y-4">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Active Identity</p>
                  <p className="text-xs font-bold text-foreground truncate mt-1 lowercase">{email}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Team ID</p>
                  <p className="text-[10px] font-mono font-medium text-foreground/50 truncate mt-1 uppercase italic">{activeTeam.id}</p>
                </div>
              </div>
            </div>

            {/* Optional Status Indicators */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">API Status</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                DataForSEO Connected
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}