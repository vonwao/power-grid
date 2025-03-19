import React from 'react';
import { Tooltip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { FieldError } from '../../../types/form';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';
import { ValidationIndicator } from '../components/ValidationIndicator';

export interface CellRendererProps {
  params: GridRenderCellParams;
  column: EnhancedColumnConfig;
  isDirty: boolean;
  error?: FieldError;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  params,
  column,
  isDirty,
  error,
}) => {
  const { value, row } = params;
  
  // Use the field config's renderViewMode if provided, otherwise use the legacy fieldType
  let content: React.ReactNode;
  if (column.fieldConfig?.renderViewMode) {
    content = column.fieldConfig.renderViewMode(value, row);
  } else if (column.fieldType?.renderViewMode) {
    content = column.fieldType.renderViewMode(value, row);
  } else {
    // Default rendering
    content = value != null ? String(value) : '';
  }
  
  // Use the ValidationIndicator component to handle styling
  return (
    <ValidationIndicator error={error} isDirty={isDirty}>
      {content}
    </ValidationIndicator>
  );
};
