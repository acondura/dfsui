'use client'

import { useState, useCallback } from 'react';
import { Plus, Trash2, Play, Save, Share2 } from 'lucide-react';
import type { QueryClause, QueryField, QueryOperator } from '@/app/dashboard/queries/actions';

// ─── Field & Operator Definitions ────────────────────────────────────────────

interface FieldDef {
  label: string;
  type: 'string' | 'number' | 'enum';
  enumValues?: string[];
}

const FIELDS: Record<QueryField, FieldDef> = {
  keyword:       { label: 'Keyword',       type: 'string' },
  seed_keyword:  { label: 'Seed Keyword',  type: 'string' },
  search_volume: { label: 'Search Volume', type: 'number' },
  cpc:           { label: 'CPC',           type: 'number' },
  competition:   { label: 'Competition',   type: 'number' },
  main_intent:   { label: 'Intent',        type: 'enum', enumValues: ['informational', 'navigational', 'commercial', 'transactional'] },
  location:      { label: 'Location Code', type: 'string' },
  language:      { label: 'Language',      type: 'string' },
  api_type:      { label: 'API Type',      type: 'enum', enumValues: ['labs', 'live'] },
  engine:        { label: 'Engine',        type: 'enum', enumValues: ['google', 'bing', 'yahoo', 'baidu'] },
};

interface OperatorDef {
  label: string;
  types: Array<'string' | 'number' | 'enum'>;
}

const OPERATORS: Record<QueryOperator, OperatorDef> = {
  equals:      { label: '=',            types: ['string', 'number', 'enum'] },
  not_equals:  { label: '≠',            types: ['string', 'number', 'enum'] },
  contains:    { label: 'Contains',     types: ['string'] },
  not_contains:{ label: 'Not Contains', types: ['string'] },
  starts_with: { label: 'Starts With',  types: ['string'] },
  ends_with:   { label: 'Ends With',    types: ['string'] },
  gt:          { label: '>',            types: ['number'] },
  lt:          { label: '<',            types: ['number'] },
  gte:         { label: '≥',            types: ['number'] },
  lte:         { label: '≤',            types: ['number'] },
};

function getOperatorsForField(field: QueryField): QueryOperator[] {
  const fieldType = FIELDS[field].type;
  return (Object.keys(OPERATORS) as QueryOperator[]).filter(
    op => OPERATORS[op].types.includes(fieldType)
  );
}

