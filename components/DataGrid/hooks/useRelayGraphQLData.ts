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
 * Combined pagination state to prevent race conditions
 */
interface PaginationState {
  page: number;
  direction: "forward" | "backward";
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
  // For debugging and logging purposes
  const debugEnabled = true;
  const logPrefix = "📊 [useRelayGraphQLData]";
  
  const debugLog = useCallback((...args: any[]) => {
    if (debugEnabled) {
      console.log(logPrefix, ...args);
    }
  }, []);

  // Store last fetch request to prevent duplicate requests
  const lastRequestRef = useRef<string>("");
  
  // Keep track of previous variables for change detection
  const prevVariablesRef = useRef<GraphQLVariables | null>(null);
  
  // Store fetch timestamps for tracking request sequence
  const fetchTimestampsRef = useRef<Map<string, number>>(new Map());
  
  // Combined pagination state to prevent race conditions
  const [paginationState, setPaginationState] = useState<PaginationState>({
    page: initialPage,
    direction: "forward",
  });
  
  // Destructure the pagination state for easier access
  const { page, direction: paginationDirection } = paginationState;
  
  // Cursor storage with both page-indexed and explicit start/end markers
  const [cursors, setCursors] = useState<Record<string, string>>({});
  
  // State for sort and filter models
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  
  // Store whether initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Store pending navigation to resolve after data loads
  const pendingNavigationRef = useRef<number | null>(null);

  // Debug logging on mount
  useEffect(() => {
    debugLog("Hook initialized with:", {
      pageSize,
      initialPage,
      enableBackwardPagination,
    });
  }, [debugLog, pageSize, initialPage, enableBackwardPagination]);

  // Memoize the sort configuration to prevent recreating on every render
  const sort = useMemo(() => {
    if (sortModel.length === 0) return undefined;
    
    debugLog("Creating sort configuration from model:", sortModel);
    
    // Create a properly formatted sort configuration
    return JSON.stringify({
      field: sortModel[0].field,
      direction: sortModel[0].sort === "desc" ? "DESC" : "ASC",
    });
  }, [sortModel, debugLog]);

  // Memoize the filter configuration
  const filter = useMemo(() => {
    if (Object.keys(filterModel).length === 0) return undefined;
    
    debugLog("Creating filter configuration:", filterModel);
    
    // Create a properly formatted filter configuration
    return JSON.stringify(filterModel);
  }, [filterModel, debugLog]);

  // Memoize pagination variables with improved cursor management
  const paginationVars = useMemo(() => {
    // Ensure pageSize has a fallback value
    const effectivePageSize = pageSize || 25;
    
    debugLog("Building pagination variables for:", {
      page,
      direction: paginationDirection,
      cursors,
    });
    
    // Construct variables based on direction and page
    if (paginationDirection === "forward") {
      if (page === 0) {
        return { first: effectivePageSize, after: null };
      }
      
      // For forward pagination beyond page 0, we need the cursor from previous page
      // Try both traditional and explicit cursor formats
      const cursor = cursors[page - 1] || cursors[`${page-1}-end`];
      
      if (!cursor && page > 0) {
        debugLog(`⚠️ Warning: Missing cursor for page ${page-1}. Navigation might fail.`);
      }
      
      return { first: effectivePageSize, after: cursor || null };
    } else {
      // For backward pagination, use the cursor from next page
      const cursor = cursors[page + 1] || cursors[`${page+1}-start`];
      
      if (!cursor) {
        debugLog(`⚠️ Warning: Missing cursor for page ${page+1}. Navigation might fail.`);
      }
      
      return { last: effectivePageSize, before: cursor || null };
    }
  }, [paginationDirection, page, pageSize, cursors, debugLog]);

  // Combine all variables into a single object
  const variables = useMemo(() => {
    // Check if paginationVars is valid
    if (!paginationVars) {
      debugLog("⚠️ Warning: Invalid pagination variables");
      return {} as GraphQLVariables;
    }

    const result = {
      ...paginationVars,
      ...customVariables,
      ...(sort ? { sort } : {}),
      ...(filter ? { filter } : {}),
    } as GraphQLVariables;
    
    const varsJSON = JSON.stringify(result);
    
    // Log only when variables actually change
    if (JSON.stringify(prevVariablesRef.current) !== varsJSON) {
      debugLog("Variables changed:", {
        current: result,
        previous: prevVariablesRef.current,
      });
      
      prevVariablesRef.current = { ...result };
    }
    
    return result;
  }, [paginationVars, customVariables, sort, filter, debugLog]);

  // Atomic page change handler with direction management
  const handlePageChange = useCallback(
    (newPage: number) => {
      debugLog(`Page change requested: ${page} → ${newPage}`);
      
      if (newPage === page) {
        debugLog("Ignoring page change to same page");
        return;
      }
      
      // Determine direction based on the page change
      const newDirection = newPage > page
        ? "forward"
        : (newPage < page && enableBackwardPagination ? "backward" : "forward");
      
      debugLog(`Setting direction to ${newDirection} for page change ${page} → ${newPage}`);
      
      // Store pending navigation to resolve after data loads
      pendingNavigationRef.current = newPage;
      
      // Update both page and direction atomically
      setPaginationState({
        page: newPage,
        direction: newDirection,
      });
    },
    [page, enableBackwardPagination, debugLog]
  );

  // Execute query with improved cache handling
  const { data, loading, error, refetch } = useQuery(query, {
    variables, // Now properly typed
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network", // Check cache but still make network request
    nextFetchPolicy: "cache-first", // For subsequent fetches within the component lifecycle
    skip: !query || Object.keys(variables).length === 0, // Skip if variables is empty
  });

