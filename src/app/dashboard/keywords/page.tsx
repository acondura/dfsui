'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords, fetchRecentQueries } from '@/app/dashboard/keywords/actions';
import { Coins, Search, AlertCircle, Clock, ChevronRight, Activity, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function KeywordsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoc, setActiveLoc] = useState('2840');
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [lastSearch, setLastSearch] = useState<{q: string, loc: string, mode: 'labs' | 'live'} | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(recentQueries.length / itemsPerPage);
  const currentQueries = recentQueries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchRecentQueries().then(res => {
      setRecentQueries(res);
      setLoadingRecent(false);
    });
    
    const handleReset = () => setResults([]);
    window.addEventListener('reset-keywords', handleReset);
    return () => window.removeEventListener('reset-keywords', handleReset);
  }, []);

  const handleSearch = async (q: string, loc: string, mode: 'labs' | 'live', bypassCache = false) => {
    setLoading(true);
    setError(null);
    setActiveLoc(loc);
    setLastSearch({ q, loc, mode });
    try {
      const data = await fetchKeywords(q, loc, mode, bypassCache);
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
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between no-print">
              <button 
                onClick={() => setResults([])}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-lg transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button 
                onClick={() => lastSearch && handleSearch(lastSearch.q, lastSearch.loc, lastSearch.mode, true)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-lg transition-all"
              >
                <RefreshCcw size={14} /> Refresh from API
              </button>
            </div>
            <KeywordTable results={results} locationCode={activeLoc} />
          </div>
        ) : recentQueries.length > 0 ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
              <Clock size={16} className="text-slate-400" /> 
              RECENT QUERIES
            </h2>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Keyword</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mode</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {currentQueries.map((query, idx) => (
                      <tr key={`${query.keyword}-${query.location}-${query.mode}-${idx}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleSearch(query.keyword, query.location, query.mode)}
                            className="font-bold text-slate-900 dark:text-slate-100 text-base lowercase hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                          >
                            {query.keyword}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-slate-500">{query.location}</td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-slate-500">{query.mode}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleSearch(query.keyword, query.location, query.mode)}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors inline-flex items-center gap-2"
                          >
                            Research <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
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
              )}
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