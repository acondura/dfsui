'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords, fetchRecentQueries } from '@/app/dashboard/keywords/actions';
import { Coins, Search, AlertCircle, Clock, ChevronRight, Activity } from 'lucide-react';

export default function KeywordsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoc, setActiveLoc] = useState('2840');
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    fetchRecentQueries().then(res => {
      setRecentQueries(res);
      setLoadingRecent(false);
    });
  }, []);

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
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">Keyword Research</h1>
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
        ) : recentQueries.length > 0 ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
              <Clock size={16} className="text-slate-400" /> 
              RECENT QUERIES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentQueries.map((query, idx) => (
                <button
                  key={`${query.keyword}-${query.location}-${query.mode}-${idx}`}
                  onClick={() => handleSearch(query.keyword, query.location, query.mode)}
                  className="group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 text-left flex flex-col gap-4 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-50/50 group-hover:to-transparent dark:group-hover:from-indigo-900/10 transition-all duration-500 pointer-events-none" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors capitalize line-clamp-2 pr-4">
                      {query.keyword}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight size={16} className="text-indigo-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 relative z-10">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">LOC: {query.location}</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">MODE: {query.mode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !loadingRecent ? (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 animate-in fade-in">
            <Activity size={48} className="text-slate-300 dark:text-slate-600 mb-6" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">No recent queries</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Start your research above to build history</p>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
             {/* Simple spacer while loading initial queries so the layout doesn't jump aggressively */}
          </div>
        )}
      </div>
    </div>
  );
}