'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Play, Pencil, Trash2, Share2, Users, User, Filter, Loader2 } from 'lucide-react';
import { getQueries, deleteQuery, toggleShareQuery } from '@/app/dashboard/queries/actions';
import type { SavedQuery } from '@/app/dashboard/queries/actions';

// Format relative time
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface QueryCardProps {
  query: SavedQuery;
  isOwned: boolean;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  deleting?: boolean;
  sharing?: boolean;
}

function QueryCard({ query, isOwned, onDelete, onShare, deleting, sharing }: QueryCardProps) {
  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
      {/* Name + description */}
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Filter size={14} className="text-primary" />
          </div>
          <div>
            <Link
              href={`/dashboard/queries/${query.id}`}
              className="font-black text-slate-900 dark:text-slate-100 hover:text-primary transition-colors"
            >
              {query.name}
            </Link>
            {query.description && (
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{query.description}</p>
            )}
          </div>
        </div>
      </td>

      {/* Clause count */}
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded text-[10px] font-black uppercase tracking-tighter">
          {query.clauses.length} condition{query.clauses.length !== 1 ? 's' : ''}
        </span>
      </td>

      {/* Owner */}
      <td className="px-6 py-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          {isOwned ? <User size={12} /> : <Users size={12} />}
          {isOwned ? 'You' : query.owner}
        </span>
      </td>

      {/* Shared status */}
      <td className="px-6 py-4">
        {query.sharedWith.length > 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-green-600 dark:text-green-400">
            <Share2 size={10} /> Shared
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300 dark:text-slate-700">Private</span>
        )}
      </td>

      {/* Updated */}
      <td className="px-6 py-4 text-xs font-mono text-slate-400">
        {timeAgo(query.updatedAt)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 justify-end">
          {/* Run */}
          <Link
            href={`/dashboard/queries/${query.id}`}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Run query"
          >
            <Play size={14} />
          </Link>

          {/* Edit (owner only) */}
          {isOwned && (
            <Link
              href={`/dashboard/queries/${query.id}?edit=1`}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
              title="Edit query"
            >
              <Pencil size={14} />
            </Link>
          )}

          {/* Share toggle (owner only) */}
          {isOwned && (
            <button
              onClick={() => onShare(query.id)}
              disabled={sharing}
              className={`p-1.5 rounded-lg transition-all ${
                query.sharedWith.length > 0
                  ? 'text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950'
                  : 'text-slate-400 hover:text-primary hover:bg-primary/10'
              }`}
              title={query.sharedWith.length > 0 ? 'Unshare from team' : 'Share with team'}
            >
              {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            </button>
          )}

          {/* Delete (owner only) */}
          {isOwned && (
            <button
              onClick={() => onDelete(query.id)}
              disabled={deleting}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all"
              title="Delete query"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function QueriesPage() {
  const [myQueries, setMyQueries]       = useState<SavedQuery[]>([]);
  const [sharedQueries, setSharedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [sharingId, setSharingId]       = useState<string | null>(null);
  const [tab, setTab]                   = useState<'mine' | 'shared'>('mine');

  const load = async () => {
    const data = await getQueries();
    setMyQueries(data.myQueries);
    setSharedQueries(data.sharedQueries);
    setLoading(false);
  };

  // loading starts as true; effect fetches and clears it
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this query? This cannot be undone.')) return;
    setDeletingId(id);
    await deleteQuery(id);
    setMyQueries(prev => prev.filter(q => q.id !== id));
    setDeletingId(null);
  };

  const handleShare = async (id: string) => {
    setSharingId(id);
    const result = await toggleShareQuery(id);
    if (!result.error) {
      // Refresh to get updated shared state
      await load();
    }
    setSharingId(null);
  };

  const displayedQueries = tab === 'mine' ? myQueries : sharedQueries;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">Queries</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Build, save and share keyword filters with your team
          </p>
        </div>
        <Link
          href="/dashboard/queries/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={14} /> New Query
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['mine', 'shared'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            {t === 'mine' ? `My Queries (${myQueries.length})` : `Shared with Me (${sharedQueries.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading queries...</p>
        </div>
      ) : displayedQueries.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Filter size={32} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {tab === 'mine' ? 'No Queries Yet' : 'Nothing Shared With You'}
            </h3>
            <p className="text-slate-500 font-bold max-w-sm mt-2">
              {tab === 'mine'
                ? 'Create a query to filter your keyword research results with custom conditions.'
                : 'When teammates share queries with your workspace, they appear here.'}
            </p>
          </div>
          {tab === 'mine' && (
            <Link
              href="/dashboard/queries/new"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> Create Your First Query
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conditions</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visibility</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Updated</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {displayedQueries.map(query => (
                  <QueryCard
                    key={query.id}
                    query={query}
                    isOwned={tab === 'mine'}
                    onDelete={handleDelete}
                    onShare={handleShare}
                    deleting={deletingId === query.id}
                    sharing={sharingId === query.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
