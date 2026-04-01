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
  <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 ${
    isMet 
    ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' 
    : 'bg-muted/30 border-border text-foreground/20'
  }`}>
    {isMet ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export default function CompetitionDeepDive({ data, keyword }: { data: Competitor[], keyword: string }) {
  if (!data) return <div className="text-muted-foreground/40 text-xs font-bold uppercase tracking-widest p-8 text-center border border-dashed border-border rounded-3xl">No audit data available.</div>;

  const avgScore = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Audit Card */}
      <div className="flex justify-between items-center bg-background p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Competitor Content Analysis</h3>
          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            Top 10 Rankings for <span className="text-primary font-black">{keyword}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg. Score</p>
            <p className="text-xl font-black text-foreground tracking-tighter">{avgScore.toFixed(0)}%</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${avgScore > 60 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40'}`}>
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, i) => (
          <div key={item.url} className="bg-background border border-border rounded-3xl p-6 hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 flex items-center justify-center bg-muted text-foreground/60 rounded-xl text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-colors">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate flex items-center gap-1.5">
                    <Globe size={10} className="text-muted-foreground/40" />
                    {item.domain}
                  </p>
                  <p className="text-[9px] font-medium text-muted-foreground/50 truncate max-w-[140px] uppercase tracking-tighter">
                    {item.url.replace('https://', '').replace('www.', '')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-foreground tracking-tighter">{item.score}%</span>
                <div className="w-12 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${item.score}%` }} 
                  />
                </div>
              </div>
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