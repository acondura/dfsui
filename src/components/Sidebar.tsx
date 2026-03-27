// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Globe, 
  Settings, 
  Database 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Keyword Research', href: '/dashboard/keywords', icon: Search },
  { name: 'SERP Checker', href: '/dashboard/serp', icon: Globe },
  { name: 'API Explorer', href: '/dashboard/explorer', icon: Database },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          {/* Using a placeholder for your new logo mark */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
            DFS
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DFS UI</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage</p>
          <p className="text-xs text-slate-400 mt-1">Cloudflare KV Enabled</p>
        </div>
      </div>
    </div>
  );
}