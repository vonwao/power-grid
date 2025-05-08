import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';
 
/**
 * Hook for handling GraphQL data operations with startKey-based pagination
 * 
 * This implementation follows the client project's approach to pagination.
 * 
 * NOTE: This replaces the previous Relay-style cursor-based pagination.
 * If you need to use Relay-style pagination, you'll need to modify this hook
 * or create a separate implementation.
 */
export function useGraphQLData<T>({
  pageSize,
  query,
  variables: customVariables = {},
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  nodeToRow = (data: any) => data as T,
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
  query?: any;
  variables?: Record<string, any>;
  nodeToRow?: (node: any) => T;
}): ServerSideResult<T> {
  // Core state
  const [page, setPage] = useState(initialPage);
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  const [startKeyMap, setStartKeyMap] = useState<{
    [page: number]: string | null;
  }>({});
 
  // Create sort and filter parameters
  const sort = useMemo(() => {
    if (!sortModel || sortModel.length === 0) return undefined;
    return JSON.stringify({
      field: sortModel[0].field,
      direction: sortModel[0].sort === 'desc' ? 'DESC' : 'ASC',
    });
  }, [sortModel]);
 
  const filter = useMemo(() => {
    if (Object.keys(filterModel).length === 0) return undefined;
    return JSON.stringify(filterModel);
  }, [filterModel]);
 
  // Build pagination variables
  const variables = useMemo(() => {
    const vars = {
      limit: pageSize,
      startKey: startKeyMap[page] || null,
      sort: sort,
      filter: filter,
      ...customVariables,
    };
    return vars;
  }, [pageSize, customVariables, startKeyMap, page, sort, filter]);
 
  // Execute the query
  const {
    data,
    loading,
    error,
    refetch: refetchQuery,
  } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !query,
  });
 
  const mtmHistory = data?.mtmHistory;
  const items = mtmHistory?.items || [];
  const lastEvaluatedKey = mtmHistory?.lastEvaluatedKey || null;
 
  useEffect(() => {
    if (lastEvaluatedKey) {
      setStartKeyMap((prev) => ({ ...prev, [page + 1]: lastEvaluatedKey }));
    }
  }, [lastEvaluatedKey, page]);
 
  // Process rows
  const rows = useMemo(() => {
    return items.map((item: any) => {
      return nodeToRow(item);
    });
  }, [items, nodeToRow]);
 
  // Atomic page change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
 
  // Reset to page 0 when sort or filter changes
  const handleSortChange = useCallback((newSortModel: any) => {
    setSortModel(newSortModel);
    setPage(0);
    setStartKeyMap({});
  }, []);
 
  const handleFilterChange = useCallback((newFilterModel: any) => {
    setFilterModel(newFilterModel);
    setPage(0);
    setStartKeyMap({});
  }, []);
 
  // Create a refetch function that uses the current variables
  const refetch = useCallback(() => {
    return refetchQuery({
      variables: {
        ...variables,
        filter: JSON.stringify(filterModel),
      },
    });
  }, [refetchQuery, variables, filterModel]);
  
  // Reset pagination state (equivalent to resetCursors in the old implementation)
  const resetPagination = useCallback(() => {
    setStartKeyMap({});
    setPage(0);
  }, []);
 
  // Return the final result
  return {
    rows,
    totalRows: 0, // totalRows is not available with startKey-based pagination
    loading,
    error: error as Error | null,
    pageInfo: {
      hasNextPage: !!lastEvaluatedKey,
      hasPreviousPage: page > 0,
      startCursor: null,
      endCursor: null
    },
 
    // Pagination methods
    setPage: handlePageChange,
    setSortModel: handleSortChange,
    setFilterModel: handleFilterChange,
 
    // Utility methods
    refetch,
    resetCursors: resetPagination, // Keep the same interface for backward compatibility
  };
}