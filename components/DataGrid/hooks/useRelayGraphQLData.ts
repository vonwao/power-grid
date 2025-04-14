import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

// Define types for Relay-style pagination
interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

interface Edge<T> {
  cursor: string;
  node: T;
}

interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Hook for handling GraphQL data operations with Relay-style cursor-based pagination
 * Manages fetching data with pagination, sorting, and filtering using Apollo Client
 */
export function useRelayGraphQLData<T>({
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  query,
  variables: customVariables = {},
  nodeToRow = (node: any) => node as T,
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
  query?: any; // DocumentNode from Apollo
  variables?: Record<string, any>;
  nodeToRow?: (node: any) => T;
}): ServerSideResult<T> {
  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  
  // State for sorting and filtering
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  
  // Convert sort model to sort string
  const sortString = sortModel.length > 0
    ? `${sortModel[0].sort === 'desc' ? '-' : ''}${sortModel[0].field}`
    : undefined;
  
  // Convert filter model to filter string
  const filterString = Object.keys(filterModel).length > 0
    ? JSON.stringify(filterModel)
    : undefined;
  
  // Prepare variables for GraphQL query
  const variables = {
    first: pageSize,
    after: page > 0 ? cursors[page - 1] : null,
    sort: sortString,
    filter: filterString,
    ...customVariables,
  };
  
  // Execute the query
  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    skip: !query, // Skip if no query is provided
  });
  
  // Refetch when variables change
  useEffect(() => {
    if (query) {
      refetch(variables);
    }
  }, [page, pageSize, sortModel, filterModel, refetch, query]);
  
  // Extract data from query result
  const queryResult = data ? Object.values(data)[0] : null;
  
  // Process the data if it exists
  let rows: T[] = [];
  let totalCount = 0;
  
  // Type guard to check if the result is a Connection
  const isConnection = (obj: any): obj is Connection<any> => {
    return obj && 
           typeof obj === 'object' && 
           'edges' in obj && 
           Array.isArray(obj.edges) &&
           'pageInfo' in obj &&
           'totalCount' in obj;
  };
  
  const connection = isConnection(queryResult) ? queryResult : null;
  
  if (connection) {
    // Extract edges and convert to rows
    rows = connection.edges.map((edge) => {
      // Transform the node into a row
      const row = nodeToRow(edge.node);
      
      // Ensure the row has an id property
      if (typeof row === 'object' && row !== null && !('id' in row)) {
        (row as any).id = edge.node.accounting_mtm_history_id || edge.cursor;
      }
      
      return row;
    });
    
    // Extract total count
    totalCount = connection.totalCount;
    
    // Store cursors for pagination
    if (connection.pageInfo.endCursor) {
      setCursors(prev => ({
        ...prev,
        [page]: connection.pageInfo.endCursor as string,
      }));
    }
  }
  
  return {
    rows,
    totalRows: totalCount,
    loading,
    error: error as Error | null,
    setPage,
    setSortModel,
    setFilterModel,
  };
}