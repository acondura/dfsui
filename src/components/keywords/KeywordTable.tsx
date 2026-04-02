'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Loader2, ArrowUpRight, CheckSquare, 
  Square, Play, Download, FileText, Trash2 
} from 'lucide-react';
import { analyzeCompetition } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

// Clasificator de intenție 10X (Zero Latență)
const getKeywordIntent = (kw: string) => {
  const query = kw.toLowerCase();
  const informational = ['cum', 'ce', 'de ce', 'unde', 'ghid', 'tutorial', 'idei', 'exemple', 'invata', 'how', 'what', 'why'];
  const transactional = ['pret', 'cumpara', 'servicii', 'magazin', 'ieftin', 'oferta', 'curs', 'abonament', 'buy', 'price', 'hire'];
  const navigational = ['login', 'contact', 'adresa', 'pareri', 'recenzie', 'review', 'facebook', 'instagram'];

  if (informational.some(word => query.includes(word))) return { label: 'Info', color: 'bg-blue-600 text-white' };
  if (transactional.some(word => query.includes(word))) return { label: 'Sale', color: 'bg-emerald-600 text-white' };
  if (navigational.some(word => query.includes(word))) return { label: 'Nav', color: 'bg-slate-600 text-white' };
  return { label: 'Comm', color: 'bg-amber-600 text-white' };
};

export default function KeywordTable({ results, locationCode }: any) {
  const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0));
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
      setAnalysisData(prev => ({ ...prev, [keyword]: res.analysis }));
    } catch (_e) { console.error("Audit failed"); } 
    finally { setLoadingKw(null); }
  };

  const runBulkAudit = async () => {
    setIsBulkLoading(true);
    for (const kw of selectedKws) { if (!analysisData[kw]) await handleDeepDive(kw); }
    setIsBulkLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Keyword", "Intent", "Volume", "CPC", "Audit Score"];
    const rows = selectedKws.map(kw => {
      const item = results.find((r: any) => r.keyword === kw);
      const audit = analysisData[kw];
      const intent = getKeywordIntent(kw);
      const avgScore = audit ? (audit.reduce((acc: number, curr: any) => acc + curr.score, 0) / audit.length).toFixed(0) : "N/A";
      return [kw, intent.label, item?.keyword_info?.search_volume || 0, item?.keyword_info?.cpc || 0, avgScore].join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dfsui-export-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="relative">
      {selectedKws.length > 0 && (
        <div className="sticky top-4 z-30 mx-auto mb-8 max-w-fit flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-2xl no-print">
          <div className="px-3 border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
            {selectedKws.length} Selected
          </div>
          <div className="flex items-center gap-2">
            <button onClick={runBulkAudit} className="p-2 hover:text-primary transition-colors">
              {isBulkLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button onClick={exportToCSV} className="p-2 hover:text-primary transition-colors"><Download size={18} /></button>
            <button onClick={() => window.print()} className="p-2 hover:text-primary transition-colors"><FileText size={18} /></button>
          </div>
          <button onClick={() => setSelectedKws([])} className="ml-2 p-2 opacity-50 hover:opacity-100 hover:text-red-400 border-l border-white/10"><Trash2 size={18} /></button>
        </div>
      )}

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-12 px-6 py-5 border-b-2 border-slate-200 no-print">
                <button onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map((r:any) => r.keyword))} className="text-slate-400 hover:text-slate-900">
                  {selectedKws.length === results.length ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
              </th>
              <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 border-b-2 border-slate-200">Keyword</th>
              <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 border-b-2 border-slate-200 text-center">Intent</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-200 text-right">Volume</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 border-b-2 border-slate-200 text-right">CPC</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 border-b-2 border-slate-200 text-right no-print">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedResults.map((item: any) => {
              const isSelected = selectedKws.includes(item.keyword);
              const isExpanded = !!analysisData[item.keyword];
              const intent = getKeywordIntent(item.keyword);

              return (
                <React.Fragment key={item.keyword}>
                  <tr className={`group transition-all ${isSelected ? 'bg-slate-100' : isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-6 py-6 no-print">
                      <button onClick={() => toggleSelect(item.keyword)} className={`${isSelected ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-500'}`}>
                        {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                      </button>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-950 text-base tracking-tight">{item.keyword}</span>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`} target="_blank" rel="noreferrer" className="no-print text-slate-300 hover:text-slate-900 transition-all">
                          <ArrowUpRight size={18} />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${intent.color} shadow-sm`}>
                        {intent.label}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right font-mono font-black text-slate-900 text-sm italic">
                      {item.keyword_info?.search_volume?.toLocaleString() ?? '0'}
                    </td>
                    <td className="px-6 py-6 text-right font-mono font-black text-emerald-700 text-sm">
                      ${item.keyword_info?.cpc?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="px-8 py-6 text-right no-print">
                      <button 
                        onClick={() => handleDeepDive(item.keyword)} 
                        disabled={loadingKw === item.keyword} 
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                      >
                        {loadingKw === item.keyword ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                        {isExpanded ? 'Hide' : 'Audit'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="print:break-inside-avoid bg-slate-50/30">
                      <td colSpan={6} className="p-0 border-b-2 border-slate-200">
                        <div className="px-10 py-12 animate-in fade-in slide-in-from-top-4 duration-500">
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