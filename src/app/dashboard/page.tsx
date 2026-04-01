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
    } catch (_e) {
      console.error("Dashboard fetch error");
    }
  }

  const userName = email.split('@')[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
      {/* 1. Welcome Section */}
      <div className="relative group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-[1.1]">
              Welcome back,<br /> 
              <span className="text-primary uppercase text-4xl tracking-tight">{userName}</span>
            </h1>
            <p className="text-muted-foreground/60 font-medium mt-4 max-w-md text-sm uppercase tracking-widest italic">
              System active • SEO Insights Ready
            </p>
          </div>

          {/* Credits Card */}
          <div className="bg-background border border-border p-8 rounded-3xl shadow-sm flex items-center gap-6 min-w-[320px]">
            <div className="space-y-1 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Resource Pool</p>
              <h3 className="text-foreground/80 font-bold text-sm tracking-tight">Available Credits</h3>
            </div>
            <div className="text-3xl font-mono font-bold text-foreground tracking-tighter">
              <span className="text-primary mr-1">$</span>{balance}
            </div>
          </div>
        </div>
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* 2. Usage Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Keywords', 'SERP', 'Explorer'].map((item) => (
          <div 
            key={item} 
            className="bg-background border border-border p-8 rounded-3xl shadow-sm hover:border-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{item} Usage</p>
              <div className="w-2 h-2 rounded-full bg-muted group-hover:bg-primary transition-colors duration-500" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tighter">0.00</span>
              <span className="text-[10px] font-black text-muted-foreground/30 tracking-[0.2em] uppercase">credits</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/20 w-0 group-hover:w-full transition-all duration-1000 ease-out" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Quick Actions / Status */}
      <div className="bg-muted/30 border border-dashed border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shadow-sm">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-black text-foreground uppercase tracking-widest">Environment Synced</p>
            <p className="text-[10px] font-medium text-muted-foreground/60 uppercase">Cloudflare Edge + DataForSEO API v3</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-background border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            Node: OTP-01
          </div>
          <div className="px-4 py-2 bg-background border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-primary">
            Latency: 42ms
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimalist Zap icon for the status bar
function Zap({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}