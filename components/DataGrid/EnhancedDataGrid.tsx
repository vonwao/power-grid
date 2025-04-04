import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridValueGetter,
  GridValueSetter,
  GridRenderCellParams,
  GridCellParams,
  GridTreeNode,
} from '@mui/x-data-grid';
import { Paper, Typography } from '@mui/material';
import { ValidationOptions } from '../../types/form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridFormProvider, ValidationHelpers, useGridForm } from './context/GridFormContext';
import { CellEditHandler, UnifiedDataGridToolbar } from './components';
import { useGridNavigation, useServerSideData, useSelectionModel } from './hooks';
import { GridModeProvider, useGridMode } from './context/GridModeContext';

// Field configuration for React Hook Form integration
export interface FieldConfig<T = unknown> {
  // Basic properties
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  
  // For select fields
  options?: Array<{value: T, label: string}>;
  
  // Rendering (optional - can use defaults)
  renderViewMode?: (value: T | null, row: Record<string, unknown>) => React.ReactNode;
  renderEditMode?: (props: Record<string, unknown>) => React.ReactNode;
  
  // Validation
  validation?: ValidationOptions;
  
  // Transform functions (optional)
  parse?: (value: unknown) => T | null;
  format?: (value: T | null) => string;
}

// Enhanced column configuration
export interface EnhancedColumnConfig<T = unknown> extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
  // Field configuration for React Hook Form
  fieldConfig: FieldConfig<T>;
  
  // Legacy field type (for backward compatibility)
  fieldType?: string;
  
  // Legacy validation (for backward compatibility)
  required?: boolean;
  validationRules?: Array<Record<string, unknown>>;
  validator?: (value: unknown) => boolean | string;
  
  // Value accessors
  valueGetter?: GridValueGetter;
  valueSetter?: GridValueSetter;
}

