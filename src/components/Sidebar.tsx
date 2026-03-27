// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Globe, Settings, Database, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Keyword Research', href: '/dashboard/keywords', icon: Search },
  { name: 'SERP Checker', href: '/dashboard/serp', icon: Globe },
  { name: 'API Explorer', href: '/dashboard/explorer', icon: Database },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Updated with your actual Team Domain
  const teamDomain = 'condurachi'; 
  const targetRedirect = encodeURIComponent('https://dfsui.com');
  const logoutUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${targetRedirect}`;

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white select-none">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-200">
            DFS
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">DFS UI</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-50 bg-slate-50/30">
        <a
          href={logoutUrl}
          className="flex items-center justify-center w-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Log Out
        </a>
      </div>
    </div>
  );
}