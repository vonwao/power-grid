# Enhanced Data Grid Implementation Plan

Based on a thorough analysis of the existing codebase, this document outlines the detailed implementation plan for enhancing the DataGrid component with a new master hook and additional UI components.

## File Structure Overview

```
components/
└── DataGrid/
    ├── index.ts                            // Main export file (existing)
    ├── EnhancedDataGridGraphQL.tsx         // Main component (existing, to be modified)
    ├── hooks/
    │   ├── index.ts                        // Hook exports (existing, to be updated)
    │   ├── useEnhancedDataGrid.ts          // New master hook (to be created)
    │   ├── useGraphQLData.ts               // Existing hook
    │   ├── useSelectionModel.ts            // Existing hook
    │   └── ...                             // Other existing hooks
    ├── context/
    │   ├── GridFormContext.tsx             // Existing context
    │   ├── GridModeContext.tsx             // Existing context
    │   └── ...                             // Other existing contexts
    ├── components/
    │   ├── toolbar/                        // New folder for toolbar components
    │   │   ├── DynamicToolbar.tsx          // New component (to be created)
    │   │   ├── EditModeToolbar.tsx         // New component (to be created)
    │   │   └── ViewModeToolbar.tsx         // New component (to be created)
    │   ├── EmptyStateOverlay.tsx           // New component (to be created)
    │   ├── CustomColumnMenu.tsx            // New component (to be created)
    │   └── ...                             // Existing components
    └── types/
        ├── index.ts                        // Type exports (existing)
        ├── columnConfig.ts                 // Extended column types (to be created)
        └── ...                             // Other existing type files
## Implementation Steps

### 1. Create the Master Hook: `useEnhancedDataGrid.ts`

This will be a composition hook that combines functionality from other hooks while adding new features.

```typescript
// hooks/useEnhancedDataGrid.ts
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GridFilterModel, GridSortModel, GridRowId } from '@mui/x-data-grid';
import { useGraphQLData } from './useRelayGraphQLData';
import { useSelectionModel } from './useSelectionModel';
import { usePagination } from './usePagination';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';

export interface EnhancedDataGridHookOptions<T = any> {
  // Base props
  columns: EnhancedColumnConfig[];
  rows: T[];
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean;
  query?: any;
  variables?: Record<string, any>;
  paginationStyle?: 'cursor' | 'offset' | 'key';
  
  // New feature: conditional loading
  onlyLoadWithFilters?: boolean;
  
  // Pagination options
  pageSize?: number;
  initialPage?: number;
  paginationMode?: 'client' | 'server';
  
  // Sorting and filtering options
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'client' | 'server';
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  filterMode?: 'client' | 'server';
  
  // Selection options
  selectionModel?: GridRowId[];
  onSelectionModelChange?: (selectionModel: GridRowId[]) => void;
  
  // Other options
  loading?: boolean;
}

export interface EnhancedDataGridHookResult<T = any> {
  // Grid configuration
  columns: EnhancedColumnConfig[];
  rows: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
  
  // State tracking
  filtersApplied: boolean;
  
  // Event handlers
  handleFilterModelChange: (model: GridFilterModel) => void;
  handleSortModelChange: (model: GridSortModel) => void;
  handlePaginationModelChange: (model: any) => void;
  
  // Hooks state
  selectionState: any;
  paginationState: any;
  
  // GraphQL utilities
  refetch: () => Promise<any>;
  resetCursors: () => void;
  pageInfo: any;
  
