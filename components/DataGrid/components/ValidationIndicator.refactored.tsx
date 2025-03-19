import React from 'react';
import { Tooltip } from '@mui/material';
import { FieldError } from '../../../types/form'; // Import from our custom types instead of react-hook-form

interface ValidationIndicatorProps {
  error?: FieldError;
  isDirty: boolean;
  children: React.ReactNode;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  error,
  isDirty,
  children,
}) => {
  // If the field is not dirty, just return the children without styling
  if (!isDirty) {
    return <>{children}</>;
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
      <div style={style}>{children}</div>
    </Tooltip>
  );
};
