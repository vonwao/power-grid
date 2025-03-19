import React from 'react';
import { Tooltip } from '@mui/material';
import { ValidationResult } from '../validation/types';

interface ValidationIndicatorProps {
  validationResult: ValidationResult;
  children: React.ReactNode;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  validationResult,
  children,
}) => {
  // If there's no validation result, just return the children
  if (!validationResult) {
    return <>{children}</>;
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
      <div style={style}>{children}</div>
    </Tooltip>
  );
};
