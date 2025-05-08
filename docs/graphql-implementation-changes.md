# GraphQL Implementation Changes

## Overview

We've updated the GraphQL data fetching implementation in the EnhancedDataGrid component to use the client project's startKey-based pagination approach instead of the previous Relay-style cursor-based pagination.

## Key Changes

1. **Replaced useRelayGraphQLData with useGraphQLData**
   - Implemented a new version of useGraphQLData that uses startKey-based pagination
   - Removed the Relay-style cursor-based pagination implementation

2. **Updated Hook Parameters**
   - Changed parameter names to match the client project's implementation
   - Simplified the interface to focus on the startKey approach

3. **Modified Response Handling**
   - Updated to handle the client project's response format (items array instead of edges/nodes)
   - Implemented startKey tracking for pagination

4. **Updated Component Integration**
   - Modified useEnhancedDataGrid to work with the new useGraphQLData hook
   - Updated EnhancedDataGridGraphQL to use the correct parameter names

## Implementation Details

### New useGraphQLData Hook

The new implementation follows the client project's approach:

```typescript
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
  
  // Build variables with startKey
  const variables = useMemo(() => {
    const vars = {
      limit: pageSize,
      startKey: startKeyMap[page] || null,
      sort: sort,
      filter: filter,
      ...customVariables,
    };
    return vars;
  }, [/* dependencies */]);
  
  // Process response
  const mtmHistory = data?.mtmHistory;
  const items = mtmHistory?.items || [];
  const lastEvaluatedKey = mtmHistory?.lastEvaluatedKey || null;
  
  // Update startKeyMap for pagination
  useEffect(() => {
    if (lastEvaluatedKey) {
      setStartKeyMap((prev) => ({ ...prev, [page + 1]: lastEvaluatedKey }));
    }
  }, [lastEvaluatedKey, page]);
}
```

### Integration with EnhancedDataGrid

The EnhancedDataGrid component now uses the new useGraphQLData hook:

```typescript
// In useEnhancedDataGrid.ts
const graphQLResult = useMemo(() => {
  if (!shouldFetchData) {
    // Return empty state...
  }
  
  try {
    return useGraphQLData<T>({
      pageSize: paginationState.pageSize,
      query,
      variables,
      initialPage: paginationState.page,
      initialSortModel: sortItems,
      initialFilterModel: filterObj,
      nodeToRow: (node: any) => node as T,
    });
  } catch (error) {
    // Handle error...
  }
}, [/* dependencies */]);
```

## Usage in MTMHistoryPage

The MTMHistoryPage component now uses the EnhancedDataGrid with the new GraphQL implementation:

```typescript
<EnhancedDataGrid
  columns={columns}
  rows={[]} // We'll let the component fetch data via GraphQL
  
  // GraphQL options
  useGraphQL={true}
  query={GET_MTM_HISTORY}
  variables={{
    limit: paginationModel.pageSize,
    filter: combinedFilter,
    // The startKey will be managed by the useGraphQLData hook
  }}
  
  // Other props...
/>
```

## Notes for Future Development

If Relay-style cursor-based pagination is needed in the future, the implementation will need to be modified to support both approaches. This could be done by:

1. Adding a `paginationStyle` parameter to the useGraphQLData hook
2. Implementing conditional logic based on the pagination style
3. Updating the interface to support both approaches

For now, we've focused on simplicity and supporting the client project's immediate needs.