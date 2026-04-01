'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Loader2, ArrowUpRight, CheckSquare, 
  Square, Play, Download, FileText, Trash2, Tag
} from 'lucide-react';
import { analyzeCompetition } from '@/app/dashboard/keywords/actions';
import CompetitionDeepDive from '@/components/keywords/CompetitionDeepDive';

// ... (interfețele anterioare)

// Algoritm de clasificare 10X - Zero latență, Zero cost API
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

export default function KeywordTable({ results, locationCode }: { results: any[], locationCode: string }) {
  const [analysisData, setAnalysisData] = useState<{ [key: string]: any }>({});
  const [loadingKw, setLoadingKw] = useState<string | null>(null);
  const [selectedKws, setSelectedKws] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0));
  }, [results]);

  // ... (funcțiile de export CSV/PDF rămân la fel, dar includ acum Intent)

  return (
    <div className="relative">
      {/* Bulk Action Bar */}
      {selectedKws.length > 0 && (
        <div className="sticky top-4 z-30 mx-auto mb-8 max-w-fit flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 border border-white/10">
          <div className="px-2 border-r border-background/10 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
            {selectedKws.length} Selectate
          </div>
          <button onClick={async () => {
            setIsBulkLoading(true);
            for (const kw of selectedKws) { if (!analysisData[kw]) await handleDeepDive(kw); }
            setIsBulkLoading(false);
          }} className="p-2 hover:text-primary transition-colors">
            {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button onClick={() => {/* Logica CSV */}} className="p-2 hover:text-primary transition-colors"><Download size={14} /></button>
          <button onClick={() => window.print()} className="p-2 hover:text-primary transition-colors"><FileText size={14} /></button>
          <button onClick={() => setSelectedKws([])} className="ml-2 p-2 opacity-30 hover:opacity-100 hover:text-red-400 border-l border-background/10"><Trash2 size={14} /></button>
        </div>
      )}

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/30">
              <th className="w-12 px-6 py-4 border-b border-border no-print">
                <button onClick={() => setSelectedKws(selectedKws.length === results.length ? [] : results.map(r => r.keyword))} className="text-muted-foreground/30 hover:text-primary transition-colors">
                  {selectedKws.length === results.length ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border">Keyword</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border text-center">Intent</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border text-right">Volume</th>
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
                      <button onClick={() => setSelectedKws(prev => prev.includes(item.keyword) ? prev.filter(i => i !== item.keyword) : [...prev, item.keyword])} className={`${isSelected ? 'text-primary' : 'text-muted-foreground/20 group-hover:text-muted-foreground/40'}`}>
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
                    <td className="px-8 py-4 border-b border-border/50 text-right no-print">
                      <button 
                        onClick={async () => {
                          if (analysisData[item.keyword]) {
                            const newData = { ...analysisData };
                            delete newData[item.keyword];
                            setAnalysisData(newData);
                          } else {
                            setLoadingKw(item.keyword);
                            const res = await analyzeCompetition(item.keyword, locationCode);
                            setAnalysisData(prev => ({ ...prev, [item.keyword]: res.analysis }));
                            setLoadingKw(null);
                          }
                        }}
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
                      <td colSpan={5} className="p-0 border-b border-border bg-muted/5">
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
    </div>
  );
}