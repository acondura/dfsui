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
    <div className="space-y-4 p-5 bg-background border border-border rounded-xl shadow-sm">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border rounded-lg font-bold outline-none focus:border-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground/30"
            placeholder="Seed keyword..."
          />
        </div>

        <button 
          onClick={() => onSearch(query, location, mode)}
          disabled={!query.trim()}
          className="px-10 py-4 bg-primary text-white rounded-lg font-black uppercase text-[11px] tracking-widest hover:opacity-90 transition-all disabled:opacity-30"
        >
          Research
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          {quickLocations.map((loc) => (
            <button
              key={loc.code}
              onClick={() => setLocation(loc.code)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${
                location === loc.code ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-transparent border-border text-muted-foreground/50'
              }`}
            >
              {loc.name}
            </button>
          ))}
          
          <div className="relative">
            <button 
              onClick={() => setIsLocOpen(!isLocOpen)}
              className="px-3 py-1.5 rounded-md text-[10px] font-bold border border-border text-muted-foreground/50 flex items-center gap-2"
            >
              <Globe size={12} /> Other
            </button>
            {isLocOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-2xl z-50 p-2">
                <input 
                  placeholder="Search country..." 
                  value={searchLoc} 
                  onChange={e => setSearchLoc(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-xs outline-none mb-2"
                />
                <div className="max-h-40 overflow-y-auto">
                  {filteredLocs.map(l => (
                    <button
                      key={l.location_code}
                      onClick={() => { setLocation(l.location_code.toString()); setIsLocOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/5 rounded-md flex justify-between items-center"
                    >
                      {l.location_name}
                      {location === l.location_code.toString() && <Check size={12} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 border-l border-border pl-6">
            <button onClick={() => setMode('labs')} className={`text-[9px] font-black uppercase tracking-widest ${mode === 'labs' ? 'text-primary underline underline-offset-4' : 'text-muted-foreground/30'}`}>Labs</button>
            <button onClick={() => setMode('live')} className={`text-[9px] font-black uppercase tracking-widest ${mode === 'live' ? 'text-primary underline underline-offset-4' : 'text-muted-foreground/30'}`}>Live</button>
          </div>
          <div className="text-[9px] font-black uppercase text-muted-foreground/20 flex items-center gap-2 tracking-widest border-l border-border pl-6">
            <Coins size={11} className="text-primary/30" /> ${mode === 'labs' ? '0.01' : '0.05'}
          </div>
        </div>
      </div>
    </div>
  );
}