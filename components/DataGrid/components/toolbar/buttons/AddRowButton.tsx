import React from 'react';
import { Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGridMode } from '../../../context/GridModeContext';

interface AddRowButtonProps {
  disabled?: boolean;
  className?: string;
}

export const AddRowButton: React.FC<AddRowButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, addRow } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canAdd = !isInEditOrAddMode;
  const disabled = externalDisabled || !canAdd;
  
  const handleClick = () => {
    if (!disabled) {
      addRow();
    }
  };
  
  return (
    <Tooltip title={canAdd ? "Add new record" : "Cannot add while editing"}>
      <span>
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
          sx={{ 
            minWidth: 0, 
            px: 1,
            opacity: canAdd ? 1 : 0.5
          }}
        >
          Add
        </Button>
      </span>
    </Tooltip>
  );
};
