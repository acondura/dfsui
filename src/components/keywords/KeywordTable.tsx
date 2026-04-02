'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Loader2, ArrowUpRight, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { analyzeCompetition, KeywordItem } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

export default function KeywordTable({ results, locationCode }: { results: KeywordItem[], locationCode: string }) {
  const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0));
  }, [results]);

  const toggleSelect = (kw: string) => {
    setSelectedKws(prev => prev.includes(kw) ? prev.filter(i => i !== kw) : [...prev, kw]);
  };

  const handleAudit = async (keyword: string, bypassCache = false) => {
    // If it's just a toggle off
    if (analysisData[keyword] && !bypassCache) {
      const newData = { ...analysisData };
      delete newData[keyword];
      setAnalysisData(newData);
      return;
    }

    setLoadingKw(keyword);
    try {
      const res = await analyzeCompetition(keyword, locationCode, bypassCache);
      if (res.analysis) {
        setAnalysisData(p => ({ ...p, [keyword]: res.analysis }));
      }
    } catch (_e) {
      console.error("Audit failed");
    } finally {
      setLoadingKw(null);
    }
  };

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900 dark:border-white">
            <th className="w-12 px-4 py-5 text-left no-print">
              <button 
                onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map(r => r.keyword))}
                aria-label="Select all"
              >
                {selectedKws.length === results.length ? <CheckSquare size={20} className="text-slate-950 dark:text-white" /> : <Square size={20} className="text-slate-200" />}
              </button>
            </th>
            <th className="px-2 py-5 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Keyword</th>
            <th className="px-4 py-5 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Volume</th>
            <th className="px-4 py-5 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">CPC</th>
            {/* Action Header with Refresh Text */}
            <th className="w-24 px-4 py-5 text-right no-print">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
          {sortedResults.map((item: any) => {
            const isSelected = selectedKws.includes(item.keyword);
            const isExpanded = !!analysisData[item.keyword];
            return (
              <React.Fragment key={item.keyword}>
                <tr className={`group transition-all ${isSelected ? 'bg-slate-50 dark:bg-slate-900' : ''}`}>
                  <td className="px-4 py-4 no-print">
                    <button onClick={() => toggleSelect(item.keyword)} className={isSelected ? 'text-slate-950 dark:text-white' : 'text-slate-200 group-hover:text-slate-400'}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-950 dark:text-slate-100 text-base tracking-tight uppercase">{item.keyword}</span>
                      <a href={`https://google.com/search?q=${item.keyword}`} target="_blank">
                        <ArrowUpRight size={16} className="text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-slate-950 dark:text-slate-200 text-sm italic">
                    {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-emerald-700 dark:text-emerald-500 text-sm">
                    ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                  </td>
                  <td className="px-4 py-4 text-right no-print">
                    <div className="flex items-center justify-end gap-2">
                      {isExpanded && (
                        <button 
                          onClick={() => handleAudit(item.keyword, true)}
                          className="p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                          title="Refresh from API"
                        >
                          <RefreshCcw size={14} className={loadingKw === item.keyword ? 'animate-spin' : ''} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleAudit(item.keyword)} 
                        disabled={loadingKw === item.keyword} 
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 transition-all ${isExpanded ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-black dark:border-white' : 'border-slate-100 text-slate-300 hover:border-slate-950 hover:text-slate-950'}`}
                      >
                        {loadingKw === item.keyword && !isExpanded ? <Loader2 size={14} className="animate-spin" /> : isExpanded ? 'Hide' : 'Audit'}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="px-0 py-8 bg-white dark:bg-black">
                      <CompetitionDeepDive data={analysisData[item.keyword]} keyword={item.keyword} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}