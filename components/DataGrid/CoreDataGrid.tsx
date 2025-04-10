import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridApi,
  GridRowSelectionModel,
  GridCallbackDetails,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel,
} from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useGridMode } from './context/GridModeContext'; // Corrected path
import { EnhancedColumnConfig } from './types/columnConfig'; // Corrected path

interface CoreDataGridProps<T = any> { // Renamed interface
  apiRef: React.MutableRefObject<GridApi>;
  displayRows: T[];
  gridColumns: GridColDef[];
  columns: EnhancedColumnConfig<T>[]; // Needed for double-click logic
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  disableSelectionOnClick?: boolean;
  disableVirtualization?: boolean;
  loading?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  pageSize?: number;
  rowsPerPageOptions?: number[];
  useGraphQLFetching: boolean; // Assuming this prop remains relevant for server-side logic
  totalRows: number;
  setPage: (page: number) => void;
  setSortModel: (model: { field: string; sort: 'asc' | 'desc' }[]) => void;
  setFilterModel: (model: Record<string, any>) => void;
  checkboxSelection?: boolean;
  canSelectRows?: boolean;
  selectionModel: GridRowSelectionModel;
  handleSelectionModelChange: (selectionModel: GridRowSelectionModel, details: GridCallbackDetails) => void;
  disableMultipleSelection?: boolean;
  canEditRows?: boolean;
  rowHeight?: number;
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  props?: any; // Pass through any remaining props
}

export const CoreDataGrid = <T extends { id: GridRowId }>({ // Renamed component
  apiRef,
  displayRows,
  gridColumns,
  columns,
  autoHeight,
  density,
  disableColumnFilter,
  disableColumnMenu,
  disableColumnSelector,
  disableDensitySelector,
  disableSelectionOnClick,
  disableVirtualization,
  loading,
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  pageSize = 25, // Default value if not provided
  rowsPerPageOptions,
  useGraphQLFetching,
  totalRows,
  setPage,
  setSortModel,
  setFilterModel,
  checkboxSelection,
  canSelectRows,
  selectionModel,
  handleSelectionModelChange,
  disableMultipleSelection,
  canEditRows,
  rowHeight,
  handleKeyDown,
  props,
}: CoreDataGridProps<T>) => { // Used renamed interface
  // Get the current mode from context
  const { mode, setMode } = useGridMode();

  // Determine if row selection should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';

  // Handle cell click
  const handleCellClick = (params: any) => {
    // If we're already in edit mode, allow single click to edit cells
    if (mode === 'edit') {
      // Don't handle clicks on checkboxes or action columns
      if (params.field === '__check__' || params.field === '__actions__') {
        return;
      }

      const { id, field } = params;
      const column = columns.find(col => col.field === field);

      // Only allow editing if the column is editable and editing is enabled
      if (column?.editable !== false && canEditRows) {
        try {
          // Start cell edit mode
          const cellMode = apiRef.current.getCellMode(id, field);
          if (cellMode === 'view') {
            apiRef.current.startCellEditMode({ id, field });
          }
        } catch (error) {
          console.error('Error starting cell edit mode:', error);
        }
      }
    }
    // In other modes, single click does nothing - we'll use double click for initial editing
  };

  // Handle cell double click to enter edit mode
  const handleCellDoubleClick = (params: any) => {
    // Disable cell editing when in add mode for existing rows
    if (mode === 'add' && !params.id.toString().startsWith('new-')) {
      return;
    }

    // Don't handle double clicks on checkboxes or action columns
    if (params.field === '__check__' || params.field === '__actions__') {
      return;
    }

    const { id, field } = params;
    const column = columns.find(col => col.field === field);

    // Only allow editing if the column is editable and editing is enabled
    if (column?.editable !== false && canEditRows) {
      try {
        // Set the grid mode to edit
        setMode('edit');

        // Start cell edit mode
        const cellMode = apiRef.current.getCellMode(id, field);
        if (cellMode === 'view') {
          apiRef.current.startCellEditMode({ id, field });
        }
      } catch (error) {
        console.error('Error starting cell edit mode:', error);
      }
    }
  };

  return (
    <DataGrid
      apiRef={apiRef}
      rows={displayRows}
      columns={gridColumns}
      autoHeight={autoHeight}
      density={density}
      disableColumnFilter={disableColumnFilter}
      disableColumnMenu={disableColumnMenu}
      disableColumnSelector={disableColumnSelector}
      disableDensitySelector={disableDensitySelector}
      disableRowSelectionOnClick={isInEditOrAddMode || disableSelectionOnClick}
      disableVirtualization={disableVirtualization}
      loading={loading}
      hideFooter={hideFooter}
      hideFooterPagination={hideFooterPagination}
      hideFooterSelectedRowCount={hideFooterSelectedRowCount}
      // Pagination
      initialState={{
        pagination: {
          paginationModel: { pageSize, page: 0 },
        },
      }}
      pageSizeOptions={rowsPerPageOptions}
      paginationMode={useGraphQLFetching ? 'server' : 'client'}
      rowCount={totalRows}
      onPaginationModelChange={(model: GridPaginationModel) => {
        // For GraphQL pagination, fetch the data
        if (useGraphQLFetching) {
          setPage(model.page);
        }
      }}
      
      // Sorting and filtering
      sortingMode={useGraphQLFetching ? 'server' : 'client'}
      filterMode={useGraphQLFetching ? 'server' : 'client'}
      onSortModelChange={(model: GridSortModel) => {
        if (useGraphQLFetching) {
          setSortModel(model.map(item => ({
            field: item.field,
            sort: item.sort as 'asc' | 'desc'
          })));
        }
      }}
      onFilterModelChange={(model: GridFilterModel) => {
        if (useGraphQLFetching) {
          const filterModel: Record<string, any> = {};
          model.items.forEach(item => {
            if (item.field && item.value !== undefined) {
              filterModel[item.field] = item.value;
            }
          });
          setFilterModel(filterModel);
        }
      }}
      // Row selection
      checkboxSelection={checkboxSelection && canSelectRows}
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={handleSelectionModelChange}
      disableMultipleRowSelection={disableMultipleSelection}
      isRowSelectable={() => !isInEditOrAddMode}
      
      // Editing
      editMode="cell"
      rowHeight={rowHeight}
      onCellClick={handleCellClick}
      onCellDoubleClick={handleCellDoubleClick}
      // Wrap handleKeyDown to match the expected signature for onCellKeyDown
      onCellKeyDown={(params, event, details) => {
        // Pass only the event to the original handleKeyDown from the hook
        handleKeyDown(event as React.KeyboardEvent<HTMLDivElement>); 
      }}
      slots={{
        noRowsOverlay: () => (
          <div className="flex items-center justify-center h-full">
            <Typography>No rows</Typography>
          </div>
        )
      }}
      sx={{
        border: 'none',
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        height: '100%',
        '& .MuiDataGrid-main': {
          overflow: 'auto',
        }
      }}
      {...props}
    />
  );
};