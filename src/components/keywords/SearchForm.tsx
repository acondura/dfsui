'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Zap, Database, Coins } from 'lucide-react';
import { getLocations } from '@/app/dashboard/keywords/actions';

interface Location {
  location_code: number;
  location_name: string;
}

export default function SearchForm({ 
  initialQuery = '', 
  initialLocation = '2840',
  onSearch 
}: { 
  initialQuery?: string, 
  initialLocation?: string,
  onSearch: (q: string, loc: string, mode: 'labs' | 'live') => void 
}) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [mode, setMode] = useState<'labs' | 'live'>('labs');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingLocs(true);
    getLocations(mode).then(res => {
      if (isMounted) {
        setLocations(res);
        setLoadingLocs(false);
      }
    });
    return () => { isMounted = false; };
  }, [mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:border-blue-500 transition-all text-slate-900"
            placeholder="Seed keyword..."
          />
        </div>

        <div className="lg:w-64 relative">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={location} 
            onChange={e => setLocation(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none cursor-pointer text-slate-700"
          >
            {loadingLocs ? (
              <option>Loading...</option>
            ) : (
              locations.map(l => (
                <option key={l.location_code} value={l.location_code}>
                  {l.location_name}
                </option>
              ))
            )}
          </select>
        </div>

        <button 
          onClick={() => onSearch(query, location, mode)}
          disabled={!query.trim()}
          className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          Get Keywords
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setMode('labs')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'labs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Database size={12} /> Standard
          </button>
          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'live' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Zap size={12} /> Live
          </button>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
          <Coins size={14} />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            Est. Cost: ${mode === 'labs' ? '0.010' : '0.050'}
          </span>
        </div>
      </div>
    </div>
  );
}