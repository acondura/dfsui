'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, Coins, Check } from 'lucide-react';
import { getLocations } from '@/app/dashboard/keywords/actions';

export default function SearchForm({ onSearch, initialLocation = '2840' }: any) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [mode, setMode] = useState<'labs' | 'live'>('labs');
  const [locations, setLocations] = useState<any[]>([]);
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [searchLoc, setSearchLoc] = useState('');

  const quickLocations = [
    { name: 'Romania', code: '2642' },
    { name: 'United States', code: '2840' },
    { name: 'United Kingdom', code: '2826' }
  ];

  useEffect(() => {
    getLocations(mode).then((res) => setLocations(res));
  }, [mode]);

  const filteredLocs = locations
    .filter(l => l.location_name.toLowerCase().includes(searchLoc.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-900" size={24} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-100 border-2 border-transparent focus:border-slate-900 rounded-xl font-black text-xl outline-none transition-all text-slate-950 placeholder:text-slate-400"
            placeholder="Seed keyword..."
          />
        </div>

        <button 
          onClick={() => onSearch(query, location, mode)}
          disabled={!query.trim()}
          className="px-12 py-5 bg-slate-950 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all disabled:opacity-30"
        >
          Research
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-slate-100">
        <div className="flex items-center gap-3">
          {quickLocations.map((loc) => (
            <button
              key={loc.code}
              onClick={() => setLocation(loc.code)}
              className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight border-2 transition-all ${
                location === loc.code ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-950'
              }`}
            >
              {loc.name}
            </button>
          ))}
          
          <button 
            onClick={() => setIsLocOpen(!isLocOpen)}
            className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight border-2 border-slate-200 text-slate-900 bg-white hover:border-slate-950 flex items-center gap-2"
          >
            <Globe size={14} /> Custom
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex p-1 bg-slate-100 rounded-xl border-2 border-slate-200">
            <button onClick={() => setMode('labs')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'labs' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>Labs</button>
            <button onClick={() => setMode('live')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'live' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>Live</button>
          </div>
          <div className="text-[10px] font-black uppercase text-slate-950 flex items-center gap-2 tracking-[0.1em] border-l-2 border-slate-200 pl-6">
            <Coins size={14} className="text-slate-400" /> ${mode === 'labs' ? '0.01' : '0.05'}
          </div>
        </div>
      </div>
    </div>
  );
}