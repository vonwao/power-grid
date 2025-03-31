import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
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
} from '@mui/material';

// Mode icons
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SelectAllIcon from '@mui/icons-material/SelectAll';

// Pagination icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Existing toolbar icons
import SaveIcon from '@mui/icons-material/Save';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';

// Context and hooks
import { useToolbarMode, ToolbarMode } from '../context/ToolbarModeContext';

interface UnifiedDataGridToolbarProps {
  onSave?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
}

export const UnifiedDataGridToolbar: React.FC<UnifiedDataGridToolbarProps> = ({
  onSave,
  onFilter,
  onExport,
  onUpload,
  onHelp
}) => {
  // Get toolbar mode context
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
  } = useToolbarMode();

  // State for confirmation dialog
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<ToolbarMode>('none');

  // Handle mode switching with confirmation when needed
  const handleModeSwitch = (newMode: ToolbarMode) => {
    // If in selection mode with multiple rows selected, show confirmation
    if (mode === 'select' && selectedRowCount > 1 && newMode !== 'select') {
      setConfirmationDialogOpen(true);
      setTargetMode(newMode);
      return;
    }
    
    // Otherwise, switch mode directly
    setMode(newMode);
  };

  // Handle toggle button group change
  const handleToggleChange = (_: React.MouseEvent<HTMLElement>, newMode: ToolbarMode | null) => {
    if (newMode !== null) {
      handleModeSwitch(newMode);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
  };

  // Determine button disabled states based on current mode
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const isAddButtonDisabled = mode === 'edit';
  const areActionButtonsDisabled = isInEditOrAddMode;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 1,
      borderBottom: '1px solid #e0e0e0'
    }}>
      {/* Left Section: Mode Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleToggleChange}
          size="small"
        >
          <ToggleButton value="edit" disabled={isAddingRow}>
            <EditIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>Edit</Typography>
          </ToggleButton>
          <ToggleButton value="add" disabled={isAddButtonDisabled}>
            <AddIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>Add</Typography>
          </ToggleButton>
          <ToggleButton value="select">
            <SelectAllIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>Select</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Middle Section: Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 1
      }}>
        {/* Save Options */}
        <Tooltip title="Save">
          <span>
            <IconButton onClick={onSave} disabled={areActionButtonsDisabled}>
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Filter Options */}
        <Tooltip title="Filter">
          <span>
            <IconButton onClick={onFilter} disabled={areActionButtonsDisabled}>
              <FilterAltIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Export Options */}
        <Tooltip title="Export">
          <span>
            <IconButton onClick={onExport} disabled={areActionButtonsDisabled}>
              <FileDownloadIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Upload Options */}
        <Tooltip title="Upload">
          <span>
            <IconButton onClick={onUpload} disabled={areActionButtonsDisabled}>
              <UploadIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Help Options */}
        <Tooltip title="Help">
          <span>
            <IconButton onClick={onHelp} disabled={areActionButtonsDisabled}>
              <HelpIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Right Section: Status & Pagination */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2
      }}>
        {/* Mode Status Panel */}
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
                    sx={{ height: 24 }}
                  />
                )}
                <Tooltip title="Save changes">
                  <IconButton size="small" onClick={saveChanges} disabled={hasValidationErrors}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel changes">
                  <IconButton size="small" onClick={cancelChanges}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                    sx={{ height: 24 }}
                  />
                )}
                <Tooltip title="Save changes">
                  <IconButton size="small" onClick={saveChanges} disabled={hasValidationErrors}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel changes">
                  <IconButton size="small" onClick={cancelChanges}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {mode === 'select' && (
              <>
                <Typography variant="body2">
                  {selectedRowCount} row{selectedRowCount !== 1 ? 's' : ''} selected
                </Typography>
                <Tooltip title="Clear selection">
                  <IconButton size="small" onClick={clearSelection}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Paper>
        )}

        {/* Pagination Controls */}
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
            }} 
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};