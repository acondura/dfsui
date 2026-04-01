'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Coins } from 'lucide-react';
import { getLocations } from '@/app/dashboard/keywords/actions';

interface LocationOption {
  location_code: number;
  location_name: string;
}

interface SearchFormProps {
  // FIXED: Changed mode to the specific union type and allowed Promise return
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
    <div className="bg-background border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border rounded-2xl font-bold outline-none focus:border-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground/30"
            placeholder="Seed keyword..."
          />
        </div>

        <div className="lg:w-64 relative">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
          <select 
            value={location} 
            onChange={e => setLocation(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-4 bg-muted/30 border border-border rounded-2xl font-bold text-sm outline-none cursor-pointer focus:border-primary text-foreground"
          >
            {loadingLocs ? <option>Loading...</option> : locations.map(l => (
              <option key={l.location_code} value={l.location_code}>{l.location_name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => onSearch(query, location, mode)}
          disabled={!query.trim()}
          className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          Research
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex gap-6">
          <button 
            onClick={() => setMode('labs')} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              mode === 'labs' 
                ? 'text-primary underline underline-offset-8 decoration-2' 
                : 'text-muted-foreground/60 hover:text-foreground'
            }`}
          >
            Labs API
          </button>
          <button 
            onClick={() => setMode('live')} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              mode === 'live' 
                ? 'text-primary underline underline-offset-8 decoration-2' 
                : 'text-muted-foreground/60 hover:text-foreground'
            }`}
          >
            Live Ads
          </button>
        </div>
        <div className="text-[10px] font-black uppercase text-muted-foreground/40 flex items-center gap-2 tracking-widest">
          <Coins size={12} className="text-primary/40" /> 
          Est. Cost: <span className="font-mono text-foreground/60">${mode === 'labs' ? '0.01' : '0.05'}</span>
        </div>
      </div>
    </div>
  );
}