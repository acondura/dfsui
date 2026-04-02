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
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h1 className="text-5xl font-black text-slate-950 tracking-tighter">Keyword Research</h1>
        {cost > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl shadow-2xl">
             <Coins size={16} />
             <span className="text-xs font-black uppercase tracking-widest">${cost.toFixed(4)}</span>
          </div>
        )}
      </div>

      <SearchForm onSearch={handleSearch} initialLocation={activeLoc} />

      {error && (
        <div className="p-5 bg-red-50 border-l-4 border-red-600 flex items-center gap-4 text-red-700 animate-in slide-in-from-left-4">
          <AlertCircle size={20} />
          <p className="text-sm font-black uppercase tracking-widest">Error: {error}</p>
        </div>
      )}

      <div className="min-h-[400px] pt-4">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin" />
            <p className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">Querying DataForSEO...</p>
          </div>
        ) : results.length > 0 ? (
          <KeywordTable results={results} locationCode={activeLoc} />
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-20">
            <Search size={48} className="text-slate-950 mb-6" />
            <p className="text-sm font-black text-slate-950 uppercase tracking-[0.4em]">No results yet</p>
          </div>
        )}
      </div>
    </div>
  );
}