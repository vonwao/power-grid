import React from 'react';
import { Tooltip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { FieldError } from '../../../../types/form';
import { CoreColumnConfig } from '../../core/types';
import { useGridForm } from '../../core/context';

export interface CellRendererProps {
  params: GridRenderCellParams;
  column: CoreColumnConfig;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  params,
  column,
}) => {
  const { value, row, id, field } = params;
  const { isFieldDirty, getRowErrors, getFormMethods, isCompact } = useGridForm();
  
  const isDirty = isFieldDirty(id, field);
  const errors = getRowErrors(id);
  const error = errors?.[field];
  
  // Get the latest value from the form state if available
  const formMethods = getFormMethods(id);
  const formValue = formMethods ? formMethods.getValues()[field] : undefined;
  
  // Use the form value if available, otherwise use the grid value
  const displayValue = formValue !== undefined ? formValue : value;
  
  // Use the field config's renderViewMode if provided, otherwise use the legacy fieldType
  let content: React.ReactNode;
  if (column.fieldConfig?.renderViewMode) {
    content = column.fieldConfig.renderViewMode(displayValue, row);
  } else if (column.fieldType?.renderViewMode) {
    content = column.fieldType.renderViewMode(displayValue, row);
  } else {
    // Default rendering
    content = displayValue != null ? String(displayValue) : '';
  }
  
  // Apply styling based on validation state
  const getStyles = () => {
    const baseStyles = {
      padding: isCompact ? '4px 8px' : '8px 16px',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    };
    
    if (error) {
      return {
        ...baseStyles,
        color: '#d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.04)',
        borderBottom: '2px solid #d32f2f',
      };
    }
    
    if (isDirty) {
      return {
        ...baseStyles,
        fontWeight: 'bold',
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
        borderBottom: '2px solid #1976d2',
      };
    }
    
    return baseStyles;
  };
  
  return (
    <div style={getStyles()}>
      {error ? (
        <Tooltip title={error.message || 'Invalid value'} arrow placement="top">
          <div>{content}</div>
        </Tooltip>
      ) : (
        content
      )}
    </div>
  );
};