import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Table state (search, filter, sort, page) kept in the URL.
 *
 * Holding it in component state meant a filtered admin view could not be
 * shared, bookmarked, or survive a refresh — and coming back from a record
 * drawer dropped the operator on page 1 of an unfiltered list. The URL is the
 * right home for "what am I looking at".
 *
 * Keys are namespaced so a page with two tables does not have them fight over
 * `?q=`. Defaults are omitted from the URL entirely, so an untouched table
 * leaves a clean address bar.
 */

export type TableState = {
  query: string;
  filter: string;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  page: number;
};

export type TableStateSetters = {
  setQuery: (value: string) => void;
  setFilter: (value: string) => void;
  setSort: (key: string, dir: 'asc' | 'desc' | null) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

export function useTableState(
  namespace = '',
  defaults: { filter?: string } = {}
): [TableState, TableStateSetters] {
  const [params, setParams] = useSearchParams();
  const defaultFilter = defaults.filter ?? 'all';

  const key = useCallback((name: string) => (namespace ? `${namespace}_${name}` : name), [namespace]);

  const state = useMemo<TableState>(() => {
    const rawPage = Number.parseInt(params.get(key('page')) ?? '', 10);
    const rawDir = params.get(key('dir'));
    return {
      query: params.get(key('q')) ?? '',
      filter: params.get(key('f')) ?? defaultFilter,
      sortKey: params.get(key('sort')) ?? '',
      sortDir: rawDir === 'desc' ? 'desc' : 'asc',
      // URLs are 1-based for humans; the table is 0-based internally.
      page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0,
    };
  }, [params, key, defaultFilter]);

  /**
   * Apply a patch to the search params.
   *
   * `replace: true` on every write: typing in the search box would otherwise
   * push one history entry per keystroke, and the back button would walk the
   * operator backwards through their own typing.
   */
  const patch = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [name, value] of Object.entries(updates)) {
            if (value === null || value === '') next.delete(name);
            else next.set(name, value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const setters = useMemo<TableStateSetters>(
    () => ({
      // Any change to what is being filtered resets paging — page 4 of a
      // 3-page result set shows nothing.
      setQuery: (value) => patch({ [key('q')]: value || null, [key('page')]: null }),
      setFilter: (value) =>
        patch({ [key('f')]: value === defaultFilter ? null : value, [key('page')]: null }),
      setSort: (sortKey, dir) =>
        patch({
          [key('sort')]: dir ? sortKey : null,
          [key('dir')]: dir === 'desc' ? 'desc' : null,
          [key('page')]: null,
        }),
      setPage: (page) => patch({ [key('page')]: page > 0 ? String(page + 1) : null }),
      reset: () =>
        patch({
          [key('q')]: null,
          [key('f')]: null,
          [key('sort')]: null,
          [key('dir')]: null,
          [key('page')]: null,
        }),
    }),
    [patch, key, defaultFilter]
  );

  return [state, setters];
}
