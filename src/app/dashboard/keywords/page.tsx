'use client';

import { useState } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords } from '@/app/dashboard/keywords/actions';
import { Coins, Search, AlertCircle } from 'lucide-react';

export default function KeywordsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoc, setActiveLoc] = useState('2840');

  const handleSearch = async (q: string, loc: string, mode: 'labs' | 'live') => {
    setLoading(true);
    setError(null);
    setActiveLoc(loc);
    
    try {
      const data = await fetchKeywords(q, loc, mode);
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results);
        setCost(data.cost);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-black text-foreground tracking-tighter">Keyword Research</h1>
        {cost > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all">
             <Coins size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">${cost.toFixed(4)}</span>
          </div>
        )}
      </div>

      <div className="bg-background">
        <SearchForm onSearch={handleSearch} initialLocation={activeLoc} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <p className="text-xs font-bold uppercase tracking-widest">API Status: {error}</p>
        </div>
      )}

      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Querying DataForSEO...</p>
          </div>
        ) : results.length > 0 ? (
          <KeywordTable results={results} locationCode={activeLoc} />
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Search size={32} className="text-muted-foreground/20 mb-4" />
            <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">No results yet</p>
          </div>
        )}
      </div>
    </div>
  );
}