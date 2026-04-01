'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Loader2, ArrowUpRight, CheckSquare, 
  Square, Play, Download, FileText, Trash2 
} from 'lucide-react';
import { analyzeCompetition } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

interface Competitor {
  domain: string;
  url: string;
  score: number;
  metrics: { url: boolean; title: boolean; description: boolean; h1: boolean; p1: boolean; };
}

interface KeywordItem {
  keyword: string;
  keyword_info?: { search_volume?: number; cpc?: number; };
}

// Clasificator de intenție 10X (Zero Latență)
const getKeywordIntent = (kw: string) => {
  const query = kw.toLowerCase();
  const informational = ['cum', 'ce', 'de ce', 'unde', 'ghid', 'tutorial', 'idei', 'exemple', 'invata', 'how', 'what', 'why'];
  const transactional = ['pret', 'cumpara', 'servicii', 'magazin', 'ieftin', 'oferta', 'curs', 'abonament', 'buy', 'price', 'hire'];
  const navigational = ['login', 'contact', 'adresa', 'pareri', 'recenzie', 'review', 'facebook', 'instagram'];

  if (informational.some(word => query.includes(word))) return { label: 'Informational', color: 'bg-blue-500/10 text-blue-500' };
  if (transactional.some(word => query.includes(word))) return { label: 'Transactional', color: 'bg-primary/20 text-primary' };
  if (navigational.some(word => query.includes(word))) return { label: 'Navigational', color: 'bg-muted-foreground/10 text-muted-foreground/60' };
  
  return { label: 'Commercial', color: 'bg-amber-500/10 text-amber-600' };
};

export default function KeywordTable({ results, locationCode }: { results: KeywordItem[], locationCode: string }) {
  const [analysisData, setAnalysisData] = useState<{ [key: string]: Competitor[] }>({});
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => 
      (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0)
    );
  }, [results]);

  const toggleSelect = (kw: string) => {
    setSelectedKws(prev => prev.includes(kw) ? prev.filter(i => i !== kw) : [...prev, kw]);
  };

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
      setAnalysisData(prev => ({ ...prev, [keyword]: res.analysis as Competitor[] }));
    } catch (_e) {
      console.error("Audit failed");
    } finally {
      setLoadingKw(null);
    }
  };

  const runBulkAudit = async () => {
    setIsBulkLoading(true);
    for (const kw of selectedKws) {
      if (!analysisData[kw]) {
        await handleDeepDive(kw);
      }
    }
    setIsBulkLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Keyword", "Intent", "Search Volume", "CPC ($)", "Audit Score (%)"];
    const rows = selectedKws.map(kw => {
      const item = results.find(r => r.keyword === kw);
      const audit = analysisData[kw];
      const intent = getKeywordIntent(kw);
      const avgScore = audit 
        ? (audit.reduce((acc, curr) => acc + curr.score, 0) / audit.length).toFixed(0) 
        : "N/A";
      
      return [
        kw,
        intent.label,
        item?.keyword_info?.search_volume || 0,
        item?.keyword_info?.cpc?.toFixed(2) || 0,
        avgScore
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dfsui-export-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="relative">
      {/* 10X Bulk Action Bar */}
      {selectedKws.length > 0 && (
        <div className="sticky top-4 z-30 mx-auto mb-8 max-w-fit flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 border border-white/10 no-print">
          <div className="px-2 border-r border-background/10 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
            {selectedKws.length} Selectate
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={runBulkAudit} className="p-2 hover:text-primary transition-colors">
              {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            </button>
            <button onClick={exportToCSV} className="p-2 hover:text-primary transition-colors"><Download size={14} /></button>
            <button onClick={() => window.print()} className="p-2 hover:text-primary transition-colors"><FileText size={14} /></button>
          </div>

          <button onClick={() => setSelectedKws([])} className="ml-2 p-2 opacity-30 hover:opacity-100 hover:text-red-400 border-l border-background/10">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/30">
              <th className="w-12 px-6 py-4 border-b border-border no-print">
                <button 
                  onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map(r => r.keyword))} 
                  className="text-muted-foreground/30 hover:text-primary"
                >
                  {selectedKws.length === results.length ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border">Keyword</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border text-center">Intent</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border text-right">Volume</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border text-right">CPC</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border text-right no-print">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedResults.map((item) => {
              const isSelected = selectedKws.includes(item.keyword);
              const isExpanded = !!analysisData[item.keyword];
              const intent = getKeywordIntent(item.keyword);

              return (
                <React.Fragment key={item.keyword}>
                  <tr className={`group transition-all ${isSelected ? 'bg-primary/5' : isExpanded ? 'bg-muted/10' : 'hover:bg-muted/20'}`}>
                    <td className="px-6 py-4 border-b border-border/50 no-print">
                      <button onClick={() => toggleSelect(item.keyword)} className={`${isSelected ? 'text-primary' : 'text-muted-foreground/20 group-hover:text-muted-foreground/40'}`}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm tracking-tight">{item.keyword}</span>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`} target="_blank" rel="noreferrer" className="no-print opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-primary transition-all">
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b border-border/50 text-center">
                      <span className={`inline-block px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${intent.color}`}>
                        {intent.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-border/50 text-right font-mono font-bold text-foreground/70 text-xs">
                      {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                    </td>
                    <td className="px-6 py-4 border-b border-border/50 text-right font-mono font-bold text-primary text-xs">
                      ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="px-8 py-4 border-b border-border/50 text-right no-print">
                      <button 
                        onClick={() => handleDeepDive(item.keyword)} 
                        disabled={loadingKw === item.keyword} 
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground/40 hover:bg-foreground hover:text-background'}`}
                      >
                        {loadingKw === item.keyword ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={12} />}
                        {isExpanded ? 'Hide' : 'Audit'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="print:break-inside-avoid">
                      <td colSpan={6} className="p-0 border-b border-border bg-muted/5">
                        <div className="px-8 py-10 animate-in fade-in slide-in-from-top-2">
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
    </div>
  );
}