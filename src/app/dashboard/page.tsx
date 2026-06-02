import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv } from '@/lib/auth';

export const runtime = 'edge';

export default async function DashboardPage() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, dfsUser, dfsPass, isConnected } = await getTeamContext(env);

  let balance = "---";
  let serpPrice: number | null = null;
  let keywordPrice: number | null = null;

  if (isConnected && dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 }
      });
      const data = await res.json() as any;
      balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
      
      // Retrieve API unit prices dynamically from user_data response
      serpPrice = data.tasks?.[0]?.result?.[0]?.price?.serp?.google?.organic?.live?.priority_normal?.cost ?? null;
      keywordPrice = data.tasks?.[0]?.result?.[0]?.price?.dataforseo_labs?.google?.keyword_suggestions?.live?.priority_normal?.cost ?? null;
    } catch (_e) {}
  }

  // Retrieve KV cache counts to display live performance
  let cachedKeywordsCount = 0;
  let cachedAuditsCount = 0;

  if (env?.dfsui) {
    try {
      // List the cache keys for the active user email prefix
      const kwList = await env.dfsui.list({ prefix: `keywords:${email}:` });
      cachedKeywordsCount = kwList.keys.length;

      const auditList = await env.dfsui.list({ prefix: `audit:${email}:` });
      cachedAuditsCount = auditList.keys.length;
    } catch (_e) {}
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl font-black tracking-tighter leading-tight">
          Welcome back,<br /> 
          <span className="text-primary uppercase text-3xl tracking-tight">{email.split('@')[0]}</span>
        </h1>

        <div className="border border-border p-6 rounded-xl shadow-sm flex items-center gap-6 min-w-[280px]">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Available Credits</p>
            <h3 className="font-bold text-sm mt-0.5">DataForSEO Balance</h3>
          </div>
          <div className="text-2xl font-mono font-bold tracking-tighter">
            <span className="text-primary mr-1">$</span>{balance}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Cached Keywords */}
        <div className="border border-border p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Cached Keywords</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter">{cachedKeywordsCount}</span>
              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">datasets</span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">Search volume & intent data stored at the edge.</p>
          </div>
          <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-700" />
          </div>
        </div>

        {/* Card 2: Cached SERP Audits */}
        <div className="border border-border p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Cached SERP Audits</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter">{cachedAuditsCount}</span>
              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">audits</span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">Competitor roadmap analyses saved for fast checks.</p>
          </div>
          <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-700" />
          </div>
        </div>

        {/* Card 3: API Unit Pricing */}
        <div className="border border-border p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">API Unit Pricing</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground/60">Keyword Labs Suggestions</span>
                <span className="font-mono font-bold text-primary">
                  {keywordPrice !== null ? `$${(keywordPrice * 1000).toFixed(2)} / 1K` : '---'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground/60">Google Organic SERP</span>
                <span className="font-mono font-bold text-primary">
                  {serpPrice !== null ? `$${serpPrice.toFixed(4)} / task` : '---'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}