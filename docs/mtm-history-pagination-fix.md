# MTM History Pagination Fix

This document outlines the fixes implemented for the MTM History pagination issues and the approach for testing with stable data.

## Issues Fixed

1. **Cursor Management Issue**: The way cursors were being stored and retrieved in the `useRelayGraphQLData` hook was problematic. When clicking "Next" multiple times, the cursor for subsequent pages wasn't being properly managed.

2. **Pagination Variables Construction**: The logic for constructing pagination variables needed improvement to handle multiple "Next" clicks correctly.

3. **Random Data Generation**: The mock data in the resolver was generated randomly each time, making testing inconsistent.

## Implementation Details

### 1. Cursor Management Fix

The `useRelayGraphQLData` hook has been updated to:

- Add better tracking of cursor state with improved logging
- Fix the logic for constructing pagination variables
- Ensure cursors are properly stored for each page
- Add a `lastFetchedPage` state to track which page was last fetched

```typescript
// Key changes in useRelayGraphQLData.ts
const [lastFetchedPage, setLastFetchedPage] = useState<number | null>(null);

// Improved pagination variables construction
const paginationVars = useMemo(() => {
  // For forward pagination, use the cursor from the previous page
  if (paginationDirection === "forward") {
    if (page === 0) {
      return { first: effectivePageSize, after: null };
    }
    
    const cursor = cursors[page - 1];
    return { first: effectivePageSize, after: cursor || null };
  } else {
    // For backward pagination
    const cursor = cursors[page + 1];
    return { last: effectivePageSize, before: cursor || null };
  }
}, [paginationDirection, pageSize, page, cursors]);
```

### 2. Pagination Direction Handling

The `EnhancedDataGridGraphQL` component has been updated to properly handle pagination direction:

```typescript
onPaginationModelChange={(model) => {
  if (useGraphQLFetching) {
    // For Relay cursor pagination, we need to handle "Next" and "Previous" differently
    if (paginationStyle === 'cursor') {
      // If we're going to the next page, set pagination direction to forward
      if (model.page > 0) {
        setPaginationDirection("forward");
      }
    }
    
    // Set the page
    setPage(model.page);
  }
}}
```

### 3. Stable Data Generation

A new utility has been created to generate stable data with a fixed seed:

- `utils/stableDataGenerator.ts`: Provides functions to generate stable data with a fixed seed
- `scripts/generate-stable-data.ts`: Script to generate and save stable data to a file
- Updated resolver to use the stable data from file

```typescript
// In graphql/resolvers/mtm-history.ts
function getMTMHistoryData(): MTMHistoryItem[] {
  if (!cachedMTMHistory) {
    // Try to load from file first
    const loadedData = loadDataFromFile<MTMHistoryItem[]>(STABLE_DATA_FILE);
    
    if (loadedData && loadedData.length > 0) {
      cachedMTMHistory = loadedData;
    } else {
      // Generate new data with fixed seed
      cachedMTMHistory = generateStableMTMHistoryData(500, 12345);
      
      // Save to file for future use
      saveDataToFile(cachedMTMHistory, STABLE_DATA_FILE);
    }
  }
  
  return cachedMTMHistory;
}
```

## Testing Approach

A comprehensive testing approach has been implemented:

1. **Stable Data Generation**: Data is generated with a fixed seed and saved to a file, ensuring consistent test data.

2. **Pagination Test Data**: Expected pagination results are pre-calculated and saved to a file, providing a reference for verification.

3. **Pagination Test Page**: A dedicated test page (`pages/pagination-test.tsx`) has been created to:
   - Display the paginated data
   - Allow verification against expected data
   - Show detailed error messages if verification fails

4. **Verification Utility**: The `utils/paginationTestHelper.ts` utility provides functions to:
   - Generate expected pagination test data
   - Verify actual pagination results against expected data

## How to Test

1. Generate stable data:
   ```
   npx ts-node scripts/generate-stable-data.ts
   ```

2. Generate pagination test data:
   ```
   npx ts-node scripts/generate-pagination-test-data.ts
   ```

3. Run the application and navigate to `/pagination-test`

4. Test pagination by:
   - Clicking "Next" multiple times
   - Verifying each page against expected data using the "Verify Current Page" button

## Conclusion

These fixes ensure that the Relay-style cursor-based pagination works correctly, even when clicking "Next" multiple times. The stable data generation and testing approach provide a reliable way to verify the pagination functionality.