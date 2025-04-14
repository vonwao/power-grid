# GraphQL Integration with EnhancedDataGridGraphQL

This document explains how the `EnhancedDataGridGraphQL` component integrates with GraphQL to provide server-side sorting, filtering, and pagination capabilities.

## Overview

The `EnhancedDataGridGraphQL` component is designed to work with both client-side and server-side data. When used with GraphQL, it leverages server-side operations for better performance with large datasets. The component accepts a GraphQL query and variables as props, making it flexible and reusable across different data sources.

## Component Architecture

The GraphQL integration consists of several key components:

1. **EnhancedDataGridGraphQL**: The main component that renders the data grid and handles user interactions.
2. **useGraphQLData**: A custom hook that manages the GraphQL data fetching, including pagination, sorting, and filtering.
3. **Apollo Client**: Used to execute GraphQL queries and manage the data cache.

## How to Use the Component with GraphQL

### Basic Usage

```tsx
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';

// Define your GraphQL query
const GET_DATA = gql`
  query GetData(
    $page: Int
    $pageSize: Int
    $sort: SortInput
    $filter: FilterInput
  ) {
    data(
      page: $page
      pageSize: $pageSize
      sort: $sort
      filter: $filter
    ) {
      rows {
        id
        field1
        field2
        // ... other fields
      }
      totalRows
    }
  }
`;

// Define your columns
const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'field1',
    headerName: 'Field 1',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  // ... other columns
];

// Use the component in your page/component
function MyDataGrid() {
  return (
    <EnhancedDataGridGraphQL
      columns={columns}
      rows={[]} // Fallback data if not using GraphQL
      useGraphQL={true} // Enable GraphQL fetching
      query={GET_DATA} // Pass the GraphQL query
      variables={{}} // Optional additional variables
      pageSize={25}
      // ... other props
    />
  );
}
```

### Props for GraphQL Integration

The `EnhancedDataGridGraphQL` component accepts the following props for GraphQL integration:

- `useGraphQL` (boolean): Whether to use GraphQL for data fetching.
- `forceClientSide` (boolean): Force client-side operations even when GraphQL is enabled.
- `query` (DocumentNode): The GraphQL query to execute.
- `variables` (object): Additional variables to pass to the GraphQL query.

## How Sorting, Filtering, and Pagination Work with GraphQL

### Server-Side Mode Configuration

The DataGrid is configured to use server-side mode for sorting, filtering, and pagination when GraphQL fetching is enabled:

```tsx
<DataGrid
  // ...other props
  paginationMode={useGraphQLFetching ? 'server' : 'client'}
  sortingMode={useGraphQLFetching ? 'server' : 'client'}
  filterMode={useGraphQLFetching ? 'server' : 'client'}
  // ...
/>
```

### Event Handlers for User Interactions

When users interact with the grid (sort columns, apply filters, change pages), the component captures these events and updates the GraphQL variables:

```tsx
// Pagination handler
onPaginationModelChange={(model) => {
  if (useGraphQLFetching) {
    setPage(model.page);
  }
}}

// Sorting handler
onSortModelChange={(model) => {
  if (useGraphQLFetching) {
    setSortModel(model.map(item => ({
      field: item.field,
      sort: item.sort as 'asc' | 'desc'
    })));
  }
}}

// Filtering handler
onFilterModelChange={(model) => {
  if (useGraphQLFetching) {
    const filterModel: Record<string, any> = {};
    model.items.forEach(item => {
      if (item.field && item.value !== undefined) {
        filterModel[item.field] = item.value;
      }
    });
    setFilterModel(filterModel);
  }
}}
```

### GraphQL Variables Construction

In the `useGraphQLData` hook, these state changes are used to construct the variables for the GraphQL query:

```tsx
// In useGraphQLData.ts
const variables = {
  page,
  pageSize,
  sort: sortModel.length > 0
    ? { field: sortModel[0].field, direction: sortModel[0].sort }
    : undefined,
  filter: Object.keys(filterModel).length > 0
    ? filterModel
    : undefined,
  ...customVariables, // Merge custom variables from props
};
```

### Data Refetching on State Changes

An effect hook triggers a refetch whenever any of these variables change:

```tsx
// In useGraphQLData.ts
useEffect(() => {
  refetch(variables);
}, [page, pageSize, sortModel, filterModel, refetch]);
```

### Data Flow to the Grid

The fetched data is then passed to the DataGrid:

```tsx
// In EnhancedDataGridGraphQL.tsx
const displayRows = useGraphQLFetching ? graphQLRows : rows;
const totalRows = useGraphQLFetching ? graphQLTotalRows : rows.length;

// ...

<DataGrid
  rows={displayRows}
  rowCount={totalRows}
  // ...
/>
```

