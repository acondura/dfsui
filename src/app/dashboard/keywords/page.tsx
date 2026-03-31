'use client';

import { useState } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords } from '@/app/dashboard/keywords/actions';
import { Coins, Search } from 'lucide-react';

// 1. Define the interface to replace 'any'
interface KeywordResult {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
}

export default function KeywordsPage() {
  // 2. Apply the interface to the state
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeLoc, setActiveLoc] = useState('2840');

  const handleSearch = async (q: string, loc: string, mode: 'labs' | 'live') => {
    setLoading(true);
    setActiveLoc(loc);
    try {
      const data = await fetchKeywords(q, loc, mode);
      // Data is now typed via the fetchKeywords return (or cast here)
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Keyword Research</h1>
          <p className="text-slate-500 font-medium mt-2">v1.2.0: Multi-Engine Research</p>
        </div>
        {cost > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4">
             <Coins size={14} className="text-amber-400" />
             <span className="text-[10px] font-black uppercase">Search Cost: ${cost.toFixed(4)}</span>
          </div>
        )}
      </div>

      {/* 3. The Search Form handles engine toggling and location fetching */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <SearchForm onSearch={handleSearch} initialLocation={activeLoc} />
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Querying DataForSEO...</p>
          </div>
        ) : results.length > 0 ? (
          <KeywordTable results={results} locationCode={activeLoc} />
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
              <Search size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No results yet</p>
            <p className="text-xs text-slate-300 mt-1 uppercase">Enter a seed keyword to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}