import React from 'react';
import { Tooltip } from '@mui/material';
import { FieldError } from '../../../types/form';

interface ValidationIndicatorProps {
  error?: FieldError;
  isDirty: boolean;
  children: React.ReactNode;
  compact?: boolean; // For smaller row heights
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  error,
  isDirty,
  children,
  compact = false,
}) => {
  // If the field is not dirty, just return the children without styling
  if (!isDirty) {
    return <>{children}</>;
  }
  
  // Apply validation styling if needed
  const style: React.CSSProperties = {};
  
  // Set padding based on compact mode
  style.padding = compact ? '2px' : '4px';
  
  if (error) {
    // Invalid field styling - No border as requested
    
    // Option 1: Solid background color
    style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    
    // Option 2: Diagonal striped pattern (commented out, can be toggled)
    // style.backgroundImage = 'linear-gradient(45deg, rgba(255, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 0, 0, 0.1) 50%, rgba(255, 0, 0, 0.1) 75%, transparent 75%, transparent)';
    // style.backgroundSize = '10px 10px';
  } else {
    // Valid field styling - No border as requested
    
    // Option 1: Solid background color
    style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    
    // Option 2: Diagonal striped pattern (commented out, can be toggled)
    // style.backgroundImage = 'linear-gradient(45deg, rgba(0, 255, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 255, 0, 0.1) 50%, rgba(0, 255, 0, 0.1) 75%, transparent 75%, transparent)';
    // style.backgroundSize = '10px 10px';
  }
  
  return (
    <Tooltip title={error ? error.message || 'Invalid' : 'Valid'}>
      <div style={style}>{children}</div>
    </Tooltip>
  );
};
