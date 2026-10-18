'use client'

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Loader2, AlertCircle } from 'lucide-react';
import QueryBuilder from '@/components/queries/QueryBuilder';
import QueryResults from '@/components/queries/QueryResults';
import { getQuery, saveQuery, runQuery, toggleShareQuery } from '@/app/dashboard/queries/actions';
import type { QueryClause, QueryResultItem, SavedQuery } from '@/app/dashboard/queries/actions';

interface QueryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function QueryDetailPage({ params }: QueryDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';

  const [query, setQuery]         = useState<SavedQuery | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [results, setResults]     = useState<QueryResultItem[] | null>(null);
  const [scanned, setScanned]     = useState(0);

  useEffect(() => {
    getQuery(id).then(q => {
      if (!q) {
        setNotFound(true);
      } else {
        setQuery(q);
        // Auto-run on initial load (not in edit mode)
        if (!isEditMode) {
          handleRunClauses(q.clauses);
        }
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRunClauses = async (clauses: QueryClause[]) => {
    setIsRunning(true);
    setError(null);
    const result = await runQuery(clauses);
    setIsRunning(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResults(result.results);
      setScanned(result.scanned);
    }
  };

  const handleSave = async (name: string, description: string, clauses: QueryClause[]) => {
    setIsSaving(true);
    setError(null);
    const result = await saveQuery({ id: id, name, description, clauses });
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
    } else if (result.query) {
      setQuery(result.query);
      // Switch to run mode after saving
      router.replace(`/dashboard/queries/${id}`);
    }
  };

  const handleShare = async () => {
    if (!query) return;
    setIsSharing(true);
    const result = await toggleShareQuery(query.id);
    if (result.error) {
      setError(result.error);
    } else {
      // Update local shared state
      setQuery(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sharedWith: result.shared
            ? [...prev.sharedWith, '__active_team__'] // placeholder; reload will fix it
            : []
        };
      });
      // Reload to get accurate sharedWith from server
      const updated = await getQuery(id);
      if (updated) setQuery(updated);
    }
    setIsSharing(false);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading query...</p>
      </div>
    );
  }

  if (notFound || !query) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
        <AlertCircle size={48} className="text-red-400" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Query Not Found</h2>
          <p className="text-slate-500 mt-2">This query doesn&apos;t exist or you don&apos;t have access to it.</p>
        </div>
        <Link href="/dashboard/queries" className="text-primary font-black hover:underline">
          ← Back to Queries
        </Link>
      </div>
    );
  }

  const isShared = query.sharedWith.length > 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/queries"
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">{query.name}</h1>
            {query.description && (
              <p className="text-sm text-slate-400 font-medium mt-1">{query.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isShared && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
              <Share2 size={10} /> Shared with Team
            </span>
          )}
          {/* Edit / View toggle */}
          {isEditMode ? (
            <Link
              href={`/dashboard/queries/${query.id}`}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-slate-900 dark:hover:border-zinc-500 transition-all"
            >
              View Results
            </Link>
          ) : (
            <Link
              href={`/dashboard/queries/${query.id}?edit=1`}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-slate-900 dark:hover:border-zinc-500 transition-all"
            >
              Edit Query
            </Link>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl flex items-center gap-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Edit mode: show builder */}
      {isEditMode ? (
        <QueryBuilder
          initialName={query.name}
          initialDescription={query.description}
          initialClauses={query.clauses}
          queryId={query.id}
          isShared={isShared}
          onSave={handleSave}
          onRun={handleRunClauses}
          onShare={handleShare}
          isSaving={isSaving}
          isRunning={isRunning}
        />
      ) : (
        <>
          {/* Read-only clause summary */}
          <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-zinc-900/50 border-b border-border">
              <span className="w-20 text-[10px] font-black uppercase tracking-widest text-slate-400">And/Or</span>
              <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Field</span>
              <span className="w-36 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</span>
              <span className="flex-[2] text-[10px] font-black uppercase tracking-widest text-slate-400">Value</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {query.clauses.map((clause, i) => (
                <div key={clause.id} className="flex items-center gap-2 px-6 py-2.5">
                  <div className="w-20">
                    {i === 0 ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Where</span>
                    ) : (
                      <span className="text-xs font-black uppercase tracking-wider text-primary">{clause.logicalOperator}</span>
                    )}
                  </div>
                  <div className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-300">{clause.field.replace(/_/g, ' ')}</div>
                  <div className="w-36 text-sm font-bold text-slate-500">{clause.operator.replace(/_/g, ' ')}</div>
                  <div className="flex-[2] font-mono text-sm text-slate-900 dark:text-slate-100">{clause.value}</div>
                </div>
              ))}
            </div>

            {/* Share action */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${
                  isShared
                    ? 'text-green-600 hover:text-green-800'
                    : 'text-slate-400 hover:text-primary'
                }`}
              >
                {isSharing
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Share2 size={12} />}
                {isShared ? 'Shared with Team — Click to Unshare' : 'Share with Active Team'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-3">
              Results
              {isRunning && <Loader2 size={16} className="animate-spin text-primary" />}
            </h2>
            {results !== null ? (
              <QueryResults results={results} scanned={scanned} queryName={query.name} />
            ) : isRunning ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Running query...</p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
