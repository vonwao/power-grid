# MUI X DataGrid Integrated Toolbar Approach

## Understanding MUI X DataGrid's Toolbar System

MUI X DataGrid has a built-in slots system that allows for customizing components like the toolbar. The DataGrid provides:

1. `GridToolbarContainer` - A container component for toolbar items
2. Built-in toolbar components:
   - `GridToolbarColumnsButton` - For column visibility
   - `GridToolbarFilterButton` - For filtering
   - `GridToolbarDensitySelector` - For density selection
   - `GridToolbarExportButton` - For exporting data
3. A default `GridToolbar` that combines these components

The DataGrid uses a slot-based customization approach where you can provide your own components for various parts of the grid.

## Improved Toolbar Integration

Instead of creating a completely custom toolbar that replaces the MUI X functionality, we can extend the built-in toolbar system:

1. Use the `slots` and `slotProps` pattern that MUI X DataGrid provides
2. Create a toolbar component that leverages the built-in toolbar components
3. Add our custom functionality while maintaining the MUI X look and feel

### Implementation Approach

```typescript
// components/DataGrid/components/GridToolbar.tsx
import React from 'react';
import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExportButton,
  GridToolbarProps as MuiGridToolbarProps
} from '@mui/x-data-grid';
import { Button, Chip, Divider, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGridMode } from '../context/GridModeContext';

export interface GridToolbarProps extends MuiGridToolbarProps {
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
  
  const { customActions, onFilterClick, ...other } = props;
  
  // Handle filter button click
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onFilterClick) {
      onFilterClick();
    }
    // Call the original handler if it exists
    if (other.onClick) {
      other.onClick(event);
    }
  };
  
  return (
    <GridToolbarContainer ref={ref} {...other}>
      {/* Left section: Standard MUI X toolbar buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton onClick={handleFilterClick} />
        <GridToolbarDensitySelector />
        <GridToolbarExportButton />
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
```

## Integration with DataGrid

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

## Benefits of This Approach

1. **Better MUI X Integration**: Uses the built-in slots system and toolbar components
2. **Maintains MUI X Look and Feel**: Preserves the standard MUI X toolbar buttons
3. **Flexible Layout**: Divides the toolbar into logical sections (standard buttons, mode-specific actions, custom actions)
4. **Simplified Implementation**: Single component handles all modes
5. **Extensible**: Easy to add new functionality or customize existing behavior

## Comparison with Previous Approach

The previous `UnifiedDataGridToolbar.tsx` had several issues:

1. **Complex Layout**: Used nested Box components with complex styling
2. **Manual Implementation**: Reimplemented functionality already provided by MUI X
3. **Inconsistent Look and Feel**: Didn't match the MUI X design language
4. **Limited Extensibility**: Difficult to add new features or customize behavior

The new approach addresses these issues by:

1. **Leveraging MUI X Components**: Uses built-in toolbar components
2. **Simplified Layout**: Clear, logical sections with minimal nesting
3. **Consistent Design**: Matches the MUI X design language
4. **Improved Extensibility**: Easy to customize through props and slots

This approach provides the flexibility and simplicity you're looking for while integrating better with the MUI X Grid way of doing things.