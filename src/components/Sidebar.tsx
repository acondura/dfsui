'use client'
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Globe, Settings, LogOut, ChevronDown, Check, ShieldAlert, Menu, X } from 'lucide-react';
import { switchTeam } from '@/app/dashboard/settings/actions';
import { Team } from '@/lib/auth';

import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Sidebar({ allTeams = [], activeTeamId }: { allTeams?: Team[], activeTeamId?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];
  const teamDomain = process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || 'k9czuj5q2zbo29nb';
  const logoutUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${encodeURIComponent('https://dfsui.com')}`;

  const menuItems = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('keywords'), href: '/dashboard/keywords', icon: Search },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('disclaimer'), href: '/dashboard/disclaimer', icon: ShieldAlert },
  ];

  // Helper to translate team names
  const translateTeamName = (name: string) => {
    if (name === 'Personal Workspace') return t('personal');
    return name;
  };

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Burger Button */}
      {!isMobileOpen && (
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-3 left-4 z-40 p-2 bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-lg text-zinc-600 dark:text-zinc-400"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 flex flex-col shrink-0 border-r border-border z-50
        transition-transform duration-300 lg:translate-x-0 lg:static
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="text-xl tracking-tighter flex items-center gap-2 font-black group-hover:text-primary transition-colors">
              DFSUI
            </h1>
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-bold transition-all ${
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
          <LanguageSwitcher />

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              suppressHydrationWarning
              className="w-full flex items-center justify-between p-3 border border-border rounded-xl hover:border-primary/50 transition-all"
            >
              <span className="text-sm font-black truncate uppercase tracking-widest">{translateTeamName(activeTeam?.name || '')}</span>
              <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 bg-white dark:bg-zinc-900">
                {allTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => switchTeam(team.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold hover:bg-muted text-left"
                  >
                    {translateTeamName(team.name)}
                    {team.id === activeTeamId && <Check size={14} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a 
            href={logoutUrl}
            className="mt-4 flex items-center gap-3 px-4 py-3 text-sm font-black hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
          >
            <LogOut size={16} /> {t('sign_out')}
          </a>
        </div>
      </aside>
    </>
  );
}