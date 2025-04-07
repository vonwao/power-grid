import React from 'react';
import { Chip } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useGridMode } from '../../../context/GridModeContext';

interface ValidationSummaryProps {
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  className,
}) => {
  const { hasValidationErrors } = useGridMode();
  
  if (!hasValidationErrors) {
    return null;
  }

  return (
    <Chip
      icon={<ErrorIcon />}
      label="Validation Errors"
      color="error"
      size="small"
      className={className}
      sx={{ 
        height: 24,
        '& .MuiChip-icon': {
          fontSize: '1rem'
        }
      }}
    />
  );
};
