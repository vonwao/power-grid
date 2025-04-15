import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

/**
 * PageInfo interface from the Relay Cursor Connections specification
 * Contains information about whether there are more pages in either direction
 * and cursors for the start and end of the current page
 */
interface PageInfo {
  hasNextPage: boolean;    // Whether there are more items after the end cursor
  hasPreviousPage: boolean; // Whether there are more items before the start cursor
  startCursor?: string | null; // Cursor pointing to the first item in the current page
  endCursor?: string | null;   // Cursor pointing to the last item in the current page
}

/**
 * Edge interface from the Relay Cursor Connections specification
 * Represents a single item in the connection along with its cursor
 */
interface Edge<T> {
  cursor: string; // Base64-encoded cursor for pagination
  node: T;        // The actual data item
}

/**
 * Connection interface from the Relay Cursor Connections specification
 * Represents a paginated list of items with metadata
 */
interface Connection<T> {
  edges: Edge<T>[];    // Array of edges (items with cursors)
  pageInfo: PageInfo;  // Pagination metadata
  totalCount: number;  // Total number of items matching the query
}

/**
 * Hook for handling GraphQL data operations with Relay-style cursor-based pagination
 * Manages fetching data with pagination, sorting, and filtering using Apollo Client
 * 
 * This hook is specifically designed to work with a DynamoDB backend that uses
 * cursor-based pagination following the Relay Connection specification
 */
export function useRelayGraphQLData<T>({
  pageSize,
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  query,
  variables: customVariables = {},
  nodeToRow = (node: any) => node as T,
  enableBackwardPagination = false, // Set to true to enable backward pagination
}: {
  pageSize: number;  // Number of items to fetch per page
  initialPage?: number; // Starting page (0-indexed)
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[]; // Initial sort configuration
  initialFilterModel?: Record<string, any>; // Initial filter configuration
  query?: any; // GraphQL DocumentNode from Apollo
  variables?: Record<string, any>; // Additional GraphQL variables
  nodeToRow?: (node: any) => T; // Function to convert GraphQL nodes to row objects
  enableBackwardPagination?: boolean; // Whether to enable backward pagination
}): ServerSideResult<T> {
  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const [paginationDirection, setPaginationDirection] = 
    useState<'forward' | 'backward'>('forward');
  
  // State for sorting and filtering
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  
  /**
   * Convert MUI DataGrid sort model to the format expected by the backend
   * The backend expects an array of objects with 'field' and 'direction' properties
   */
  const sort = sortModel.length > 0
    ? [{ 
        field: sortModel[0].field, 
        direction: sortModel[0].sort === 'desc' ? 'DESC' : 'ASC' 
      }]
    : undefined;
  
  /**
   * Pass filter model directly to the backend
   * The backend expects a direct object with filter criteria
   * (not a JSON string as in the previous version)
   */
  const filter = Object.keys(filterModel).length > 0
    ? filterModel
    : undefined;
  
  /**
   * Prepare variables for GraphQL query based on pagination direction
   * For forward pagination: use 'first' and 'after'
   * For backward pagination: use 'last' and 'before'
   */
  // Create basic pagination variables
  const paginationVars = paginationDirection === 'forward'
    ? { first: pageSize, after: page > 0 ? cursors[page - 1] : null }
    : { last: pageSize, before: cursors[page + 1] || null };
  
  // Create variables object with pagination, sort, and filter
  const variables = {
    ...paginationVars,
    ...(sort && { sort: JSON.stringify(sort) }),
    ...(filter && { filter: JSON.stringify(filter) }),
  };
  
  /**
   * Execute the GraphQL query using Apollo Client's useQuery hook
   * This fetches data from the backend and handles loading/error states
   */
  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true, // Update loading state on refetch
    fetchPolicy: 'cache-and-network',  // Check cache but also fetch from network
    skip: !query, // Skip if no query is provided
  });
  
  /**
   * Refetch data when pagination, sorting, or filtering changes
   * This ensures we get updated data when any parameter changes
   */
  useEffect(() => {
    if (query) {
      // Use a stable reference to variables
      const stableVariables = { ...variables };
      refetch(stableVariables);
    }
  }, [page, pageSize, paginationDirection, query, refetch]);
  
  // Separate effect for sort and filter changes to avoid unnecessary refetches
  useEffect(() => {
    if (query && (sortModel.length > 0 || Object.keys(filterModel).length > 0)) {
      const stableVariables = { ...variables };
      refetch(stableVariables);
    }
  }, [sortModel, filterModel, query, refetch]);
  
  /**
   * Handle page changes with proper cursor management
   * This function updates both the page number and pagination direction
   */
  const handlePageChange = (newPage: number) => {
    // Determine if we're going forward or backward
    if (newPage > page) {
      setPaginationDirection('forward');
    } else if (newPage < page && enableBackwardPagination) {
      setPaginationDirection('backward');
    }
    
    setPage(newPage);
  };
  
  // Extract data from query result - get the first property which should be our connection
  const queryResult = data ? Object.values(data)[0] : null;
  
  // Initialize empty results
  let rows: T[] = [];
  let totalCount = 0;
  
  /**
   * Type guard to check if the result matches the Connection interface
   * This ensures we only process data that has the expected structure
   */
  const isConnection = (obj: any): obj is Connection<any> => {
    return obj && 
           typeof obj === 'object' && 
           'edges' in obj && 
           Array.isArray(obj.edges) &&
           'pageInfo' in obj &&
           'totalCount' in obj;
  };
  
  // Only process data if it matches the Connection interface
  const connection = isConnection(queryResult) ? queryResult : null;
  
  if (connection) {
    // Convert edges to rows using the provided nodeToRow function
    rows = connection.edges.map((edge) => {
      // Transform the node into a row
      const row = nodeToRow(edge.node);
      
      // Instead of modifying the original object, create a new one with the id property
      if (typeof row === 'object' && row !== null && !('id' in row)) {
        // Look for common ID patterns or fallback to the cursor
        const id =
          edge.node.id ||
          edge.node.uuid ||
          edge.node.accounting_mtm_history_id ||
          edge.node[`${Object.keys(edge.node)[0]}_id`] ||
          edge.cursor;
        
        // Create a new object with the id property
        return { ...row, id };
      }
      
      return row;
    });
    
    // Store the total count for pagination UI
    totalCount = connection.totalCount;
    
    // Store the end cursor for the current page to use for future pagination
    if (connection.pageInfo.endCursor) {
      setCursors(prev => ({
        ...prev,
        [page]: connection.pageInfo.endCursor as string,
      }));
    }
  }
  
  /**
   * Return an object with all the data and functions needed by the grid component
   * This follows the ServerSideResult interface expected by the consuming component
   */
  return {
    rows,                       // Transformed data rows
    totalRows: totalCount,      // Total count for pagination
    loading,                    // Loading state
    error: error as Error | null, // Error state
    setPage: handlePageChange,  // Function to change pages
    setSortModel,               // Function to update sorting
    setFilterModel,             // Function to update filtering
    
    // Additional properties for pagination info
    pageInfo: connection?.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null
    },
    
    // Function to explicitly set pagination direction if needed
    setPaginationDirection,
  };
}