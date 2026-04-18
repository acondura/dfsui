'use client';
import { Info } from 'lucide-react';

export default function InfoTooltip({ content, size = 12 }: { content: string, size?: number }) {
  return (
    <div className="group relative inline-block ml-1">
      <Info size={size} className="text-slate-400 cursor-help hover:text-primary transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold leading-relaxed rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-white" />
      </div>
    </div>
  );
}
