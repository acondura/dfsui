import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, DFUserResponse } from '@/lib/auth';

export const runtime = 'edge';

export default async function DashboardPage() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, dfsUser, dfsPass, isConnected } = await getTeamContext(env);

  let balance = "---";
  if (isConnected && dfsUser && dfsPass) {
    try {
      const auth = btoa(`${dfsUser}:${dfsPass}`);
      const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        headers: { 'Authorization': `Basic ${auth}` },
        next: { revalidate: 60 }
      });
      const data = await res.json() as DFUserResponse;
      balance = (data.tasks?.[0]?.result?.[0]?.money?.balance ?? 0).toFixed(2);
    } catch (_e) {}
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl font-black text-foreground tracking-tighter leading-tight">
          Welcome back,<br /> 
          <span className="text-primary uppercase text-3xl tracking-tight">{email.split('@')[0]}</span>
        </h1>

        <div className="bg-background border border-border p-6 rounded-xl shadow-sm flex items-center gap-6 min-w-[280px]">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Available Credits</p>
            <h3 className="text-foreground/80 font-bold text-sm mt-0.5">DataForSEO Balance</h3>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground tracking-tighter">
            <span className="text-primary mr-1">$</span>{balance}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Keywords', 'SERP', 'Explorer'].map((item) => (
          <div key={item} className="bg-background border border-border p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all group">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{item}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground tracking-tighter">0.00</span>
              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">credits</span>
            </div>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}