'use client'

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, ChevronRight, Zap, TrendingUp, Target, DollarSign } from 'lucide-react';
import QueryBuilder from '@/components/queries/QueryBuilder';
import QueryResults from '@/components/queries/QueryResults';
import { saveQuery, runQuery } from '@/app/dashboard/queries/actions';
import type { QueryClause, QueryResultItem } from '@/app/dashboard/queries/actions';

// ─── Example templates ────────────────────────────────────────────────────────

interface ExampleTemplate {
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  clauses: Omit<QueryClause, 'id'>[];
}

const EXAMPLES: ExampleTemplate[] = [
  {
    name: 'Drupal upgrade competition',
    description: 'Fetch keywords related to "drupal upgrade" and see their competition',
    icon: Target,
    color: 'text-blue-500',
    clauses: [
      { logicalOperator: 'AND', field: 'seed_keyword', operator: 'equals', value: 'drupal upgrade' },
      { logicalOperator: 'AND', field: 'competition_level', operator: 'equals', value: 'LOW' },
    ],
  },
  {
    name: 'High-volume commercial',
    description: 'Keywords with high search volume and commercial intent',
    icon: TrendingUp,
    color: 'text-green-500',
    clauses: [
      { logicalOperator: 'AND', field: 'seed_keyword', operator: 'equals', value: 'your keyword' },
      { logicalOperator: 'AND', field: 'search_volume', operator: 'gte', value: '1000' },
      { logicalOperator: 'AND', field: 'main_intent', operator: 'equals', value: 'commercial' },
    ],
  },
  {
    name: 'Low-competition opportunities',
    description: 'Easy to rank for keywords with decent traffic',
    icon: Zap,
    color: 'text-amber-500',
    clauses: [
      { logicalOperator: 'AND', field: 'seed_keyword', operator: 'equals', value: 'your keyword' },
      { logicalOperator: 'AND', field: 'competition_level', operator: 'equals', value: 'LOW' },
      { logicalOperator: 'AND', field: 'search_volume', operator: 'gte', value: '500' },
    ],
  },
  {
    name: 'High-value transactional',
    description: 'Transactional keywords with strong CPC signals',
    icon: DollarSign,
    color: 'text-purple-500',
    clauses: [
      { logicalOperator: 'AND', field: 'seed_keyword', operator: 'equals', value: 'your keyword' },
      { logicalOperator: 'AND', field: 'main_intent', operator: 'equals', value: 'transactional' },
      { logicalOperator: 'AND', field: 'cpc', operator: 'gte', value: '2' },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [isSaving, setIsSaving]     = useState(false);
  const [isRunning, setIsRunning]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [results, setResults]       = useState<QueryResultItem[] | null>(null);
  const [scanned, setScanned]       = useState(0);
  // Counts how many times we've reset so QueryBuilder remounts with new clauses
  const [builderKey, setBuilderKey] = useState(0);
  const [initClauses, setInitClauses] = useState<QueryClause[] | undefined>(undefined);

  const handleSave = async (name: string, description: string, clauses: QueryClause[]) => {
    setIsSaving(true);
    setError(null);
    const result = await saveQuery({ name, description, clauses });
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
    } else if (result.query) {
      router.push(`/dashboard/queries/${result.query.id}`);
      router.refresh();
    }
  };

  const handleRun = async (clauses: QueryClause[]) => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    const result = await runQuery(clauses);
    setIsRunning(false);
    if (result.error && result.results.length === 0) {
      setError(result.error);
    } else {
      setResults(result.results);
      setScanned(result.scanned);
      // Warn but still show results if partial error
      if (result.error) setError(result.error);
    }
  };

  // Load an example template into the builder
  const loadExample = useCallback((tpl: ExampleTemplate) => {
    const clauses: QueryClause[] = tpl.clauses.map(c => ({
      ...c,
      id: crypto.randomUUID(),
    }));
    setInitClauses(clauses);
    setBuilderKey(k => k + 1); // force remount so builder resets
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-300 tracking-tighter">Query Builder</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Add a <span className="font-black text-slate-600 dark:text-slate-300">Seed Keyword</span> clause to fetch live data from DataForSEO, then add filters to narrow results.
        </p>
      </div>

      {/* Example templates */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Examples — click to load</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXAMPLES.map(tpl => (
            <button
              key={tpl.name}
              onClick={() => loadExample(tpl)}
              className="group text-left p-4 bg-white dark:bg-zinc-900 border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className={`mb-2 ${tpl.color}`}>
                <tpl.icon size={18} />
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">{tpl.name}</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{tpl.description}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                Load <ChevronRight size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 text-amber-800 dark:text-amber-300 text-sm font-bold rounded-r-xl">
          {error}
        </div>
      )}

      {/* Builder — keyed so it remounts when an example is loaded */}
      <QueryBuilder
        key={builderKey}
        initialClauses={initClauses}
        onSave={handleSave}
        onRun={handleRun}
        isSaving={isSaving}
        isRunning={isRunning}
      />

      {/* Results */}
      {results !== null && (
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">
            Results
          </h2>
          <QueryResults results={results} scanned={scanned} />
        </div>
      )}
    </div>
  );
}