  // Record request timing for tracking
  useEffect(() => {
    if (!loading && Object.keys(variables).length > 0) {
      const requestKey = JSON.stringify(variables);
      
      // Record the request timestamp if it's a new request
      if (requestKey !== lastRequestRef.current) {
        lastRequestRef.current = requestKey;
        fetchTimestampsRef.current.set(requestKey, Date.now());
        debugLog(`Request started: ${requestKey}`);
      }
    }
  }, [loading, variables, debugLog]);

  // Force refetch when variables change to ensure fresh data
  useEffect(() => {
    if (!query || Object.keys(variables).length === 0) return;
    
    const requestKey = JSON.stringify(variables);
    
    // Only refetch if this is a new request (avoid duplicate requests)
    if (lastRequestRef.current !== requestKey) {
      debugLog(`Refetching data with variables:`, variables);
      
      refetch(variables).then(() => {
        debugLog(`✅ Refetch complete for page ${page}`);
      }).catch(err => {
        debugLog(`❌ Refetch error for page ${page}:`, err);
      });
    }
  }, [query, refetch, variables, page, debugLog]);

  // Process and transform data
  const queryResult = data ? Object.values(data)[0] : null;

  // Type guard to validate connection structure
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

  // Validate connection format
  const connection = isConnection(queryResult) ? queryResult : null;

  // Process rows only when connection changes
  const { rows, totalCount } = useMemo(() => {
    if (!connection) {
      return { rows: [], totalCount: 0 };
    }

    debugLog(`Processing ${connection.edges.length} rows for page ${page}`);
    
    // Mark initial data as loaded
    if (!initialDataLoaded && connection.edges.length > 0) {
      setInitialDataLoaded(true);
    }

    const processedRows = connection.edges.map((edge) => {
      const row = nodeToRow(edge.node);

      // Ensure each row has an ID
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
  }, [connection, page, nodeToRow, initialDataLoaded, debugLog]);

  // Update cursors when connection changes with improved cursor management
  useEffect(() => {
    if (!connection?.pageInfo) return;
    
    debugLog("Updating cursors from pageInfo:", {
      page,
      startCursor: connection.pageInfo.startCursor,
      endCursor: connection.pageInfo.endCursor,
    });
    
    setCursors(prev => {
      const newCursors = { ...prev };
      
      // Store both explicit start/end cursors and traditional format
      if (connection.pageInfo.startCursor) {
        newCursors[`${page}-start`] = connection.pageInfo.startCursor;
      }
      
      if (connection.pageInfo.endCursor) {
        // Store as explicit end cursor
        newCursors[`${page}-end`] = connection.pageInfo.endCursor;
        
        // Also store in traditional format for backward compatibility
        newCursors[page.toString()] = connection.pageInfo.endCursor;
      }
      
      return newCursors;
    });
  }, [connection, page, debugLog]);
  
  // Debug logging for cursor state changes
  useEffect(() => {
    debugLog("Cursor state updated:", cursors);
  }, [cursors, debugLog]);
  
  // Clear pending navigation when data loads
  useEffect(() => {
    if (!loading && pendingNavigationRef.current !== null) {
      debugLog(`Resolving pending navigation to page ${pendingNavigationRef.current}`);
      pendingNavigationRef.current = null;
    }
  }, [loading, debugLog]);

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

  // Methods for pagination control
  const pagination = useMemo(() => ({
    setPage: handlePageChange,
    
    setSortModel: (newSortModel: typeof sortModel) => {
      debugLog("Setting sort model:", newSortModel);
      setSortModel(newSortModel);
      
      // Reset to first page when sorting changes
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    
    setFilterModel: (newFilterModel: typeof filterModel) => {
      debugLog("Setting filter model:", newFilterModel);
      setFilterModel(newFilterModel);
      
      // Reset to first page when filtering changes
      if (page !== 0) {
        handlePageChange(0);
      }
    },
    
    setPaginationDirection: (newDirection: "forward" | "backward") => {
      debugLog(`Setting pagination direction: ${paginationDirection} → ${newDirection}`);
      
      setPaginationState(prev => ({
        ...prev,
        direction: newDirection,
      }));
    },
    
    // Helper for debugging
    resetCursors: () => {
      debugLog("Resetting all cursors");
      setCursors({});
      handlePageChange(0);
    },
  }), [page, handlePageChange, paginationDirection, debugLog]);

  // Create debug info
  const debugInfo = useMemo(() => ({
    page,
    direction: paginationDirection,
    cursors,
    variables,
    loading,
    error: error ? error.message : null,
    rowCount: rows.length,
    totalCount,
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: pageInfo.hasPreviousPage,
  }), [
    page, 
    paginationDirection, 
    cursors, 
    variables, 
    loading, 
    error, 
    rows.length, 
    totalCount, 
    pageInfo.hasNextPage, 
    pageInfo.hasPreviousPage
  ]);

  // Memoize the final result object to prevent unnecessary renders
  return useMemo(() => ({
    // Data
    rows,
    totalRows: totalCount,
    loading,
    error: error as Error | null,
    pageInfo,
    
    // Methods
    setPage: pagination.setPage,
    setSortModel: pagination.setSortModel,
    setFilterModel: pagination.setFilterModel,
    setPaginationDirection: pagination.setPaginationDirection,
    
    // Debugging helper
    debug: debugInfo,
    
    // Force refetch method
    refetch: () => {
      debugLog("Manually forcing refetch");
      return refetch(variables);
    },
    
    // Reset cursors method
    resetCursors: pagination.resetCursors,
  }), [
    rows,
    totalCount,
    loading,
    error,
    pageInfo,
    pagination,
    variables,
    refetch,
    debugInfo,
    debugLog
  ]);
}