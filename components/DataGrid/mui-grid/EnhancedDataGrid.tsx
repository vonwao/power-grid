import React, { useCallback } from 'react';
import {
  DataGrid,
  GridRowId,
  useGridApiRef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowSelectionModel,
  GridCallbackDetails,
} from '@mui/x-data-grid';
import { Box, Paper, Typography } from '@mui/material';
import { CoreDataGridProps } from '../core/types';
import { GridFormProvider, useGridForm } from '../core/context';
import { 
  StatusPanel, 
  AddRowButton, 
  CellEditHandler, 
  CellRenderer, 
  EditCellRenderer 
} from './components';
import { adaptColumnsToMuiGrid } from './adapters';
import { useServerSideData } from '../core/hooks';

/**
 * MUI X Grid implementation of the EnhancedDataGrid component
 */
export function MuiEnhancedDataGrid<T extends { id: GridRowId }>({
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
  const apiRef = useGridApiRef();
  
  // Use server-side data if enabled
  const {
    rows,
    totalRows,
    loading: serverLoading,
    setPage,
    setSortModel,
    setFilterModel,
  } = serverSide && dataUrl
    ? useServerSideData<T>({
        url: dataUrl,
        pageSize,
        initialPage: 0,
      })
    : { 
        rows: initialRows, 
        totalRows: initialRows.length, 
        loading: false, 
        setPage: () => {}, 
        setSortModel: () => {}, 
        setFilterModel: () => {} 
      };
  
  // Combine external loading state with server loading state
  const loading = externalLoading || serverLoading;
  
  // Define a navigation handler that uses the correct API methods
  const handleNavigate = useCallback((id: GridRowId, field: string) => {
    try {
      // Check if the cell is already in edit mode
      const cellMode = apiRef.current.getCellMode(id, field);
      if (cellMode === 'view') {
        apiRef.current.startCellEditMode({ id, field });
      }
    } catch (error) {
      console.error('Error navigating to cell:', error);
    }
  }, [apiRef]);
  
  // Convert enhanced columns to MUI X Data Grid columns
  const gridColumns = React.useMemo(() => {
    return columns.map(column => {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => (
          <CellRenderer 
            params={params} 
            column={column}
          />
        ),
        renderEditCell: (params: GridRenderEditCellParams) => (
          <EditCellRenderer
            params={params}
            column={column}
          />
        ),
      };
    });
  }, [columns]);
  
  // Determine if we're in compact mode based on row height
  const isCompact = rowHeight !== undefined && rowHeight <= 30;
  
  // Handle selection model change
  const handleSelectionModelChange = useCallback(
    (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
      if (onSelectionModelChange) {
        // Convert readonly array to mutable array
        onSelectionModelChange([...newSelectionModel]);
      }
    },
    [onSelectionModelChange]
  );
  
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
          <CellEditHandler apiRef={apiRef} />
          <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={gridColumns}
            autoHeight={autoHeight}
            density={density}
            disableColumnFilter={disableColumnFilter}
            disableColumnMenu={disableColumnMenu}
            disableColumnSelector={disableColumnSelector}
            disableDensitySelector={disableDensitySelector}
            disableRowSelectionOnClick={disableSelectionOnClick}
            disableVirtualization={disableVirtualization}
            loading={loading}
            hideFooter={hideFooter}
            hideFooterPagination={hideFooterPagination}
            hideFooterSelectedRowCount={hideFooterSelectedRowCount}
            initialState={{
              pagination: {
                paginationModel: { pageSize },
              },
            }}
            pageSizeOptions={rowsPerPageOptions}
            editMode="cell"
            rowHeight={rowHeight}
            checkboxSelection={checkboxSelection}
            rowSelectionModel={selectionModel ? selectionModel : []}
            onRowSelectionModelChange={handleSelectionModelChange}
            disableMultipleRowSelection={disableMultipleSelection}
            onCellClick={(params) => {
              if (params.field !== '__check__' && params.field !== '__actions__') {
                const { id, field } = params;
                const column = columns.find(col => col.field === field);
                if (column?.editable !== false) {
                  try {
                    // Check if the cell is already in edit mode
                    const cellMode = apiRef.current.getCellMode(id, field);
                    if (cellMode === 'view') {
                      apiRef.current.startCellEditMode({ id, field });
                    }
                  } catch (error) {
                    console.error('Error starting cell edit mode:', error);
                  }
                }
              }
            }}
            paginationMode={serverSide ? 'server' : 'client'}
            sortingMode={serverSide ? 'server' : 'client'}
            filterMode={serverSide ? 'server' : 'client'}
            rowCount={totalRows}
            onPaginationModelChange={(model) => {
              if (serverSide) {
                setPage(model.page);
              }
            }}
            onSortModelChange={(model) => {
              if (serverSide) {
                setSortModel(model.map(item => ({
                  field: item.field,
                  sort: item.sort as 'asc' | 'desc'
                })));
              }
            }}
            onFilterModelChange={(model) => {
              if (serverSide) {
                const filterModel: Record<string, any> = {};
                model.items.forEach(item => {
                  if (item.field && item.value !== undefined) {
                    filterModel[item.field] = item.value;
                  }
                });
                setFilterModel(filterModel);
              }
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
        </Paper>
        
        <StatusPanel />
      </div>
    </GridFormProvider>
  );
}