'use client';
import React from 'react';
import { Check, X } from 'lucide-react';

interface Competitor {
  domain: string;
  url: string;
  score: number;
  metrics: { url: boolean; title: boolean; description: boolean; h1: boolean; };
}

const MetricPoint = ({ label, isMet }: { label: string, isMet: boolean }) => (
  <div className="flex flex-col items-center justify-center w-14 shrink-0">
    <span className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-tighter">{label}</span>
    {isMet ? (
      <Check size={14} className="text-emerald-500 stroke-[4]" />
    ) : (
      <X size={14} className="text-slate-200 dark:text-slate-800" />
    )}
  </div>
);

export default function CompetitionDeepDive({ data, keyword }: { data: Competitor[], keyword: string }) {
  if (!data || data.length === 0) return null;

  const avgScore = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;

  return (
    <div className="w-full border-t border-slate-900 dark:border-white bg-white dark:bg-black">
      <div className="flex justify-between items-center py-4 px-2 border-b border-slate-100 dark:border-slate-900">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          SERP Audit: {keyword}
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Average Optimization</span>
          <span className="text-2xl font-black font-mono text-slate-950 dark:text-white leading-none">{avgScore.toFixed(0)}%</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-900">
        {data.map((item, i) => (
          <div key={item.url} className="flex items-center py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            {/* Position */}
            <div className="w-10 shrink-0 text-[11px] font-black text-slate-300 font-mono italic">
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Domain & URL */}
            <div className="flex-1 min-w-0 mr-8">
              <div className="text-sm font-black text-slate-950 dark:text-slate-50 truncate uppercase tracking-tight leading-none mb-1">
                {item.domain}
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate lowercase opacity-60 leading-none">
                {item.url}
              </div>
            </div>

            {/* 4 Metrics */}
            <div className="flex items-center gap-2 shrink-0">
              <MetricPoint label="URL" isMet={item.metrics.url} />
              <MetricPoint label="TITLE" isMet={item.metrics.title} />
              <MetricPoint label="META" isMet={item.metrics.description} />
              <MetricPoint label="H1" isMet={item.metrics.h1} />
            </div>

            {/* Final Percentage */}
            <div className="w-20 shrink-0 text-right">
              <span className={`text-base font-black font-mono tracking-tighter ${item.score >= 50 ? 'text-emerald-500' : 'text-slate-950 dark:text-white'}`}>
                {item.score.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}