import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetter,
  GridValueSetter,
  useGridApiRef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { Box, Paper, Typography } from '@mui/material';
import { RegisterOptions } from 'react-hook-form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridFormProvider, useGridForm, ValidationHelpers } from './context/GridFormContext';
import { StatusPanel, AddRowButton, CellEditHandler } from './components';

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
  validation?: RegisterOptions;
  
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

export interface EnhancedDataGridProps<T = any> {
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
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
}

export function EnhancedDataGrid<T extends { id: GridRowId }>({ 
  columns, 
  rows,
  onSave,
  validateRow,
  className,
  autoHeight,
  density = 'standard',
  disableColumnFilter,
  disableColumnMenu,
  disableColumnSelector,
  disableDensitySelector,
  disableSelectionOnClick = true,
  disableVirtualization,
  loading,
  pageSize = 25,
  rowsPerPageOptions = [10, 25, 50, 100],
  showCellRightBorder,
  showColumnRightBorder,
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  ...props
}: EnhancedDataGridProps<T>) {
  const apiRef = useGridApiRef();
  
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
  
  return (
    <GridFormProvider columns={columns} initialRows={rows} onSave={onSave} validateRow={validateRow}>
      <div className={`h-screen w-screen flex flex-col overflow-hidden ${className || ''}`}>
        <Paper elevation={1} className="p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <Typography variant="h5">
              Enhanced Data Grid
            </Typography>
            
            <AddRowButton />
          </div>
          
          <Box className="flex items-center mt-2">
            <Typography variant="body2" className="text-gray-600">
              Click to edit • Tab to navigate • Enter or click outside to save cell
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} className="flex-grow w-full">
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
            onCellClick={(params) => {
              if (params.field !== '__check__' && params.field !== '__actions__') {
                const { id, field } = params;
                const column = columns.find(col => col.field === field);
                if (column?.editable !== false) {
                  apiRef.current.startCellEditMode({ id, field });
                }
              }
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
            }}
            {...props}
          />
        </Paper>
        
        <StatusPanel />
      </div>
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
