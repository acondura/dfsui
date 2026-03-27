// src/components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // This ensures the component only renders its interactive state on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // To avoid the linter warning, we check 'mounted' before rendering the UI
  // The placeholder matches the size of the button to prevent layout shift
  if (!mounted) {
    return <div className="p-2 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800" />;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-blue-500 transition-all focus:outline-none"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}