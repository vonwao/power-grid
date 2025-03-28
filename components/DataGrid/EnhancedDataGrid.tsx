import React, { useCallback } from 'react';
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
import { ValidationOptions } from '../../types/form';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridFormProvider, useGridForm, ValidationHelpers } from './context/GridFormContext';
import { StatusPanel, AddRowButton, CellEditHandler } from './components';
import { SelectFieldType } from './fieldTypes/SelectField';
import { useGridNavigation } from './hooks';

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
  rowHeight?: number; // Custom row height in pixels
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
  showCellRightBorder = true,
  showColumnRightBorder = true,
  hideFooter,
  hideFooterPagination,
  hideFooterSelectedRowCount,
  rowHeight,
  ...props
}: EnhancedDataGridProps<T>) {
  const apiRef = useGridApiRef();
  
  // Define a navigation handler that uses the correct API methods
  const handleNavigate = useCallback((id: GridRowId, field: string) => {
    try {
      // Wrap in setTimeout to avoid the "not in view mode" error
      setTimeout(() => {
        try {
          // Check if the cell is already in edit mode
          const cellMode = apiRef.current.getCellMode(id, field);
          if (cellMode === 'view') {
            apiRef.current.startCellEditMode({ id, field });
          }
        } catch (innerError) {
          console.error('Error navigating to cell:', innerError);
        }
      }, 0);
    } catch (error) {
      console.error('Error in navigation handler:', error);
    }
  }, [apiRef]);

  // Initialize grid navigation hook
  const { handleKeyDown } = useGridNavigation({
    api: apiRef.current,
    columns,
    rows,
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
            onCellClick={(params) => {
              if (params.field !== '__check__' && params.field !== '__actions__') {
                const { id, field } = params;
                const column = columns.find(col => col.field === field);
                if (column?.editable !== false) {
                  try {
                    // Wrap in setTimeout to avoid the "not in view mode" error
                    setTimeout(() => {
                      try {
                        // Check if the cell is already in edit mode
                        const cellMode = apiRef.current.getCellMode(id, field);
                        if (cellMode === 'view') {
                          apiRef.current.startCellEditMode({ id, field });
                        }
                      } catch (innerError) {
                        console.error('Error starting cell edit mode:', innerError);
                      }
                    }, 0);
                  } catch (error) {
                    console.error('Error in cell click handler:', error);
                  }
                }
              }
            }}
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
