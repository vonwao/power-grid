# Implementing Relay-Style Pagination in EnhancedDataGridGraphQL

This document outlines the implementation plan for adapting the `EnhancedDataGridGraphQL` component to work with Relay-style cursor-based pagination.

## Overview

The current implementation uses offset-based pagination with `page` and `pageSize` parameters, but we need to adapt it to work with a Relay-style GraphQL query that uses cursor-based pagination with `first` and `after` parameters.

## Implementation Steps

### 1. Create a New Hook for Relay-Style Pagination

Create a new hook called `useRelayGraphQLData` that handles cursor-based pagination:

```typescript
// components/DataGrid/hooks/useRelayGraphQLData.ts

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

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
  query?: any;
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
  });
  
  // Refetch when variables change
  useEffect(() => {
    refetch(variables);
  }, [page, pageSize, sortModel, filterModel, refetch]);
  
  // Extract data from query result
  const connection = data ? Object.values(data)[0] : null;
  
  // Process the data if it exists
  let rows: T[] = [];
  let totalCount = 0;
  
  if (connection && typeof connection === 'object' && connection !== null) {
    // Extract edges and convert to rows
    if ('edges' in connection && Array.isArray(connection.edges)) {
      rows = connection.edges.map((edge: any) => {
        // Transform the node into a row
        const row = nodeToRow(edge.node);
        
        // Ensure the row has an id property
        if (!('id' in row)) {
          (row as any).id = edge.node.accounting_mtm_history_id || edge.cursor;
        }
        
        return row;
      });
    }
    
    // Extract total count
    if ('totalCount' in connection && typeof connection.totalCount === 'number') {
      totalCount = connection.totalCount;
    }
    
    // Store cursors for pagination
    if ('pageInfo' in connection && connection.pageInfo?.endCursor) {
      setCursors(prev => ({
        ...prev,
        [page]: connection.pageInfo.endCursor,
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
```

### 2. Update the Hook Index File

Update the hooks index file to export the new hook:

```typescript
// components/DataGrid/hooks/index.ts

export * from './useGraphQLData';
export * from './useRelayGraphQLData'; // Add this line
export * from './useGridNavigation';
export * from './useSelectionModel';
export * from './useServerSideData';
export * from './useGridValidation';
export * from './usePagination';
```

### 3. Modify the EnhancedDataGridGraphQL Component

Update the component to support both pagination styles:

```typescript
// components/DataGrid/EnhancedDataGridGraphQL.tsx

// Add a new prop to the interface
export interface EnhancedDataGridGraphQLProps<T = any> {
  // ... existing props
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean;
  query?: DocumentNode;
  variables?: Record<string, any>;
  paginationStyle?: 'offset' | 'cursor'; // Add this line
  
  // ... other props
}

// In the component function
export function EnhancedDataGridGraphQL<T extends { id: GridRowId }>({
  // ... existing props
  
  // GraphQL options
  useGraphQL = true,
  forceClientSide = false,
  query,
  variables,
  paginationStyle = 'offset', // Add this line with default value
  
  // ... other props
}) {
  // ... existing code
  
  // Use GraphQL data if enabled and not forcing client-side
  const useGraphQLFetching = useGraphQL && !forceClientSide;
  
  // Determine which hook to use based on pagination style
  const isRelayCursorPagination = paginationStyle === 'cursor';
  
  // Use the appropriate hook based on pagination style
  const {
    rows: graphQLRows,
    totalRows: graphQLTotalRows,
    loading: graphQLLoading,
    setPage,
    setSortModel,
    setFilterModel,
  } = useGraphQLFetching
    ? (isRelayCursorPagination
      ? useRelayGraphQLData<T>({
          pageSize,
          initialPage: 0,
          initialSortModel: [],
          initialFilterModel: {},
          query,
          variables,
          nodeToRow: (node) => ({ ...node, id: node.accounting_mtm_history_id || node.id }),
        })
      : useGraphQLData<T>({
          pageSize,
          initialPage: 0,
          initialSortModel: [],
          initialFilterModel: {},
          query,
          variables,
        }))
    : { 
        rows: [] as T[], 
        totalRows: 0, 
        loading: false, 
        error: null, 
        setPage: () => {}, 
        setSortModel: () => {}, 
        setFilterModel: () => {} 
      };
  
  // ... rest of the component remains the same
}
```

### 4. Create a Test Page

Create a test page to verify the implementation:

```typescript
// pages/mtm-history.tsx

import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';

// GraphQL query using Relay-style pagination
const GET_MTM_HISTORY = gql`
  query MtmHistory(
    $first: Int
    $after: String
    $filter: String
    $sort: String
  ) {
    mtmHistory(first: $first, after: $after, filter: $filter, sort: $sort) {
      edges {
        cursor
        node {
          accounting_mtm_history_id
          adj_description 
          commodity
          deal_volume
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Define columns
const mtmHistoryColumns = [
  {
    field: 'accounting_mtm_history_id',
    headerName: 'ID',
    width: 120,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'adj_description',
    headerName: 'Description',
    width: 200,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'commodity',
    headerName: 'Commodity',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'deal_volume',
    headerName: 'Deal Volume',
    width: 150,
    fieldConfig: { type: 'number' as const },
  },
];

export default function MTMHistoryPage() {
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };
  
  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">MTM History</h1>
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={mtmHistoryColumns}
          rows={[]} // Empty array as fallback
          
          // GraphQL options
          useGraphQL={true}
          query={GET_MTM_HISTORY}
          paginationStyle="cursor" // Use cursor-based pagination
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={false}
          canAddRows={false}
          canSelectRows={true}
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </div>
  );
}
```

## Key Implementation Details

### Cursor Management

The `useRelayGraphQLData` hook maintains a mapping of page numbers to cursors. When a user navigates to a new page, the hook looks up the cursor for the previous page and uses it as the `after` parameter in the query.

### Data Transformation

The hook transforms the Relay-style response (with edges and nodes) into the format expected by the DataGrid component:

1. It extracts nodes from the edges array
2. It ensures each node has an `id` property (using `accounting_mtm_history_id` or the cursor)
3. It extracts the total count from the response

### Sorting and Filtering

The hook converts the DataGrid's sort and filter models into the format expected by the Relay-style query:

1. Sort model: Converted to a string with an optional `-` prefix for descending order
2. Filter model: Converted to a JSON string

## Testing the Implementation

To test the implementation:

1. Create the `useRelayGraphQLData` hook
2. Update the `EnhancedDataGridGraphQL` component
3. Create a test page that uses the component with the Relay-style query
4. Verify that pagination, sorting, and filtering work correctly

## Potential Challenges and Solutions

### Challenge: Cursor Tracking

Tracking cursors for pagination can be complex, especially when users jump between pages.

**Solution**: Maintain a mapping of page numbers to cursors and fetch missing cursors as needed.

### Challenge: Data Transformation

The Relay-style response structure is different from what the DataGrid expects.

**Solution**: Transform the data in the hook before returning it to the component.

### Challenge: Backward Compatibility

We need to support both pagination styles.

**Solution**: Add a `paginationStyle` prop to the component and use the appropriate hook based on the value.

## Conclusion

By implementing these changes, the `EnhancedDataGridGraphQL` component will be able to work with Relay-style cursor-based pagination while maintaining backward compatibility with the existing offset-based pagination.