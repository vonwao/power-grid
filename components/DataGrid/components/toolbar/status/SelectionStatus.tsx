import React from 'react';
import { Chip } from '@mui/material';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import { useGridMode } from '../../../context/GridModeContext';

interface SelectionStatusProps {
  className?: string;
}

export const SelectionStatus: React.FC<SelectionStatusProps> = ({
  className,
}) => {
  const { mode, selectedRowCount } = useGridMode();
  
  if (mode !== 'select' || selectedRowCount === 0) {
    return null;
  }

  return (
    <Chip
      icon={<SelectAllIcon />}
      label={`${selectedRowCount} selected`}
      color="info"
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
