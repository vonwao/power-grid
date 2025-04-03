import { useState, useEffect, useCallback } from 'react';
import { gql, useQuery, ApolloError } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

// GraphQL query for fetching employees with pagination, sorting, and filtering
const GET_EMPLOYEES = gql`
  query GetEmployees(
    $page: Int
    $pageSize: Int
    $sort: SortInput
    $filter: EmployeeFilterInput
  ) {
    employees(
      page: $page
      pageSize: $pageSize
      sort: $sort
      filter: $filter
    ) {
      rows {
        id
        name
        email
        age
        birthday
        active
        departmentId
        department {
          id
          label
        }
      }
      totalRows
    }
  }
`;

/**
 * Hook for handling GraphQL data operations
 * Manages fetching data with pagination, sorting, and filtering using Apollo Client
 */
export function useGraphQLData<T>({
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  initialFilterModel?: Record<string, any>;
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
  };

  // Execute the query
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  // Refetch when variables change
  useEffect(() => {
    refetch(variables);
  }, [page, pageSize, sortModel, filterModel, refetch]);

  // Extract data from query result
  const rows = data?.employees?.rows || [];
  const totalRows = data?.employees?.totalRows || 0;

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