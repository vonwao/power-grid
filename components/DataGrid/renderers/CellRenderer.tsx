import React from 'react';
import { Tooltip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { FieldTypeConfig } from '../fieldTypes/types';
import { ValidationResult } from '../validation/types';

interface CellRendererProps {
  params: GridRenderCellParams;
  fieldType: FieldTypeConfig;
  validationResult?: ValidationResult;
}

export const CellRenderer: React.FC<CellRendererProps> = ({
  params,
  fieldType,
  validationResult,
}) => {
  const { value, row } = params;
  
  // Render the cell content using the field type's renderViewMode
  const content = fieldType.renderViewMode(value, row);
  
  // If there's no validation result, just return the content
  if (!validationResult) {
    return content;
  }
  
  // Apply validation styling if needed
  const style: React.CSSProperties = {};
  
  if (!validationResult.valid) {
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
    <Tooltip title={validationResult.valid ? 'Valid' : validationResult.message || 'Invalid'}>
      <div style={style}>{content}</div>
    </Tooltip>
  );
};
