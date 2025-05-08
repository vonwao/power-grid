import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  DataGrid,
  GridRowId,
  GridFilterModel,
  GridSortModel,
  GridPaginationModel,
  GridNoRowsOverlay
} from '@mui/x-data-grid';
import { DocumentNode } from '@apollo/client';

// Import the master hook
import { useEnhancedDataGrid } from './hooks/useEnhancedDataGrid';

// Import contexts
import { GridFormProvider } from './context/GridFormContext';
import { GridModeProvider } from './context/GridModeContext';

// Import components
import { GridToolbar } from './components/GridToolbar';
import { EmptyStateOverlay } from './components/EmptyStateOverlay';

// Import types
import { EnhancedColumnConfig } from './types/columnConfig';
import { ValidationHelpers } from './context/GridFormContext';

/**
 * Props for the EnhancedDataGrid component
 */
export interface EnhancedDataGridProps<T = any> {
  // Base props
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (_changes: { edits: any[]; additions: any[] }) => void;
  validateRow?: (
    _values: any,
    _helpers: ValidationHelpers
  ) => Record<string, string> | Promise<Record<string, string>>;
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean;
  query?: DocumentNode;
  variables?: Record<string, any>;
  paginationStyle?: 'offset' | 'cursor' | 'key';
  
  // New feature: conditional loading
  onlyLoadWithFilters?: boolean;
  
  // Sorting and filtering options
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'client' | 'server';
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  filterMode?: 'client' | 'server';
  
  // Selection options
  checkboxSelection?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (_selectionModel: any[]) => void;
  disableMultipleSelection?: boolean;
  
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
  canDeleteRows?: boolean;
  
  // Action handlers
  onDelete?: (ids: GridRowId[]) => void;
  
  // Custom components
  customToolbarActions?: React.ReactNode;
  
  // UI options
  className?: string;
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  disableSelectionOnClick?: boolean;
  disableVirtualization?: boolean;
  loading?: boolean;
  pageSize?: number;
  rowsPerPageOptions?: number[];
  showCellRightBorder?: boolean;
  showColumnRightBorder?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  rowHeight?: number;
  
  // Pagination props
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  paginationMode?: 'client' | 'server';
  rowCount?: number;
  
  // Testing and debugging props
  onPageChange?: (page: number) => void;
  onRowsChange?: (rows: T[]) => void;
  
  // Grid functions
  onGridFunctionsInit?: (
    refetch: () => Promise<any>,
    resetCursors: () => void,
    pageInfo: any
  ) => void;
  
  // Add row dialog
  useAddDialog?: boolean;
  onAddRow?: (rowData: any) => void;
}

/**
 * Enhanced Data Grid component
 * 
 * A powerful data grid component that combines MUI X DataGrid with advanced features
 * like GraphQL integration, conditional loading, and enhanced column menus.
 */
