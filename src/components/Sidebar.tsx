'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Globe, 
  Settings, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import { switchTeam } from '@/app/dashboard/settings/actions';
import { Team, getIdentity } from '@/lib/auth';

export default function Sidebar({ allTeams = [], activeTeamId }: { allTeams?: Team[], activeTeamId?: string }) {
  const pathname = usePathname();

  // Construct the Cloudflare Access logout URL
  // Replace 'k9czuj5q2zbo29nb' with your env variable if preferred
  const teamDomain = process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || 'k9czuj5q2zbo29nb';
  const logoutUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${encodeURIComponent('https://dfsui.com')}`;

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800">
      <div className="p-8">
        <h1 className="text-white text-xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">DF</div>
          dfsui<span className="text-blue-500">.com</span>
        </h1>
      </div>

      {/* Workspace Switcher */}
      {allTeams.length > 0 && (
        <div className="px-6 mb-10 relative">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 mb-2.5 block">Active Workspace</label>
          <div className="relative group">
            <select 
              value={activeTeamId}
              onChange={(e) => switchTeam(e.target.value)}
              className="w-full appearance-none bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-xs font-black text-white outline-none cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 pr-12 shadow-sm"
            >
              {allTeams.map(team => (
                <option key={team.id} value={team.id} className="bg-slate-900 text-white py-4">
                  {team.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-400 transition-colors">
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {[
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Keywords', href: '/dashboard/keywords', icon: Search },
          { name: 'SERP Checker', href: '/dashboard/serp', icon: Globe },
          { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 mt-auto border-t border-slate-800/50">
        <a
          href={logoutUrl}
          className="flex items-center justify-center w-full px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={14} className="mr-3" />
          Log Out
        </a>
      </div>
    </aside>
  );
}