  // Component flags
  isEmpty: boolean;
  isLoadingWithoutFilters: boolean;
}
```
```typescript
export function useEnhancedDataGrid<T extends { id: GridRowId }>({
  // Base props
  columns,
  rows,
  // GraphQL options
  useGraphQL = true,
  forceClientSide = false,
  query,
  variables,
  paginationStyle = 'cursor',
  // New feature: conditional loading
  onlyLoadWithFilters = false,
  // Pagination options
  pageSize = 25,
  initialPage = 0,
  paginationMode = 'server',
  // Sorting and filtering options
  sortModel: initialSortModel,
  onSortModelChange: externalOnSortModelChange,
  sortingMode = 'server',
  filterModel: initialFilterModel,
  onFilterModelChange: externalOnFilterModelChange,
  filterMode = 'server',
  // Selection options
  selectionModel: initialSelectionModel,
  onSelectionModelChange,
  // Other options
  loading: externalLoading = false,
}: EnhancedDataGridHookOptions<T>): EnhancedDataGridHookResult<T> {
  console.log('[useEnhancedDataGrid] Initializing with:', {
    columnsCount: columns?.length,
    rowsCount: rows?.length,
    useGraphQL,
    onlyLoadWithFilters
  });
  
  // State for tracking if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Determine if GraphQL fetching should be used
  const useGraphQLFetching = useMemo(
    () => useGraphQL && !forceClientSide,
    [useGraphQL, forceClientSide]
  );
  
  // Setup filter and sort models with proper state tracking
  const [internalFilterModel, setInternalFilterModel] = useState<GridFilterModel>(
    initialFilterModel || { items: [] }
  );
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>(
    initialSortModel || []
  );
  
  // Use appropriate hooks based on configuration
  const selectionState = useSelectionModel({
    selectionModel: initialSelectionModel,
    onSelectionModelChange,
  });
  
  const paginationState = usePagination({
    initialPage,
    initialPageSize: pageSize,
  });
  
  // Determine if data should be fetched
  const shouldFetchData = useMemo(() => {
    if (!useGraphQLFetching) return false;
    if (!onlyLoadWithFilters) return true;
    return filtersApplied;
  }, [useGraphQLFetching, onlyLoadWithFilters, filtersApplied]);
  
  // Setup GraphQL data with conditional fetching
  const graphQLResult = useMemo(() => {
    if (!shouldFetchData) {
      console.log('[useEnhancedDataGrid] Skipping GraphQL fetch - conditions not met');
      return {
        rows: [],
        totalRows: 0,
        loading: false,
        error: null,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false, 
          startCursor: null,
          endCursor: null
        },
        setPage: () => {},
        setSortModel: () => {},
        setFilterModel: () => {},
        refetch: () => Promise.resolve({ data: null }),
        resetCursors: () => {}
      };
    }
    
    console.log('[useEnhancedDataGrid] Initiating GraphQL fetch');
    try {
      return useGraphQLData<T>({
        pageSize: paginationState.pageSize,
        initialPage: paginationState.page,
        query,
        variables,
        initialFilterModel: internalFilterModel.items.length > 0 ? 
          internalFilterModel.items.reduce((acc, item) => {
            if (item.field && item.value !== undefined) {
              acc[item.field] = {
                value: item.value,
                operator: item.operator || 'contains'
              };
            }
            return acc;
          }, {} as Record<string, any>) : 
          {},
        initialSortModel: internalSortModel.length > 0 ? 
          internalSortModel.map(item => ({
            field: item.field,
            sort: item.sort
          })) : 
          [],
      });
    } catch (error) {
      console.error('[useEnhancedDataGrid] Error setting up GraphQL data:', error);
      // Return empty/default state on error
      return {
        rows: [],
        totalRows: 0,
        loading: false,
        error,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false, 
          startCursor: null,
          endCursor: null
        },
        setPage: () => {},
        setSortModel: () => {},
        setFilterModel: () => {},
        refetch: () => Promise.resolve({ data: null }),
        resetCursors: () => {}
      };
    }
  }, [
    shouldFetchData, 
    paginationState.pageSize, 
    paginationState.page, 
    query, 
    variables, 
    internalFilterModel, 
    internalSortModel
  ]);
