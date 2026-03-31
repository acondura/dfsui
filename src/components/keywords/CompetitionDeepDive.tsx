'use client';
import React from 'react';
import { Check, X, ShieldCheck, Globe } from 'lucide-react';

interface Competitor {
  domain: string;
  url: string;
  score: number;
  metrics: {
    url: boolean;
    title: boolean;
    description: boolean;
    h1: boolean;
    p1: boolean;
  };
}

const MetricBadge = ({ label, isMet }: { label: string, isMet: boolean }) => (
  <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
    isMet 
    ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
    : 'bg-white border-slate-100 text-slate-300'
  }`}>
    {isMet ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default function CompetitionDeepDive({ data, keyword }: { data: Competitor[], keyword: string }) {
  if (!data) return <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">No audit data available.</div>;

  const avgScore = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">On-Page Competition Audit</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Analyzing Top 10 for <span className="text-blue-600"><b>{keyword}</b></span></p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">Avg. Optimization</p>
            <p className="text-xl font-black text-slate-900">{avgScore.toFixed(0)}%</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${avgScore > 60 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, i) => (
          <div key={item.url} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-xl text-[10px] font-black">#{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-900 truncate flex items-center gap-1.5">
                    <Globe size={10} className="text-slate-400" />
                    {item.domain}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">{item.score}%</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <MetricBadge label="URL" isMet={item.metrics.url} />
              <MetricBadge label="Title" isMet={item.metrics.title} />
              <MetricBadge label="Meta" isMet={item.metrics.description} />
              <MetricBadge label="H1" isMet={item.metrics.h1} />
              <MetricBadge label="Text" isMet={item.metrics.p1} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}