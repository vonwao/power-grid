import React from 'react';
import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarProps as MuiGridToolbarProps
} from '@mui/x-data-grid';
import { Button, Chip, Divider, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGridMode } from '../context/GridModeContext';

/**
 * Extended GridToolbar props interface
 */
export interface GridToolbarProps extends MuiGridToolbarProps {
  customActions?: React.ReactNode;
  onFilterClick?: () => void;
}

/**
 * Unified GridToolbar component that integrates with MUI X DataGrid
 * 
 * This component handles all grid modes (view, edit, add, select) in a single component
 * and provides a consistent UI for each mode.
 */
export const GridToolbar = React.forwardRef<HTMLDivElement, GridToolbarProps>((props, ref) => {
  const { 
    mode,
    addRow, 
    saveChanges,
    cancelChanges,
    selectionModel, 
    clearSelection, 
    deleteRows,
    canAddRows,
    canDeleteRows,
    hasValidationErrors,
    isAddingRow,
    editingRowCount
  } = useGridMode();
  
  const { customActions, onFilterClick, ...other } = props;
  
  // Handle filter button click
  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    }
  };
  
  return (
    <GridToolbarContainer ref={ref} {...other}>
      {/* Left section: Standard MUI X toolbar buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      
      {/* Middle section: Mode-specific actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        {/* Edit/Add mode actions */}
        {(mode === 'edit' || mode === 'add') && (
          <>
            <Button 
              startIcon={<SaveIcon />} 
              onClick={saveChanges}
              disabled={hasValidationErrors}
              color="primary"
              size="small"
            >
              {isAddingRow ? 'Add' : 'Save'}
            </Button>
            
            <Button 
              startIcon={<CloseIcon />} 
              onClick={cancelChanges}
              size="small"
              sx={{ ml: 1 }}
            >
              Cancel
            </Button>
            
            {/* Status indicators */}
            {isAddingRow ? (
              <Chip 
                label="Adding new record" 
                color="success" 
                size="small" 
                sx={{ ml: 2 }}
              />
            ) : editingRowCount > 0 && (
              <Chip 
                label={`Editing ${editingRowCount} record(s)`} 
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            )}
            
            {hasValidationErrors && (
              <Chip 
                label="Fix validation errors" 
                color="error" 
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </>
        )}
        
        {/* View mode actions */}
        {mode === 'none' && canAddRows && (
          <Button 
            startIcon={<AddIcon />} 
            onClick={addRow}
            size="small"
          >
            Add
          </Button>
        )}
        
        {/* Selection mode actions */}
        {selectionModel.length > 0 && (
          <>
            <Chip 
              label={`${selectionModel.length} selected`}
              onDelete={clearSelection}
              size="small"
              sx={{ ml: mode !== 'none' ? 2 : 0 }}
            />
            
            {canDeleteRows && mode !== 'edit' && mode !== 'add' && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => deleteRows(selectionModel)}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </Box>
      
      {/* Right section: Custom actions */}
      {customActions && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {customActions}
          </Box>
        </>
      )}
    </GridToolbarContainer>
  );
});