```
// Process columns to add custom menu options
  const processedColumns = useMemo(() => {
    return columns.map((column: EnhancedColumnConfig) => {
      // Base column configuration
      const baseColumn = {
        ...column,
        // Existing transformations
      };
      
      // Add custom menu options if provided
      if (column.menuOptions) {
        baseColumn.columnMenuItems = (colDef: any) => {
          const items = [];
          
          // Add standard items if enabled (default to showing them)
          if (column.menuOptions?.showSortAsc !== false) items.push('columnMenuSortAsc');
          if (column.menuOptions?.showSortDesc !== false) items.push('columnMenuSortDesc');
          if (column.menuOptions?.showFilter !== false) items.push('columnMenuFilterItem');
          if (column.menuOptions?.showColumnSelector !== false) items.push('columnMenuColumnsItem');
          
          // Add custom items
          column.menuOptions?.customItems?.forEach(item => {
            items.push({
              label: item.label,
              icon: item.icon,
              onClick: () => {
                try {
                  item.onClick(colDef);
                } catch (error) {
                  console.error(`[useEnhancedDataGrid] Error in custom menu item click handler:`, error);
                }
              }
            });
          });
          
          return items;
        };
      }
      
      return baseColumn;
    });
  }, [columns]);
  
  // Determine displayed rows based on configuration
  const displayRows = useMemo(() => {
    if (useGraphQLFetching) {
      if (onlyLoadWithFilters && !filtersApplied) {
        console.log('[useEnhancedDataGrid] Returning empty rows - filters not applied');
        return [];
      }
      return graphQLResult.rows || [];
    }
    return rows || [];
  }, [useGraphQLFetching, onlyLoadWithFilters, filtersApplied, graphQLResult.rows, rows]);
  
  // Enhanced filter handler that tracks filter application
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    console.log('[useEnhancedDataGrid] Filter model changed:', newModel);
    
    // Update internal state
    setInternalFilterModel(newModel);
    
    // Track if filters have been applied
    setFiltersApplied(newModel.items && newModel.items.length > 0);
    
    // If using GraphQL with server-side filtering
    if (useGraphQLFetching && shouldFetchData) {
      try {
        // Pass filter to GraphQL hook
        const filterObj: Record<string, any> = {};
        newModel.items.forEach(item => {
          if (item.field && item.value !== undefined) {
            filterObj[item.field] = {
              value: item.value,
              operator: item.operator || 'contains'
            };
          }
        });
        
        graphQLResult.setFilterModel?.(filterObj);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying filter:', error);
      }
    }
    
    // Call external handler if provided
    if (externalOnFilterModelChange) {
      externalOnFilterModelChange(newModel);
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setFilterModel, 
    externalOnFilterModelChange
  ]);
  
  // Enhanced sort handler
  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    console.log('[useEnhancedDataGrid] Sort model changed:', newModel);
    
    // Update internal state
    setInternalSortModel(newModel);
    
    // If using GraphQL with server-side sorting
    if (useGraphQLFetching && shouldFetchData) {
      try {
        // Pass sort to GraphQL hook
        const sortItems = newModel.map(item => ({
          field: item.field,
          sort: item.sort
        }));
        
        graphQLResult.setSortModel?.(sortItems);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying sort:', error);
      }
    }
    
    // Call external handler if provided
    if (externalOnSortModelChange) {
      externalOnSortModelChange(newModel);
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setSortModel, 
    externalOnSortModelChange
  ]);
  
  // Enhanced pagination handler
  const handlePaginationModelChange = useCallback((newModel: any) => {
    console.log('[useEnhancedDataGrid] Pagination model changed:', newModel);
    
    // Update internal state
    paginationState.setPage(newModel.page);
    paginationState.setPageSize(newModel.pageSize);
    
    // If using GraphQL with server-side pagination
    if (useGraphQLFetching && shouldFetchData) {
      try {
        // Pass page to GraphQL hook
        graphQLResult.setPage?.(newModel.page);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying pagination:', error);
      }
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setPage, 
    paginationState
  ]);
  
  // Calculate total rows
  const totalRows = useMemo(() => {
    if (useGraphQLFetching) {
      return graphQLResult.totalRows || 0;
    }
    return rows?.length || 0;
  }, [useGraphQLFetching, graphQLResult.totalRows, rows?.length]);
  
  // Combine loading states
  const loading = useMemo(() => {
    return externalLoading || graphQLResult.loading;
  }, [externalLoading, graphQLResult.loading]);
  
  // Return everything the component needs
  return {
    // Grid configuration
    columns: processedColumns,
    rows: displayRows,
    totalRows,
    loading,
    error: graphQLResult.error,
    
    // State tracking
    filtersApplied,
    
    // Event handlers
    handleFilterModelChange,
    handleSortModelChange,
    handlePaginationModelChange,
    
    // Hooks state
    selectionState,
    paginationState,
    
    // GraphQL utilities
    refetch: graphQLResult.refetch,
    resetCursors: graphQLResult.resetCursors,
    pageInfo: graphQLResult.pageInfo,
    
    // Component flags
    isEmpty: displayRows.length === 0,
    isLoadingWithoutFilters: onlyLoadWithFilters && !filtersApplied
  };
}
```
### 2. Create the New UI Components

#### a. EmptyStateOverlay Component

