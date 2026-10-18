'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QueryBuilder from '@/components/queries/QueryBuilder';
import QueryResults from '@/components/queries/QueryResults';
import { saveQuery, runQuery } from '@/app/dashboard/queries/actions';
import type { QueryClause, QueryResultItem } from '@/app/dashboard/queries/actions';

export default function NewQueryPage() {
  const router = useRouter();
  const [isSaving, setIsSaving]   = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [results, setResults]     = useState<QueryResultItem[] | null>(null);
  const [scanned, setScanned]     = useState(0);

  const handleSave = async (name: string, description: string, clauses: QueryClause[]) => {
    setIsSaving(true);
    setError(null);
    const result = await saveQuery({ name, description, clauses });
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
    } else if (result.query) {
      // Redirect to the query's detail page after saving
      router.push(`/dashboard/queries/${result.query.id}`);
    }
  };

  const handleRun = async (clauses: QueryClause[]) => {
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

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/queries"
          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">New Query</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Define conditions to filter your keyword research results
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
          {error}
        </div>
      )}

      {/* Builder */}
      <QueryBuilder
        onSave={handleSave}
        onRun={handleRun}
        isSaving={isSaving}
        isRunning={isRunning}
      />

      {/* Results (preview before saving) */}
      {results !== null && (
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">
            Preview Results
          </h2>
          <QueryResults results={results} scanned={scanned} />
        </div>
      )}
    </div>
  );
}
