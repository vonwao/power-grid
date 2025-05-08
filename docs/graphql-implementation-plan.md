# GraphQL Implementation Plan for Client Project Support

## Overview

Our current EnhancedDataGrid component uses a Relay-style cursor-based pagination approach for GraphQL data fetching. However, the client project uses a different approach with startKey-based pagination. This document outlines the changes needed to support both styles.

## Current vs. Client Implementation

### Current Implementation (Relay-style)

```typescript
// In useRelayGraphQLData.ts
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
  // params
}) {
  // Uses cursor-based pagination
  const variables = useMemo(() => {
    let cursor = null;
    if (direction === 'forward') {
      cursor = page > 0 ? cursors[page - 1] : null;
    } else if (enableBackwardPagination) {
      cursor = cursors[page + 1] || null;
    }
    
    const paginationVars =
      direction === 'forward'
        ? { first: pageSize, after: cursor }
        : { last: pageSize, before: cursor };
        
    return {
      ...paginationVars,
      ...customVariables,
      ...(sort ? { sort } : {}),
      ...(filter ? { filter } : {}),
    };
  }, [/* dependencies */]);
  
  // Expects a connection-style response with edges/nodes
  const connection = isConnection(queryResult) ? queryResult : null;
  
  const { rows, totalCount } = useMemo(() => {
    if (!connection) return { rows: [], totalCount: 0 };
    
    const processedRows = connection.edges.map((edge) => {
      const row = nodeToRow(edge.node);
      // Process row...
      return row;
    });
    
    return { rows: processedRows, totalCount: connection.totalCount };
  }, [connection, nodeToRow]);
}
```

### Client Implementation (startKey-based)

```typescript
// In client's useGraphQLData.ts
export function useGraphQLData<T>({
  pageSize,
  query,
  variables: customVariables = {},
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  nodeToRow = (data: any) => data as T,
}: {
  // params
}) {
  // Uses startKey-based pagination
  const [startKeyMap, setStartKeyMap] = useState<{
    [page: number]: string | null;
  }>({});
  
  const variables = useMemo(() => {
    const vars = {
      limit: pageSize,
      startKey: startKeyMap[page] || null,
      sort: sort,
      filter: filter,
      ...customVariables,
    };
    return vars;
  }, [pageSize, customVariables, startKeyMap, page, sort, filter, filterModel]);
  
  // Expects a direct items array
  const mtmHistory = data?.mtmHistory;
  const items = mtmHistory?.items || [];
  const lastEvaluatedKey = mtmHistory?.lastEvaluatedKey || null;
  
  useEffect(() => {
    if (lastEvaluatedKey) {
      setStartKeyMap((prev) => ({ ...prev, [page + 1]: lastEvaluatedKey }));
    }
  }, [lastEvaluatedKey, page]);
  
  // Process rows directly from items
  const rows = useMemo(() => {
    return items.map((item: any) => {
      return nodeToRow(item);
    });
  }, [items, nodeToRow]);
}
```

## Implementation Plan

### 1. Create a Unified GraphQL Data Hook

We need to create a new implementation of `useGraphQLData` that can support both pagination styles:

