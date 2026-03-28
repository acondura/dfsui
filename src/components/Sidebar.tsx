'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { switchTeam } from '@/app/dashboard/settings/actions';
import { Team } from '@/lib/auth';

export default function Sidebar({ allTeams, activeTeamId }: { allTeams: Team[], activeTeamId: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="p-8">
        <h1 className="text-white text-xl font-black tracking-tighter">dfsui<span className="text-blue-500">.com</span></h1>
      </div>

      {/* Team Switcher */}
      <div className="px-6 mb-8">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 mb-2 block">Workspace</label>
        <select 
          value={activeTeamId}
          onChange={(e) => switchTeam(e.target.value)}
          className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white outline-none cursor-pointer hover:bg-slate-700 transition-colors"
        >
          {allTeams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {[
          { name: 'Overview', href: '/dashboard', icon: '📊' },
          { name: 'Keywords', href: '/dashboard/keywords', icon: '🔑' },
          { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              pathname === item.href ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}