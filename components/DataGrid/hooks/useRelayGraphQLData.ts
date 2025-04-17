import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult, Connection } from '../types/serverSide';
 
/**
 * Hook for handling GraphQL data operations with Relay-style cursor-based pagination
 */
export function useGraphQLData<T>({
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  query,
  variables: customVariables = {},
  nodeToRow = (node: any) => node as T,
  enableBackwardPagination = false,
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
  query?: any;
  variables?: Record<string, any>;
  nodeToRow?: (node: any) => T;
  enableBackwardPagination?: boolean;
}): ServerSideResult<T> {
  // Core state
  const [page, setPage] = useState(initialPage);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [cursors, setCursors] = useState<Record<string, string>>({});
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
 
  // Race condition prevention
  const requestIdRef = useRef(0);
 
  // Create sort and filter parameters
  const sort = useMemo(() => {
    if (sortModel.length === 0) return undefined;
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
    // Get appropriate cursor based on page and direction
    let cursor = null;
    if (direction === 'forward') {
      cursor = page > 0 ? cursors[page - 1] : null;
    } else if (enableBackwardPagination) {
      cursor = cursors[page + 1] || null;
    }
 
    // Create pagination variables
    const paginationVars =
      direction === 'forward'
        ? { first: pageSize, after: cursor }
        : { last: pageSize, before: cursor };
 
    // Return combined variables
    return {
      ...paginationVars,
      ...customVariables,
      ...(sort ? { sort } : {}),
      ...(filter ? { filter } : {}),
    };
  }, [
    page,
    direction,
    cursors,
    pageSize,
    sort,
    filter,
    customVariables,
    enableBackwardPagination,
  ]);
 
  // Track current request ID to handle race conditions
  useEffect(() => {
    requestIdRef.current = Date.now();
  }, [variables]);
 
  // Execute the query
  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !query || Object.keys(variables).length === 0,
  });
 
  // Extract and validate connection data
  const queryResult = data ? Object.values(data)[0] : null;
  const isConnection = (obj: any): obj is Connection<any> => {
    return (
      obj &&
      typeof obj === 'object' &&
      'edges' in obj &&
      'pageInfo' in obj &&
      'totalCount' in obj
    );
  };
  const connection = isConnection(queryResult) ? queryResult : null;
 
  // Process rows from connection
  const { rows, totalCount } = useMemo(() => {
    if (!connection) return { rows: [], totalCount: 0 };
 
    const processedRows = connection.edges.map((edge) => {
      const row = nodeToRow(edge.node);
 
      // Ensure each row has an ID
      if (typeof row === 'object' && row !== null && !('id' in row)) {
        const id = edge.node.id || edge.node.uuid || edge.cursor;
        return { ...row, id };
      }
 
      return row;
    });
 
    return { rows: processedRows, totalCount: connection.totalCount };
  }, [connection, nodeToRow]);
 
  // Update cursors when connection changes
  useEffect(() => {
    if (connection?.pageInfo?.endCursor) {
      setCursors((prev) => ({
        ...prev,
        [page]: connection.pageInfo.endCursor,
      }));
    }
  }, [connection, page]);
 
  // Atomic page change handler that handles direction
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === page) return;
 
      // Determine direction based on page change
      const newDirection =
        newPage > page
          ? 'forward'
          : newPage < page && enableBackwardPagination
            ? 'backward'
            : 'forward';
 
      setDirection(newDirection);
      setPage(newPage);
    },
    [page, enableBackwardPagination]
  );
 
  // Reset to page 0 when sort or filter changes
  const handleSortChange = useCallback((newSortModel: any) => {
    setSortModel(newSortModel);
    setPage(0);
    setDirection('forward');
  }, []);
 
  const handleFilterChange = useCallback((newFilterModel: any) => {
    setFilterModel(newFilterModel);
    setPage(0);
    setDirection('forward');
  }, []);
 
  // Extract page info
  const pageInfo = connection?.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  };
 
  // Return the final result
  return {
    rows,
    totalRows: totalCount,
    loading,
    error: error as Error | null,
    pageInfo,
 
    // Pagination methods
    setPage: handlePageChange,
    setSortModel: handleSortChange,
    setFilterModel: handleFilterChange,
 
    // Utility methods
    refetch: () => refetch(variables),
    resetCursors: () => {
      setCursors({});
      handlePageChange(0);
    },
 
    // // Optional debug info
    // debug: {
    //   page,
    //   direction,
    //   cursors,
    //   variables,
    //   loading,
    //   error: error ? error.message : null,
    //   rowCount: rows.length,
    //   totalCount,
    //   hasNextPage: pageInfo.hasNextPage,
    //   hasPreviousPage: pageInfo.hasPreviousPage,
    // },
  };
}
 
 