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

  // This is the specific Cloudflare Access logout URL
  // It clears the 'CF_Authorization' cookie and redirects back to your domain
  const logoutUrl = `https://condurachi.cloudflareaccess.com/cdn-cgi/access/logout`;

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-200">
            DFS
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DFS UI</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <a
          href={logoutUrl}
          className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </a>
      </div>
    </div>
  );
}