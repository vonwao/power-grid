import React from 'react';
import { Tooltip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { FieldError } from 'react-hook-form';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';

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
  
  // If the field is not dirty, just return the content without styling
  if (!isDirty) {
    return <>{content}</>;
  }
  
  // Apply validation styling if needed
  const style: React.CSSProperties = {};
  
  if (error) {
    // Invalid field styling
    style.border = '1px solid red';
    style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    style.borderStyle = 'dotted';
    style.padding = '4px';
    style.borderRadius = '4px';
  } else {
    // Valid field styling
    style.border = '1px solid green';
    style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    style.padding = '4px';
    style.borderRadius = '4px';
  }
  
  return (
    <Tooltip title={error ? error.message || 'Invalid' : 'Valid'}>
      <div style={style}>{content}</div>
    </Tooltip>
  );
};
