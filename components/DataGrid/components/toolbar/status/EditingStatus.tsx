import React from 'react';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useGridMode } from '../../../context/GridModeContext';

interface EditingStatusProps {
  className?: string;
}

export const EditingStatus: React.FC<EditingStatusProps> = ({
  className,
}) => {
  const { mode } = useGridMode();
  
  if (mode === 'none') {
    return null;
  }

  return (
    <Chip
      icon={mode === 'edit' ? <EditIcon /> : <AddIcon />}
      label={mode === 'edit' ? 'Editing' : 'Adding'}
      color="primary"
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
