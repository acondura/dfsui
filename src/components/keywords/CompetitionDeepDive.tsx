'use client';
import React from 'react';
import { Check, X, ExternalLink, Target, Zap, AlertCircle } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';

interface Competitor {
  domain: string;
  url: string;
  score: number;
  metrics: { url: boolean; title: boolean; description: boolean; h1: boolean; };
}

const MetricPoint = ({ label, isMet, tooltip }: { label: string, isMet: boolean, tooltip: string }) => (
  <div className="flex flex-col items-center justify-center w-16 shrink-0 group">
    <div className="flex items-center gap-1 mb-1">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{label}</span>
      <InfoTooltip content={tooltip} size={10} />
    </div>
    {isMet ? (
      <Check size={18} className="text-primary stroke-[4]" />
    ) : (
      <X size={18} className="text-slate-300 dark:text-slate-700" />
    )}
  </div>
);

export default function CompetitionDeepDive({ data, keyword, volume }: { data: Competitor[], keyword: string, volume?: number }) {
  if (!data || data.length === 0) return null;

  const avgScore = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;
  
  // Calculate Strategy Insights
  const totalCompetitors = data.length;
  const missingH1 = data.filter(c => !c.metrics.h1).length;
  const missingTitle = data.filter(c => !c.metrics.title).length;
  const missingURL = data.filter(c => !c.metrics.url).length;
  const missingMeta = data.filter(c => !c.metrics.description).length;

  const weaknesses = [
    { label: 'H1 Tag', count: missingH1 },
    { label: 'Meta Title', count: missingTitle },
    { label: 'URL Structure', count: missingURL },
    { label: 'Meta Description', count: missingMeta },
  ].sort((a, b) => b.count - a.count);

  const mainWeakness = weaknesses[0];
  const opportunityLevel = avgScore < 40 ? 'Very High' : avgScore < 60 ? 'High' : avgScore < 80 ? 'Moderate' : 'Low';
  const opportunityColor = opportunityLevel.includes('High') ? 'text-primary' : opportunityLevel === 'Moderate' ? 'text-blue-500' : 'text-slate-500';

  const trafficPotential = volume ? Math.round(volume * 0.3) : null;

  return (
    <div className="w-full border-t border-slate-900 dark:border-white">
      {/* Strategy Analysis Section */}
      <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                Roadmap to #1 Spot
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Zap size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {opportunityLevel} Opportunity Detected
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    The average competitor optimization is {avgScore.toFixed(0)}%. 
                    {avgScore < 60 
                      ? " Most winners are ranking due to domain authority rather than perfect SEO, making this a prime target for you."
                      : " Competitors are well-optimized. You'll need perfect execution and strong internal linking to break into the top 3."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Attack the "{mainWeakness.label}" Gap
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {mainWeakness.count} out of {totalCompetitors} competitors are failing to optimize their **{mainWeakness.label}**. 
                    By simply including "{keyword}" in your {mainWeakness.label}, you instantly gain a technical edge over {((mainWeakness.count/totalCompetitors)*100).toFixed(0)}% of the SERP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm min-w-[160px]">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 text-center">Winning Potential</span>
              <span className={`text-3xl font-black font-mono leading-none ${opportunityColor}`}>
                {100 - Math.round(avgScore)}%
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${opportunityColor.replace('text', 'bg')}`} 
                  style={{ width: `${100 - avgScore}%` }}
                />
              </div>
            </div>

            {trafficPotential && (
              <div className="flex-1 flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm min-w-[160px]">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 text-center">Traffic Potential</span>
                <span className="text-2xl font-black font-mono text-slate-950 dark:text-white leading-none">
                  ~{trafficPotential.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">clicks / month</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center py-4 px-2 border-b border-slate-100 dark:border-slate-900">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          SERP Audit: {keyword}
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Average Optimization</span>
          <span className="text-3xl font-black font-mono text-slate-950 dark:text-white leading-none">{avgScore.toFixed(0)}%</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-900">
        {data.map((item, i) => (
          <div key={item.url} className="flex items-center py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            {/* Position */}
            <div className="w-10 shrink-0 text-xs font-black text-slate-400 font-mono italic">
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Domain & URL */}
            <div className="flex-1 min-w-0 mr-8">
              <div className="text-base font-black text-slate-950 dark:text-slate-50 truncate uppercase tracking-tight leading-none mb-1">
                {item.domain}
              </div>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/link flex items-center gap-1.5 text-sm font-mono text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate lowercase leading-none"
              >
                <span className="truncate">{item.url}</span>
                <ExternalLink size={12} className="shrink-0 opacity-40 group-hover/link:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* 4 Metrics */}
            <div className="flex items-center gap-2 shrink-0">
              <MetricPoint 
                label="URL" 
                isMet={item.metrics.url} 
                tooltip="Checks if the target keyword is present in the page URL slug."
              />
              <MetricPoint 
                label="TITLE" 
                isMet={item.metrics.title} 
                tooltip="Checks if the target keyword is present in the browser tab title (Meta Title)."
              />
              <MetricPoint 
                label="META" 
                isMet={item.metrics.description} 
                tooltip="Checks if the target keyword is present in the meta description snippet."
              />
              <MetricPoint 
                label="H1" 
                isMet={item.metrics.h1} 
                tooltip="Checks if the target keyword is present in the primary H1 heading tag."
              />
            </div>

            {/* Final Percentage */}
            <div className="w-20 shrink-0 text-right">
              <span className={`text-xl font-black font-mono tracking-tighter ${item.score >= 50 ? 'text-primary' : 'text-slate-950 dark:text-white'}`}>
                {item.score.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}