```typescript
// components/EmptyStateOverlay.tsx
import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

interface EmptyStateOverlayProps {
  onFilterClick?: () => void;
}

export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({ 
  onFilterClick 
}) => {
  return (
    <Box 
      className="flex flex-col items-center justify-center h-full p-8"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
      }}
    >
      <FilterAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6">No Results to Display</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        Apply filters to load data for this grid
      </Typography>
      {onFilterClick && (
        <Button 
          variant="outlined" 
          startIcon={<FilterAltIcon />} 
          onClick={onFilterClick}
          size="small"
        >
          Open Filters
        </Button>
      )}
    </Box>
  );
};
```

#### b. Toolbar Components

```typescript
// components/toolbar/ViewModeToolbar.tsx
import React from 'react';
import { 
  GridToolbarContainer, 
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarExportButton
} from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGridMode } from '../../context/GridModeContext';

export const ViewModeToolbar = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { 
    addRow, 
    selectionModel, 
    clearSelection, 
    canAddRows 
  } = useGridMode();
  
  return (
    <GridToolbarContainer ref={ref}>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarExportButton />
      
      {canAddRows && (
        <Button 
          startIcon={<AddIcon />} 
          onClick={addRow}
          size="small"
        >
          Add
        </Button>
      )}
      
      {selectionModel.length > 0 && (
        <Chip 
          label={`${selectionModel.length} selected`}
          onDelete={clearSelection}
          size="small"
          sx={{ ml: 2 }}
        />
      )}
      
      {/* Custom actions */}
      {props.children}
    </GridToolbarContainer>
  );
});
```

```typescript
// components/toolbar/EditModeToolbar.tsx
import React from 'react';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useGridMode } from '../../context/GridModeContext';

export const EditModeToolbar = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { 
    saveChanges, 
    cancelChanges, 
    hasValidationErrors,
    isAddingRow,
    editingRowCount
  } = useGridMode();
  
  const actionLabel = isAddingRow ? 'Add' : 'Save';
  
  return (
    <GridToolbarContainer ref={ref}>
      <Button 
        startIcon={<SaveIcon />} 
        onClick={saveChanges}
        disabled={hasValidationErrors}
        color="primary"
        size="small"
      >
        {actionLabel}
      </Button>
      
      <Button 
        startIcon={<CloseIcon />} 
        onClick={cancelChanges}
        size="small"
      >
        Cancel
      </Button>
      
      {/* Status indicators */}
      {isAddingRow ? (
        <Chip 
          label="Adding new record" 
          color="success" 
          size="small" 
          sx={{ ml: 2 }}
        />
      ) : editingRowCount > 0 && (
        <Chip 
          label={`Editing ${editingRowCount} record(s)`} 
          color="primary" 
          size="small" 
          sx={{ ml: 2 }}
        />
      )}
      
      {hasValidationErrors && (
        <Chip 
          label="Fix validation errors" 
          color="error" 
          size="small"
          sx={{ ml: 1 }}
        />
      )}
      
      {/* Pass through children for extensibility */}
      {props.children}
    </GridToolbarContainer>
  );
});
```
```typescript
// components/toolbar/DynamicToolbar.tsx
import React, { useCallback } from 'react';
import { ViewModeToolbar } from './ViewModeToolbar';
import { EditModeToolbar } from './EditModeToolbar';
import { useGridMode } from '../../context/GridModeContext';
import { GridToolbarProps } from '@mui/x-data-grid';

export interface DynamicToolbarProps extends GridToolbarProps {
  customActions?: React.ReactNode;
  onFilterClick?: () => void;
}

export const DynamicToolbar = React.forwardRef<HTMLDivElement, DynamicToolbarProps>((props, ref) => {
  const { mode } = useGridMode();
  const { customActions, ...otherProps } = props;
  
  // Determine which toolbar to render based on current mode
  return mode === 'edit' || mode === 'add' 
    ? <EditModeToolbar ref={ref} {...otherProps}>{customActions}</EditModeToolbar> 
    : <ViewModeToolbar ref={ref} {...otherProps}>{customActions}</ViewModeToolbar>;
});
```

### 3. Update Type Definitions

