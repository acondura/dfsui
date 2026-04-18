'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { getUiLanguages } from '@/app/dashboard/keywords/actions';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUiLanguages().then(setLanguages);
  }, []);

  const filtered = languages.filter(l => 
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  const activeLabel = languages.find(l => l.value === lang)?.label || lang.toUpperCase();

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className="w-full flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-primary/50 transition-all group"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-zinc-400 group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            {activeLabel}
          </span>
        </div>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-bottom-2">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <Search size={12} className="text-zinc-400" />
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full bg-transparent border-none text-[10px] font-bold outline-none uppercase tracking-widest"
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.map((l) => (
              <button
                key={l.value}
                onClick={() => {
                  setLang(l.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className={lang === l.value ? 'text-primary' : 'text-zinc-600 dark:text-zinc-400'}>
                  {l.label}
                </span>
                {lang === l.value && <Check size={12} className="text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
