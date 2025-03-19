# Architecture Evolution: Form Management in DataGrid

## Current Relationship with react-hook-form

Our DataGrid component currently has a partial dependency on `react-hook-form`, primarily using it for:

1. **Type Definitions**: We import and use types like `RegisterOptions`, `FieldError`, `FieldValues`, and `FieldPath` from react-hook-form
2. **Validation Schema Format**: Our column definitions in `EnhancedDataGridDemo.tsx` follow react-hook-form's validation schema format
3. **No Runtime Dependency**: We don't actually use react-hook-form's hooks or form state management functionality

Instead, we've implemented our own custom form management system in `GridFormContext.tsx` that mimics some of react-hook-form's concepts but operates independently.

## Roadmap for Removing react-hook-form Dependency

### Phase 1: Create Internal Type Definitions (Week 1)

1. Create a new file `types/form.ts` with our own type definitions that mirror the react-hook-form types we're using:

```typescript
// types/form.ts

// Replace react-hook-form's RegisterOptions
export interface ValidationOptions {
  required?: string | boolean;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => string | boolean | Promise<string | boolean>;
}

// Replace react-hook-form's FieldError
export interface FieldError {
  type: string;
  message?: string;
}

// Replace react-hook-form's FieldValues
export interface FieldValues {
  [key: string]: any;
}

// Replace react-hook-form's FieldPath
export type FieldPath<TFieldValues extends FieldValues> = string;
```

### Phase 2: Refactor Components to Use Internal Types (Week 2)

1. Update imports in all files to use our internal types instead of react-hook-form types:
   - `EnhancedDataGrid.tsx`
   - `GridFormContext.tsx`
   - `ValidationIndicator.tsx`
   - `CellRenderer.tsx`
   - Any other components using react-hook-form types

2. Ensure backward compatibility by maintaining the same structure and naming conventions where appropriate.

### Phase 3: Enhance Our Form Management System (Week 3)

1. Review and refine our custom form management implementation in `GridFormContext.tsx`:
   - Simplify where possible
   - Ensure all validation features work correctly
   - Add any missing functionality that would be valuable

2. Update documentation to reflect our custom form management approach.

### Phase 4: Remove react-hook-form Dependency (Week 4)

1. Remove react-hook-form from package.json
2. Run tests to ensure everything still works correctly
3. Update README to document our form validation approach

## Design Principles for Our Implementation

### 1. Preserve Familiar Concepts

We'll maintain these familiar concepts from react-hook-form:

- **Validation Schema Format**: Keep the structure of validation rules (required, min, max, pattern, etc.)
- **Error Handling**: Maintain the concept of field errors with type and message
- **Form State**: Keep tracking dirty fields, validation state, and form values

### 2. Simplify Where Possible

Our implementation should be simpler than react-hook-form since we have more specific requirements:

- Focus only on cell/row editing in a data grid context
- Remove features we don't need (like form submission, reset, etc.)
- Optimize for our specific UI patterns

### 3. Maintain Type Safety

- Ensure strong typing throughout our implementation
- Provide good TypeScript intellisense for column definitions and validation rules

## Benefits of This Approach

1. **Reduced Dependencies**: Smaller bundle size and fewer potential conflicts
2. **Simplified Implementation**: Code that's easier to understand and maintain
3. **Tailored Solution**: Form management specifically designed for data grid editing
4. **Familiar API**: Developers familiar with react-hook-form will find our API intuitive

## Files to Clean Up During This Process

As part of this refactoring, we should also remove unused files:

1. `components/DataGrid/context/GridEditingContext.tsx` - Unused context
2. `components/DataGrid/hooks/useGridEditing.ts` - Unused hook
3. `components/DataGridDemo.tsx` - Superseded by EnhancedDataGridDemo

And either implement or remove:

4. `components/DataGrid/components/AddRowButton.tsx` - Currently deferred feature
