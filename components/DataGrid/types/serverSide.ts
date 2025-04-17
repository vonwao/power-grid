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
  pageInfo: PageInfo;
  refetch: () => Promise<any>;
  resetCursors?: () => void;
}
 
/**
 * Core interfaces for cursor pagination
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}
 
export interface Connection<T> {
  edges: { cursor: string; node: T }[];
  pageInfo: PageInfo;
  totalCount: number;
}
 
 