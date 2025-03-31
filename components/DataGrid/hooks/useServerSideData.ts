import { useState, useEffect, useCallback, useRef } from 'react';
import { ServerSideParams, ServerSideResult } from '../types/serverSide';

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
}: ServerSideParams): ServerSideResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  
  // Use a ref to track the current request to allow cancellation
  const currentRequestRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // If there's no URL, don't fetch data
    if (!url) {
      setRows([]);
      setTotalRows(0);
      return;
    }
    
    // Cancel any in-flight request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    
    // Create a new abort controller for this request
    const abortController = new AbortController();
    currentRequestRef.current = abortController;
    
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
      
      // Fetch data with abort signal
      const response = await fetch(`${url}?${params.toString()}`, {
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      setRows(data.rows);
      setTotalRows(data.totalRows);
    } catch (err) {
      // Only set error if it's not an abort error
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestRef.current === abortController) {
        setLoading(false);
        currentRequestRef.current = null;
      }
    }
  }, [url, page, pageSize, sortModel, filterModel]);

  // Debounced fetch data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

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