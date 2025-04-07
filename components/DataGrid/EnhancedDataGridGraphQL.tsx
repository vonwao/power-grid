import React, { useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetter,
  GridValueSetter,
  useGridApiRef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridCallbackDetails,
} from '@mui/x-data-grid';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { ValidationOptions } from '../../types/form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridFormProvider, useGridForm, ValidationHelpers } from './context/GridFormContext';
import { CellEditHandler, UnifiedDataGridToolbar } from './components';
import { SelectFieldType } from './fieldTypes/SelectField';
import { useGridNavigation, useGraphQLData, useSelectionModel, usePagination } from './hooks';
import { ServerSideResult } from './types';
import { GridModeProvider, useGridMode, GridMode } from './context/GridModeContext';
import { CellRendererWrapper } from './components/graphqlGrid/CellRendererWrapper'; 
import { DataGridWithModeControl } from './components/graphqlGrid/DataGridWithModeControl'; // Import the new component

// Field configuration for React Hook Form integration
export interface FieldConfig<T = any> {
  // Basic properties
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  
  // For select fields
  options?: Array<{value: any, label: string}>;
  
  // Rendering (optional - can use defaults)
  renderViewMode?: (value: T | null, row: any) => React.ReactNode;
  renderEditMode?: (props: any) => React.ReactNode;
  
  // Validation
  validation?: ValidationOptions;
  
  // Transform functions (optional)
  parse?: (value: any) => T | null;
  format?: (value: T | null) => string;
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
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean; // Escape hatch - not recommended for large datasets
  
  // Selection options
  checkboxSelection?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (selectionModel: any[]) => void;
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

export function EnhancedDataGridGraphQL<T extends { id: GridRowId }>({
  columns,
  rows,
  onSave,
  validateRow,
  // GraphQL options
  useGraphQL = true,
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
  showCellRightBorder = true,
  showColumnRightBorder = true,
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  rowHeight,
  ...props
}: EnhancedDataGridGraphQLProps<T>) {
  const apiRef = useGridApiRef();
  
  // Use GraphQL data if enabled and not forcing client-side
  const useGraphQLFetching = useGraphQL && !forceClientSide;
  
  // Always call the hook, but only use its results if useGraphQLFetching is true
  const {
    rows: graphQLRows,
    totalRows: graphQLTotalRows,
    loading: graphQLLoading,
    setPage,
    setSortModel,
    setFilterModel,
  } = useGraphQLData<T>({
    pageSize,
    initialPage: 0,
    initialSortModel: [],
    initialFilterModel: {},
  });
  
  // Use GraphQL data or client data based on the useGraphQLFetching flag
  const displayRows = useGraphQLFetching ? graphQLRows : rows;
  const totalRows = useGraphQLFetching ? graphQLTotalRows : rows.length;
  
  // Combine external loading state with GraphQL loading state
  const loading = externalLoading || graphQLLoading;
  
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

  // Removed DataGridWithModeControl definition
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
        // Use correct prop name 'onSelectionModelChange' and match expected signature
        onSelectionModelChange={(
          newSelectionModel: GridRowSelectionModel
          // details: GridCallbackDetails // Provider might expect only one argument
        ) => handleSelectionModelChange(newSelectionModel, {} as GridCallbackDetails)} // Pass empty details if needed
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
            {/* Use the imported DataGridWithModeControl component */}
            <DataGridWithModeControl
              apiRef={apiRef}
              displayRows={displayRows}
              gridColumns={gridColumns}
              columns={columns}
              autoHeight={autoHeight}
              density={density}
              disableColumnFilter={disableColumnFilter}
              disableColumnMenu={disableColumnMenu}
              disableColumnSelector={disableColumnSelector}
              disableDensitySelector={disableDensitySelector}
              disableSelectionOnClick={disableSelectionOnClick}
              disableVirtualization={disableVirtualization}
              loading={loading}
              hideFooter={hideFooter}
              hideFooterPagination={hideFooterPagination}
              hideFooterSelectedRowCount={hideFooterSelectedRowCount}
              pageSize={pageSize}
              rowsPerPageOptions={rowsPerPageOptions}
              useGraphQLFetching={useGraphQLFetching}
              totalRows={totalRows}
              setPage={setPage}
              setSortModel={setSortModel}
              setFilterModel={setFilterModel}
              checkboxSelection={checkboxSelection}
              canSelectRows={canSelectRows}
              selectionModel={selectionModel}
              handleSelectionModelChange={handleSelectionModelChange}
              disableMultipleSelection={disableMultipleSelection}
              canEditRows={canEditRows}
              rowHeight={rowHeight}
              handleKeyDown={handleKeyDown}
              props={props}
            />
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
      <div>HELLO Demo</div>
      <GridFormWithToolbar />
    </GridFormProvider>
  );
}

// Removed the inline CellRendererWrapper definition as it's now imported