## Complete Example: MTM Adjustments Grid

Here's a complete example of using the `EnhancedDataGridGraphQL` component with a GraphQL query for MTM Adjustments data:

```tsx
import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';
import { ValidationHelpers } from '../components/DataGrid/context/GridFormContext';

// Define types for MTM Adjustments
interface MTMAdjustment {
  id: number;
  deal_key: number;
  reporting_month: string;
  contract_month: string;
  contract_number: string;
  bucket_strategy: string;
  bs_netting_label: string;
  group_id: number;
  rolloff_classification: string;
  fas_161_label: string;
  strategy: string;
  fas_157_curve_rank: number;
  portfolio: string;
  modified_by: string;
  modified_on: string;
}

// GraphQL query for fetching MTMAdjustments with pagination, sorting, and filtering
const GET_MTM_ADJUSTMENTS = gql`
  query GetMTMAdjustments(
    $page: Int
    $pageSize: Int
    $sort: SortInput
    $filter: MTMAdjustmentFilterInput
  ) {
    mtmAdjustments(
      page: $page
      pageSize: $pageSize
      sort: $sort
      filter: $filter
    ) {
      rows {
        id
        deal_key
        reporting_month
        contract_month
        contract_number
        bucket_strategy
        bs_netting_label
        group_id
        rolloff_classification
        fas_161_label
        strategy
        fas_157_curve_rank
        portfolio
        modified_by
        modified_on
      }
      totalRows
    }
  }
`;

// Define columns for MTM Adjustments
const mtmAdjustmentColumns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'deal_key',
    headerName: 'Deal Key',
    width: 120,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'reporting_month',
    headerName: 'Reporting Month',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  // ... other columns
];

// Sample data for client-side fallback
const sampleMTMAdjustments: MTMAdjustment[] = [
  {
    id: 1,
    deal_key: 12345,
    reporting_month: '2023-01',
    contract_month: '2023-02',
    contract_number: 'CN-001',
    bucket_strategy: 'Strategy A',
    bs_netting_label: 'Label 1',
    group_id: 100,
    rolloff_classification: 'Class A',
    fas_161_label: 'Label X',
    strategy: 'Hedge',
    fas_157_curve_rank: 2,
    portfolio: 'Portfolio A',
    modified_by: 'John Doe',
    modified_on: '2023-01-15',
  },
  // ... other sample data
];

export default function MTMAdjustmentsPage() {
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [useGraphQLFetching, setUseGraphQLFetching] = useState(true);
  
  // Row-level validation for MTM Adjustment data
  const validateMTMAdjustmentRow = (values: any, helpers: ValidationHelpers) => {
    const errors: Record<string, string> = {};
    // Add validation logic as needed
    return errors;
  };

  // Handle save function
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Submit changes to API
  };
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };

  // Custom variables for the GraphQL query
  const variables = {
    // Any additional variables needed for the query
  };

  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">MTM Adjustments</h1>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useGraphQLFetching}
            onChange={(e) => setUseGraphQLFetching(e.target.checked)}
            className="mr-2"
          />
          Use GraphQL Fetching
        </label>
      </div>
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={mtmAdjustmentColumns}
          rows={sampleMTMAdjustments} // Used as fallback when not using GraphQL
          onSave={handleSave}
          validateRow={validateMTMAdjustmentRow}
          
          // GraphQL options
          useGraphQL={useGraphQLFetching}
          query={GET_MTM_ADJUSTMENTS} // Pass the GraphQL query
          variables={variables} // Pass variables for the query
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={true}
          canAddRows={true}
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

## Implementation Details

### useGraphQLData Hook

The `useGraphQLData` hook is responsible for managing the GraphQL data fetching. Here's a simplified version of the hook:

```tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ServerSideResult } from '../types/serverSide';

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
  // Safely access rows and totalRows with type assertions
  const queryResult = data ? Object.values(data)[0] : null;
  
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
```

## Benefits of GraphQL Integration

1. **Efficient Data Loading**: Only fetches the data needed for the current view.
2. **Reduced Network Traffic**: Server-side sorting, filtering, and pagination reduce the amount of data transferred.
3. **Better Performance**: Especially noticeable with large datasets.
4. **Flexibility**: Can work with different GraphQL schemas by passing custom queries.
5. **Seamless User Experience**: Loading states are handled automatically.

## Conclusion

The GraphQL integration with `EnhancedDataGridGraphQL` provides a powerful and flexible way to work with server-side data. By leveraging GraphQL's capabilities for data fetching, sorting, filtering, and pagination, the component delivers a smooth user experience even with large datasets.