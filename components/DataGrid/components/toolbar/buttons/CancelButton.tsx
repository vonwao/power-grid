import React from 'react';
import { Button, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGridMode } from '../../../context/GridModeContext';

interface CancelButtonProps {
  disabled?: boolean;
  className?: string;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, cancelChanges } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canCancel = isInEditOrAddMode;
  const disabled = externalDisabled || !canCancel;
  
  const handleClick = () => {
    if (!disabled) {
      cancelChanges();
    }
  };
  
  return (
    <Tooltip title={canCancel ? "Cancel changes" : "No changes to cancel"}>
      <span>
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<CloseIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
          sx={{ 
            minWidth: 0, 
            px: 1,
            opacity: canCancel ? 1 : 0.5
          }}
        >
          Cancel
        </Button>
      </span>
    </Tooltip>
  );
};
