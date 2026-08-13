import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Inbox, Search, TriangleAlert } from 'lucide-react';
import { Input } from '../../components/ui/input';

/**
 * The one table used across Users, Projects, Transactions and Memberships.
 *
 * Search / sort / pagination are done client-side against the already-loaded
 * dataset. That is the right trade at this data volume — the admin endpoints
 * return full lists — and it keeps filtering instant. If a list ever outgrows
 * a few thousand rows, this is the single place to swap in server-side paging.
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
  emptyTitle?: string;
  emptyBody?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
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
  emptyTitle = 'Nothing here yet',
  emptyBody = 'Records will appear as soon as there are any.',
  pageSize = 10,
  onRowClick,
}: Props<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => searchable(row).toLowerCase().includes(q));
  }, [rows, searchable, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    // Copy first — Array.sort mutates, and `filtered` can be the caller's array.
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp rather than store: deleting the last row of the last page would
  // otherwise leave `page` pointing past the end and render nothing.
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === 'asc'
          ? { key, dir: 'desc' }
          : null
        : { key, dir: 'asc' }
    );
  };

  const showToolbar = Boolean(searchable || filters || toolbarAction);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {showToolbar && (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {searchable && (
              <div className="relative sm:max-w-xs sm:flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder={searchPlaceholder}
                  className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
                />
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
                      onClick={() => {
                        filters.onChange(opt.value);
                        setPage(0);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                      {opt.count !== undefined && (
                        <span className={active ? 'ml-1.5 text-emerald-100' : 'ml-1.5 text-slate-400'}>
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {toolbarAction && <div className="shrink-0">{toolbarAction}</div>}
        </div>
      )}

      {/* Wide tables scroll inside this container so the page itself never does. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                      col.headerClassName ?? ''
                    }`}
                    aria-sort={isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 transition-colors hover:text-slate-800"
                      >
                        {col.header}
                        {isSorted ? (
                          sort!.dir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUp className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
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
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-3.5 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                  <p className="text-sm font-medium text-slate-700">Could not load this data</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{error}</p>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
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
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-slate-50 transition-colors last:border-0 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 align-middle ${col.className ?? ''}`}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-600">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
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
