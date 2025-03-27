import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useGridForm } from '../../core/context';

/**
 * Button component for adding a new row to the grid
 */
export const AddRowButton: React.FC = () => {
  const { addRow, hasValidationErrors } = useGridForm();
  
  return (
    <Tooltip 
      title={
        hasValidationErrors 
          ? "Please fix validation errors before adding a new row" 
          : "Add a new row"
      }
    >
      <span>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addRow}
          disabled={hasValidationErrors}
          size="small"
        >
          Add Row
        </Button>
      </span>
    </Tooltip>
  );
};