export interface EnhancedDataGridProps<T = Record<string, unknown>> {
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (changes: { edits: T[], additions: T[] }) => void;
  validateRow?: (values: T, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
  
  // Server-side options
  dataUrl?: string;
  forceClientSide?: boolean; // Escape hatch - not recommended for large datasets
  
  // Selection options
  checkboxSelection?: boolean;
  selectionModel?: Array<string | number>;
  onSelectionModelChange?: (selectionModel: Array<string | number>) => void;
  disableMultipleSelection?: boolean;
  
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
  
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
  rowHeight?: number; // Custom row height in pixels
}

export function EnhancedDataGrid<T extends { id: GridRowId }>({
  columns,
  rows,
  onSave,
  validateRow,
  // Server-side options
  dataUrl,
  forceClientSide = false,
  // Selection options
  checkboxSelection = false,
  selectionModel: initialSelectionModel,
  onSelectionModelChange,
  disableMultipleSelection = false,
  // Grid capabilities
  canEditRows = true,
  canAddRows = true,
  canSelectRows = true,
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
  ...props
}: EnhancedDataGridProps<T>) {
  const apiRef = useGridApiRef();
  // Use built-in DataGrid pagination
  
  // Use server-side data if dataUrl is provided and not forcing client-side
  const useServerSide = dataUrl && !forceClientSide;
  
  // Always call the hook, but only use its results if useServerSide is true
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
  
  // Use server data or client data based on the useServerSide flag
  const displayRows = useServerSide ? serverRows : rows;
  const totalRows = useServerSide ? serverTotalRows : rows.length;
  
  // Combine external loading state with server loading state
  const loading = externalLoading || serverLoading;
  
  // Initialize selection model hook
  const { selectionModel, onSelectionModelChange: handleSelectionModelChange } = useSelectionModel({
    selectionModel: initialSelectionModel,
    onSelectionModelChange,
  });
  
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

  // Initialize grid navigation hook
  const { handleKeyDown } = useGridNavigation({
    api: apiRef.current,
    columns,
    rows: displayRows,
    onNavigate: handleNavigate
  });
  
  // Create SelectFieldType instances for select fields
  columns.forEach(column => {
    if (column.fieldConfig?.type === 'select' && !column.fieldType) {
      column.fieldType = new SelectFieldType({
        options: column.fieldConfig.options || [],
        valueKey: 'value',
        labelKey: 'label'
      });
    }
  });
  
  // Convert enhanced columns to MUI X Data Grid columns
  const gridColumns: GridColDef[] = columns.map(column => {
    return {
      ...column,
      renderCell: (params) => {
        return (
          <CellRendererWrapper 
            params={params} 
            column={column}
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <EditCellRenderer
            params={params}
            column={column}
          />
        );
      },
    };
  });
  
  // Determine if we're in compact mode based on row height
  const isCompact = rowHeight !== undefined && rowHeight <= 30;

  // Create a wrapper component for DataGrid that uses the grid mode
  const DataGridWithModeControl = () => {
    // Get the current mode from context
    const { mode, setMode } = useGridMode();
    
    // Determine if row selection should be disabled
    const isInEditOrAddMode = mode === 'edit' || mode === 'add';
    
    // Handle cell click
    const handleCellClick = (params: GridCellParams<Record<string, unknown>, unknown, unknown, GridTreeNode>) => {
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
    const handleCellDoubleClick = (params: GridCellParams<Record<string, unknown>, unknown, unknown, GridTreeNode>) => {
      // Disable cell editing when in add mode for existing rows
      if (mode === 'add' && !params.id.toString().startsWith('new-')) {
        return;
      }
      
      // Don't handle double clicks on checkboxes or action columns
      if (typeof params.field === 'string' && (params.field === '__check__' || params.field === '__actions__')) {
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
        paginationMode={useServerSide ? 'server' : 'client'}
        rowCount={totalRows}
        onPaginationModelChange={(model) => {
          // For server-side pagination, fetch the data
          if (useServerSide) {
            setPage(model.page);
          }
        }}
        
        // Sorting and filtering
        sortingMode={useServerSide ? 'server' : 'client'}
        filterMode={useServerSide ? 'server' : 'client'}
        onSortModelChange={(model) => {
          if (useServerSide) {
            setSortModel(model.map(item => ({
              field: item.field,
              sort: item.sort as 'asc' | 'desc'
            })));
          }
        }}
        onFilterModelChange={(model) => {
          if (useServerSide) {
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
        onRowSelectionModelChange={(newSelectionModel) => {
          if (onSelectionModelChange) {
            onSelectionModelChange(Array.from(newSelectionModel).map(id => id.toString()));
          }
        }}
        disableMultipleRowSelection={disableMultipleSelection}
        isRowSelectable={() => !isInEditOrAddMode}
        
        // Editing
        editMode="cell"
        rowHeight={rowHeight}
        onCellClick={handleCellClick}
        onCellDoubleClick={handleCellDoubleClick}
        onCellKeyDown={handleKeyDown}
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
  // Get the GridFormContext functions and state
  const GridFormWrapper = ({ children }: { children: React.ReactNode }) => {
    const {
      saveChanges,
      cancelChanges,
      addRow,
      hasValidationErrors,
      isRowEditing,
      isRowDirty
    } = useGridForm();

    // Debug: Log selection model
    console.log('EnhancedDataGrid - selectionModel:', selectionModel);

    return (
      <GridModeProvider
        totalRows={totalRows}
        initialMode="none"
        saveChanges={saveChanges}
        cancelChanges={cancelChanges}
        addRow={addRow}
        hasValidationErrors={hasValidationErrors}
        isRowEditing={isRowEditing}
        isRowDirty={isRowDirty}
        canEditRows={canEditRows}
        canAddRows={canAddRows}
        canSelectRows={canSelectRows}
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionModelChange}
      >
        {children}
      </GridModeProvider>
    );
  };
  
  // Get the saveChanges function from GridFormContext
  const GridFormWithToolbar = () => {
    const { saveChanges } = useGridForm();
    
    return (
      <GridFormWrapper>
        <div className={`h-full w-full flex flex-col ${className || ''}`}>
          {/* Unified Toolbar */}
          <UnifiedDataGridToolbar
            onSave={saveChanges}
            onFilter={() => console.log('Filter clicked')}
            onExport={() => console.log('Export clicked')}
            onUpload={() => console.log('Upload clicked')}
            onHelp={() => console.log('Help clicked')}
            canEditRows={canEditRows}
            canAddRows={canAddRows}
            canSelectRows={canSelectRows}
          />

          <Paper elevation={0} className="flex-grow w-full overflow-auto">
            <CellEditHandler apiRef={apiRef} />
            <DataGridWithModeControl />
          </Paper>
        </div>
      </GridFormWrapper>
    );
  };
  
  return (
    <GridFormProvider
      columns={columns}
      initialRows={displayRows}
      onSave={onSave}
      validateRow={validateRow}
      isCompact={isCompact}
    >
      <GridFormWithToolbar />
    </GridFormProvider>
  );
}

// Wrapper for CellRenderer that gets validation state from context
const CellRendererWrapper = ({ params, column }: { params: GridRenderCellParams, column: EnhancedColumnConfig }) => {
  const { isFieldDirty, getRowErrors, getFormMethods } = useGridForm();
  const isDirty = isFieldDirty(params.id, params.field);
  const errors = getRowErrors(params.id);
  const error = errors?.[params.field];
  
  // Get the latest value from the form state if available
  const formMethods = getFormMethods(params.id);
  const formValue = formMethods ? formMethods.getValues()[params.field] : undefined;
  
  // Create a new params object with the updated value from form state
  const updatedParams = {
    ...params,
    value: formValue !== undefined ? formValue : params.value
  };
  
  return (
    <CellRenderer
      params={updatedParams}
      column={column}
      isDirty={isDirty}
      error={error}
    />
  );
};
