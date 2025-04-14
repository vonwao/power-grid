/**
 * Types for server-side data loading
 */

/**
 * PageInfo interface for Relay-style pagination
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

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
  
  // Optional properties for Relay-style pagination
  pageInfo?: PageInfo;
  setPaginationDirection?: (direction: 'forward' | 'backward') => void;
}