```typescript
// types/columnConfig.ts
import { GridColDef } from '@mui/x-data-grid';

// Add menu options to column config
export interface EnhancedColumnConfig<T = any> extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
  // Existing properties from EnhancedDataGridGraphQL.tsx
  fieldConfig: {
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    options?: Array<{ value: any; label: string }>;
    renderViewMode?: (_value: T | null, _row: any) => React.ReactNode;
    renderEditMode?: (_props: any) => React.ReactNode;
    validation?: any;
    parse?: (_value: any) => T | null;
    format?: (_value: T | null) => string;
  };
  
  // Legacy field type (for backward compatibility)
  fieldType?: any;
  
  // Legacy validation (for backward compatibility)
  required?: boolean;
  validationRules?: any[];
  validator?: any;
  
  // New property for column menu configuration
  menuOptions?: {
    // Which menu items to show (defaults to true if not specified)
    showSortAsc?: boolean;
    showSortDesc?: boolean;
    showFilter?: boolean;
    showColumnSelector?: boolean;
    // Custom menu items
    customItems?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (colDef: GridColDef) => void;
    }>;
  };
}
```
### 4. Update Main Component to Use New Features

```typescript
// EnhancedDataGridGraphQL.tsx (modified)
import React, { useCallback } from 'react';
import { DataGrid, GridFilterModel } from '@mui/x-data-grid';
import { useEnhancedDataGrid } from './hooks/useEnhancedDataGrid';
import { GridFormProvider } from './context/GridFormContext';
import { GridModeProvider } from './context/GridModeContext';
import { DynamicToolbar } from './components/toolbar/DynamicToolbar';
import { EmptyStateOverlay } from './components/EmptyStateOverlay';

// Keep existing interfaces and add new props
export interface EnhancedDataGridGraphQLProps<T = any> {
  // Existing props...
  
  // New props
  onlyLoadWithFilters?: boolean;
  customToolbarActions?: React.ReactNode;
}

export function EnhancedDataGridGraphQL<T extends { id: GridRowId }>({
  // Add new props
  onlyLoadWithFilters = false,
  customToolbarActions,
  // Existing props
  ...props
}) {
  console.log('[EnhancedDataGridGraphQL] Rendering with props:', {
    onlyLoadWithFilters,
    // Log other key props
  });
  
  // Use the master hook for state management and logic
  const {
    columns,
    rows,
    totalRows,
    loading,
    error,
    filtersApplied,
    handleFilterModelChange,
    handleSortModelChange,
    handlePaginationModelChange,
    selectionState,
    paginationState,
    isEmpty,
    isLoadingWithoutFilters
  } = useEnhancedDataGrid({
    ...props,
    onlyLoadWithFilters
  });
  
  // Filter panel reference for empty state
  const filterPanelRef = React.useRef<any>(null);
  
  // Callback to open filter panel
  const handleOpenFilterPanel = useCallback(() => {
    // Find and click the filter button
    const filterButton = document.querySelector('.MuiDataGrid-toolbarFilterButton');
    if (filterButton && filterButton instanceof HTMLElement) {
      filterButton.click();
    }
  }, []);
  
  return (
    <GridFormProvider
      columns={columns}
      initialRows={rows}
      onSave={props.onSave}
      validateRow={props.validateRow}
      isCompact={props.rowHeight !== undefined && props.rowHeight <= 30}
    >
      <GridModeProvider
        totalRows={totalRows}
        initialMode="none"
        selectionModel={selectionState.selectionModel}
        onSelectionModelChange={selectionState.onSelectionModelChange}
        saveChanges={() => {}}  // Implement this
        cancelChanges={() => {}} // Implement this
        addRow={() => {}} // Implement this
        hasValidationErrors={false} // Implement this
        canEditRows={props.canEditRows}
        canAddRows={props.canAddRows}
        canSelectRows={props.canSelectRows}
        canDeleteRows={props.canDeleteRows}
        onDelete={props.onDelete}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          
          // Pagination
          paginationModel={paginationState.paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode={props.paginationMode || 'server'}
          rowCount={totalRows}
          pageSizeOptions={props.rowsPerPageOptions || [10, 25, 50, 100]}
          
          // Selection
          checkboxSelection={props.checkboxSelection}
          rowSelectionModel={selectionState.selectionModel}
          onRowSelectionModelChange={selectionState.onSelectionModelChange}
          
          // Sorting and filtering
          sortingMode={props.sortingMode || 'server'}
          onSortModelChange={handleSortModelChange}
          filterMode={props.filterMode || 'server'}
          onFilterModelChange={handleFilterModelChange}
          
          // Custom components
          slots={{
            toolbar: DynamicToolbar,
            noRowsOverlay: isLoadingWithoutFilters ? EmptyStateOverlay : undefined,
            // Other slots
          }}
          slotProps={{
            toolbar: {
              customActions: customToolbarActions,
              onFilterClick: handleOpenFilterPanel
            },
            noRowsOverlay: {
              onFilterClick: handleOpenFilterPanel
            }
          }}
          
          // Other props from the input
          density={props.density || 'standard'}
          editMode="cell"
          disableRowSelectionOnClick={props.disableSelectionOnClick}
          
          // Error handling
          {...(error ? { error: true } : {})}
        />
      </GridModeProvider>
    </GridFormProvider>
  );
}
```

