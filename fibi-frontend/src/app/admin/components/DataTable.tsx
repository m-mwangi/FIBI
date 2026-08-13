import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Inbox,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { useTableState } from '../lib/useTableState';

/**
 * The one table used across Users, Projects, Transactions and Memberships.
 *
 * Search / sort / pagination are done client-side against the already-loaded
 * dataset. That is the right trade at this data volume — the admin endpoints
 * return full lists — and it keeps filtering instant. If a list ever outgrows
 * a few thousand rows, this is the single place to swap in server-side paging.
 *
 * That state lives in the URL (see useTableState), so a filtered view is
 * shareable and survives a refresh.
 */

export type Column<T> = {
  key: string;
  header: string;
  /** Cell renderer. */
  cell: (row: T) => ReactNode;
  /** Value used for sorting; omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  /** Extra classes for the cell and header (alignment, width, responsive hiding). */
  className?: string;
  headerClassName?: string;
};

export type FilterOption = { value: string; label: string; count?: number };

export type BulkAction<T> = {
  label: string;
  icon?: ReactNode;
  onClick: (rows: T[]) => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string;
  /** Fields concatenated per row and matched against the search box. */
  searchable?: (row: T) => string;
  searchPlaceholder?: string;
  /** Optional single-select filter rendered as chips. */
  filters?: { options: FilterOption[]; value: string; onChange: (value: string) => void };
  /** Rendered at the right of the toolbar — typically a primary action. */
  toolbarAction?: ReactNode;
  /** Rendered between the filters and the toolbar action. */
  toolbarExtra?: ReactNode;
  emptyTitle?: string;
  emptyBody?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  /** Enables the checkbox column and the bulk bar. */
  bulkActions?: BulkAction<T>[];
  /** Namespace for the URL params, so two tables on one page do not collide. */
  urlKey?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  error = '',
  searchable,
  searchPlaceholder = 'Search…',
  filters,
  toolbarAction,
  toolbarExtra,
  emptyTitle = 'Nothing here yet',
  emptyBody = 'Records will appear as soon as there are any.',
  pageSize = 10,
  onRowClick,
  bulkActions,
  urlKey = '',
}: Props<T>) {
  // Only query/sort/page are owned here. The filter is passed in by the
  // section, which needs its value to narrow `rows` before they ever reach this
  // component — but it stores that value through the same hook against the same
  // URL params, so the two instances stay in step without a second source of
  // truth.
  const [state, set] = useTableState(urlKey);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { query, sortKey, sortDir } = state;
  const selectable = Array.isArray(bulkActions) && bulkActions.length > 0;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => searchable(row).toLowerCase().includes(q));
  }, [rows, searchable, query]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    // Copy first — Array.sort mutates, and `filtered` can be the caller's array.
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp rather than store: deleting the last row of the last page would
  // otherwise leave `page` pointing past the end and render nothing.
  const safePage = Math.min(state.page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  // Rows can disappear underneath a selection (a delete, a refresh, a filter
  // change). Dropping ids that no longer exist keeps the bulk bar's count
  // honest and stops actions firing against ghosts.
  const liveKeys = useMemo(() => new Set(rows.map(rowKey)), [rows, rowKey]);
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set([...prev].filter((id) => liveKeys.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [liveKeys]);

  const selectedRows = useMemo(
    () => rows.filter((row) => selected.has(rowKey(row))),
    [rows, rowKey, selected]
  );

  const toggleSort = (key: string) => {
    if (sortKey !== key) return set.setSort(key, 'asc');
    if (sortDir === 'asc') return set.setSort(key, 'desc');
    return set.setSort(key, null);
  };

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Select-all acts on the whole filtered result, not just the visible page —
  // "select all" that silently means "these ten" is a footgun on a delete.
  const allFilteredKeys = useMemo(() => sorted.map(rowKey), [sorted, rowKey]);
  const allSelected = allFilteredKeys.length > 0 && allFilteredKeys.every((id) => selected.has(id));
  const someSelected = allFilteredKeys.some((id) => selected.has(id));

  const toggleAll = () =>
    setSelected((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        allFilteredKeys.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...allFilteredKeys]);
    });

  const showToolbar = Boolean(searchable || filters || toolbarAction || toolbarExtra);
  const columnCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)]">
      {/* Bulk bar replaces the toolbar while a selection is live, so the two
          never compete for the same row of space. */}
      {selectable && selected.size > 0 ? (
        <div className="adm-slide-down flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-900 px-4 py-3">
          <span className="adm-num text-sm font-semibold text-white">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="adm-focus rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {bulkActions!.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={action.disabled}
                onClick={() => action.onClick(selectedRows)}
                className={`adm-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                  action.tone === 'danger'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        showToolbar && (
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {searchable && (
                <div className="relative sm:max-w-xs sm:flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => set.setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => set.setQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {filters && (
                <div className="flex flex-wrap gap-1.5">
                  {filters.options.map((opt) => {
                    const active = filters.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => filters.onChange(opt.value)}
                        className={`adm-focus rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                        {opt.count !== undefined && (
                          <span className={`adm-num ml-1.5 ${active ? 'text-white/60' : 'text-slate-400'}`}>
                            {opt.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {toolbarExtra}
              {toolbarAction}
            </div>
          </div>
        )
      )}

      {/* Wide tables scroll inside this container so the page itself never does. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                    className="translate-y-[1px]"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500 ${
                      col.headerClassName ?? ''
                    }`}
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="adm-focus group inline-flex items-center gap-1 transition-colors hover:text-slate-800"
                      >
                        {col.header}
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-slate-700" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-slate-700" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Skeleton rows rather than a spinner: the table keeps its shape,
              // so the layout does not jump when data lands.
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {selectable && <td className="px-4 py-4" />}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-3.5 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center">
                  <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                  <p className="text-sm font-medium text-slate-700">Could not load this data</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{error}</p>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center">
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">
                    {query ? 'No matches' : emptyTitle}
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    {query ? `Nothing matches “${query}”.` : emptyBody}
                  </p>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = rowKey(row);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-b border-slate-50 transition-colors last:border-0 ${
                      isSelected
                        ? 'bg-emerald-50/40'
                        : onRowClick
                          ? 'cursor-pointer hover:bg-slate-50'
                          : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label="Select row"
                          className="translate-y-[1px]"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 align-middle ${col.className ?? ''}`}>
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-3">
          <p className="adm-num text-xs text-slate-500">
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => set.setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="adm-focus rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="adm-num px-2 text-xs font-medium text-slate-600">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => set.setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="adm-focus rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
