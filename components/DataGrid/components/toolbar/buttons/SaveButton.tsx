import React from 'react';
import { Button, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useGridMode } from '../../../context/GridModeContext';

interface SaveButtonProps {
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, saveChanges, hasValidationErrors } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canSave = isInEditOrAddMode && !hasValidationErrors;
  const disabled = externalDisabled || !canSave;
  
  const handleClick = () => {
    if (!disabled) {
      saveChanges();
    }
  };
  
  return (
    <Tooltip title={
      !isInEditOrAddMode ? "No changes to save" :
      hasValidationErrors ? "Cannot save with validation errors" :
      "Save changes"
    }>
      <span>
        <Button
          variant="contained"
          size="small"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
          sx={{ 
            minWidth: 0, 
            px: 1,
            opacity: canSave ? 1 : 0.5
          }}
        >
          Save
        </Button>
      </span>
    </Tooltip>
  );
};
