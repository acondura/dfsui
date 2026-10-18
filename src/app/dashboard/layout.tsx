import Sidebar from '@/components/Sidebar';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import type { SavedQuerySummary } from '@/components/Sidebar';

export const runtime = 'edge';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam, allTeams, dfsUser, dfsPass, isConnected } = await getTeamContext(env);

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
        const rawBalance = data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0;
        // Truncate to 2 decimals instead of rounding
        balance = (Math.floor(rawBalance * 100) / 100).toFixed(2);
      }
    } catch {}
  }

  // Load saved query names for the sidebar — only the ID + name, no full definitions needed
  let savedQueries: SavedQuerySummary[] = [];
  try {
    const rawUserList = await env.dfsui.get(`user:${email}:queries`);
    const userQueryIds: string[] = rawUserList ? JSON.parse(rawUserList) : [];

    // Also include queries shared with the active team
    const rawTeamList = await env.dfsui.get(`team:${activeTeam.id}:queries`);
    const teamQueryIds: string[] = rawTeamList ? JSON.parse(rawTeamList) : [];

    const allIds = [...new Set([...userQueryIds, ...teamQueryIds])];

    // Fetch names in parallel (we only need id + name from the full definition)
    const results = await Promise.all(
      allIds.map(async (id) => {
        const raw = await env.dfsui.get(`query:${id}`);
        if (!raw) return null;
        try {
          const q = JSON.parse(raw);
          return { id: q.id, name: q.name } as SavedQuerySummary;
        } catch {
          return null;
        }
      })
    );

    savedQueries = results.filter(Boolean) as SavedQuerySummary[];
  } catch {}

  return (
    <I18nProvider>
      <div className="flex h-screen font-sans antialiased overflow-hidden">
        <Sidebar allTeams={allTeams} activeTeamId={activeTeam.id} savedQueries={savedQueries} />

        <div className="flex-1 bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-border flex items-center justify-between pl-16 pr-4 lg:px-8 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xl z-20 sticky top-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 hidden xs:block">Balance</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 font-mono font-bold text-base">
                ${balance}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground/60 hidden sm:block">{email}</span>
              <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-xs font-bold">
                {email[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto px-8 py-10">
              <div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
