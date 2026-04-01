'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Coins } from 'lucide-react';
import { getLocations } from '@/app/dashboard/keywords/actions';

interface LocationOption {
  location_code: number;
  location_name: string;
}

interface SearchFormProps {
  onSearch: (query: string, location: string, mode: 'labs' | 'live') => void | Promise<void>;
  initialLocation?: string;
}

export default function SearchForm({ onSearch, initialLocation = '2840' }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [mode, setMode] = useState<'labs' | 'live'>('labs');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingLocs(true);
    
    getLocations(mode).then((res) => {
      if (isMounted) {
        setLocations(res as LocationOption[]);
        setLoadingLocs(false);
      }
    });
    return () => { isMounted = false; };
  }, [mode]);

  return (
    <div className="bg-background shadow-sm">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-muted/20 border border-border rounded-lg font-bold outline-none focus:border-primary focus:bg-background transition-all text-sm text-foreground placeholder:text-muted-foreground/30"
            placeholder="Seed keyword..."
          />
        </div>

        <div className="lg:w-56 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
          <select 
            value={location} 
            onChange={e => setLocation(e.target.value)}
            className="w-full appearance-none pl-10 pr-8 py-3 bg-muted/20 border border-border rounded-lg font-bold text-xs outline-none cursor-pointer focus:border-primary text-foreground"
          >
            {loadingLocs ? <option>Loading...</option> : locations.map(l => (
              <option key={l.location_code} value={l.location_code.toString()}>
                {l.location_name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => onSearch(query, location, mode)}
          disabled={!query.trim()}
          className="px-8 py-3 bg-primary text-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
        >
          Research
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 px-1">
        <div className="flex gap-5">
          <button 
            onClick={() => setMode('labs')} 
            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
              mode === 'labs' ? 'text-primary underline underline-offset-4 decoration-2' : 'text-muted-foreground/40 hover:text-foreground'
            }`}
          >
            Labs
          </button>
          <button 
            onClick={() => setMode('live')} 
            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
              mode === 'live' ? 'text-primary underline underline-offset-4 decoration-2' : 'text-muted-foreground/40 hover:text-foreground'
            }`}
          >
            Live
          </button>
        </div>
        <div className="text-[9px] font-black uppercase text-muted-foreground/30 flex items-center gap-1.5 tracking-widest">
          <Coins size={11} className="text-primary/30" /> 
          Cost: <span className="font-mono text-foreground/60">${mode === 'labs' ? '0.01' : '0.05'}</span>
        </div>
      </div>
    </div>
  );
}