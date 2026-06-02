'use client';
import { Info } from 'lucide-react';

export default function InfoTooltip({ 
  content, 
  size = 12, 
  children,
  className = "w-56"
}: { 
  content: string, 
  size?: number, 
  children?: React.ReactNode,
  className?: string
}) {
  return (
    <div className="group relative inline-block">
      {children || <Info size={size} className="text-slate-400 cursor-help hover:text-primary transition-colors ml-1" />}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block ${className} p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold leading-relaxed rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 break-all`}>
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-white" />
      </div>
    </div>
  );
}
