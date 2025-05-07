# Toolbar Modes Explanation

## Current Approach in the Implementation Plan

In the current implementation plan, I've separated the toolbar into two components:

1. **EditModeToolbar**: Shown when the grid is in edit or add mode
2. **ViewModeToolbar**: Shown when the grid is in view mode

You're absolutely right that this approach doesn't fully account for all possible states of the grid, particularly selection mode. The current GridModeContext defines several modes:

```typescript
export type GridMode = 'none' | 'edit' | 'add' | 'select';
```

## Issues with the Current Approach

1. **Incomplete Mode Coverage**: The current implementation only handles 'edit'/'add' vs. other modes, but doesn't specifically address 'select' mode
2. **Redundant Components**: Having separate components for each mode could lead to code duplication
3. **Limited Flexibility**: If we add more modes in the future, we'd need to create more toolbar components

## Improved Approach: Single Dynamic Toolbar

A better approach would be to have a single `GridToolbar` component that dynamically renders different controls based on the current mode. This would:

1. Eliminate the need for separate toolbar components
2. Handle all possible grid modes in one place
3. Be more maintainable and flexible

### Example Implementation:

```typescript
// components/GridToolbar.tsx
import React from 'react';
import { 
  GridToolbarContainer, 
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarExportButton
} from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGridMode } from '../context/GridModeContext';

export interface GridToolbarProps {
  customActions?: React.ReactNode;
  onFilterClick?: () => void;
}

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
  
  const { customActions, onFilterClick } = props;
  
  // Determine which controls to show based on mode
  const showAddButton = canAddRows && mode !== 'edit' && mode !== 'add';
  const showSaveButton = mode === 'edit' || mode === 'add';
  const showCancelButton = mode === 'edit' || mode === 'add';
  const showSelectionChip = selectionModel.length > 0;
  const showDeleteButton = canDeleteRows && selectionModel.length > 0 && mode !== 'edit' && mode !== 'add';
  const showEditingStatus = mode === 'edit' || mode === 'add';
  
  // Determine action label based on mode
  const actionLabel = isAddingRow ? 'Add' : 'Save';
  
  return (
    <GridToolbarContainer ref={ref}>
      {/* Standard DataGrid toolbar buttons */}
      <GridToolbarFilterButton onClick={onFilterClick} />
      <GridToolbarColumnsButton />
      <GridToolbarExportButton />
      
      {/* Add button */}
      {showAddButton && (
        <Button 
          startIcon={<AddIcon />} 
          onClick={addRow}
          size="small"
        >
          Add
        </Button>
      )}
      
      {/* Save button for edit/add mode */}
      {showSaveButton && (
        <Button 
          startIcon={<SaveIcon />} 
          onClick={saveChanges}
          disabled={hasValidationErrors}
          color="primary"
          size="small"
        >
          {actionLabel}
        </Button>
      )}
      
      {/* Cancel button for edit/add mode */}
      {showCancelButton && (
        <Button 
          startIcon={<CloseIcon />} 
          onClick={cancelChanges}
          size="small"
        >
          Cancel
        </Button>
      )}
      
      {/* Status indicators */}
      {showEditingStatus && (
        <>
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
      
      {/* Selection indicator */}
      {showSelectionChip && (
        <Chip 
          label={`${selectionModel.length} selected`}
          onDelete={clearSelection}
          size="small"
          sx={{ ml: 2 }}
        />
      )}
      
      {/* Delete button for selection mode */}
      {showDeleteButton && (
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
      
      {/* Custom actions */}
      {customActions}
    </GridToolbarContainer>
  );
});
```

## Benefits of the Unified Approach

1. **Comprehensive Mode Handling**: Handles all grid modes in one component
2. **Reduced Code Duplication**: No need for separate components with similar code
3. **Improved Maintainability**: Changes to toolbar behavior only need to be made in one place
4. **Better Flexibility**: Easy to add support for new modes or states
5. **Contextual Controls**: Shows only the relevant controls for each mode

## Implementation in the Main Component

With this approach, the main component would simply use the unified `GridToolbar`:

```typescript
// In EnhancedDataGridGraphQL.tsx
<DataGrid
  // ...other props
  slots={{
    toolbar: GridToolbar,
    noRowsOverlay: isLoadingWithoutFilters ? EmptyStateOverlay : undefined,
    // Other slots
  }}
  slotProps={{
    toolbar: {
      customActions: customToolbarActions,
      onFilterClick: handleOpenFilterPanel
    },
    // Other slot props
  }}
/>
```

This approach aligns better with the existing `GridModeContext` and provides a more flexible solution for handling all the different states of the grid.