### 5. Update Hook Exports

```typescript
// hooks/index.ts (updated)
export * from './useGridNavigation';
export * from './useGridValidation';
export * from './useServerSideData';
export * from './useRelayGraphQLData';
export * from './useSelectionModel';
export * from './usePagination';
export * from './useEnhancedDataGrid'; // Add the new hook export
```
## Usage Example

Here's how the enhanced DataGrid would be used in a component:

```typescript
// MTMAdjustmentsPage.tsx (example usage)
import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { gql } from '@apollo/client';
import { EnhancedDataGridGraphQL } from '../components/DataGrid';
import { ValidationHelpers } from '../components/DataGrid/context/GridFormContext';

// Existing code...

// Custom toolbar actions
const CustomActions = () => {
  const handleAnalyticsClick = () => {
    console.log('Show analytics for current data');
    // Analytics logic
  };
  
  return (
    <Button
      startIcon={<BarChartIcon />}
      onClick={handleAnalyticsClick}
      size="small"
    >
      Analytics
    </Button>
  );
};

export default function MTMAdjustmentsPage() {
  // Existing state...
  
  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">MTM Adjustments</h1>
      
      {/* Data Grid with new features */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGridGraphQL
          columns={mtmAdjustmentColumns}
          rows={sampleMTMAdjustments} // Used as fallback
          
          // Enable conditional loading
          onlyLoadWithFilters={true}
          
          // Pass custom toolbar actions
          customToolbarActions={<CustomActions />}
          
          // Existing props
          onSave={handleSave}
          validateRow={validateMTMAdjustmentRow}
          useGraphQL={useGraphQLFetching}
          query={GET_MTM_ADJUSTMENTS}
          variables={variables}
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          canEditRows={true}
          canAddRows={true}
          canSelectRows={true}
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

## Additional Files to Check

For a complete implementation, we should also review:

1. **context/GridModeContext.tsx** - Ensure it exposes all needed state for the toolbar
2. **context/GridFormContext.tsx** - Check it supports the validation workflow
3. **hooks/useRelayGraphQLData.ts** - Verify it can handle the conditional loading approach
4. **hooks/useSelectionModel.ts** - Confirm it properly manages selection state
5. **hooks/usePagination.ts** - Ensure pagination works with the new approach

## Error Handling and Logging Strategy

1. **Component-Level Error Boundaries**: Add error boundaries around key components to prevent full UI crashes
2. **Consistent Logging Pattern**: Use structured logging at each level:
   - `[ComponentName] Message: details`
   - Include relevant state in logs
   - Log at important lifecycle points (init, update, error)
3. **Graceful Error Recovery**: Provide fallbacks for common failure modes
4. **User-Friendly Error States**: Show helpful messages rather than breaking the UI

## Implementation Sequence

To implement this plan effectively, we should follow this sequence:

1. Create the type definitions first (`columnConfig.ts`)
2. Implement the master hook (`useEnhancedDataGrid.ts`)
3. Create the UI components (EmptyStateOverlay and toolbar components)
4. Update the main component to use the new features
5. Update the hook exports
6. Test with an example page

## Summary

This plan provides a clear, logical enhancement to the EnhancedDataGrid while maintaining the core structure:

1. **The master hook (`useEnhancedDataGrid`)** unifies all functionality and provides a clean interface
2. **New UI components** are organized in a logical folder structure
3. **Type definitions** are extended rather than replaced
4. **The main component** is updated to use the new features while maintaining its API
5. **Proper error handling** ensures stability

The approach minimizes changes to file structure while improving clarity and functionality. By isolating most changes to new files, we reduce the risk of breaking existing usage patterns.

Key benefits of this implementation:

- **Conditional Loading**: Allows grids to only load data when filters are applied
- **Unified Interface**: Provides a single hook that manages all grid state
- **Improved Toolbars**: Context-aware toolbars that change based on grid mode
- **Enhanced Column Menus**: Customizable column menu options
- **Better Error Handling**: Comprehensive error handling and logging

This implementation follows the principle of progressive enhancement, allowing existing code to continue working while providing new capabilities for future development.