import React, { useState } from 'react';
import { Paper, Typography, Button, IconButton, Tooltip, Modal, Box } from '@mui/material';
import { useGridForm } from '../context/GridFormContext';

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
  // Get all form context values we need
  const {
    saveChanges,
    cancelChanges,
    hasValidationErrors,
    isRowEditing
  } = useGridForm();
  
  // Get access to the pendingChanges state via a custom hook
  const pendingChangesRef = React.useRef<Map<any, Record<string, any>>>(new Map());
  const [changeCount, setChangeCount] = React.useState(0);
  const [mode, setMode] = React.useState<'add' | 'edit' | 'none'>('none');
  
  // State for the save changes modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [changesJson, setChangesJson] = useState('');
  
  // Use effect to monitor the console logs for pending changes
  React.useEffect(() => {
    // Create a custom console.log to intercept the pendingChanges logs
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      // Check if this is a pendingChanges log
      if (args[0] === 'Pending changes:') {
        const changes = args[1];
        if (Array.isArray(changes)) {
          // Update our local reference to the changes
          const changesMap = new Map();
          changes.forEach(change => {
            changesMap.set(change.rowId, change.changes);
          });
          pendingChangesRef.current = changesMap;
          setChangeCount(changesMap.size);
          
          // Determine mode based on changes
          let hasAddedRow = false;
          changesMap.forEach((_, rowId) => {
            if (rowId.toString().startsWith('new-') || parseInt(rowId) > 1000) {
              hasAddedRow = true;
            }
          });
          
          setMode(hasAddedRow ? 'add' : changesMap.size > 0 ? 'edit' : 'none');
        }
      }
      
      // Call the original console.log
      originalConsoleLog.apply(console, args);
    };
    
    // Restore the original console.log on unmount
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
  // Function to handle opening the save modal
  const handleOpenSaveModal = () => {
    // Convert the pending changes to a format suitable for display
    const changesArray = Array.from(pendingChangesRef.current.entries()).map(([rowId, changes]) => ({
      rowId,
      changes
    }));
    
    // Convert to pretty JSON
    setChangesJson(JSON.stringify(changesArray, null, 2));
    setSaveModalOpen(true);
  };
  
  // Function to handle the actual save
  const handleSave = () => {
    saveChanges();
    setSaveModalOpen(false);
  };
  
  // Always show the panel, with different states based on editing status
  const hasDirtyFields = changeCount > 0 && mode !== 'none';
  const canSave = hasDirtyFields && !hasValidationErrors;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <Paper
        elevation={3}
        className={`
          rounded-lg px-4 py-3 flex flex-col space-y-2
          ${mode === 'add' ? 'bg-green-50' : hasDirtyFields ? 'bg-blue-50' : 'bg-gray-50'}
          hover:shadow-lg transition-shadow
        `}
      >
        {/* Status header */}
        <div className="flex items-center space-x-2">
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
              : hasDirtyFields
                ? `Editing ${changeCount} record${changeCount > 1 ? 's' : ''}`
                : 'No changes'}
          </Typography>
        </div>

        {/* Validation warning if needed */}
        {hasValidationErrors && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md text-xs font-medium">
            Validation errors
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-2 justify-end pt-1">
          <Tooltip title={hasValidationErrors ? "Fix validation errors before saving" : "Save changes"}>
            <span>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleOpenSaveModal}
                className="min-w-0 px-3"
                disabled={!canSave}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<CloseIcon />}
            onClick={(e) => {
              if (window.confirm('Are you sure you want to discard changes?')) {
                cancelChanges();
              }
            }}
            className="min-w-0 px-3"
          >
            Cancel
          </Button>
        </div>
      </Paper>
      
      {/* Save Changes Modal */}
      <Modal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        aria-labelledby="save-changes-modal"
        aria-describedby="modal-showing-changes-to-save"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflow: 'auto'
        }}>
          <Typography id="save-changes-modal" variant="h6" component="h2" gutterBottom>
            Changes to Save
          </Typography>
          
          <Box sx={{
            mt: 2,
            mb: 3,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '50vh'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {changesJson}
            </pre>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              color="primary"
            >
              Confirm Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};
