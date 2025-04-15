import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { ServerSideResult } from "../types/serverSide";

/**
 * PageInfo interface from the Relay Cursor Connections specification
 * Contains information about whether there are more pages in either direction
 * and cursors for the start and end of the current page
 */
interface PageInfo {
  hasNextPage: boolean; // Whether there are more items after the end cursor
  hasPreviousPage: boolean; // Whether there are more items before the start cursor
  startCursor?: string | null; // Cursor pointing to the first item in the current page
  endCursor?: string | null; // Cursor pointing to the last item in the current page
}

/**
 * Edge interface from the Relay Cursor Connections specification
 * Represents a single item in the connection along with its cursor
 */
interface Edge<T> {
  cursor: string; // Base64-encoded cursor for pagination
  node: T; // The actual data item
}

/**
 * Connection interface from the Relay Cursor Connections specification
 * Represents a paginated list of items with metadata
 */
interface Connection<T> {
  edges: Edge<T>[]; // Array of edges (items with cursors)
  pageInfo: PageInfo; // Pagination metadata
  totalCount: number; // Total number of items matching the query
}

/**
 * Define GraphQLVariables type to fix type issues
 */
interface GraphQLVariables {
  first?: number;
  last?: number;
  after?: string | null;
  before?: string | null;
  sort?: string;
  filter?: string;
  [key: string]: any;
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
  enableBackwardPagination = false,
}: {
  pageSize: number;
  initialPage?: number;
  initialSortModel?: { field: string; sort: "asc" | "desc" }[];
  initialFilterModel?: Record<string, any>;
  query?: any;
  variables?: Record<string, any>;
  nodeToRow?: (node: any) => T;
  enableBackwardPagination?: boolean;
}): ServerSideResult<T> {
  // Track last fetch time to prevent excessive fetching
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const FETCH_COOLDOWN = 500; // ms

  // Keep a ref of previous variables to spot changes
  const prevVariablesRef = useRef<GraphQLVariables | null>(null);
  
  // State with proper initialization
  // State with proper initialization
const [page, setPage] = useState(initialPage);
const [cursors, setCursors] = useState<Record<number, string>>({});
const [paginationDirection, setPaginationDirection] = useState<"forward" | "backward">("forward");
const [sortModel, setSortModel] = useState(initialSortModel);
const [filterModel, setFilterModel] = useState(initialFilterModel);

  // Debug log when hook runs
  console.log("useRelayGraphQLData hook running with page:", page);

  // Memoize the sort configuration to prevent recreating on every render
  const sort = useMemo(() => {
    if (sortModel.length === 0) return undefined;
    
    // Log the sort model for debugging
    console.log('Creating sort configuration from model:', sortModel);
    
    // Create a properly formatted sort object that includes the direction
    // This ensures both ASC and DESC sorting work correctly
    const sortConfig = JSON.stringify({
      field: sortModel[0].field,
      direction: sortModel[0].sort === "desc" ? "DESC" : "ASC",
    });
    
    console.log('Generated sort configuration:', sortConfig);
    return sortConfig;
  }, [sortModel]);

  // Memoize the filter configuration
  const filter = useMemo(() => {
    if (Object.keys(filterModel).length === 0) return undefined;
    
    // Create a properly formatted filter object that includes all filter information
    // This ensures filtering works correctly with the GraphQL API
    return JSON.stringify(filterModel);
  }, [filterModel]);

  // Memoize pagination variables
  const paginationVars = useMemo(() => {
    // Ensure pageSize has a fallback value
    const effectivePageSize = pageSize || 25;

    // Add null checks for cursor access
    return paginationDirection === "forward"
      ? {
          first: effectivePageSize,
          after: page > 0 && cursors[page - 1] ? cursors[page - 1] : null,
        }
      : { last: effectivePageSize, before: cursors[page + 1] || null };
  }, [paginationDirection, pageSize, page, cursors]);

  // Add additional validation - Fixed to return empty object instead of null
  const variables = useMemo(() => {
    // Check if paginationVars is valid before creating the object
    if (!paginationVars) {
      console.warn("Invalid pagination variables");
      return {} as GraphQLVariables; // Return empty object instead of null
    }

    return {
      ...paginationVars,
      ...customVariables,
      ...(sort ? { sort } : {}),
      ...(filter ? { filter } : {}),
    } as GraphQLVariables;
  }, [paginationVars, customVariables, sort, filter]);

  // Debug log when variables change
  useEffect(() => {
    console.log("Variables changed:", {
      variables,
      prevVariablesJson: JSON.stringify(prevVariablesRef.current || {}),
      currentVariablesJson: JSON.stringify(variables || {})
    });
    prevVariablesRef.current = variables;
  }, [variables]);

  // Stable page change handler with useCallback
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage > page) {
        setPaginationDirection("forward");
      } else if (newPage < page && enableBackwardPagination) {
        setPaginationDirection("backward");
      }
      setPage(newPage);
    },
    [page, enableBackwardPagination]
  );

  // Execute query with stable variables
  const { data, loading, error, refetch } = useQuery(query, {
    variables, // Now properly typed
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: !query || Object.keys(variables).length === 0, // Skip if variables is empty
  });

  // Effect to log sort model changes
  useEffect(() => {
    console.log('Sort model changed in hook:', sortModel);
  }, [sortModel]);

  // Effect for pagination changes with throttling
  useEffect(() => {
    if (!query || Object.keys(variables).length === 0) return;
    
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('Throttling refetch - too soon since last fetch');
      return;
    }
    
    console.log('Refetching with variables:', variables);
    setLastFetchTime(now);
    refetch(variables);
  }, [query, refetch, variables, lastFetchTime]);

  // Process and transform data
  const queryResult = data ? Object.values(data)[0] : null;

  // Type guard
  const isConnection = (obj: any): obj is Connection<any> => {
    return (
      obj &&
      typeof obj === "object" &&
      "edges" in obj &&
      Array.isArray(obj.edges) &&
      "pageInfo" in obj &&
      "totalCount" in obj
    );
  };

  const connection = isConnection(queryResult) ? queryResult : null;

  // Process rows only when connection changes
  const { rows, totalCount } = useMemo(() => {
    if (!connection) {
      return { rows: [], totalCount: 0 };
    }

    const processedRows = connection.edges.map((edge) => {
      const row = nodeToRow(edge.node);

      if (typeof row === "object" && row !== null && !("id" in row)) {
        const id =
          edge.node.id ||
          edge.node.uuid ||
          edge.node.accounting_mtm_history_id ||
          edge.node[`${Object.keys(edge.node)[0]}_id`] ||
          edge.cursor;

        return { ...row, id };
      }

      return row;
    });

    return {
      rows: processedRows,
      totalCount: connection.totalCount,
    };
  }, [connection, nodeToRow]);

  // Update cursors when connection changes
  useEffect(() => {
    if (connection?.pageInfo?.endCursor) {
      setCursors((prev) => {
        // Only update if cursor has changed
        if (prev[page] === connection.pageInfo.endCursor) {
          return prev;
        }
        return {
          ...prev,
          [page]: connection.pageInfo.endCursor as string,
        };
      });
    }
  }, [connection, page]);

  // Memoize the pageInfo object
  const pageInfo = useMemo(
    () =>
      connection?.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    [connection]
  );

  // Memoize the final result object to prevent unnecessary renders
  return useMemo(
    () => ({
      rows,
      totalRows: totalCount,
      loading,
      error: error as Error | null,
      setPage: handlePageChange,
      setSortModel,
      setFilterModel,
      pageInfo,
      setPaginationDirection,
    }),
    [
      rows,
      totalCount,
      loading,
      error,
      handlePageChange,
      setSortModel,
      setFilterModel,
      pageInfo,
      setPaginationDirection,
    ]
  );
}