# Cleanup List for DataGrid Refactoring

This document lists the files that should be removed or refactored as part of the process to remove the react-hook-form dependency and clean up unused code.

## Files to Remove

These files are not being used and can be safely removed:

1. `components/DataGrid/context/GridEditingContext.tsx`
   - Unused context provider
   - Not exported from context/index.ts
   - No components are using this context

2. `components/DataGrid/hooks/useGridEditing.ts`
   - Imports from GridEditingContext but not used anywhere
   - Exported from hooks/index.ts but no components are importing it

3. `components/DataGridDemo.tsx`
   - Superseded by EnhancedDataGridDemo.tsx
   - Not imported or used anywhere in the application

## Files to Refactor or Implement

These files need to be refactored or implemented:

1. `components/DataGrid/components/AddRowButton.tsx`
   - Currently has functionality commented out with "add row feature deferred"
   - Either implement the feature or remove the component from the UI

## Files to Refactor to Remove react-hook-form Dependency

These files need to be updated to use our custom types instead of react-hook-form types:

1. `components/DataGrid/EnhancedDataGrid.tsx`
   - Replace RegisterOptions import with ValidationOptions from our custom types

2. `components/DataGrid/context/GridFormContext.tsx`
   - Replace FieldValues, FieldError, RegisterOptions, FieldPath imports
   - Replace SimpleFormState and SimpleFormMethods with our custom FormState and FormMethods

3. `components/DataGrid/components/ValidationIndicator.tsx`
   - Replace FieldError import with our custom FieldError type

4. `components/DataGrid/renderers/CellRenderer.tsx`
   - Replace FieldError import with our custom FieldError type

5. `components/DataGrid/renderers/EditCellRenderer.tsx`
   - Update any react-hook-form types used

## Migration Process

1. Create the custom types in `types/form.ts` (already done)
2. Update imports in all files to use our custom types
3. Refactor the form management implementation in GridFormContext.tsx
4. Remove unused files
5. Remove react-hook-form from package.json
6. Run tests to ensure everything works correctly

## Testing Strategy

After refactoring, we should test:

1. Cell editing functionality
2. Validation rules (required, min, max, pattern)
3. Row-level validation
4. Form state tracking (dirty fields, errors)
5. Visual feedback for validation errors
6. Saving changes
7. Canceling changes

## Estimated Effort

- Creating custom types: 1 day
- Refactoring components: 2-3 days
- Testing and fixing issues: 1-2 days
- Documentation: 1 day

Total: 5-7 days
