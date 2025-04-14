import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

/**
 * Hook for handling GraphQL data operations
 * Manages fetching data with pagination, sorting, and filtering using Apollo Client
 */
export function useGraphQLData<T>({
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  query,
  variables: customVariables = {},
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
  query?: any; // DocumentNode from Apollo
  variables?: Record<string, any>;
}): ServerSideResult<T> {
  const [page, setPage] = useState(initialPage);
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);

  // Prepare variables for GraphQL query
  const variables = {
    page,
    pageSize,
    sort: sortModel.length > 0
      ? { field: sortModel[0].field, direction: sortModel[0].sort }
      : undefined,
    filter: Object.keys(filterModel).length > 0
      ? filterModel
      : undefined,
    ...customVariables, // Merge custom variables
  };

  // Execute the query - use custom query if provided, otherwise use default
  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  // Refetch when variables change
  useEffect(() => {
    refetch(variables);
  }, [page, pageSize, sortModel, filterModel, refetch]);

  // Extract data from query result
  // Try to find the first property that has rows and totalRows
  const queryResult = data ? Object.values(data)[0] : null;
  
  // Safely access rows and totalRows with type assertions
  const rows = queryResult && typeof queryResult === 'object' && queryResult !== null && 'rows' in queryResult
    ? (queryResult as any).rows
    : [];
  const totalRows = queryResult && typeof queryResult === 'object' && queryResult !== null && 'totalRows' in queryResult
    ? (queryResult as any).totalRows
    : 0;

  return {
    rows: rows as T[],
    totalRows,
    loading,
    error: error as Error | null,
    setPage,
    setSortModel,
    setFilterModel,
  };
}