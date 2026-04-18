'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Loader2, ArrowUpRight, CheckSquare, Square, RefreshCcw, ArrowDown, ArrowUp, Zap, Check, Search } from 'lucide-react';
import { analyzeCompetition, KeywordItem, getSerpPrice } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

export default function KeywordTable({ results, locationCode }: { results: KeywordItem[], locationCode: string }) {
  const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
  const [expandedKws, setExpandedKws] = useState<string[]>([]);
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);
  const [serpPrice, setSerpPrice] = useState(0.05);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Load persistence and price
  useEffect(() => {
    getSerpPrice().then(setSerpPrice);
    const saved = localStorage.getItem(`dfs_audit_cache_${locationCode}`);
    if (saved) {
      try {
        setAnalysisData(JSON.parse(saved));
      } catch (e) {}
    }
  }, [locationCode]);

  // Save persistence
  useEffect(() => {
    if (Object.keys(analysisData).length > 0) {
      localStorage.setItem(`dfs_audit_cache_${locationCode}`, JSON.stringify(analysisData));
    }
  }, [analysisData, locationCode]);

  const bulkAudit = async () => {
    if (isBulkLoading) return;
    const toAudit = results.filter(r => overwriteExisting || !analysisData[r.keyword]);
    if (toAudit.length === 0) return;
    
    if (!confirm(`This will audit ${toAudit.length} keywords. Estimated cost: $${(toAudit.length * serpPrice).toFixed(2)}. Continue?`)) return;

    setIsBulkLoading(true);
    // Process in smaller batches of 5 to avoid blocking
    for (let i = 0; i < toAudit.length; i++) {
        const item = toAudit[i];
        setLoadingKw(item.keyword);
        try {
            const res = await analyzeCompetition(item.keyword, locationCode, overwriteExisting);
            if (res.analysis) {
                setAnalysisData(p => ({ ...p, [item.keyword]: res.analysis }));
            }
        } catch (e) {
            console.error(`Bulk audit failed for ${item.keyword}`);
        }
    }
    setLoadingKw(null);
    setIsBulkLoading(false);
  };

  const [sortField, setSortField] = useState<'keyword' | 'volume' | 'cpc'>('volume');
  const [sortDesc, setSortDesc] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const sortedResults = useMemo(() => {
    let base = [...results];
    if (filterText) {
        base = base.filter(r => r.keyword.toLowerCase().includes(filterText.toLowerCase()));
    }
    return base.sort((a, b) => {
      if (sortField === 'keyword') {
        const aVal = a.keyword || '';
        const bVal = b.keyword || '';
        return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      } else if (sortField === 'volume') {
        const aVal = a.keyword_info?.search_volume || 0;
        const bVal = b.keyword_info?.search_volume || 0;
        return sortDesc ? bVal - aVal : aVal - bVal;
      } else {
        const aVal = a.keyword_info?.cpc || 0;
        const bVal = b.keyword_info?.cpc || 0;
        return sortDesc ? bVal - aVal : aVal - bVal;
      }
    });
  }, [results, sortField, sortDesc, filterText]);

  const handleSort = (field: 'keyword' | 'volume' | 'cpc') => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(field === 'keyword' ? false : true);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: 'keyword' | 'volume' | 'cpc') => {
    if (sortField !== field) return null;
    return sortDesc ? <ArrowDown size={12} className="inline mb-0.5 ml-1" /> : <ArrowUp size={12} className="inline mb-0.5 ml-1" />;
  };

  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const currentResults = sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (kw: string) => {
    setSelectedKws(prev => prev.includes(kw) ? prev.filter(i => i !== kw) : [...prev, kw]);
  };

  const toggleExpand = (kw: string) => {
    setExpandedKws(prev => prev.includes(kw) ? prev.filter(i => i !== kw) : [...prev, kw]);
  };

  const handleAudit = async (keyword: string, bypassCache = false) => {
    if (analysisData[keyword] && !bypassCache) {
      toggleExpand(keyword);
      return;
    }

    setLoadingKw(keyword);
    try {
      const res = await analyzeCompetition(keyword, locationCode, bypassCache);
      if (res.analysis) {
        setAnalysisData(p => ({ ...p, [keyword]: res.analysis }));
        if (!expandedKws.includes(keyword)) {
          setExpandedKws(p => [...p, keyword]);
        }
      }
    } catch (_e) {
      console.error("Audit failed");
    } finally {
      setLoadingKw(null);
    }
  };

  const remainingToAudit = results.filter(r => overwriteExisting || !analysisData[r.keyword]).length;
  const bulkCost = remainingToAudit * serpPrice;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <span className="text-xs font-black uppercase text-slate-500 tracking-widest px-1 whitespace-nowrap">
            {filterText ? `${sortedResults.length.toLocaleString()} of ${results.length.toLocaleString()}` : results.length.toLocaleString()} Keywords
            </span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            
            <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Filter results..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                />
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            <button 
                onClick={() => setOverwriteExisting(!overwriteExisting)}
                className="flex items-center gap-2 group"
            >
                <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${overwriteExisting ? 'bg-slate-950 border-slate-950 dark:bg-white dark:border-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                    {overwriteExisting && <Check size={10} className="text-white dark:text-black stroke-[4]" />}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-950 dark:group-hover:text-white tracking-widest transition-colors">Refresh All</span>
            </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="text-right hidden sm:block">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Bulk Est. Cost</div>
                <div className="text-sm font-black text-slate-950 dark:text-white leading-none">${bulkCost.toFixed(2)}</div>
            </div>
            <button 
                onClick={bulkAudit}
                disabled={isBulkLoading || remainingToAudit === 0}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${isBulkLoading ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-slate-950/10'}`}
            >
                {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                {isBulkLoading ? 'Auditing...' : `Audit ${remainingToAudit} Keywords`}
            </button>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900 dark:border-white">
            <th className="w-12 px-4 py-5 text-left no-print">
              <button 
                onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map(r => r.keyword))}
                aria-label="Select all"
              >
                {selectedKws.length === results.length ? <CheckSquare size={20} className="text-slate-950 dark:text-white" /> : <Square size={20} className="text-slate-300" />}
              </button>
            </th>
            <th 
              className="px-2 py-5 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('keyword')}
            >
              Keyword {getSortIcon('keyword')}
            </th>
            <th 
              className="px-4 py-5 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('volume')}
            >
              Volume {getSortIcon('volume')}
            </th>
            <th 
              className="px-4 py-5 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('cpc')}
            >
              CPC {getSortIcon('cpc')}
            </th>
            <th className="w-32 px-4 py-5 text-right no-print">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
          {currentResults.map((item: any) => {
            const isSelected = selectedKws.includes(item.keyword);
            const analysis = analysisData[item.keyword];
            const isExpanded = expandedKws.includes(item.keyword);
            
            // Calculate overall score from analysis results
            const overallScore = analysis 
                ? analysis.reduce((acc: number, curr: any) => acc + curr.score, 0) / analysis.length 
                : null;

            return (
              <React.Fragment key={item.keyword}>
                <tr className={`group transition-all ${isSelected ? 'bg-slate-50 dark:bg-slate-900' : ''}`}>
                  <td className="px-4 py-4 no-print">
                    <button onClick={() => toggleSelect(item.keyword)} className={isSelected ? 'text-slate-950 dark:text-white' : 'text-slate-300 group-hover:text-slate-500'}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-950 dark:text-slate-100 text-base tracking-tight">{item.keyword}</span>
                      <a href={`https://google.com/search?q=${item.keyword}`} target="_blank">
                        <ArrowUpRight size={16} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all" />
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
                    <div className="flex items-center justify-end gap-3">
                      {overallScore !== null && (
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Score</span>
                            <span className={`text-xs font-black font-mono leading-none ${overallScore >= 50 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                {overallScore.toFixed(0)}%
                            </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {analysis && (
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
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 transition-all ${isExpanded ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-black dark:border-white' : 'border-slate-300 text-slate-500 hover:border-slate-950 hover:text-slate-950'}`}
                        >
                            {loadingKw === item.keyword && !isExpanded ? <Loader2 size={14} className="animate-spin" /> : isExpanded ? 'Hide' : analysis ? 'Show' : 'Audit'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                {isExpanded && analysis && (
                  <tr>
                    <td colSpan={5} className="px-0 py-8">
                      <CompetitionDeepDive data={analysis} keyword={item.keyword} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-6 py-4 mt-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 dark:hover:border-slate-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Prev
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 dark:hover:border-slate-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}