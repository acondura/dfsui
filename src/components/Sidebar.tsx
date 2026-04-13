'use client'
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Globe, Settings, LogOut, ChevronDown, Check } from 'lucide-react';
import { switchTeam } from '@/app/dashboard/settings/actions';
import { Team } from '@/lib/auth';

export default function Sidebar({ allTeams = [], activeTeamId }: { allTeams?: Team[], activeTeamId?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];
  const teamDomain = process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || 'k9czuj5q2zbo29nb';
  const logoutUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${encodeURIComponent('https://dfsui.com')}`;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Keywords', href: '/dashboard/keywords', icon: Search },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 flex flex-col shrink-0 border-r border-border z-50">
      <div className="p-6">
        <h1 className="text-lg tracking-tighter flex items-center gap-2">
          DFSUI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (isActive && item.name === 'Keywords') {
                  window.dispatchEvent(new Event('reset-keywords'));
                }
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'hover:bg-muted'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 border border-border rounded-xl hover:border-primary/50 transition-all"
          >
            <span className="text-xs font-black truncate uppercase tracking-widest">{activeTeam?.name}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2">
              {allTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => switchTeam(team.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold hover:bg-muted text-left"
                >
                  {team.name}
                  {team.id === activeTeamId && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <a 
          href={logoutUrl}
          className="mt-4 flex items-center gap-3 px-4 py-3 text-xs font-black hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
        >
          <LogOut size={16} /> Sign Out
        </a>
      </div>
    </aside>
  );
}