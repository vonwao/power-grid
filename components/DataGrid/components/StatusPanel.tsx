import React from 'react';
import { Paper, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { useGridEditing } from '../context/GridEditingContext';

// Icons
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const StatusPanel: React.FC = () => {
  const { editingState, saveChanges, cancelChanges, hasValidationErrors } = useGridEditing();
  const { mode, pendingChanges } = editingState;
  const changeCount = pendingChanges.size;
  
  // Only show when there are pending changes
  if (changeCount === 0 || mode === 'none') return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <Paper 
        elevation={3} 
        className={`
          rounded-full px-4 py-2 flex items-center space-x-2
          ${mode === 'add' ? 'bg-green-50' : 'bg-blue-50'}
          hover:shadow-lg transition-shadow
        `}
      >
        {/* Status icon */}
        <div className={`
          rounded-full w-8 h-8 flex items-center justify-center
          ${mode === 'add' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
        `}>
          {mode === 'add' ? <AddIcon /> : <EditIcon />}
        </div>
        
        {/* Status text */}
        <Typography variant="body2" className="font-medium">
          {mode === 'add' 
            ? 'Adding new record' 
            : `Editing ${changeCount} record${changeCount > 1 ? 's' : ''}`}
        </Typography>
        
        {/* Validation warning if needed */}
        {hasValidationErrors && (
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Validation errors
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-1">
          <Tooltip title={hasValidationErrors ? "Fix validation errors before saving" : "Save changes"}>
            <span>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveChanges}
                className="min-w-0 px-3"
                disabled={hasValidationErrors}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <IconButton 
            size="small" 
            onClick={cancelChanges}
            className="text-gray-500"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
};
