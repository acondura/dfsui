// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto text-slate-900 dark:text-slate-100">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}