function makeClause(overrides: Partial<QueryClause> = {}): QueryClause {
  return {
    id: crypto.randomUUID(),
    logicalOperator: 'AND',
    field: 'keyword',
    operator: 'contains',
    value: '',
    ...overrides,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QueryBuilderProps {
  // Initial state for edit mode
  initialName?: string;
  initialDescription?: string;
  initialClauses?: QueryClause[];
  queryId?: string;
  isShared?: boolean;
  // Callbacks
  onSave: (name: string, description: string, clauses: QueryClause[]) => Promise<void>;
  onRun: (clauses: QueryClause[]) => Promise<void>;
  onShare?: () => Promise<void>;
  isSaving?: boolean;
  isRunning?: boolean;
}

// ─── Clause Row ───────────────────────────────────────────────────────────────

interface ClauseRowProps {
  clause: QueryClause;
  onChange: (clause: QueryClause) => void;
  onRemove: () => void;
  isFirst: boolean;
}

function ClauseRow({ clause, onChange, onRemove, isFirst }: ClauseRowProps) {
  const fieldDef = FIELDS[clause.field];
  const availableOps = getOperatorsForField(clause.field);

  // When field changes, reset operator and value to valid defaults
  const handleFieldChange = (field: QueryField) => {
    const ops = getOperatorsForField(field);
    onChange({ ...clause, field, operator: ops[0], value: '' });
  };

  // When operator changes, preserve value if possible
  const handleOperatorChange = (operator: QueryOperator) => {
    onChange({ ...clause, operator });
  };

  return (
    <div className="flex items-center gap-2 py-2 group">
      {/* AND/OR selector — hidden for first row, shown as badge */}
      <div className="w-20 shrink-0">
        {isFirst ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Where</span>
        ) : (
          <select
            value={clause.logicalOperator}
            onChange={e => onChange({ ...clause, logicalOperator: e.target.value as 'AND' | 'OR' })}
            className="w-full px-2 py-1.5 border border-border rounded-lg text-xs font-black uppercase tracking-wider bg-white dark:bg-zinc-800 text-primary"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        )}
      </div>

      {/* Field selector */}
      <select
        value={clause.field}
        onChange={e => handleFieldChange(e.target.value as QueryField)}
        className="flex-1 min-w-0 px-3 py-1.5 border border-border rounded-lg text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
      >
        {(Object.keys(FIELDS) as QueryField[]).map(f => (
          <option key={f} value={f}>{FIELDS[f].label}</option>
        ))}
      </select>

      {/* Operator selector */}
      <select
        value={clause.operator}
        onChange={e => handleOperatorChange(e.target.value as QueryOperator)}
        className="w-36 shrink-0 px-3 py-1.5 border border-border rounded-lg text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
      >
        {availableOps.map(op => (
          <option key={op} value={op}>{OPERATORS[op].label}</option>
        ))}
      </select>

      {/* Value input — text, number, or enum select */}
      <div className="flex-[2] min-w-0">
        {fieldDef.type === 'enum' && fieldDef.enumValues ? (
          <select
            value={clause.value}
            onChange={e => onChange({ ...clause, value: e.target.value })}
            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">— select —</option>
            {fieldDef.enumValues.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : (
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            value={clause.value}
            onChange={e => onChange({ ...clause, value: e.target.value })}
            placeholder={fieldDef.type === 'number' ? '0' : 'value...'}
            className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
        title="Remove clause"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── QueryBuilder ─────────────────────────────────────────────────────────────

export default function QueryBuilder({
  initialName = '',
  initialDescription = '',
  initialClauses,
  isShared = false,
  onSave,
  onRun,
  onShare,
  isSaving = false,
  isRunning = false,
}: QueryBuilderProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [clauses, setClauses] = useState<QueryClause[]>(
    initialClauses && initialClauses.length > 0
      ? initialClauses
      : [makeClause({ logicalOperator: 'AND' })]
  );

  const updateClause = useCallback((index: number, updated: QueryClause) => {
    setClauses(prev => prev.map((c, i) => (i === index ? updated : c)));
  }, []);

  const removeClause = useCallback((index: number) => {
    setClauses(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addClause = useCallback(() => {
    setClauses(prev => [...prev, makeClause({ logicalOperator: 'AND' })]);
  }, []);

  const handleSave = () => onSave(name, description, clauses);
  const handleRun  = () => onRun(clauses);

  const hasEmptyValues = clauses.some(c => c.value.trim() === '');

  return (
    <div className="space-y-4">
      {/* Query name + description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
            Query Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. High-volume commercial keywords"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description..."
            maxLength={500}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Clause builder — Azure DevOps-style table */}
      <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-zinc-900/50 border-b border-border">
          <span className="w-20 text-[10px] font-black uppercase tracking-widest text-slate-400">And/Or</span>
          <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Field</span>
          <span className="w-36 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</span>
          <span className="flex-[2] text-[10px] font-black uppercase tracking-widest text-slate-400">Value</span>
          <span className="w-8" />
        </div>

        {/* Clause rows */}
        <div className="px-4 divide-y divide-slate-100 dark:divide-zinc-800">
          {clauses.map((clause, i) => (
            <ClauseRow
              key={clause.id}
              clause={clause}
              isFirst={i === 0}
              onChange={updated => updateClause(i, updated)}
              onRemove={() => removeClause(i)}
            />
          ))}
        </div>

        {/* Add clause */}
        <div className="px-6 py-3 border-t border-border">
          <button
            onClick={addClause}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            <Plus size={14} />
            Add new clause
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleRun}
          disabled={isRunning || clauses.length === 0 || hasEmptyValues}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 shadow-lg shadow-primary/20"
        >
          <Play size={14} />
          {isRunning ? 'Running...' : 'Run Query'}
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || clauses.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all disabled:opacity-40"
        >
          <Save size={14} />
          {isSaving ? 'Saving...' : 'Save Query'}
        </button>

        {onShare && (
          <button
            onClick={onShare}
            className={`flex items-center gap-2 px-6 py-2.5 border-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              isShared
                ? 'border-green-500 text-green-600 hover:border-green-700'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary'
            }`}
          >
            <Share2 size={14} />
            {isShared ? 'Shared with Team' : 'Share with Team'}
          </button>
        )}

        {hasEmptyValues && clauses.length > 0 && (
          <span className="text-xs text-amber-600 font-bold">Fill in all values before running.</span>
        )}
      </div>
    </div>
  );
}
