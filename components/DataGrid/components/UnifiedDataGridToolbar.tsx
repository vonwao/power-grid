import React, { useState, useMemo } from 'react';
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
  Select,
  MenuItem,
  Paper,
  SelectChangeEvent,
  Divider,
} from '@mui/material';

// Action icons
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';

// Pagination icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Action buttons
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';

// Context and hooks
import { useGridMode, GridMode } from '../context/GridModeContext';
import { useGridForm } from '../context/GridFormContext';

interface UnifiedDataGridToolbarProps {
  onSave?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
}

export const UnifiedDataGridToolbar: React.FC<UnifiedDataGridToolbarProps> = ({
  onSave,
  onFilter,
  onExport,
  onUpload,
  onHelp,
  canEditRows = true,
  canAddRows = true,
  canSelectRows = true
}) => {
  // Get grid mode context
  const {
    mode,
    setMode,
    selectedRowCount,
    clearSelection,
    editingRowCount,
    isAddingRow,
    hasValidationErrors,
    saveChanges,
    cancelChanges,
    addRow,
    page,
    pageSize,
    totalRows,
    setPage,
    setPageSize
  } = useGridMode();

  // Get grid form context
  const { getRowErrors, editingRows } = useGridForm();

  // State for dialogs
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<GridMode>('none');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  // Handle mode switching with confirmation when needed
  const handleModeSwitch = (newMode: GridMode) => {
    // If in selection mode with multiple rows selected, show confirmation
    if (mode === 'select' && selectedRowCount > 1 && newMode !== 'select') {
      setConfirmationDialogOpen(true);
      setTargetMode(newMode);
      return;
    }
    
    // Otherwise, switch mode directly
    setMode(newMode);
  };

  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
  };

  // Handle add button click
  const handleAddClick = () => {
    if (selectedRowCount > 1) {
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

  // Determine button disabled states based on current mode
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canSave = isInEditOrAddMode && !hasValidationErrors;
  const canCancel = isInEditOrAddMode;
  const canAdd = canAddRows && !isInEditOrAddMode;
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
        {/* Add button */}
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
                  Editing {editingRowCount} record{editingRowCount !== 1 ? 's' : ''}
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
            
            {mode === 'select' && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                  Selected:
                </Typography>
                <Chip
                  label={`${selectedRowCount} rows`}
                  onDelete={clearSelection}
                  size="small"
                />
              </Box>
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

        {/* Help button */}
        <Tooltip title="Help">
          <IconButton size="small" onClick={handleHelpClick}>
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Middle Section: Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          Page {page + 1} of {Math.max(1, Math.ceil(totalRows / pageSize))}
        </Typography>
        <IconButton 
          size="small"
          disabled={page === 0} 
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small"
          disabled={page >= Math.ceil(totalRows / pageSize) - 1} 
          onClick={() => setPage(page + 1)}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          sx={{ height: 28, minWidth: 80 }}
        >
          {[10, 25, 50, 100].map((size) => (
            <MenuItem key={size} value={size}>
              {size} rows
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Right Section: Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 1
      }}>
        {/* Filter Options */}
        <Tooltip title={areActionButtonsDisabled ? "Cannot filter while editing" : "Filter"}>
          <span>
            <IconButton onClick={onFilter} disabled={areActionButtonsDisabled} sx={{ opacity: areActionButtonsDisabled ? 0.5 : 1 }}>
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
      </Box>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationDialogOpen} 
        onClose={() => setConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Mode Switch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have {selectedRowCount} rows selected. Switching to {targetMode} mode will clear your selection. Do you want to continue?
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

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Data Grid Help</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Basic Operations</Typography>
          <Typography paragraph>
            <strong>Editing:</strong> Double-click any cell to edit its content. The grid will enter edit mode.
          </Typography>
          <Typography paragraph>
            <strong>Adding:</strong> Click the "Add" button to add a new row. You cannot add while editing.
          </Typography>
          <Typography paragraph>
            <strong>Selecting:</strong> Click the checkbox next to rows to select them. Multiple selections are allowed.
          </Typography>
          <Typography paragraph>
            <strong>Saving:</strong> Click the "Save" button to save your changes after editing or adding.
          </Typography>
          <Typography paragraph>
            <strong>Canceling:</strong> Click the "Cancel" button to discard your changes.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Modal Behavior</Typography>
          <Typography paragraph>
            The grid operates in a modal fashion, meaning you can only perform one type of operation at a time:
          </Typography>
          <Typography paragraph>
            <strong>Edit Mode:</strong> Activated by double-clicking a cell. You cannot add new rows in this mode.
          </Typography>
          <Typography paragraph>
            <strong>Add Mode:</strong> Activated by clicking the "Add" button. You cannot edit existing rows in this mode.
          </Typography>
          <Typography paragraph>
            <strong>Select Mode:</strong> Activated by selecting rows. You can switch to other modes, but will lose your selection.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Additional Features</Typography>
          <Typography paragraph>
            <strong>Filtering:</strong> Click the filter button to filter rows.
          </Typography>
          <Typography paragraph>
            <strong>Exporting:</strong> Click the export button to export data.
          </Typography>
          <Typography paragraph>
            <strong>Uploading:</strong> Click the upload button to import data.
          </Typography>
          <Typography paragraph>
            <strong>Pagination:</strong> Use the pagination controls to navigate between pages.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            {useMemo(() => {
              // Collect all validation errors from editing rows
              const allErrors: Array<{field: string, message: string}> = [];
              
              // Iterate through all editing rows
              editingRows.forEach(rowId => {
                const errors = getRowErrors(rowId);
                if (errors) {
                  // Add each error to the list
                  Object.entries(errors).forEach(([field, error]) => {
                    if (error) {
                      allErrors.push({
                        field,
                        message: error.message || 'Invalid value'
                      });
                    }
                  });
                }
              });
              
              // Return error list items
              return allErrors.length > 0 ? (
                allErrors.map((error, index) => (
                  <Typography component="li" key={index}>
                    <strong>{error.field}:</strong> {error.message}
                  </Typography>
                ))
              ) : (
                <Typography component="li">No specific validation details available</Typography>
              );
            }, [editingRows, getRowErrors])}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};