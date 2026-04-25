'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { getApiMetadata } from '@/app/dashboard/keywords/actions';
import SearchableSelect from '@/components/ui/SearchableSelect';

import { useI18n } from '@/lib/i18n';

export default function SearchForm({ onSearch, initialLocation = '2840' }: any) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  // ... rest of state ...
  const [location, setLocation] = useState(initialLocation);
  const [apiType, setApiType] = useState<'labs' | 'live'>('labs');
  const [engine, setEngine] = useState('google');
  const [language, setLanguage] = useState('English');
  const [labsFunction, setLabsFunction] = useState<'keyword_suggestions' | 'keyword_ideas'>('keyword_suggestions');
  const [locations, setLocations] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  const engines = [
    { label: 'GOOGLE', value: 'google' },
    { label: 'BING', value: 'bing' },
    { label: 'YAHOO', value: 'yahoo' },
    { label: 'BAIDU', value: 'baidu' }
  ];

  const labsFunctions = [
    { id: 'keyword_suggestions', name: 'Suggestions' },
    { id: 'keyword_ideas', name: 'Ideas' }
  ];

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dfs_search_params');
    if (saved) {
      try {
        const params = JSON.parse(saved);
        Promise.resolve().then(() => {
          if (params.apiType) setApiType(params.apiType);
          if (params.engine) setEngine(params.engine);
          if (params.language) setLanguage(params.language);
          if (params.location) setLocation(params.location);
          if (params.labsFunction) setLabsFunction(params.labsFunction);
        });
      } catch (e) {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('dfs_search_params', JSON.stringify({
      apiType, engine, language, location, labsFunction
    }));
  }, [apiType, engine, language, location, labsFunction]);

  useEffect(() => {
    getApiMetadata(apiType).then((res) => {
        setLocations(res.locations);
        setLanguages(res.languages);
    });
  }, [apiType]);


  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-900" size={24} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && onSearch(query, location, apiType, labsFunction, engine, language)}
            suppressHydrationWarning
            className="w-full pl-14 pr-3 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 rounded-xl font-black text-2xl outline-none transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            placeholder={t('seed_keyword')}
          />
        </div>

        <button 
          onClick={() => onSearch(query, location, apiType, labsFunction, engine, language)}
          disabled={!query.trim()}
          className="px-12 py-5 bg-primary text-white rounded-xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
        >
          {t('research')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm relative overflow-visible">
        <div className="space-y-2">
            <div className="flex items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">{t('api_source')}</label>
                <InfoTooltip content={t('tooltip_api_source')} />
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700">
                <button onClick={() => setApiType('labs')} suppressHydrationWarning className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${apiType === 'labs' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}>{t('labs')}</button>
                <button onClick={() => setApiType('live')} suppressHydrationWarning className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${apiType === 'live' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}>{t('live')}</button>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">{t('method')}</label>
                <InfoTooltip content={t('tooltip_method')} />
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700">
                {apiType === 'labs' ? (
                    labsFunctions.map(f => (
                        <button key={f.id} onClick={() => setLabsFunction(f.id as any)} suppressHydrationWarning className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${labsFunction === f.id ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}>{t(f.id.replace('keyword_', ''))}</button>
                    ))
                ) : (
                    <button suppressHydrationWarning className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-white dark:bg-zinc-700 text-slate-950 dark:text-white shadow-sm">{t('suggestions')}</button>
                )}
            </div>
        </div>

        <SearchableSelect 
            label={t('search_engine')}
            options={engines}
            value={engine}
            onChange={setEngine}
        />

        <SearchableSelect 
            label={t('language')}
            options={languages.length > 0 ? languages : [{ label: t('loading').toUpperCase(), value: 'English' }]}
            value={language}
            onChange={setLanguage}
        />

        <SearchableSelect 
            label={t('location')}
            options={locations.length > 0 ? locations : [{ label: t('loading').toUpperCase(), value: '' }]}
            value={location}
            onChange={setLocation}
        />
      </div>

    </div>
  );
}
