# MTM History Pagination Fix Plan

## Problem Analysis

We've identified two key issues with the MTM History data grid pagination:

1. **DynamoDB Error:** The backend throws an error: `Either the KeyConditions or KeyConditionExpression parameter must be specified in the request.` This occurs because DynamoDB Query operations require key conditions, but our frontend isn't sending the necessary filter variables.

2. **Pagination Issue:** When clicking the "next" button in pagination, the same records are returned repeatedly, suggesting issues with cursor handling.

## Root Causes

1. **Missing Filter Variables:** The `pages/mtm-history.tsx` component doesn't pass any initial filter variables to `EnhancedDataGridGraphQL`, which means no key conditions are sent to DynamoDB.

2. **Cursor Handling:** The backend may not be correctly using the `after` cursor to fetch the next set of records.

## Implementation Plan

### 1. Frontend Modifications

#### Update `pages/mtm-history.tsx`

Add the necessary filter variables to the `EnhancedDataGridGraphQL` component:

```tsx
<EnhancedDataGridGraphQL
  // ... existing props
  variables={{
    first: 25,
    // Add a default filter that includes the required partition key
    filter: {
      // This should match your DynamoDB table's partition key
      // For example, if your table uses 'user_id' as the partition key:
      user_id: 'default-user'
      // Or if it uses a date range:
      // date_range: { start: '2025-01-01', end: '2025-04-15' }
    },
    sort: '[{"field": "accounting_mtm_history_id", "direction": "DESC"}]',
  }}
  // ... other props
/>
```

### 2. Backend Enhancements

#### Improve the Existing Mock Resolver

Enhance `graphql/resolvers/mtm-history.ts` to better simulate DynamoDB behavior:

1. **Enforce Key Conditions:**
   - Validate that required key conditions are present in the filter
   - Return an appropriate error if they're missing

2. **Fix Filter Handling:**
   - Handle both string and object filter formats
   - Properly parse and apply filters to match DynamoDB behavior

3. **Improve Sort Handling:**
   - Parse the sort parameter correctly (it's a JSON string containing an array of objects)
   - Apply sorting based on the specified field and direction

4. **Enhance Cursor Pagination:**
   - Implement more robust cursor encoding/decoding
   - Ensure cursors correctly point to the last item of the current page
   - Properly handle the `after` parameter for subsequent page requests

### 3. Mock Implementation Details

#### Enhanced Mock Data Structure

```typescript
interface MTMHistoryItem {
  accounting_mtm_history_id: string;
  adj_description: string;
  commodity: string;
  deal_volume: number;
  // Add a timestamp field for sorting
  created_at: string;
  // Add a partition key field (e.g., user_id or date_range)
  user_id: string;
}
```

#### Key Condition Simulation

```typescript
// Simulate DynamoDB's requirement for key conditions
function validateKeyConditions(filter: any): boolean {
  // Check if the required partition key is present
  // This should match your actual DynamoDB table's partition key
  if (!filter || !filter.user_id) {
    throw new Error('KeyConditionExpression must be specified: user_id is required');
  }
  return true;
}
```

#### Improved Cursor Handling

```typescript
// Encode cursor (similar to DynamoDB's LastEvaluatedKey)
function encodeCursor(item: MTMHistoryItem): string {
  return Buffer.from(JSON.stringify({
    accounting_mtm_history_id: item.accounting_mtm_history_id,
    user_id: item.user_id
  })).toString('base64');
}

// Decode cursor
function decodeCursor(cursor: string): { accounting_mtm_history_id: string, user_id: string } {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch (e) {
    console.error('Error decoding cursor:', e);
    return { accounting_mtm_history_id: '', user_id: '' };
  }
}
```

#### Enhanced Resolver Logic

```typescript
mtmHistory: (_: any, args: {
  first?: number;
  after?: string;
  filter?: any;
  sort?: string;
}) => {
  const {
    first = 25,
    after,
    filter: rawFilter,
    sort: rawSort,
  } = args;
  
  console.log('MTM History Query:', { first, after, filter: rawFilter, sort: rawSort });
  
  // Parse filter (handle both string and object formats)
  let filter = rawFilter;
  if (typeof rawFilter === 'string') {
    try {
      filter = JSON.parse(rawFilter);
    } catch (e) {
      console.error('Error parsing filter:', e);
      filter = {};
    }
  }
  
  // Validate key conditions (simulate DynamoDB requirement)
  try {
    validateKeyConditions(filter);
  } catch (error) {
    throw new Error(`INTERNAL_SERVER_ERROR: ${error.message}`);
  }
  
  // Parse sort (handle string format)
  let sortOptions = [];
  if (rawSort) {
    try {
      sortOptions = typeof rawSort === 'string' ? JSON.parse(rawSort) : rawSort;
    } catch (e) {
      console.error('Error parsing sort:', e);
    }
  }
  
  // Get data
  let data = getMTMHistoryData();
  
  // Apply filtering
  data = applyFilters(data, filter);
  
  // Apply sorting
  data = applySorting(data, sortOptions);
  
  // Handle cursor-based pagination
  let startIndex = 0;
  if (after) {
    const decodedCursor = decodeCursor(after);
    // Find the index based on the cursor
    // This is a simplified approach - real DynamoDB would use the key directly
    startIndex = data.findIndex(item => 
      item.accounting_mtm_history_id === decodedCursor.accounting_mtm_history_id
    ) + 1;
  }
  
  // Apply pagination
  const paginatedData = data.slice(startIndex, startIndex + first);
  
  // Create edges with proper cursors
  const edges = paginatedData.map(node => ({
    cursor: encodeCursor(node),
    node,
  }));
  
  // Create page info
  const hasNextPage = startIndex + first < data.length;
  const hasPreviousPage = startIndex > 0;
  
  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount: data.length,
  };
}
```

### 4. Testing Strategy

1. **Frontend Testing:**
   - Verify that the updated `mtm-history.tsx` correctly passes filter variables
   - Test pagination by clicking through multiple pages
   - Verify that different records are returned for each page

2. **Backend Testing:**
   - Test the resolver with various filter combinations
   - Verify that missing key conditions result in the appropriate error
   - Test cursor pagination to ensure it correctly returns subsequent pages

## Implementation Steps

1. Update `pages/mtm-history.tsx` to include filter variables
2. Enhance the mock resolver in `graphql/resolvers/mtm-history.ts`
3. Test the implementation with the frontend
4. Document the changes and lessons learned

## Future Considerations

1. **Error Handling:** Improve error messages to be more descriptive about missing key conditions
2. **Performance:** For large datasets, consider more efficient cursor implementation
3. **Filter UI:** Add a UI for users to specify filter criteria
4. **Documentation:** Update API documentation to clearly indicate required filter parameters