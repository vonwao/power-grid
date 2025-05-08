import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { DocumentNode } from '@apollo/client';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetter,
  GridValueSetter,
  useGridApiRef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridFilterPanel,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';

// Import the AddRowDialog
import { AddRowDialog } from './components/AddRowDialog';
import { Paper, Typography } from '@mui/material';
import { ValidationOptions } from '../../types/form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import {
  GridFormProvider,
  useGridForm,
  ValidationHelpers,
} from './context/GridFormContext';
import { CellEditHandler, UnifiedDataGridToolbar } from './components';
import { SelectFieldType } from './fieldTypes/SelectField';
import { useGridNavigation, useGraphQLData, useSelectionModel } from './hooks';
import { GridModeProvider, useGridMode } from './context/GridModeContext';
import { ServerSideResult } from './types/serverSide';
 
// Field configuration for React Hook Form integration
export interface FieldConfig<T = any> {
  // Basic properties
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
 
  // For select fields
  options?: Array<{ value: any; label: string }>;
 
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
export interface EnhancedColumnConfig<T = any>
  extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
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
  onSave?: (_changes: { edits: any[]; additions: any[] }) => void;
  validateRow?: (
    _values: any,
    _helpers: ValidationHelpers
  ) => Record<string, string> | Promise<Record<string, string>>;
 
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean; // Escape hatch - not recommended for large datasets
  query?: DocumentNode; // New prop for GraphQL query
  variables?: Record<string, any>;
  paginationStyle?: 'offset' | 'cursor' | 'key'; // Pagination style: offset (default), cursor (Relay), or key-based
 
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

 
  onDelete?: (ids: GridRowId[]) => void; // Callback for row deletion

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
 
  // Pagination props (legacy + new MUI DataGrid pagination)
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  paginationMode?: 'client' | 'server';
  rowCount?: number;
 
  // Testing and debugging props
  onPageChange?: (page: number) => void; // Callback for page changes
  onRowsChange?: (rows: T[]) => void; // Callback for rows changes
 
  // New callback to get grid functions
  onGridFunctionsInit?: (
    refetch: () => Promise<any>,
    resetCursors: () => void,
    pageInfo: any
  ) => void;

  // Add new props for AddRowDialog
  useAddDialog?: boolean; // Whether to use dialog for adding rows
  onAddRow?: (rowData: any) => void; // Custom callback for when a row is added through the dialog
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
  paginationStyle = 'cursor',
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
  canDeleteRows = false, // Default to false
  onDelete,
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
  // New pagination props
  paginationModel: externalPaginationModel,
  onPaginationModelChange: externalOnPaginationModelChange,
  paginationMode = 'server',
  rowCount,
  // Add new props for AddRowDialog
  useAddDialog = true, // Whether to use dialog for adding rows
  onAddRow, // Custom callback for when a row is added through the dialog
  ...props // Moved ...props to the end
}: EnhancedDataGridGraphQLProps<T>) {
  // Debug logging
  const debugLog = (message: string, ...args: any[]) => {
    console.log(`📊 [EnhancedDataGridGraphQL] ${message}`, ...args);
  };
 
  // Track render count for debugging
  const renderCountRef = useRef(0);
  renderCountRef.current++;
 
  debugLog(`Rendering (count: ${renderCountRef.current}) with props:`, {
    useGraphQL,
    forceClientSide,
    selectionModel: initialSelectionModel?.length,
    // rows: rows.length
  });
 
  const apiRef = useGridApiRef();
 
  // Use GraphQL data if enabled and not forcing client-side
  const useGraphQLFetching = useMemo(
    () => useGraphQL && !forceClientSide,
    [useGraphQL, forceClientSide]
  );

  // Handle pagination model state (combining legacy and new MUI DataGrid pagination)
  const [internalPaginationModel, setInternalPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSize,
  });

  // Use external pagination model if provided, otherwise use internal state
  const paginationModelToUse = useMemo(() => {
    return externalPaginationModel || internalPaginationModel;
  }, [externalPaginationModel, internalPaginationModel]);

  // Handle pagination model changes
  const handlePaginationModelChange = useCallback(
    (newModel: GridPaginationModel) => {
      // Update internal state if not controlled externally
      if (!externalPaginationModel) {
        setInternalPaginationModel(newModel);
      }
      
      // Call external handler if provided
      if (externalOnPaginationModelChange) {
        externalOnPaginationModelChange(newModel);
      }
      
      // TODO: Integrate with legacy pagination handler (setPage)
      if (useGraphQLFetching && setPage) {
        setPage(newModel.page);
      }
    },
    [externalPaginationModel, externalOnPaginationModelChange, useGraphQLFetching]
  );
 
  // Track the current page for controlled pagination
  const [currentPage, setCurrentPage] = React.useState(0);

  // Track sort and filter models for internal state
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>(initialSortModel || []);
  const [internalFilterModel, setInternalFilterModel] = useState<GridFilterModel>(initialFilterModel || { items: [] });

  // Use external models if provided, otherwise use internal state
  const sortModelToUse = useMemo(() => initialSortModel || internalSortModel, [initialSortModel, internalSortModel]);
  const filterModelToUse = useMemo(() => initialFilterModel || internalFilterModel, [initialFilterModel, internalFilterModel]);

