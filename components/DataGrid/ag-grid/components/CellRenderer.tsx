import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Tooltip } from '@mui/material';
import { FieldError } from '../../../../types/form';
import { CoreColumnConfig } from '../../core/types';
import { useGridForm } from '../../core/context';

export interface CellRendererProps extends ICellRendererParams {
  // Use a custom property for our column config
  columnConfig?: CoreColumnConfig;
}

/**
 * Cell renderer component for ag-Grid
 */
export const CellRenderer: React.FC<CellRendererProps> = (props) => {
  const { value, data, node, colDef, columnConfig } = props;
  const rowId = node?.id || '';
  const field = colDef?.field || '';
  
  // Use the column config from params or find it by field
  const { isFieldDirty, getRowErrors, getFormMethods, isCompact, columns } = useGridForm();
  const actualColumnConfig = columnConfig || columns.find(col => col.field === field);
  
  if (!actualColumnConfig) {
    return <div>{value}</div>;
  }
  
  const isDirty = isFieldDirty(rowId, field);
  const errors = getRowErrors(rowId);
  const error = errors?.[field];
  
  // Get the latest value from the form state if available
  const formMethods = getFormMethods(rowId);
  const formValue = formMethods ? formMethods.getValues()[field] : undefined;
  
  // Use the form value if available, otherwise use the grid value
  const displayValue = formValue !== undefined ? formValue : value;
  
  // Use the field config's renderViewMode if provided, otherwise use the legacy fieldType
  let content: React.ReactNode;
  if (actualColumnConfig.fieldConfig?.renderViewMode) {
    content = actualColumnConfig.fieldConfig.renderViewMode(displayValue, data);
  } else if (actualColumnConfig.fieldType?.renderViewMode) {
    content = actualColumnConfig.fieldType.renderViewMode(displayValue, data);
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