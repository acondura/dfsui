'use client';

import { useState } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords } from '@/app/dashboard/keywords/actions';
import { Coins, Search } from 'lucide-react';

interface KeywordResult {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
}

export default function KeywordsPage() {
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeLoc, setActiveLoc] = useState('2840');

  const handleSearch = async (q: string, loc: string, mode: 'labs' | 'live') => {
    setLoading(true);
    setActiveLoc(loc);
    try {
      const data = await fetchKeywords(q, loc, mode);
      setResults(data.results as KeywordResult[]);
      setCost(data.cost);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Keyword Research</h1>
        </div>
        {cost > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl shadow-md animate-in fade-in slide-in-from-right-4 border border-primary/20">
             <Coins size={14} className="text-white/80" />
             <span className="text-[10px] font-black uppercase tracking-widest">Search Cost: ${cost.toFixed(4)}</span>
          </div>
        )}
      </div>

      <div className="bg-background shadow-sm">
        <SearchForm onSearch={handleSearch} initialLocation={activeLoc} />
      </div>

      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-black uppercase text-muted-foreground/40 tracking-widest">Querying DataForSEO...</p>
          </div>
        ) : results.length > 0 ? (
          <KeywordTable results={results} locationCode={activeLoc} />
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted/30 rounded-3xl flex items-center justify-center text-muted-foreground/20 mb-4">
              <Search size={32} />
            </div>
            <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">No results yet</p>
            <p className="text-xs text-muted-foreground/20 mt-1 uppercase">Enter a seed keyword to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}