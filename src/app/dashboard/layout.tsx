// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email') || 'User';

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation / Welcome Bar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div className="text-sm font-medium text-slate-600">
            Welcome, <span className="text-slate-900 font-bold">{email}</span>
          </div>
          <div className="flex items-center gap-4">
             {/* Future space for notifications or profile dropdown */}
             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {email.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}