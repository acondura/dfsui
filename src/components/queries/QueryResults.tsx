'use client'

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { QueryResultItem } from '@/app/dashboard/queries/actions';

interface QueryResultsProps {
  results: QueryResultItem[];
  scanned: number;
  queryName?: string;
}

// Format search volume with K/M suffix
function formatVolume(v?: number): string {
  if (v === undefined || v === null) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// Intent badge colour
function intentColor(intent?: string): string {
  switch (intent) {
    case 'informational':  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'commercial':     return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'transactional':  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'navigational':   return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    default:               return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  }
}

const ITEMS_PER_PAGE = 25;

export default function QueryResults({ results, scanned, queryName }: QueryResultsProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'search_volume' | 'cpc' | 'keyword'>('search_volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...results].sort((a, b) => {
    if (sortBy === 'keyword') {
      return sortDir === 'asc'
        ? a.keyword.localeCompare(b.keyword)
        : b.keyword.localeCompare(a.keyword);
    }
    const av = a[sortBy] ?? 0;
    const bv = b[sortBy] ?? 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const current = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  if (results.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Search size={32} className="text-slate-300" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Results Found</h3>
          <p className="text-slate-500 font-bold max-w-sm mt-2">
            No cached keywords matched your query conditions. Try running some keyword research first or adjust your filters.
          </p>
        </div>
        <p className="text-xs font-mono text-slate-400">Scanned {scanned.toLocaleString()} keyword{scanned !== 1 ? 's' : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {results.length.toLocaleString()} result{results.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-mono text-slate-400">
            scanned {scanned.toLocaleString()} keywords
          </span>
        </div>
        {queryName && (
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 px-3 py-1 border border-border rounded-lg">
            {queryName}
          </span>
        )}
      </div>

      {/* Results table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => handleSort('keyword')}
                >
                  Keyword {sortBy === 'keyword' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer hover:text-slate-900 transition-colors text-right"
                  onClick={() => handleSort('search_volume')}
                >
                  Volume {sortBy === 'search_volume' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer hover:text-slate-900 transition-colors text-right"
                  onClick={() => handleSort('cpc')}
                >
                  CPC {sortBy === 'cpc' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Intent</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {current.map((item, idx) => (
                <tr
                  key={`${item.keyword}-${idx}`}
                  className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-6 py-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm lowercase">
                      {item.keyword}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400">
                      {formatVolume(item.search_volume)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400">
                      {item.cpc !== undefined ? `$${item.cpc.toFixed(2)}` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {item.main_intent && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${intentColor(item.main_intent)}`}>
                        {item.main_intent}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {item.source.seed_keyword} · {item.source.engine}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:border-slate-900 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
