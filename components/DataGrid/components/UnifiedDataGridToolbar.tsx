import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { DataGridHelpDialog } from './DataGridHelpDialog'; // Import the help dialog
// Import the filter dialog and its types
import { GlobalFilterDialog, FilterValues } from './GlobalFilterDialog';

// Action icons
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import BugReportIcon from '@mui/icons-material/BugReport';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon

// Pagination icons

// Action buttons
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';

// Context and hooks
import { useGridMode, GridMode } from '../context/GridModeContext';
import { useGridForm } from '../context/GridFormContext';

// Define the structure for the filters passed to onFilter, matching GlobalFilterDialog
// interface FilterValues { // Or import from GlobalFilterDialog as done above
//   birthdayMonthYear: Dayjs | null; 
//   department: string;
//   name: string;
// }

interface UnifiedDataGridToolbarProps {
  onSave?: () => void;
  onFilter?: (filters: FilterValues) => void; // Use the imported/defined FilterValues type
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void; // Keep existing onHelp prop if needed elsewhere
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean; // Removed default value = true
  canSelectRows?: boolean;
  canDeleteRows?: boolean; // Added for row deletion capability
  // Custom action buttons
  customActionButtons?: React.ReactNode;
}

export const UnifiedDataGridToolbar: React.FC<UnifiedDataGridToolbarProps> = ({
  onSave,
  onFilter,
  onExport,
  onUpload,
  onHelp,
  canEditRows = true,
  canAddRows, // Removed default value = true
  canSelectRows = true,
  customActionButtons
}) => {
  // Get grid mode context
  const {
    mode,
    setMode,
    editingRowCount,
    isAddingRow,
    hasValidationErrors,
    saveChanges,
    cancelChanges,
    addRow,
    // Get selection model from context
    selectionModel,
    onSelectionModelChange,
    clearSelection,
    // Get delete context
    canDeleteRows,
    deleteRows
  } = useGridMode();
  
  // Debug: Log selection model changes
  console.log('UnifiedDataGridToolbar - selectionModel from context:', selectionModel);
  
  // Add a visual indicator for debugging
  if (!selectionModel || selectionModel.length === 0) {
    console.log('No selection model or empty selection model');
  }

  // Get grid form context
  const {
    getPendingChanges,
    getEditedRowCount,
    getAllValidationErrors,
    getOriginalRowData
  } = useGridForm();

  // State for dialogs
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<GridMode>('none');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false); // State for filter dialog
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false); // State for delete confirmation

  // Handle mode switching with confirmation when needed
  const handleModeSwitch = (newMode: GridMode) => {
    // If in selection mode with multiple rows selected, show confirmation
    if (mode === 'select' && selectionModel.length > 1 && newMode !== 'select') {
      setConfirmationDialogOpen(true);
      setTargetMode(newMode);
      return;
    }
    
    // Otherwise, switch mode directly
    setMode(newMode);
  };
  
  // Get the actual count of edited rows
  const actualEditedRowCount = getEditedRowCount();

  // No pagination handlers needed - using built-in DataGrid pagination

  // Handle add button click
  const handleAddClick = () => {
    if (selectionModel.length > 1) {
      setConfirmationDialogOpen(true);
      setTargetMode('add');
      return;
    }
    
    addRow();
  };

  // Handle save button click
  const handleSaveClick = () => {
    saveChanges();
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    cancelChanges();
  };

  // Handle help button click
  const handleHelpClick = () => {
    setHelpDialogOpen(true);
  };

  // Handle filter button click - opens the dialog
  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  // Handle applying filters from the dialog - update parameter type
  const handleApplyFilters = (filters: FilterValues) => {
    // Log the Dayjs object directly, or format it if needed
    console.log('Applying filters:', {
      ...filters,
      // Example: Format the date for logging or sending elsewhere
      birthday: filters.birthdayMonthYear ? filters.birthdayMonthYear.format('YYYY-MM') : null, 
    });
    if (onFilter) {
      // Pass the filters object (containing the Dayjs object) to the parent
      // For now, let's assume the parent expects the filters object
      onFilter(filters); 
    }
    setFilterDialogOpen(false); // Close dialog after applying
  };
  
  // Handle debug button click
  const handleDebugClick = () => {
    setDebugDialogOpen(true);
  };

  // Handle delete button click - opens confirmation dialog
  const handleDeleteClick = () => {
    if (selectionModel.length > 0 && canDeleteRows) {
      setDeleteConfirmationDialogOpen(true);
    }
  };

  // Handle confirming deletion
  const handleConfirmDelete = () => {
    deleteRows(selectionModel);
    setDeleteConfirmationDialogOpen(false);
  };

  // Determine button disabled states based on current mode
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canSave = isInEditOrAddMode && !hasValidationErrors;
  const canCancel = isInEditOrAddMode;
  const canAdd = canAddRows && !isInEditOrAddMode;
  const canDeleteSelected = canDeleteRows && selectionModel.length > 0 && !isInEditOrAddMode;
  const areActionButtonsDisabled = isInEditOrAddMode;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 1,
      borderBottom: '1px solid #e0e0e0'
    }}>
      {/* Left Section: Add/Save/Cancel buttons + Status */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1
      }}>
        {/* Add button - only show if canAddRows is true */}
        {canAddRows && (
          <Tooltip title={canAdd ? "Add new record" : "Cannot add while editing"}>
            <span>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                disabled={!canAdd}
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
        )}

        {/* Status section */}
        {mode !== 'none' && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '4px 8px',
              borderRadius: 1,
              backgroundColor: mode === 'edit' ? 'rgba(25, 118, 210, 0.08)' : 
                              mode === 'add' ? 'rgba(46, 125, 50, 0.08)' : 
                              'rgba(237, 108, 2, 0.08)'
            }}
          >
            {/* Status content based on mode */}
            {mode === 'edit' && (
              <>
            <Typography variant="body2">
              Editing {actualEditedRowCount} record{actualEditedRowCount !== 1 ? 's' : ''}
            </Typography>
                {hasValidationErrors && (
                  <Chip
                    label="Validation errors"
                    size="small"
                    color="warning"
                    sx={{ height: 24, cursor: 'pointer' }}
                    onClick={() => setValidationDialogOpen(true)}
                  />
                )}
              </>
            )}
            
            {mode === 'add' && (
              <>
                <Typography variant="body2">
                  Adding new record
                </Typography>
                {hasValidationErrors && (
                  <Chip
                    label="Validation errors"
                    size="small"
                    color="warning"
                    sx={{ height: 24, cursor: 'pointer' }}
                    onClick={() => setValidationDialogOpen(true)}
                  />
                )}
              </>
            )}

          </Paper>
        )}

        {/* Save button */}
        <Tooltip title={canSave ? "Save changes" : hasValidationErrors ? "Fix validation errors before saving" : "Nothing to save"}>
          <span>
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              disabled={!canSave}
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
        
        {/* Debug button - only show when in edit mode */}
        {mode === 'edit' && (
          <Tooltip title="Debug Edits (Temporary)">
            <Button
              variant="outlined"
              size="small"
              color="info"
              startIcon={<BugReportIcon />}
              onClick={handleDebugClick}
              sx={{ 
                minWidth: 0, 
                px: 1,
                ml: 1
              }}
            >
              Debug
            </Button>
          </Tooltip>
        )}

        {/* Cancel button */}
        {canCancel && (
          <Tooltip title="Cancel changes">
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleCancelClick}
              sx={{ minWidth: 0, px: 1 }}
            >
              Cancel
            </Button>
          </Tooltip>
        )}

      </Box>

      {/* Middle Section - Pagination removed in favor of built-in DataGrid pagination */}
      <Box sx={{ flex: 1 }} />

      {/* Right Section: Selection Status + Action Buttons */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1
      }}>
        {/* Custom Action Buttons - if provided, render them instead of default buttons */}
        {customActionButtons ? (
          customActionButtons
        ) : (
          <>
            {/* Selection Status */}
            {selectionModel && selectionModel.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                  Selected:
                </Typography>
                <Chip
                  label={`${selectionModel.length} rows`}
                  onDelete={clearSelection}
                  size="small"
                />
                {/* Delete Button - Show only if deletion is allowed and rows are selected */}
                {canDeleteRows && selectionModel.length > 0 && (
                  <Tooltip title={canDeleteSelected ? `Delete ${selectionModel.length} selected row(s)` : "Cannot delete while editing"}>
                    <span> {/* Span needed for disabled Tooltip */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleDeleteClick}
                        disabled={!canDeleteSelected}
                        sx={{ ml: 0.5, opacity: canDeleteSelected ? 1 : 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            )}
            {/* Filter Options - Updated onClick */}
            <Tooltip title={areActionButtonsDisabled ? "Cannot filter while editing" : "Filter"}>
              <span>
                <IconButton onClick={handleFilterClick} disabled={areActionButtonsDisabled} sx={{ opacity: areActionButtonsDisabled ? 0.5 : 1 }}>
                  <FilterAltIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Upload Options */}
            <Tooltip title={areActionButtonsDisabled ? "Cannot upload while editing" : "Upload"}>
              <span>
                <IconButton onClick={onUpload} disabled={areActionButtonsDisabled} sx={{ opacity: areActionButtonsDisabled ? 0.5 : 1 }}>
                  <UploadIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Export Options */}
            <Tooltip title={areActionButtonsDisabled ? "Cannot export while editing" : "Export"}>
              <span>
                <IconButton onClick={onExport} disabled={areActionButtonsDisabled} sx={{ opacity: areActionButtonsDisabled ? 0.5 : 1 }}>
                  <FileDownloadIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Help button */}
            <Tooltip title="Help">
              <IconButton size="small" onClick={handleHelpClick}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationDialogOpen} 
        onClose={() => setConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Mode Switch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have {selectionModel.length} rows selected. Switching to {targetMode} mode will clear your selection. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setMode(targetMode);
              clearSelection();
              setConfirmationDialogOpen(false);
              if (targetMode === 'add') {
                addRow();
              }
            }} 
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use the imported DataGridHelpDialog */}
      <DataGridHelpDialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
      />

      {/* Global Filter Dialog */}
      <GlobalFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        onApply={handleApplyFilters}
        // Pass department options if available/needed from parent or context
        // departmentOptions={...} 
      />

      {/* Validation Errors Dialog */}
      <Dialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Validation Errors</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The following validation errors need to be fixed before saving:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2 }}>
            {getAllValidationErrors().map((error, index) => (
              <Typography component="li" key={index}>
                Row {error.rowId}: {error.field} - {error.message}
              </Typography>
            ))}
            {getAllValidationErrors().length === 0 && (
              <Typography component="li">
                {mode === 'edit' && actualEditedRowCount > 0 ? (
                  "There are validation errors in the current editing session. Please check highlighted fields for specific issues."
                ) : mode === 'add' && isAddingRow ? (
                  "There are validation errors in the new row. Please check highlighted fields for specific issues."
                ) : (
                  "No specific validation details available"
                )}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Debug Dialog */}
      <Dialog
        open={debugDialogOpen}
        onClose={() => setDebugDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Debug Edits</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Current edited fields ({actualEditedRowCount} rows with changes):
          </DialogContentText>
          <Box 
            component="pre" 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '400px'
            }}
          >
            {JSON.stringify(
              getPendingChanges().map(item => {
                const { rowId, changes } = item;
                
                // Get the original values for comparison
                const originalData = getOriginalRowData(rowId);
                const originalValues: Record<string, any> = {};
                
                if (originalData) {
                  // Extract only the fields that have changed
                  Object.keys(changes).forEach(field => {
                    originalValues[field] = originalData[field];
                  });
                }
                
                return {
                  rowId,
                  changes,
                  originalValues
                };
              }), 
              null, 
              2
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDebugDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

     {/* Delete Confirmation Dialog */}
     <Dialog
       open={deleteConfirmationDialogOpen}
       onClose={() => setDeleteConfirmationDialogOpen(false)}
     >
       <DialogTitle>Confirm Deletion</DialogTitle>
       <DialogContent>
         <DialogContentText>
           Are you sure you want to delete {selectionModel.length} selected row(s)? This action cannot be undone.
         </DialogContentText>
       </DialogContent>
       <DialogActions>
         <Button onClick={() => setDeleteConfirmationDialogOpen(false)}>Cancel</Button>
         <Button onClick={handleConfirmDelete} color="error">
           Delete
         </Button>
       </DialogActions>
     </Dialog>
    </Box>
  );
};
