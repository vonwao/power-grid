import React, { useCallback } from 'react';
import { DocumentNode } from '@apollo/client';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetter,
  GridValueSetter,
  useGridApiRef,
  GridRenderCellParams,
  GridRowSelectionModel as _GridRowSelectionModel,
  GridCallbackDetails as _GridCallbackDetails,
} from '@mui/x-data-grid';
import { Paper, Typography } from '@mui/material';
import { ValidationOptions } from '../../types/form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridFormProvider, useGridForm, ValidationHelpers } from './context/GridFormContext';
import { CellEditHandler, UnifiedDataGridToolbar } from './components';
import { SelectFieldType } from './fieldTypes/SelectField';
import { useGridNavigation, useGraphQLData, useRelayGraphQLData, useSelectionModel } from './hooks';
import { GridModeProvider, useGridMode } from './context/GridModeContext';
import { ServerSideResult } from './types/serverSide';

// Field configuration for React Hook Form integration
export interface FieldConfig<T = any> {
  // Basic properties
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  
  // For select fields
  options?: Array<{value: any, label: string}>;
  
  // Rendering (optional - can use defaults)
  renderViewMode?: (_value: T | null, _row: any) => React.ReactNode;
  renderEditMode?: (_props: any) => React.ReactNode;
  
  // Validation
  validation?: ValidationOptions;
  
  // Transform functions (optional)
  parse?: (_value: any) => T | null;
  format?: (_value: T | null) => string;
}

// Enhanced column configuration
export interface EnhancedColumnConfig<T = any> extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
  // Field configuration for React Hook Form
  fieldConfig: FieldConfig<T>;
  
  // Legacy field type (for backward compatibility)
  fieldType?: any;
  
  // Legacy validation (for backward compatibility)
  required?: boolean;
  validationRules?: any[];
  validator?: any;
  
  // Value accessors
  valueGetter?: GridValueGetter;
  valueSetter?: GridValueSetter;
}

export interface EnhancedDataGridGraphQLProps<T = any> {
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (_changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (_values: any, _helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean; // Escape hatch - not recommended for large datasets
  query?: DocumentNode; // New prop for GraphQL query
  variables?: Record<string, any>;
  paginationStyle?: 'offset' | 'cursor'; // Pagination style: offset (default) or cursor (Relay)
  
  // Selection options
  checkboxSelection?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (_selectionModel: any[]) => void;
  disableMultipleSelection?: boolean;
  
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
  
  // Custom components
  customActionButtons?: React.ReactNode;
  
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

export function EnhancedDataGridGraphQL<T extends { id: GridRowId }>({
  columns,
  rows,
  onSave,
  validateRow,
  // GraphQL options
  useGraphQL = true,
  forceClientSide = false,
  query,
  variables,
  paginationStyle = 'offset',
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
  // Removed unused border options
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  rowHeight,
  ...props
}: EnhancedDataGridGraphQLProps<T>) {
  const apiRef = useGridApiRef();
  
  // Use GraphQL data if enabled and not forcing client-side
  const useGraphQLFetching = useGraphQL && !forceClientSide;
  
  // Determine which hook to use based on pagination style
  const isRelayCursorPagination = paginationStyle === 'cursor';
  
  // Use the appropriate hook based on pagination style
  const {
    rows: graphQLRows,
    totalRows: graphQLTotalRows,
    loading: graphQLLoading,
    setPage,
    setSortModel,
    setFilterModel,
    pageInfo,
    setPaginationDirection,
  } = useGraphQLFetching
    ? (isRelayCursorPagination
      ? useRelayGraphQLData<T>({
          pageSize,
          initialPage: 0,
          initialSortModel: [],
          initialFilterModel: {},
          query,
          variables,
          nodeToRow: (node) => ({ ...node, id: node.accounting_mtm_history_id || node.id }),
        })
      : useGraphQLData<T>({
          pageSize,
          initialPage: 0,
          initialSortModel: [],
          initialFilterModel: {},
          query,
          variables,
        }))
    : {
        rows: [] as T[],
        totalRows: 0,
        loading: false,
        error: null as Error | null,
        setPage: () => {},
        setSortModel: () => {},
        setFilterModel: () => {},
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        },
        setPaginationDirection: () => {}
      } as ServerSideResult<T>;
  
  // Use GraphQL data or client data based on the useGraphQLFetching flag
  const displayRows = useGraphQLFetching ? graphQLRows : rows;
  const totalRows = useGraphQLFetching ? graphQLTotalRows : rows.length;
  
  // Combine external loading state with GraphQL loading state
  const loading = externalLoading || graphQLLoading;
  
  // Initialize selection model hook
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
        onPaginationModelChange={(model) => {
          // For GraphQL pagination, fetch the data
          if (useGraphQLFetching) {
            setPage(model.page);
          }
        }}
        
        // Sorting and filtering
        sortingMode={useGraphQLFetching ? 'server' : 'client'}
        filterMode={useGraphQLFetching ? 'server' : 'client'}
        onSortModelChange={(model) => {
          if (useGraphQLFetching) {
            setSortModel(model.map(item => ({
              field: item.field,
              sort: item.sort as 'asc' | 'desc'
            })));
          }
        }}
        onFilterModelChange={(model) => {
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
        onSelectionModelChange={(selectionModel) => {
          // Adapter function to match the expected signature
          handleSelectionModelChange(selectionModel, {} as any);
        }}
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
            customActionButtons={props.customActionButtons}
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