# Unused Code Analysis

This document analyzes potentially unused, outdated, or dead code in the DataGrid component directory.

## Summary of Findings

After analyzing the codebase, I've identified several components and hooks that may be candidates for cleanup, deprecation, or relocation:

1. **useGraphQLData.ts**: Contains a hardcoded GraphQL query for employees, making it less generic and more suitable for demo purposes.
2. **ToolbarPagination.tsx**: Not used anywhere in the codebase and explicitly marked as "saved for future reference".
3. **UnifiedDataGridToolbar.tsx**: Still in use but being gradually replaced by a more modular toolbar system.
4. **graphqlGrid/**: Empty directory that appears to be unused.

## Detailed Analysis

### 1. useGraphQLData.ts

**Current Status**: 
- Located in `components/DataGrid/hooks/useGraphQLData.ts`
- A copy exists in `components/DataGrid/hooks/deprecated/useGraphQLData.ts`
- Used in several demo components:
  - `demos/kitchen-sink/KitchenSinkDemo.tsx`
  - `pages/tradingdash.tsx`
  - `demos/graphql/components/EnhancedDataGridGraphQL.tsx`
  - `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx`

**Issues**:
- Contains a hardcoded GraphQL query specifically for fetching employees
- Not generic enough for a core hook
- Schema-specific, making it less reusable

**Recommendation**:
Move this hook to a demo-specific directory since it's primarily used in demo components and contains hardcoded, schema-specific queries. This would make it clear that it's not intended for general use.

### 2. ToolbarPagination.tsx

**Current Status**:
- Located in `components/DataGrid/components/ToolbarPagination.tsx`
- Not imported or used anywhere in the codebase
- Contains a comment: "This component was originally part of UnifiedDataGridToolbar but was removed in favor of using the built-in DataGrid pagination."

**Recommendation**:
Remove this component or move it to a deprecated directory since it's explicitly marked as replaced by built-in pagination and is not used anywhere.

### 3. UnifiedDataGridToolbar.tsx

**Current Status**:
- Located in `components/DataGrid/components/UnifiedDataGridToolbar.tsx`
- Still used in `components/DataGrid/EnhancedDataGrid.tsx`
- Being gradually replaced by a more modular toolbar system:
  - `components/DataGrid/components/toolbar/DataGridToolbar.tsx`
  - `components/DataGrid/components/toolbar/DataGridToolbarLeft.tsx`
  - `components/DataGrid/components/toolbar/DataGridToolbarRight.tsx`
  - Associated hooks in `components/DataGrid/hooks/toolbar/`

**Recommendation**:
Continue the planned refactoring to replace this monolithic component with the more modular toolbar system. The extensive documentation in the `toolbar/` directory suggests this is already in progress.

### 4. graphqlGrid/ Directory

**Current Status**:
- Located at `components/DataGrid/components/graphqlGrid/`
- Empty directory with no files

**Recommendation**:
Remove this empty directory if it's not needed for future development.

## Next Steps

1. **Move useGraphQLData.ts**: Relocate to a demo-specific directory to clarify its purpose.
2. **Remove ToolbarPagination.tsx**: Delete or move to a deprecated directory.
3. **Continue Toolbar Refactoring**: Follow the existing plan to replace UnifiedDataGridToolbar with the modular system.
4. **Clean Up Empty Directories**: Remove the empty graphqlGrid/ directory.

These changes will help maintain a cleaner, more maintainable codebase by removing unused components and clarifying the purpose of specialized hooks.