export function EnhancedDataGrid<T extends { id: GridRowId }>({
  // Base props
  columns,
  rows,
  onSave,
  validateRow,
  
  // GraphQL options
  useGraphQL = true,
  forceClientSide = false,
  query,
  variables,
  paginationStyle = 'cursor',
  
  // New feature: conditional loading
  onlyLoadWithFilters = false,
  
  // Sorting and filtering options
  sortModel: initialSortModel,
  onSortModelChange,
  sortingMode = 'server',
  filterModel: initialFilterModel,
  onFilterModelChange,
  filterMode = 'server',
  
  // Selection options
  checkboxSelection = false,
  selectionModel: initialSelectionModel,
  onSelectionModelChange,
  disableMultipleSelection = false,
  
  // Grid capabilities
  canEditRows = true,
  canAddRows = true,
  canSelectRows = true,
  canDeleteRows = false,
  onDelete,
  
  // Custom components
  customToolbarActions,
  
  // UI options
  className,
  autoHeight,
  density = 'standard',
  disableColumnFilter,
  disableColumnMenu,
  disableColumnSelector,
  disableDensitySelector,
  disableSelectionOnClick = true,
  disableVirtualization,
  loading: externalLoading,
  pageSize = 25,
  rowsPerPageOptions = [10, 25, 50, 100],
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  rowHeight,
  
  // Pagination props
  paginationModel: externalPaginationModel,
  onPaginationModelChange: externalOnPaginationModelChange,
  paginationMode = 'server',
  rowCount,
  
  // Grid functions
  onGridFunctionsInit,
  
  // Add row dialog
  useAddDialog = true,
  onAddRow,
  
  // Other props
  ...props
}: EnhancedDataGridProps<T>) {
  // Debug logging - only in development mode
  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 [EnhancedDataGrid] ${message}`, ...args);
    }
  }, []);
  
  // Log rendering only in development mode
  if (process.env.NODE_ENV !== 'production') {
    debugLog('Rendering with props:', {
      useGraphQL,
      forceClientSide,
      onlyLoadWithFilters,
      selectionModel: initialSelectionModel?.length,
    });
  }
  
  // Memoize hook options to prevent unnecessary re-renders
  const hookOptions = useMemo(() => ({
    columns,
    rows,
    useGraphQL,
    forceClientSide,
    query,
    variables,
    paginationStyle,
    onlyLoadWithFilters,
    pageSize,
    initialPage: 0,
    paginationMode,
    paginationModel: externalPaginationModel,
    onPaginationModelChange: externalOnPaginationModelChange,
    sortModel: initialSortModel,
    onSortModelChange,
    sortingMode,
    filterModel: initialFilterModel,
    onFilterModelChange,
    filterMode,
    selectionModel: initialSelectionModel,
    onSelectionModelChange,
    loading: externalLoading
  }), [
    columns,
    rows,
    useGraphQL,
    forceClientSide,
    query,
    variables,
    paginationStyle,
    onlyLoadWithFilters,
    pageSize,
    paginationMode,
    externalPaginationModel,
    externalOnPaginationModelChange,
    initialSortModel,
    onSortModelChange,
    sortingMode,
    initialFilterModel,
    onFilterModelChange,
    filterMode,
    initialSelectionModel,
    onSelectionModelChange,
    externalLoading
  ]);

  // Use the master hook for state management and logic
  const {
    columns: processedColumns,
    rows: displayRows,
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
    isLoadingWithoutFilters,
    refetch,
    resetCursors,
    pageInfo
  } = useEnhancedDataGrid(hookOptions);
  
  // Memoize the grid functions init callback
  const memoizedGridFunctionsInit = useCallback(() => {
    if (onGridFunctionsInit) {
      debugLog('Initializing grid functions');
      onGridFunctionsInit(refetch, resetCursors, pageInfo);
    }
  }, [onGridFunctionsInit, refetch, resetCursors, pageInfo, debugLog]);

  // Call onGridFunctionsInit callback if provided
  React.useEffect(() => {
    memoizedGridFunctionsInit();
  }, [memoizedGridFunctionsInit]);
  
  // Call the onRowsChange callback when rows change
  React.useEffect(() => {
    if (props.onRowsChange) {
      debugLog('Rows changed, calling onRowsChange');
      props.onRowsChange(displayRows as T[]);
    }
  }, [displayRows, props.onRowsChange]);
  
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
  
  // State for add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Open add dialog
  const handleOpenAddDialog = useCallback(() => {
    setAddDialogOpen(true);
  }, []);
  
  // Close add dialog
  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false);
  }, []);
  
  // Handle saving a new row from dialog
  const handleSaveNewRow = useCallback((rowData: any) => {
    debugLog('Adding new row from dialog:', rowData);
    
    // Call the onAddRow callback if provided
    if (onAddRow) {
      onAddRow(rowData);
    } else {
      // Default behavior - add to the rows state
      if (useGraphQL) {
        // For GraphQL, we'll queue this addition for the next save operation
        debugLog('Queueing row addition for GraphQL save');
      } else {
        // For client-side, add directly to rows
        debugLog('Client-side row addition - parent component should handle update');
      }
    }
    
    // Close the dialog
    setAddDialogOpen(false);
  }, [useGraphQL, onAddRow]);
  
  return (
    <GridFormProvider
      columns={processedColumns}
      initialRows={displayRows}
      onSave={onSave}
      validateRow={validateRow}
      isCompact={rowHeight !== undefined && rowHeight <= 30}
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
        canEditRows={canEditRows}
        canAddRows={canAddRows}
        canSelectRows={canSelectRows}
        canDeleteRows={canDeleteRows}
        onDelete={onDelete}
      >
        <DataGrid
          columns={processedColumns}
          rows={displayRows}
          loading={loading}
          
          // Pagination
          paginationModel={paginationState.paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode={paginationMode}
          rowCount={totalRows}
          pageSizeOptions={rowsPerPageOptions}
          
          // Selection
          checkboxSelection={checkboxSelection}
          rowSelectionModel={selectionState.selectionModel}
          onRowSelectionModelChange={selectionState.onSelectionModelChange}
          
          // Sorting and filtering
          sortingMode={sortingMode}
          onSortModelChange={handleSortModelChange}
          filterMode={filterMode}
          onFilterModelChange={handleFilterModelChange}
          
          // Custom components
          slots={{
            toolbar: GridToolbar,
            noRowsOverlay: isLoadingWithoutFilters ?
              // Cast to any to bypass TypeScript limitations
              EmptyStateOverlay as any :
              undefined,
            // Other slots
          }}
          slotProps={{
            toolbar: {
              // Cast to any to bypass TypeScript limitations
              customActions: customToolbarActions,
              onFilterClick: handleOpenFilterPanel
            } as any,
            noRowsOverlay: isLoadingWithoutFilters ? {
              onFilterClick: handleOpenFilterPanel
            } as any : undefined
          }}
          
          // Other props from the input
          className={className}
          autoHeight={autoHeight}
          density={density}
          disableColumnFilter={disableColumnFilter}
          disableColumnMenu={disableColumnMenu}
          disableColumnSelector={disableColumnSelector}
          disableDensitySelector={disableDensitySelector}
          disableRowSelectionOnClick={disableSelectionOnClick}
          disableVirtualization={disableVirtualization}
          hideFooter={hideFooter}
          hideFooterPagination={hideFooterPagination}
          hideFooterSelectedRowCount={hideFooterSelectedRowCount}
          rowHeight={rowHeight}
          editMode="cell"
          
          // Error handling
          {...(error ? { error: true } : {})}
          
          // Other props
          {...props}
        />
        
        {/* Add Row Dialog - implement if needed */}
      </GridModeProvider>
    </GridFormProvider>
  );
}