# Add Functionality Implementation Plan

## Issues Identified

After analyzing the codebase, we've identified several issues with the "Add" functionality in the MTM History page:

1. **New Row Position**: In the `addRow` function in GridFormContext (line 700), new rows are being added to the end of the grid, not at the top:
   ```javascript
   // Add the row to the grid
   setRows(prev => [...prev, newRow]);
   ```

2. **Refetching After Save**: In the mtm-history.tsx file, the refetch function is commented out in both the save and delete handlers:
   ```javascript
   // Refetch data after saving (optional, depends on mutation response/cache updates)
   // refetch();
   ```

3. **Access to Refetch Function**: There's no clear way for the mtm-history.tsx component to access the refetch function from the EnhancedDataGridGraphQL component.

## Implementation Plan

### 1. Fix New Row Position

Modify the `addRow` function in GridFormContext to add new rows at the top of the grid:

```javascript
// Change from
setRows(prev => [...prev, newRow]);

// To
setRows(prev => [newRow, ...prev]);
```

**File**: `components/DataGrid/context/GridFormContext.tsx` (line 700)

### 2. Implement Access to Refetch Function

We need to implement the `onGridFunctionsInit` callback in the EnhancedDataGridGraphQL component to provide access to the refetch function.

1. In the EnhancedDataGridGraphQL component, extract the refetch function from graphQLResult:
   ```javascript
   const {
     rows: graphQLRows,
     totalRows: graphQLTotalRows,
     loading: graphQLLoading,
     setPage,
     setSortModel,
     setFilterModel,
     refetch, // Extract refetch
     pageInfo, // Extract pageInfo
     resetCursors, // Extract resetCursors
   } = useGraphQLFetching
     ? graphQLResult
     : { /* ... */ };
   ```

2. Add an effect to call the onGridFunctionsInit callback when the component mounts:
   ```javascript
   useEffect(() => {
     if (props.onGridFunctionsInit && useGraphQLFetching) {
       props.onGridFunctionsInit(
         refetch,
         resetCursors,
         pageInfo
       );
     }
   }, [props.onGridFunctionsInit, refetch, resetCursors, pageInfo, useGraphQLFetching]);
   ```

**File**: `components/DataGrid/EnhancedDataGridGraphQL.tsx`

### 3. Use the Refetch Function in MTM History Page

1. Add a state variable to store the refetch function:
   ```javascript
   const [refetchData, setRefetchData] = useState<() => Promise<any>>(() => Promise.resolve({ data: null }));
   ```

2. Implement the onGridFunctionsInit callback:
   ```javascript
   const handleGridFunctionsInit = (
     refetch: () => Promise<any>,
     resetCursors: () => void,
     pageInfo: any
   ) => {
     setRefetchData(() => refetch);
   };
   ```

3. Pass the callback to the EnhancedDataGridGraphQL component:
   ```jsx
   <EnhancedDataGridGraphQL
     // ... other props
     onGridFunctionsInit={handleGridFunctionsInit}
   />
   ```

4. Uncomment and update the refetch calls in the save and delete handlers:
   ```javascript
   // In handleSave
   try {
     // ... existing code
     
     // Refetch data after saving
     refetchData();
     
     alert('Changes saved (simulated). Check console.');
   } catch (error) {
     // ... error handling
   }
   
   // In handleDelete
   try {
     // ... existing code
     
     // Refetch data after deleting
     refetchData();
     
     alert(`${ids.length} row(s) deleted (simulated). Check console.`);
   } catch (error) {
     // ... error handling
   }
   ```

**File**: `pages/mtm-history.tsx`

### 4. Verify Validation Consistency

Ensure that validation rules are applied consistently in both edit and add modes:

1. Check that the same validation rules are applied in both modes
2. Verify that validation errors are displayed correctly
3. Confirm that the Save button is disabled when there are validation errors

## Testing Plan

After implementing these changes, we should test:

1. **Add Functionality**:
   - Verify that new rows are added at the top of the grid
   - Ensure all fields are editable in the new row
   - Check that validation works correctly

2. **Edit Functionality**:
   - Verify that existing rows can be edited
   - Ensure validation works correctly

3. **Save Functionality**:
   - Verify that changes are saved correctly
   - Ensure the grid is refreshed after saving

4. **Delete Functionality**:
   - Verify that rows can be deleted
   - Ensure the grid is refreshed after deleting

## Conclusion

By implementing these changes, we will ensure that the "Add" functionality in the MTM History page works correctly, with new rows added at the top of the grid and proper validation and error handling.