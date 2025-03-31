/**
 * Types for server-side data loading
 */

/**
 * Server-side data parameters
 */
export interface ServerSideParams {
  url: string;
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
}

/**
 * Server-side data result
 */
export interface ServerSideResult<T> {
  rows: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setSortModel: (sortModel: { field: string; sort: 'asc' | 'desc' }[]) => void;
  setFilterModel: (filterModel: Record<string, any>) => void;
}