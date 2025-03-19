import React, { useRef } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
  GridValueSetterParams,
  useGridApiRef,
  GridRowModel,
} from '@mui/x-data-grid';
import { Box, Paper, Typography } from '@mui/material';
import { FieldTypeConfig } from './fieldTypes/types';
import { ValidationRule, FieldValidator } from './validation/types';
import { CellRenderer } from './renderers/CellRenderer';
import { EditCellRenderer } from './renderers/EditCellRenderer';
import { GridEditingProvider, useGridEditing } from './context/GridEditingContext';
import { StatusPanel } from './components/StatusPanel';
import { AddRowButton } from './components/AddRowButton';

// Enhanced column configuration
export interface EnhancedColumnConfig<T = any> extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
  // Field type configuration
  fieldType: FieldTypeConfig<T>;
  
  // Special case for required fields (simplified configuration)
  required?: boolean;
  
  // Custom validation rules (in addition to required)
  validationRules?: ValidationRule<T>[];
  
  // Custom validator (overrides validationRules if provided)
  validator?: FieldValidator<T>;
  
  // Value accessors
  valueGetter?: (params: GridValueGetterParams) => T | null;
  valueSetter?: (params: GridValueSetterParams) => T | null;
}

export interface EnhancedDataGridProps<T = any> {
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
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
    const { fieldType, required, validationRules, validator, ...rest } = column;
    
    return {
      ...rest,
      renderCell: (params) => {
        return (
          <CellRendererWrapper 
            params={params} 
            fieldType={fieldType} 
          />
        );
      },
      renderEditCell: (params) => {
        return (
          <EditCellRenderer
            params={params}
            fieldType={fieldType}
          />
        );
      },
    };
  });
  
  return (
    <GridEditingProvider columns={columns} initialRows={rows} onSave={onSave}>
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
            disableSelectionOnClick={disableSelectionOnClick}
            disableVirtualization={disableVirtualization}
            loading={loading}
            showCellRightBorder={showCellRightBorder}
            showColumnRightBorder={showColumnRightBorder}
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
    </GridEditingProvider>
  );
}

// Wrapper for CellRenderer that gets validation state from context
const CellRendererWrapper = ({ params, fieldType }: { params: any, fieldType: FieldTypeConfig }) => {
  const { getValidationState } = useGridEditing();
  const validationResult = getValidationState(params.id, params.field);
  
  return (
    <CellRenderer
      params={params}
      fieldType={fieldType}
      validationResult={validationResult}
    />
  );
};
