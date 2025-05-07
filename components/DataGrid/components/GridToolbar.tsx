import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarProps as MuiGridToolbarProps
} from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGridMode } from '../context/GridModeContext';

export interface GridToolbarProps extends MuiGridToolbarProps {
  customActions?: React.ReactNode;
  onFilterClick?: () => void;
}

export const GridToolbar: React.FC<GridToolbarProps> = React.forwardRef<HTMLDivElement, GridToolbarProps>((props, ref) => {
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
  
  const isEditMode = mode === 'edit' || mode === 'add';
  const actionLabel = isAddingRow ? 'Add' : 'Save';
  
  return (
    <GridToolbarContainer ref={ref}>
      {/* Standard MUI X toolbar buttons */}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      
      {/* View mode actions */}
      {!isEditMode && (
        <>
          {canAddRows && (
            <Button 
              startIcon={<AddIcon />} 
              onClick={addRow}
              size="small"
            >
              Add
            </Button>
          )}
          
          {selectionModel.length > 0 && (
            <>
              <Chip 
                label={`${selectionModel.length} selected`}
                onDelete={clearSelection}
                size="small"
                sx={{ ml: 2 }}
              />
              
              {canDeleteRows && (
                <Button 
                  startIcon={<DeleteIcon />} 
                  onClick={() => deleteRows(selectionModel)}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </>
      )}
      
      {/* Edit mode actions */}
      {isEditMode && (
        <>
          <Button 
            startIcon={<SaveIcon />} 
            onClick={saveChanges}
            disabled={hasValidationErrors}
            color="primary"
            size="small"
          >
            {actionLabel}
          </Button>
          
          <Button 
            startIcon={<CloseIcon />} 
            onClick={cancelChanges}
            size="small"
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
      
      {/* Custom actions */}
      {props.customActions}
    </GridToolbarContainer>
  );
});

GridToolbar.displayName = 'GridToolbar';