// First, let's make sure the selectGraphQLHook function always returns a valid object
const selectGraphQLHook = useCallback(() => {
  if (!useGraphQLFetching) {
    return {
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
        endCursor: null,
      },
      refetch: () => Promise.resolve({ data: null }),
      resetCursors: () => {},
    } as ServerSideResult<T>;
  }

  // TODO: Add implementation for key-based pagination when paginationStyle is 'key'
  if (paginationStyle === 'key') {
    // Use key-based pagination hook
    return useGraphQLData<T>({
      pageSize: paginationModelToUse.pageSize,
      initialPage: paginationModelToUse.page,
      query,
      variables,
      initialFilterModel: filterModelToUse,
      initialSortModel: sortModelToUse?.map(item => ({
        field: item.field,
        sort: item.sort as 'asc' | 'desc'
      })),
      nodeToRow: (node) => ({
        ...node,
        id: node.accounting_mtm_history_id || node.id,
      }),
    });
  } else {
    // For cursor-based pagination or other types, return the default empty state
    // This is just a fallback until the actual implementation is added
    return {
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
        endCursor: null,
      },
      refetch: () => Promise.resolve({ data: null }),
      resetCursors: () => {},
    } as ServerSideResult<T>;
  }
}, [
  useGraphQLFetching,
  paginationStyle,
  paginationModelToUse.pageSize,
  paginationModelToUse.page,
  query,
  variables,
  filterModelToUse,
  sortModelToUse
]);

// Use the appropriate hook based on pagination style
const graphQLResult = selectGraphQLHook();

