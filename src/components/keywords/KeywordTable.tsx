'use client';
import React, { useState } from 'react';
import { BarChart3, Loader2, ArrowUpRight } from 'lucide-react';
import { analyzeCompetition } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

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

interface KeywordResult {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
}

export default function KeywordTable({ 
  results, 
  locationCode 
}: { 
  results: KeywordResult[], 
  locationCode: string 
}) {
  const [analysisData, setAnalysisData] = useState<{ [key: string]: Competitor[] }>({});
  const [loadingKw, setLoadingKw] = useState<string | null>(null);

  const handleDeepDive = async (keyword: string) => {
    if (analysisData[keyword]) {
      const newData = { ...analysisData };
      delete newData[keyword];
      setAnalysisData(newData);
      return;
    }

    setLoadingKw(keyword);
    try {
      const res = await analyzeCompetition(keyword, locationCode);
      setAnalysisData(prev => ({ ...prev, [keyword]: res.analysis }));
    } catch (e) {
      console.error("Deep dive failed", e);
    } finally {
      setLoadingKw(null);
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-muted/30">
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-border">Keyword</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-border text-right">Volume</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-border text-right">CPC</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-border text-right">Audit</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => {
            const isExpanded = !!analysisData[item.keyword];
            const isLoading = loadingKw === item.keyword;

            return (
              <React.Fragment key={item.keyword}>
                <tr className={`group transition-all duration-300 ${isExpanded ? 'bg-primary/5' : 'hover:bg-muted/20'}`}>
                  <td className="px-8 py-5 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm tracking-tight">{item.keyword}</span>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-foreground/20 hover:text-primary transition-all"
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-b border-border/50 text-right">
                    <span className="font-mono font-bold text-foreground/70 text-xs">
                      {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                    </span>
                  </td>
                  <td className="px-6 py-5 border-b border-border/50 text-right">
                    <span className="font-mono font-bold text-primary text-xs">
                      ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                    </span>
                  </td>
                  <td className="px-8 py-5 border-b border-border/50 text-right">
                    <button
                      onClick={() => handleDeepDive(item.keyword)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isExpanded 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-muted text-foreground/40 hover:bg-foreground hover:text-background'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <BarChart3 size={12} />
                      )}
                      {isExpanded ? 'Close' : 'Deep Dive'}
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan={4} className="p-0 border-b border-border bg-muted/10">
                      <div className="px-8 py-12 animate-in fade-in slide-in-from-top-2 duration-500">
                        <CompetitionDeepDive data={analysisData[item.keyword]} keyword={item.keyword} />
                      </div>
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