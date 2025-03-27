import React from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Tooltip, 
  CircularProgress 
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';
import { useGridForm } from '../../core/context';

/**
 * Status panel component that shows validation errors and save/cancel buttons
 */
export const StatusPanel: React.FC = () => {
  const { 
    hasValidationErrors, 
    saveChanges, 
    cancelChanges, 
    isRowDirty, 
    getRowErrors 
  } = useGridForm();
  
  // Check if there are any dirty rows
  const hasDirtyRows = React.useMemo(() => {
    try {
      // This is a simplified check - in a real app, you'd track dirty rows more efficiently
      return Array.from(document.querySelectorAll('[data-id]')).some(
        el => isRowDirty(el.getAttribute('data-id'))
      );
    } catch (error) {
      console.error('Error checking for dirty rows:', error);
      return false;
    }
  }, [isRowDirty]);
  
  // If there are no dirty rows, don't show the panel
  if (!hasDirtyRows) {
    return null;
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mt: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {hasValidationErrors ? (
          <Tooltip title="Please fix validation errors before saving">
            <Chip 
              icon={<ErrorIcon />} 
              label="Validation errors" 
              color="error" 
              variant="outlined" 
              sx={{ mr: 2 }}
            />
          </Tooltip>
        ) : (
          <Typography variant="body1">
            You have unsaved changes
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<CancelIcon />} 
          onClick={cancelChanges}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={saveChanges}
          disabled={hasValidationErrors}
          color="primary"
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};