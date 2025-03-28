import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ClientSideRowModelModule,
  InfiniteRowModelModule,
  ModuleRegistry
} from 'ag-grid-community';
import type {
  GridReadyEvent,
  CellValueChangedEvent,
  SelectionChangedEvent,
  PaginationChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  GridOptions,
} from 'ag-grid-community';

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  InfiniteRowModelModule
]);

// Import ag-Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { Box, Paper, Typography } from '@mui/material';
import { CoreDataGridProps } from '../core/types';
import { GridFormProvider, useGridForm } from '../core/context';
import { 
  StatusPanel, 
  AddRowButton, 
  CellRenderer, 
  EditCellRenderer 
} from './components';
import { adaptColumnsToAgGrid } from './adapters';
import { useServerSideData } from '../core/hooks';

/**
 * ag-Grid implementation of the EnhancedDataGrid component
 */
export function AgGridEnhancedDataGrid<T extends { id: any }>({
  columns,
  rows: initialRows,
  onSave,
  validateRow,
  serverSide = false,
  dataUrl,
  pageSize = 25,
  autoHeight,
  density = 'standard',
  disableColumnFilter,
  disableColumnMenu,
  disableColumnSelector,
  disableDensitySelector,
  disableSelectionOnClick = true,
  disableVirtualization,
  loading: externalLoading,
  rowsPerPageOptions = [10, 25, 50, 100],
  showCellRightBorder = true,
  showColumnRightBorder = true,
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  rowHeight,
  checkboxSelection = false,
  selectionModel,
  onSelectionModelChange,
  disableMultipleSelection = false,
  className,
  ...props
}: CoreDataGridProps<T>) {
  const gridRef = useRef<AgGridReact>(null);
  
  // Always call the hook, but only use its results if serverSide and dataUrl are true
  const {
    rows: serverRows,
    totalRows: serverTotalRows,
    loading: serverLoading,
    setPage,
    setSortModel,
    setFilterModel,
  } = useServerSideData<T>({
    url: dataUrl || '', // Provide a default empty string
    pageSize,
    initialPage: 0,
  });

  // Use server data or client data based on the serverSide flag
  const rows = (serverSide && dataUrl) ? serverRows : initialRows;
  const totalRows = (serverSide && dataUrl) ? serverTotalRows : initialRows.length;
  
  // Combine external loading state with server loading state
  const loading = externalLoading || serverLoading;
  
  // Convert enhanced columns to ag-Grid columns
  const gridColumns = useMemo(() => adaptColumnsToAgGrid(columns), [columns]);
  
  // Define components
  const components = useMemo(() => ({
    cellRenderer: CellRenderer,
    cellEditor: EditCellRenderer,
  }), []);
  
  // Determine row height based on density
  const actualRowHeight = rowHeight || (
    density === 'compact' ? 30 : 
    density === 'comfortable' ? 52 : 
    42 // standard
  );
  
  // Determine if we're in compact mode based on row height
  const isCompact = actualRowHeight <= 30;
  
  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns - simplified approach
    setTimeout(() => {
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.sizeColumnsToFit();
      }
    }, 100);
  }, []);
  
  // Handle cell value changed
  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue, node } = event;
    const { updateCellValue } = useGridForm();
    
    if (node && colDef?.field) {
      // Update form state
      updateCellValue(node.id, colDef.field, newValue);
    }
  }, []);
  
  // Handle selection changed
  const onSelectionChanged = useCallback(() => {
    if (onSelectionModelChange && gridRef.current?.api) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      const selectedIds = selectedRows.map(row => row.id);
      onSelectionModelChange(selectedIds);
    }
  }, [onSelectionModelChange]);
  
  // Handle pagination changed
  const onPaginationChanged = useCallback(() => {
    if (serverSide && gridRef.current?.api) {
      const currentPage = gridRef.current.api.paginationGetCurrentPage();
      setPage(currentPage);
    }
  }, [serverSide, setPage]);
  
  // Handle sort changed
  const onSortChanged = useCallback(() => {
    if (serverSide && gridRef.current?.api) {
      // We'll use a simplified approach for sorting
      // In a real implementation, you'd extract the sort model from the grid
      setSortModel([]);
    }
  }, [serverSide, setSortModel]);
  
  // Handle filter changed
  const onFilterChanged = useCallback(() => {
    if (serverSide && gridRef.current?.api) {
      // We'll use a simplified approach for filtering
      // In a real implementation, you'd extract the filter model from the grid
      setFilterModel({});
    }
  }, [serverSide, setFilterModel]);
  
  // Grid options
  const gridOptions: GridOptions = {
    // Basic configuration
    rowData: rows,
    columnDefs: gridColumns,
    rowHeight: actualRowHeight,
    
    // Components
    components,
    
    // Default column configuration
    defaultColDef: {
      resizable: true,
      sortable: !disableColumnMenu,
      filter: !disableColumnFilter,
      editable: true,
    },
    
    // Selection
    rowSelection: disableMultipleSelection ? 'single' : 'multiple',
    suppressRowClickSelection: disableSelectionOnClick,
    
    // Pagination
    pagination: !hideFooter,
    paginationPageSize: pageSize,
    
    // Server-side features
    rowModelType: serverSide ? 'infinite' : 'clientSide',
    cacheBlockSize: serverSide ? pageSize : undefined,
    infiniteInitialRowCount: serverSide ? pageSize : undefined,
    // Note: Modules are registered globally at the top of the file
    
    // Events
    onGridReady,
    onCellValueChanged,
    onSelectionChanged,
    onPaginationChanged,
    onSortChanged,
    onFilterChanged,
    
    // Styling
    suppressCellFocus: false,
    suppressMovableColumns: true,
    suppressLoadingOverlay: !loading,
    suppressNoRowsOverlay: rows.length > 0,
  };
  
  return (
    <GridFormProvider
      columns={columns}
      initialRows={rows}
      onSave={onSave}
      validateRow={validateRow}
      isCompact={isCompact}
    >
      <div className={`h-full w-full flex flex-col ${className || ''}`}>
        <Paper elevation={1} className="p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <Typography variant="h5">
              Enhanced Data Grid
            </Typography>
            
            <AddRowButton />
          </div>
          
          <Box className="flex items-center mt-2">
            <Typography variant="body2" className="text-gray-600">
              Click to edit • Tab to navigate
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} className="flex-grow w-full overflow-auto">
          <div 
            className="ag-theme-material" 
            style={{ 
              height: autoHeight ? 'auto' : '100%', 
              width: '100%',
              minHeight: 400
            }}
          >
            <AgGridReact
              ref={gridRef}
              {...gridOptions}
            />
          </div>
        </Paper>
        
        <StatusPanel />
      </div>
    </GridFormProvider>
  );
}