// Now when we destructure graphQLResult, it will always be a valid object with the expected properties
const {
  rows: graphQLRows = [],
  totalRows: graphQLTotalRows = 0,
  loading: graphQLLoading = false,
  setPage = () => {},
  setSortModel = () => {},
  setFilterModel = () => {},
  refetch = () => Promise.resolve({ data: null }),
  pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  resetCursors = () => {},
} = graphQLResult || {}; // Add a fallback empty object in case graphQLResult is undefined
 
  // Use GraphQL data or client data based on the useGraphQLFetching flag
  const displayRows = useMemo(() => {
    const displayedRows = useGraphQLFetching ? graphQLRows : rows;
    debugLog(
      `Using ${useGraphQLFetching ? 'GraphQL' : 'client'} data with ${displayedRows.length} rows`
    );
    console.log('EnhancedDataGridGraphQL: displayRows updated:', displayedRows);
    return displayedRows;
  }, [useGraphQLFetching, graphQLRows, rows]);
 
  const totalRows = useMemo(
    () => {
      if (useGraphQLFetching) {
        return graphQLTotalRows || rowCount || 0;
      }
      return rowCount || rows.length;
    },
    [useGraphQLFetching, graphQLTotalRows, rowCount, rows.length]
  );
 
  // Combine external loading state with GraphQL loading state
  const loading = useMemo(
    () => externalLoading || graphQLLoading,
    [externalLoading, graphQLLoading]
  );
 
  // Call the onRowsChange callback when rows change
  useEffect(() => {
    if (props.onRowsChange) {
      debugLog('Rows changed, calling onRowsChange');
      props.onRowsChange(displayRows);
    }
  }, [displayRows, props.onRowsChange]);

  // Call onGridFunctionsInit callback if provided
  // Use a ref to track if we've already initialized the grid functions
  const gridFunctionsInitializedRef = useRef(false);
  
  useEffect(() => {
    // Only initialize once to prevent infinite loops
    if (props.onGridFunctionsInit && useGraphQLFetching && !gridFunctionsInitializedRef.current) {
      debugLog('Initializing grid functions');
      // Ensure all functions are defined before passing them
      const safeRefetch = refetch || (() => Promise.resolve({ data: null }));
      const safeResetCursors = resetCursors || (() => {});
      const safePageInfo = pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      };
      
      props.onGridFunctionsInit(
        safeRefetch,
        safeResetCursors,
        safePageInfo
      );
      
      // Mark as initialized
      gridFunctionsInitializedRef.current = true;
    }
  }, [props.onGridFunctionsInit, refetch, resetCursors, pageInfo, useGraphQLFetching]);

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
      if (useGraphQLFetching) {
        // For GraphQL, we'll queue this addition for the next save operation
        // The row will appear in the next save event's additions array
        // No immediate UI update
        debugLog('Queueing row addition for GraphQL save');
      } else {
        // For client-side, add directly to rows
        // This is typically handled by the parent component managing the `rows` prop
        debugLog('Client-side row addition - parent component should handle update');
      }
    }

    // Close the dialog
    setAddDialogOpen(false);
  }, [useGraphQLFetching, onAddRow]);


  // Initialize selection model hook
  const { selectionModel, onSelectionModelChange: handleSelectionModelChange } =
    useSelectionModel({
      selectionModel: initialSelectionModel,
      onSelectionModelChange,
    });
 
  // Define a navigation handler that uses the correct API methods
  const handleNavigate = useCallback(
    (id: GridRowId, field: string) => {
      try {
        // Check if the cell is already in edit mode
        const cellMode = apiRef.current.getCellMode(id, field);
        if (cellMode === 'view') {
          apiRef.current.startCellEditMode({ id, field });
        }
      } catch (error) {
        console.error('Error navigating to cell:', error);
      }
    },
    [apiRef]
  );
 
  // Initialize grid navigation hook
  const { handleKeyDown } = useGridNavigation({
    api: apiRef.current,
    columns,
    rows: displayRows,
    onNavigate: handleNavigate,
  });
 
  // Create SelectFieldType instances for select fields
  columns.forEach((column) => {
    if (column.fieldConfig?.type === 'select' && !column.fieldType) {
      column.fieldType = new SelectFieldType({
        options: column.fieldConfig.options || [],
        valueKey: 'value',
        labelKey: 'label',
      });
    }
  });
 
  // Convert enhanced columns to MUI X Data Grid columns
  const gridColumns: GridColDef[] = columns.map((column) => {
    return {
      ...column,
      renderCell: (params) => {
        return <CellRendererWrapper params={params} column={column} />;
      },
      renderEditCell: (params) => {
        return <EditCellRenderer params={params} column={column} />;
      },
    };
  });
 
  // Determine if we're in compact mode based on row height
  const isCompact = rowHeight !== undefined && rowHeight <= 30;
 
  // Handler for page changes (legacy support)
  const handlePageChange = useCallback(
    (newPage: number) => {
      debugLog(`Page change requested: ${currentPage} → ${newPage}`);
 
      // Update local state
      setCurrentPage(newPage);
 
      // If using GraphQL, update the page in the hook
      if (useGraphQLFetching) {
        // Prevent race conditions by setting page without timeout
        setPage(newPage);
 
        // Call the onPageChange callback if provided
        if (props.onPageChange) {
          props.onPageChange(newPage);
        }

        // Update the pagination model if using new pagination
        handlePaginationModelChange({
          page: newPage,
          pageSize: paginationModelToUse.pageSize
        });
      }
    },
    [currentPage, useGraphQLFetching, setPage, props.onPageChange, handlePaginationModelChange, paginationModelToUse.pageSize]
  );

  // Handle sorting model changes
  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    // Update internal state if not controlled externally
    if (!initialSortModel) {
      setInternalSortModel(newModel);
    }
    
    // Call external handler if provided
    if (onSortModelChange) {
      onSortModelChange(newModel);
    }
    
    // Update GraphQL hook if using server-side sorting
    if (useGraphQLFetching && sortingMode === 'server') {
      setSortModel(newModel.map(item => ({
        field: item.field,
        sort: item.sort as 'asc' | 'desc'
      })));
      
      // Reset to page 0 when sorting changes
      if (currentPage !== 0) {
        handlePageChange(0);
      }
    }
  }, [initialSortModel, onSortModelChange, useGraphQLFetching, sortingMode, setSortModel, currentPage, handlePageChange]);

  // Handle filtering model changes
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    // Update internal state if not controlled externally
    if (!initialFilterModel) {
      setInternalFilterModel(newModel);
    }
    
    // Call external handler if provided
    if (onFilterModelChange) {
      onFilterModelChange(newModel);
    }
    
    // Update GraphQL hook if using server-side filtering
    if (useGraphQLFetching && filterMode === 'server') {
      const filterModelObj: Record<string, any> = {};
      
      // Process each filter item and capture all relevant information
      newModel.items.forEach((item) => {
        if (item.field && item.value !== undefined) {
          // Include the operator and value in the filter model
          filterModelObj[item.field] = {
            value: item.value,
            operator: item.operator || 'contains', // Default to 'contains' if no operator is specified
          };
        }
      });
      
      setFilterModel(filterModelObj);
      
      // Reset to page 0 when filtering changes
      if (currentPage !== 0) {
        handlePageChange(0);
      }
    }
  }, [initialFilterModel, onFilterModelChange, useGraphQLFetching, filterMode, setFilterModel, currentPage, handlePageChange]);
 
  // Create a wrapper component for DataGrid that uses the grid mode
  const DataGridWithModeControl = React.memo(() => {
    // Get the current mode from context
    const { mode, setMode } = useGridMode();
  
    // Determine if row selection should be disabled
    const isInEditOrAddMode = mode === 'edit' || mode === 'add';
    
    // Track filter model and panel state
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    
    // Use a ref to track if the filter panel is open
    const filterPanelOpenRef = useRef(false);
 
    // Handle cell click
    const handleCellClick = (params: any) => {
      // If we're already in edit mode, allow single click to edit cells
      if (mode === 'edit') {
        // Don't handle clicks on checkboxes or action columns
        if (params.field === '__check__' || params.field === '__actions__') {
          return;
        }
 
        const { id, field } = params;
        const column = columns.find((col) => col.field === field);
 
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
      const column = columns.find((col) => col.field === field);
 
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
        disableColumnFilter={
          disableColumnFilter === undefined ? false : disableColumnFilter
        }
        disableColumnMenu={disableColumnMenu}
        disableColumnSelector={disableColumnSelector}
        disableDensitySelector={disableDensitySelector}
        disableRowSelectionOnClick={
          isInEditOrAddMode || disableSelectionOnClick
        }
        disableVirtualization={disableVirtualization}
        loading={loading}
        hideFooter={hideFooter}
        hideFooterPagination={hideFooterPagination}
        hideFooterSelectedRowCount={hideFooterSelectedRowCount}
        // Pagination support - both legacy and new MUI DataGrid model
        paginationModel={paginationModelToUse}
        onPaginationModelChange={handlePaginationModelChange}
        paginationMode={paginationMode}
        rowCount={totalRows}
        pageSizeOptions={rowsPerPageOptions}
        // Row selection
        checkboxSelection={checkboxSelection && canSelectRows}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionModelChange}
        disableMultipleRowSelection={disableMultipleSelection}
        isRowSelectable={() => !isInEditOrAddMode}
        // Sorting
        sortingMode={sortingMode}
        sortModel={sortModelToUse}
        onSortModelChange={handleSortModelChange}
        // Filtering
        filterMode={filterMode}
        filterModel={filterModelToUse}
        onFilterModelChange={handleFilterModelChange}
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
          ),
          filterPanel: (props) => {
            // Create a custom filter panel component that prevents auto-closing
            const CustomFilterPanel = () => {
              // Mark when filter panel opens
              useEffect(() => {
                console.log('Filter panel opened');
                filterPanelOpenRef.current = true;
                setIsFilterPanelOpen(true);
                
                // Cleanup function when component unmounts
                return () => {
                  console.log('Filter panel closed');
                  setTimeout(() => {
                    filterPanelOpenRef.current = false;
                    setIsFilterPanelOpen(false);
                  }, 100);
                };
              }, []);
              
              return (
                <div className="custom-filter-panel">
                  <GridFilterPanel
                    {...props}
                  />
                </div>
              );
            };
            
            return <CustomFilterPanel />;
          }
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          height: '100%',
          width: 'calc(100vw - 70px)',
          '& .MuiDataGrid-main': {
            overflow: 'auto',
          },
        }}
        {...props}
      />
    );
  });
 
  // Get the GridFormContext functions and state
  const GridFormWrapper = ({ children }: { children: React.ReactNode }) => {
    const {
      saveChanges,
      cancelChanges,
      addRow,
      hasValidationErrors,
      isRowEditing,
      isRowDirty,
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
        // Pass delete props
        canDeleteRows={canDeleteRows}
        onDelete={onDelete}
      >
        {children}
      </GridModeProvider>
    );
  };
 
  // Custom toolbar component that includes add button logic
  const CustomToolbar = useCallback(() => {
    // Get grid mode context
    const { mode, setMode, addRow: contextAddRow } = useGridMode();

    // Handle add button click
    const handleAddClick = () => {
      if (useAddDialog) {
        // Open dialog
        handleOpenAddDialog();
      } else {
        // Use built-in grid add functionality
        contextAddRow();
      }
    };

    return (
      <UnifiedDataGridToolbar
        // Pass existing props from GridModeProvider context
        onSave={useGridForm().saveChanges}
        onExport={() => console.log('Export clicked')}
        onUpload={() => console.log('Upload clicked')}
        onHelp={() => console.log('Help clicked')}
        canEditRows={canEditRows}
        canAddRows={canAddRows}
        canSelectRows={canSelectRows}
        canDeleteRows={canDeleteRows}
        customActionButtons={props.customActionButtons}
        // Override the add button behavior
        onAddClick={handleAddClick}
      />
    );
  }, [useAddDialog, handleOpenAddDialog, canEditRows, canAddRows, canSelectRows, canDeleteRows, props.customActionButtons]);


  // Get the saveChanges function from GridFormContext
  const GridFormWithToolbar = () => {
    return (
      <GridFormWrapper>
        <div className={`h-full w-full flex flex-col ${className || ''}`}>
          {/* Custom Toolbar with Add Dialog capability */}
          <CustomToolbar />

          <Paper elevation={0} className="flex-grow w-full overflow-auto">
            <CellEditHandler apiRef={apiRef} />
            <DataGridWithModeControl />
          </Paper>

          {/* Add Row Dialog */}
          {useAddDialog && (
            <AddRowDialog
              open={addDialogOpen}
              onClose={handleCloseAddDialog}
              onSave={handleSaveNewRow}
              columns={columns.filter(col => col.field !== 'id' && col.field !== 'accounting_mtm_history_id')} // Filter out ID columns
              validateRow={validateRow ? (values) => {
                // Adapt the validateRow signature for the dialog
                // Note: This simplified wrapper ignores the promise return and helpers for now.
                // Adjust if the dialog needs more complex validation handling later.
                const result = validateRow(values, {} as ValidationHelpers); // Pass empty helpers
                return typeof result === 'object' && !(result instanceof Promise) ? result : {};
              } : undefined}
            />
          )}
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
const CellRendererWrapper = ({
  params,
  column,
}: {
  params: GridRenderCellParams;
  column: EnhancedColumnConfig;
}) => {
  const { isFieldDirty, getRowErrors, getFormMethods } = useGridForm();
  const isDirty = isFieldDirty(params.id, params.field);
  const errors = getRowErrors(params.id);
  const error = errors?.[params.field];
 
  // Get the latest value from the form state if available
  const formMethods = getFormMethods(params.id);
  const formValue = formMethods
    ? formMethods.getValues()[params.field]
    : undefined;
 
  // Create a new params object with the updated value from form state
  const updatedParams = {
    ...params,
    value: formValue !== undefined ? formValue : params.value,
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