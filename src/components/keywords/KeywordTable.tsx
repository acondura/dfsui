'use client';
import React, { useState } from 'react';
import { BarChart3, Loader2, ArrowUpRight } from 'lucide-react';
import { analyzeCompetition } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

// Define the shape of a single competitor's audit
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
  // FIXED: Replaced 'any' with the Competitor array type
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
      // Ensure we are setting the array of competitors
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
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Keyword</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Vol.</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">CPC</th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Audit</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => {
            const isExpanded = !!analysisData[item.keyword];
            const isLoading = loadingKw === item.keyword;

            return (
              <React.Fragment key={item.keyword}>
                <tr className={`group transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-8 py-6 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.keyword}</span>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-all"
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-b border-slate-50 text-right">
                    <span className="font-mono font-bold text-slate-600 text-xs">
                      {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-b border-slate-50 text-right">
                    <span className="font-mono font-bold text-blue-600 text-xs">
                      ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                    </span>
                  </td>
                  <td className="px-8 py-6 border-b border-slate-50 text-right">
                    <button
                      onClick={() => handleDeepDive(item.keyword)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isExpanded 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white'
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
                    <td colSpan={4} className="p-0 border-b border-slate-100 bg-slate-50/30">
                      <div className="px-8 py-10">
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