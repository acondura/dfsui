'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/keywords/SearchForm';
import KeywordTable from '@/components/keywords/KeywordTable';
import { fetchKeywords, fetchRecentQueries } from '@/app/dashboard/keywords/actions';
import { Coins, Search, AlertCircle, Clock, ChevronRight, Activity, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function KeywordsPage() {
  const { t } = useI18n();
  const [results, setResults] = useState<any[]>([]);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoc, setActiveLoc] = useState('2840');
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [lastSearch, setLastSearch] = useState<{
    q: string, 
    loc: string, 
    apiType: 'labs' | 'live', 
    labsFunction: 'keyword_suggestions' | 'keyword_ideas', 
    engine: string, 
    language: string
  } | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishedKws, setPublishedKws] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(recentQueries.length / itemsPerPage);
  const currentQueries = recentQueries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchRecentQueries().then(res => {
      setRecentQueries(res);
      setLoadingRecent(false);
    });

    // Fetch Admin & pSEO data
    import('@/app/dashboard/keywords/actions').then(actions => {
      actions.getAdminStatus().then(status => setIsAdmin(!!status));
      actions.getPublishedKeywords().then(kws => setPublishedKws(kws || []));
    });
    
    const handleReset = () => setResults([]);
    window.addEventListener('reset-keywords', handleReset);
    return () => window.removeEventListener('reset-keywords', handleReset);
  }, []);

  const handleSearch = async (
    q: string, 
    loc: string, 
    apiType: 'labs' | 'live', 
    labsFunction: 'keyword_suggestions' | 'keyword_ideas' = 'keyword_suggestions',
    engine: string = 'google',
    language: string = 'English',
    bypassCache = false
  ) => {
    setLoading(true);
    setError(null);
    setActiveLoc(loc);
    setLastSearch({ q, loc, apiType, labsFunction, engine, language });
    try {
      const data = await fetchKeywords(q, loc, apiType, labsFunction, engine, language, bypassCache);
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results);
        setCost(data.cost);
        fetchRecentQueries().then(res => setRecentQueries(res));
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">{t('keyword_research')}</h1>
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
          <p className="text-sm font-black uppercase tracking-widest">{t('error')}: {error}</p>
        </div>
      )}

      <div className="min-h-[400px] pt-4">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin" />
            <p className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">{t('querying_dataforseo')}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between no-print">
              <button 
                onClick={() => setResults([])}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-lg transition-all"
              >
                <ArrowLeft size={14} /> {t('back')}
              </button>

              <button 
                onClick={() => lastSearch && handleSearch(
                    lastSearch.q, 
                    lastSearch.loc, 
                    lastSearch.apiType, 
                    lastSearch.labsFunction, 
                    lastSearch.engine, 
                    lastSearch.language, 
                    true
                )}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-lg transition-all"
              >
                <RefreshCcw size={14} /> {t('refresh_from_api')}
              </button>
            </div>
            <KeywordTable 
              results={results} 
              locationCode={activeLoc} 
              isAdmin={isAdmin}
              initialPublished={publishedKws}
            />
          </div>
        ) : lastSearch && !loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Search size={32} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('no_results_found')}</h3>
              <p className="text-slate-500 font-bold max-w-sm mt-2">
                The {lastSearch.apiType === 'labs' ? 'Labs' : 'Live'} database doesn&apos;t have data for <span className="text-slate-900 dark:text-slate-200">&quot;{lastSearch.q}&quot;</span> in this location/language.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => setLastSearch(null)}
                className="px-8 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('back_to_history')}
              </button>
              
              {lastSearch.apiType === 'labs' && (
                <button 
                  onClick={() => handleSearch(lastSearch.q, lastSearch.loc, 'live', lastSearch.labsFunction, lastSearch.engine, lastSearch.language)}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                  <Activity size={18} />
                  {t('retry_in_live_mode')}
                </button>
              )}
            </div>
          </div>
        ) : recentQueries.length > 0 ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 tracking-tight">
              <Clock size={16} className="text-slate-400" /> 
              {t('recent_queries')}
            </h2>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('keyword')}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('location')}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('source')}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('engine')}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {currentQueries.map((query, idx) => (
                      <tr key={`${query.keyword}-${query.location}-${query.apiType}-${idx}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleSearch(query.keyword, query.location, query.apiType, query.labsFunction, query.engine, query.language)}
                            className="font-bold text-slate-900 dark:text-slate-100 text-base lowercase hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                          >
                            {query.keyword}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-slate-500">{query.location}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-tighter text-slate-500">
                                {query.apiType} {query.labsFunction === 'keyword_ideas' ? `(${t('ideas')})` : ''}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-slate-500">{query.engine} / {query.language}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleSearch(query.keyword, query.location, query.apiType, query.labsFunction, query.engine, query.language)}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors inline-flex items-center gap-2"
                          >
                            {t('research')} <ChevronRight size={14} />
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
                      className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 dark:hover:border-slate-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {t('next')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !loadingRecent ? (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 animate-in fade-in">
            <Activity size={48} className="text-slate-300 dark:text-slate-600 mb-6" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">{t('no_recent_queries')}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{t('start_research_to_build_history')}</p>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
          </div>
        )}
      </div>
    </div>
  );
}