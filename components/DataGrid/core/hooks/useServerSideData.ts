import { useState, useEffect, useCallback } from 'react';
import { ServerSideParams, ServerSideResult } from '../types';

/**
 * Hook for handling server-side data operations
 * Manages fetching data with pagination, sorting, and filtering
 */
export function useServerSideData<T>({
  url,
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
}: {
  url: string;
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
}): ServerSideResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      
      if (sortModel.length > 0) {
        params.append('sortField', sortModel[0].field);
        params.append('sortDirection', sortModel[0].sort);
      }
      
      // Add filter parameters
      Object.entries(filterModel).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(`filter[${field}]`, String(value));
        }
      });
      
      // Fetch data
      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      setRows(data.rows);
      setTotalRows(data.totalRows);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url, page, pageSize, sortModel, filterModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    totalRows,
    loading,
    error,
    setPage,
    setSortModel,
    setFilterModel,
  };
}