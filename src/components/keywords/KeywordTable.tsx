'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, ArrowUpRight, CheckSquare, Square, RefreshCcw, ArrowDown, ArrowUp, Zap, Check, Search, X, Globe } from 'lucide-react';
import { analyzeCompetition, KeywordItem, getSerpPrice, togglePseoPublish } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

const PeakSeasonBadge = ({ data, onClick }: { data?: { year: number, month: number, search_volume: number }[], onClick?: () => void }) => {
  if (!data || data.length === 0) return null;
  
  const points = data.map(d => d.search_volume);
  const max = Math.max(...points);
  const peakIdx = points.indexOf(max);
  const peakMonth = data[peakIdx];
  const m = peakMonth.month;
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  let colorClass = "text-primary hover:text-emerald-400";
  
  if ([6, 7, 8].includes(m)) {
    colorClass = "text-amber-500 hover:text-amber-400";
  } else if ([11, 12].includes(m)) {
    colorClass = "text-rose-500 hover:text-rose-400";
  } else if (m === 1) {
    colorClass = "text-indigo-500 hover:text-indigo-400";
  }
  
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center group transition-all duration-200 outline-none ${colorClass}`}
    >
      <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap group-hover:scale-110 transition-transform">
        Peak: {monthNames[m - 1]}
      </span>
    </button>
  );
};

const IntentBadge = ({ intent }: { intent?: string }) => {
  const { t } = useI18n();
  if (!intent) return null;
  const colors: Record<string, string> = {
    'informational': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    'transactional': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    'commercial': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    'navigational': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border ${colors[intent.toLowerCase()] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
      {t(intent.toLowerCase())}
    </span>
  );
};

const Sparkline = ({ data, onClick }: { data?: { search_volume: number }[], onClick?: () => void }) => {
  if (!data || data.length < 2) return <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded opacity-20" />;
  
  const chronologicalData = [...data].reverse();
  const points = chronologicalData.slice(-12).map(d => d.search_volume);
  const max = Math.max(...points) || 1;
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const width = 64;
  const height = 16;
  const padding = 2;
  
  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((p - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <button onClick={onClick} className="hover:scale-110 transition-transform cursor-pointer outline-none">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
          className="text-primary opacity-50"
        />
      </svg>
    </button>
  );
};

const TrendModal = ({ keyword, data, onClose }: { keyword: string, data: { year: number, month: number, search_volume: number }[], onClose: () => void }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chronologicalData = useMemo(() => [...data].reverse(), [data]);
  const points = chronologicalData.map(d => d.search_volume);
  const max = Math.max(...points) || 1;
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const width = 600;
  const height = 200;
  const padding = 40;
  
  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((p - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col items-start gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Search Volume Trend</h2>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{keyword}</p>
              {(() => {
                const peakIdx = points.indexOf(max);
                const peakMonth = chronologicalData[peakIdx];
                const m = peakMonth.month;
                
                let seasonLabel = "Peak Demand";
                let seasonClass = "bg-primary/5 border-primary/20 text-primary";
                
                if ([6, 7, 8].includes(m)) {
                  seasonLabel = "Summer Spike";
                  seasonClass = "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400";
                } else if ([11, 12].includes(m)) {
                  seasonLabel = "Holiday/Shopping Peak";
                  seasonClass = "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400";
                } else if (m === 1) {
                  seasonLabel = "New Year Surge";
                  seasonClass = "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400";
                }

                const volatility = Math.round((max / (min || 1) - 1) * 100);
                
                return (
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${seasonClass}`}>
                      <Zap size={10} className="fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {seasonLabel}: {monthNames[peakMonth.month - 1]} {peakMonth.year}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Volatility: {volatility > 500 ? 'High' : volatility > 100 ? 'Moderate' : 'Stable'} ({volatility}%)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="relative bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-900 overflow-hidden">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(tick => {
                const y = height - (tick * (height - padding * 2)) - padding;
                return (
                  <g key={tick}>
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                    <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
                      {Math.round(min + tick * range).toLocaleString()}
                    </text>
                  </g>
                );
              })}
              
              {/* Hover Line */}
              {hoveredIdx !== null && (
                <line 
                  x1={(hoveredIdx / (points.length - 1)) * (width - padding * 2) + padding} 
                  y1={padding} 
                  x2={(hoveredIdx / (points.length - 1)) * (width - padding * 2) + padding} 
                  y2={height - padding} 
                  stroke="currentColor" 
                  className="text-primary opacity-20" 
                  strokeWidth="2" 
                />
              )}

              {/* Path */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPoints}
                className="text-primary"
              />
              
              {/* Vertical Hit Zones for better hover experience */}
              {points.map((p, i) => {
                const step = (width - padding * 2) / (points.length - 1);
                const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
                return (
                  <rect
                    key={`hit-${i}`}
                    x={x - step / 2}
                    y={0}
                    width={step}
                    height={height}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                  />
                );
              })}

              {/* Points */}
              {points.map((p, i) => {
                const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
                const y = height - ((p - min) / range) * (height - padding * 2) - padding;
                const isHovered = hoveredIdx === i;
                return (
                  <g key={i} className="pointer-events-none">
                    <circle 
                      cx={x} cy={y} 
                      r={isHovered ? "8" : "5"} 
                      className={`fill-white dark:fill-slate-900 stroke-primary transition-all duration-200 ${isHovered ? 'stroke-[4]' : 'stroke-[3]'}`} 
                    />
                    {isHovered && (
                      <g className="animate-in fade-in zoom-in-95 duration-200">
                        <rect x={x - 40} y={y - 35} width="80" height="25" rx="6" className="fill-slate-900 dark:fill-white" />
                        <text x={x} y={y - 18} textAnchor="middle" className="text-[10px] font-black fill-white dark:fill-slate-950">
                          {p.toLocaleString()}
                        </text>
                        <path d={`M ${x-4} ${y-10} L ${x} ${y-5} L ${x+4} ${y-10}`} className="fill-slate-900 dark:fill-white" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 gap-4">
            {chronologicalData.slice(-12).map((d, i) => {
                const isPeak = d.search_volume === max;
                const isHovered = hoveredIdx === i;
                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`text-center p-3 rounded-xl border transition-all duration-200 relative ${
                      isHovered ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-105 z-10' : 
                      isPeak ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 shadow-md' :
                      'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {isPeak && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                        <Zap size={10} className="fill-current" />
                      </div>
                    )}
                    <div className={`text-[10px] font-black uppercase leading-none mb-2 ${
                      isHovered ? 'text-white/80' : 
                      isPeak ? 'text-amber-600 dark:text-amber-400' :
                      'text-slate-400'
                    }`}>
                      {monthNames[d.month - 1]} {d.year}
                    </div>
                    <div className={`text-sm font-black font-mono leading-none ${
                      isHovered ? 'text-white' : 
                      isPeak ? 'text-amber-900 dark:text-amber-200' :
                      'text-slate-900 dark:text-white'
                    }`}>
                      {d.search_volume.toLocaleString()}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

import { useI18n } from '@/lib/i18n';

export default function KeywordTable({ 
  results, 
  locationCode, 
  isAdmin = false, 
  initialPublished = [] 
}: { 
  results: KeywordItem[], 
  locationCode: string, 
  isAdmin?: boolean,
  initialPublished?: string[]
}) {
  const { t } = useI18n();
  const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
  const [expandedKws, setExpandedKws] = useState<string[]>([]);
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);
  const [serpPrice, setSerpPrice] = useState(0.05);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showQuestionsOnly, setShowQuestionsOnly] = useState(false);
  const [trendModalData, setTrendModalData] = useState<{ keyword: string, data: any[] } | null>(null);
  const [published, setPublished] = useState<string[]>(initialPublished);

  const handleTogglePseo = async (keyword: string) => {
    try {
        const analysis = analysisData[keyword];
        const { published: isNowPublished } = await togglePseoPublish(keyword, analysis);
        if (isNowPublished) {
            setPublished(prev => [...prev, keyword]);
        } else {
            setPublished(prev => prev.filter(k => k !== keyword));
        }
    } catch (e) {
        console.error("pSEO toggle failed", e);
    }
  };

  useEffect(() => {
    getSerpPrice().then(setSerpPrice);
    const saved = localStorage.getItem(`dfs_audit_cache_${locationCode}`);
    if (saved) {
      try {
        setAnalysisData(JSON.parse(saved));
      } catch (e) {}
    }
  }, [locationCode]);

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
    if (showQuestionsOnly) {
        const questionWords = ['who', 'what', 'where', 'why', 'how', 'is', 'can', 'are', 'do', 'does', 'which'];
        base = base.filter(r => questionWords.some(word => r.keyword.toLowerCase().split(/\s+/).includes(word)));
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
  }, [results, sortField, sortDesc, filterText, showQuestionsOnly]);

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
            <span className="text-sm font-black uppercase text-slate-500 tracking-widest px-1 whitespace-nowrap">
            {filterText ? `${sortedResults.length.toLocaleString()} ${t('of')} ${results.length.toLocaleString()}` : results.length.toLocaleString()} {t('keywords')}
            </span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            
            <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text"
                    placeholder={t('filter_results')}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
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
                <span className="text-xs font-black uppercase text-slate-500 group-hover:text-slate-950 dark:group-hover:text-white tracking-widest transition-colors">{t('refresh_all')}</span>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            <button 
                onClick={() => setShowQuestionsOnly(!showQuestionsOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${showQuestionsOnly ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
                <span className="text-[10px] font-black uppercase tracking-widest">{t('questions')}</span>
            </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="text-right hidden sm:block">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{t('bulk_est_cost')}</div>
                <div className="text-base font-black text-slate-950 dark:text-white leading-none">${bulkCost.toFixed(2)}</div>
            </div>
            <button 
                onClick={bulkAudit}
                disabled={isBulkLoading || remainingToAudit === 0}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${isBulkLoading ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-slate-950/10'}`}
            >
                {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                {isBulkLoading ? t('querying_dataforseo') : t('audit_keywords').replace('{count}', remainingToAudit.toString())}
            </button>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900 dark:border-white">
            <th className="w-12 px-4 py-6 text-left no-print">
              <button 
                onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map(r => r.keyword))}
                aria-label="Select all"
              >
                {selectedKws.length === results.length ? <CheckSquare size={20} className="text-slate-950 dark:text-white" /> : <Square size={20} className="text-slate-300" />}
              </button>
            </th>
            <th 
              className="px-2 py-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('keyword')}
            >
              {t('keyword')} {getSortIcon('keyword')}
            </th>
            <th className="px-4 py-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em]">
              {t('intent')}
            </th>
            <th 
              className="px-4 py-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('volume')}
            >
              {t('volume')} {getSortIcon('volume')}
            </th>
            <th className="px-4 py-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] text-center">
              {t('trend')}
            </th>
            <th 
              className="px-4 py-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => handleSort('cpc')}
            >
              {t('cpc')} {getSortIcon('cpc')}
            </th>
            <th className="w-32 px-4 py-6 text-right no-print">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('audit')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
          {currentResults.map((item: any) => {
            const isSelected = selectedKws.includes(item.keyword);
            const analysis = analysisData[item.keyword];
            const isExpanded = expandedKws.includes(item.keyword);
            
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
                      <span className="font-black text-slate-950 dark:text-slate-100 text-lg tracking-tight">{item.keyword}</span>
                      <a href={`https://google.com/search?q=${item.keyword}`} target="_blank">
                        <ArrowUpRight size={16} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <IntentBadge intent={item.search_intent_info?.main_intent} />
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-slate-950 dark:text-slate-200 text-sm italic">
                    {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Sparkline 
                        data={item.keyword_info?.monthly_searches} 
                        onClick={() => setTrendModalData({ keyword: item.keyword, data: item.keyword_info?.monthly_searches || [] })}
                        />
                        <PeakSeasonBadge 
                          data={item.keyword_info?.monthly_searches} 
                          onClick={() => setTrendModalData({ keyword: item.keyword, data: item.keyword_info?.monthly_searches || [] })}
                        />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-primary text-base">
                    ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                  </td>
                  <td className="px-4 py-4 text-right no-print">
                    <div className="flex items-center justify-end gap-3">
                      {overallScore !== null && (
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Score</span>
                            <span className={`text-sm font-black font-mono leading-none ${overallScore >= 50 ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                {overallScore.toFixed(0)}%
                            </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                            <button 
                            onClick={() => handleTogglePseo(item.keyword)}
                            className={`p-2 transition-all ${published.includes(item.keyword) ? 'text-primary' : 'text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                            title={published.includes(item.keyword) ? "Unpublish from pSEO" : "Publish to pSEO"}
                            >
                            <Globe size={16} />
                            </button>
                        )}
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
                            className={`text-xs font-black uppercase tracking-widest px-4 py-2 border-2 transition-all ${isExpanded ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-black dark:border-white' : 'border-slate-300 text-slate-500 hover:border-slate-950 hover:text-slate-950'}`}
                        >
                            {loadingKw === item.keyword && !isExpanded ? <Loader2 size={14} className="animate-spin" /> : isExpanded ? t('hide') : analysis ? t('show') : t('audit')}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                {isExpanded && analysis && (
                  <tr>
                    <td colSpan={7} className="px-0 py-8">
                      <CompetitionDeepDive data={analysis} keyword={item.keyword} volume={item.keyword_info?.search_volume} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {trendModalData && (
        <TrendModal 
          keyword={trendModalData.keyword} 
          data={trendModalData.data} 
          onClose={() => setTrendModalData(null)} 
        />
      )}

      <div className="flex items-center justify-between px-6 py-4 mt-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 dark:hover:border-slate-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {t('prev')}
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 dark:hover:border-slate-500 rounded-lg text-sm font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