```typescript
// New useGraphQLData.ts
export function useGraphQLData<T>({
  pageSize,
  query,
  variables: customVariables = {},
  initialPage = 0,
  initialSortModel = [],
  initialFilterModel = {},
  nodeToRow = (data: any) => data as T,
  paginationStyle = 'startKey', // 'startKey' or 'cursor'
  enableBackwardPagination = false,
}: {
  // params including paginationStyle
}) {
  // Common state
  const [page, setPage] = useState(initialPage);
  const [sortModel, setSortModel] = useState(initialSortModel);
  const [filterModel, setFilterModel] = useState(initialFilterModel);
  
  // Pagination-specific state
  const [cursors, setCursors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [startKeyMap, setStartKeyMap] = useState<{
    [page: number]: string | null;
  }>({});
  
  // Build variables based on pagination style
  const variables = useMemo(() => {
    if (paginationStyle === 'cursor') {
      // Cursor-based pagination (Relay style)
      let cursor = null;
      if (direction === 'forward') {
        cursor = page > 0 ? cursors[page - 1] : null;
      } else if (enableBackwardPagination) {
        cursor = cursors[page + 1] || null;
      }
      
      const paginationVars =
        direction === 'forward'
          ? { first: pageSize, after: cursor }
          : { last: pageSize, before: cursor };
          
      return {
        ...paginationVars,
        ...customVariables,
        ...(sort ? { sort } : {}),
        ...(filter ? { filter } : {}),
      };
    } else {
      // StartKey-based pagination (Client style)
      return {
        limit: pageSize,
        startKey: startKeyMap[page] || null,
        sort: sort,
        filter: filter,
        ...customVariables,
      };
    }
  }, [/* dependencies */]);
  
  // Execute the query
  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !query,
  });
  
  // Process response based on pagination style
  const { rows, totalRows, pageInfo } = useMemo(() => {
    if (paginationStyle === 'cursor') {
      // Process Relay-style connection
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
      
      if (!connection) {
        return { 
          rows: [], 
          totalRows: 0,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null
          }
        };
      }
      
      const processedRows = connection.edges.map((edge) => {
        const row = nodeToRow(edge.node);
        // Ensure each row has an ID
        if (typeof row === 'object' && row !== null && !('id' in row)) {
          const id = edge.node.id || edge.node.uuid || edge.cursor;
          return { ...row, id };
        }
        return row;
      });
      
      return { 
        rows: processedRows, 
        totalRows: connection.totalCount,
        pageInfo: connection.pageInfo
      };
    } else {
      // Process Client-style items array
      const mtmHistory = data?.mtmHistory;
      const items = mtmHistory?.items || [];
      const lastEvaluatedKey = mtmHistory?.lastEvaluatedKey || null;
      
      // Update startKeyMap when lastEvaluatedKey changes
      if (lastEvaluatedKey) {
        setStartKeyMap((prev) => ({ ...prev, [page + 1]: lastEvaluatedKey }));
      }
      
      const processedRows = items.map((item: any) => {
        return nodeToRow(item);
      });
      
      return { 
        rows: processedRows, 
        totalRows: 0, // totalRows is not available with startKey pagination
        pageInfo: {
          hasNextPage: !!lastEvaluatedKey,
          hasPreviousPage: page > 0,
          startCursor: null,
          endCursor: null
        }
      };
    }
  }, [data, paginationStyle, nodeToRow, page]);
  
  // Unified page change handler
  const handlePageChange = useCallback((newPage: number) => {
    if (paginationStyle === 'cursor') {
      // Determine direction for cursor-based pagination
      const newDirection =
        newPage > page
          ? 'forward'
          : newPage < page && enableBackwardPagination
            ? 'backward'
            : 'forward';
      
      setDirection(newDirection);
    }
    
    setPage(newPage);
  }, [page, paginationStyle, enableBackwardPagination]);
  
  // Reset pagination state
  const resetPagination = useCallback(() => {
    if (paginationStyle === 'cursor') {
      setCursors({});
    } else {
      setStartKeyMap({});
    }
    setPage(0);
    setDirection('forward');
  }, [paginationStyle]);
  
  // Return unified interface
  return {
    rows,
    totalRows,
    loading,
    error: error as Error | null,
    pageInfo,
    
    // Pagination methods
    setPage: handlePageChange,
    setSortModel: (newSortModel: any) => {
      setSortModel(newSortModel);
      resetPagination();
    },
    setFilterModel: (newFilterModel: any) => {
      setFilterModel(newFilterModel);
      resetPagination();
    },
    
    // Utility methods
    refetch: () => refetch(variables),
    resetCursors: resetPagination,
  };
}
```

### 2. Update useEnhancedDataGrid to Support Both Pagination Styles

Modify the `useEnhancedDataGrid` hook to pass the appropriate `paginationStyle` to `useGraphQLData`:

```typescript
// In useEnhancedDataGrid.ts
const graphQLResult = useMemo(() => {
  if (!shouldFetchData) {
    // Return empty state...
  }
  
  try {
    return useGraphQLData<T>({
      pageSize: paginationState.pageSize,
      initialPage: paginationState.page,
      query,
      variables,
      initialFilterModel: filterObj,
      initialSortModel: sortItems,
      paginationStyle, // Pass through from props
      // Other parameters...
    });
  } catch (error) {
    // Handle error...
  }
}, [/* dependencies */]);
```

### 3. Update MTMHistoryPage to Use the New Approach

Update the `mtm-history-new.tsx` file to use the new approach:

```typescript
// In mtm-history-new.tsx
<EnhancedDataGrid
  columns={columns}
  rows={[]} // We'll let the component fetch data via GraphQL
  
  // GraphQL options
  useGraphQL={true}
  query={GET_MTM_HISTORY}
  variables={{
    limit: paginationModel.pageSize,
    filter: combinedFilter,
  }}
  paginationStyle="startKey" // Specify the client's pagination style
  
  // Other props...
/>
```

## Benefits of This Approach

1. **Unified Interface**: Both pagination styles are supported through a single interface.
2. **Backward Compatibility**: Existing code using the Relay-style pagination will continue to work.
3. **Client Support**: The client project's startKey-based pagination is now supported.
4. **Flexibility**: New projects can choose the pagination style that best fits their needs.
5. **Maintainability**: Common logic is shared between both pagination styles.

## Implementation Steps

1. Create the new `useGraphQLData.ts` file with support for both pagination styles.
2. Update `useEnhancedDataGrid.ts` to pass the pagination style to `useGraphQLData`.
3. Update `mtm-history-new.tsx` to use the new approach with `paginationStyle="startKey"`.
4. Test the implementation with both pagination styles.
5. Document the new approach for future developers.