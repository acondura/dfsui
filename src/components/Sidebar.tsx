'use client'
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Globe, 
  Settings, 
  LogOut, 
  ChevronDown,
  Check
} from 'lucide-react';
import { switchTeam } from '@/app/dashboard/settings/actions';
import { Team } from '@/lib/auth';

export default function Sidebar({ allTeams = [], activeTeamId }: { allTeams?: Team[], activeTeamId?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];
  const teamDomain = process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || 'k9czuj5q2zbo29nb';
  const logoutUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${encodeURIComponent('https://dfsui.com')}`;

  const handleTeamSwitch = async (id: string) => {
    setIsOpen(false);
    await switchTeam(id);
  };

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800 z-50">
      <div className="p-8">
        <h1 className="text-white text-xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">DF</div>
          dfsui<span className="text-blue-500">.com</span>
        </h1>
      </div>

      {/* Custom Workspace Switcher */}
      <div className="px-6 mb-10 relative" ref={dropdownRef}>
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 mb-2.5 block">
          Active Workspace
        </label>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-slate-800/50 border rounded-2xl px-5 py-4 text-xs font-black text-white transition-all duration-300 ${
            isOpen ? 'border-blue-500 bg-slate-800' : 'border-slate-700/50 hover:border-slate-600'
          }`}
        >
          <span className="truncate">{activeTeam?.name}</span>
          <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
        </button>

        {/* The Dropdown Menu - Positioned absolutely below the button */}
        {isOpen && (
          <div className="absolute left-6 right-6 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
            <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
              {allTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSwitch(team.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[11px] font-bold transition-colors ${
                    team.id === activeTeamId 
                      ? 'bg-blue-600/10 text-blue-400' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="truncate">{team.name}</span>
                  {team.id === activeTeamId && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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