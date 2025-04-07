# DataGrid Toolbar Implementation Plan

This document outlines the detailed implementation plan for refactoring the UnifiedDataGridToolbar component into a more modular and composable structure.

## Step 1: Decompose the Toolbar into Modular Components

### File Structure

```
components/DataGrid/components/toolbar/
├── index.ts                    # Export all components
├── DataGridToolbar.tsx         # Main container component
├── DataGridToolbarLeft.tsx     # Left section with editing controls
├── DataGridToolbarRight.tsx    # Right section with action buttons
├── buttons/
│   ├── AddRowButton.tsx        # Button to add a new row
│   ├── SaveButton.tsx          # Button to save changes
│   ├── CancelButton.tsx        # Button to cancel changes
│   ├── FilterButton.tsx        # Button to open filter dialog
│   ├── ExportButton.tsx        # Button to export data
│   ├── UploadButton.tsx        # Button to upload data
│   └── HelpButton.tsx          # Button to open help dialog
└── status/
    ├── EditingStatus.tsx       # Shows editing status
    ├── ValidationSummary.tsx   # Shows validation errors
    └── SelectionStatus.tsx     # Shows selection status
```

### Component Implementations

#### 1. Individual Components

##### `buttons/AddRowButton.tsx`

```tsx
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGridMode } from '../../context/GridModeContext';

interface AddRowButtonProps {
  disabled?: boolean;
  className?: string;
}

export const AddRowButton: React.FC<AddRowButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, addRow } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canAdd = !isInEditOrAddMode;
  const disabled = externalDisabled || !canAdd;
  
  const handleClick = () => {
    if (!disabled) {
      addRow();
    }
  };
  
  return (
    <Tooltip title={canAdd ? "Add new record" : "Cannot add while editing"}>
      <span>
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
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
  );
};
```

##### `buttons/SaveButton.tsx`

```tsx
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useGridMode } from '../../context/GridModeContext';

interface SaveButtonProps {
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, saveChanges, hasValidationErrors } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canSave = isInEditOrAddMode && !hasValidationErrors;
  const disabled = externalDisabled || !canSave;
  
  const handleClick = () => {
    if (!disabled) {
      saveChanges();
    }
  };
  
  let tooltipTitle = "Save changes";
  if (hasValidationErrors) {
    tooltipTitle = "Fix validation errors before saving";
  } else if (!isInEditOrAddMode) {
    tooltipTitle = "Nothing to save";
  }
  
  return (
    <Tooltip title={tooltipTitle}>
      <span>
        <Button
          variant="contained"
          size="small"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
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
  );
};
```

##### `buttons/CancelButton.tsx`

```tsx
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useGridMode } from '../../context/GridModeContext';

interface CancelButtonProps {
  disabled?: boolean;
  className?: string;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  disabled: externalDisabled,
  className,
}) => {
  const { mode, cancelChanges } = useGridMode();
  
  // Determine if button should be disabled
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  const canCancel = isInEditOrAddMode;
  const disabled = externalDisabled || !canCancel;
  
  const handleClick = () => {
    if (!disabled) {
      cancelChanges();
    }
  };
  
  if (!canCancel) {
    return null;
  }
  
  return (
    <Tooltip title="Cancel changes">
      <Button
        variant="outlined"
        size="small"
        color="error"
        startIcon={<CloseIcon />}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        sx={{ minWidth: 0, px: 1 }}
      >
        Cancel
      </Button>
    </Tooltip>
  );
};
```

## Step 2: Create Headless UI Layer

In the second phase, we'll create a set of hooks that provide the necessary state and functions for building custom UI components.

### File Structure

```
components/DataGrid/hooks/toolbar/
├── index.ts                    # Export all hooks
├── useDataGridToolbar.ts       # Main hook for toolbar functionality
├── useDataGridToolbarLeft.ts   # Hook for left section functionality
├── useDataGridToolbarRight.ts  # Hook for right section functionality
└── buttons/
    ├── useAddRow.ts            # Hook for add row functionality
    ├── useSaveChanges.ts       # Hook for save changes functionality
    ├── useCancelChanges.ts     # Hook for cancel changes functionality
    ├── useFilter.ts            # Hook for filter functionality
    ├── useExport.ts            # Hook for export functionality
    ├── useUpload.ts            # Hook for upload functionality
    └── useHelp.ts              # Hook for help functionality
```

### Integration with EnhancedDataGrid

To use the new modular toolbar in the EnhancedDataGrid component, we'll need to update the component to use the new DataGridToolbar instead of the UnifiedDataGridToolbar.

```tsx
// In EnhancedDataGrid.tsx
import { DataGridToolbar } from './components/toolbar';

// ...

const GridFormWithToolbar = () => {
  const { saveChanges } = useGridForm();
  
  return (
    <GridFormWrapper>
      <div className={`h-full w-full flex flex-col ${className || ''}`}>
        {/* New Modular Toolbar */}
        <DataGridToolbar
          onFilter={onFilter}
          onExport={onExport}
          onUpload={onUpload}
          onHelp={onHelp}
          canEditRows={canEditRows}
          canAddRows={canAddRows}
          canSelectRows={canSelectRows}
        />

        <Paper elevation={0} className="flex-grow w-full overflow-auto">
          <CellEditHandler apiRef={apiRef} />
          <DataGridWithModeControl />
        </Paper>
      </div>
    </GridFormWrapper>
  );
};
```

## Example Usage

### Basic Usage

```tsx
import { DataGridToolbar } from './components/toolbar';

<DataGridToolbar
  onFilter={handleFilter}
  onExport={handleExport}
  onUpload={handleUpload}
  onHelp={handleHelp}
  canAddRows={true}
  canEditRows={true}
/>
```

### Customized Usage

```tsx
import { 
  DataGridToolbar, 
  DataGridToolbarLeft, 
  DataGridToolbarRight 
} from './components/toolbar';

<DataGridToolbar
  leftSection={<DataGridToolbarLeft hideAddButton={true} />}
  rightSection={
    <DataGridToolbarRight 
      hideExportButton={true}
      customFilterButton={<MyCustomFilterButton />}
    />
  }
/>
```

### Headless Usage

```tsx
import { useDataGridToolbarLeft, useDataGridToolbarRight } from './hooks/toolbar';

function MyCustomToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editedRowCount,
    hasValidationErrors,
    validationErrors
  } = useDataGridToolbarLeft();

  const {
    selectionModel,
    clearSelection,
    handleFilter,
    handleExport
  } = useDataGridToolbarRight();

  return (
    <div className="my-custom-toolbar">
      {/* Custom UI using the hooks */}
      <div className="left-section">
        <button onClick={addRow}>Add New</button>
        {isEditing && (
          <>
            <span>Editing {editedRowCount} rows</span>
            <button onClick={saveChanges} disabled={hasValidationErrors}>Save</button>
            <button onClick={cancelChanges}>Cancel</button>
          </>
        )}
      </div>
      <div className="right-section">
        {selectionModel.length > 0 && (
          <span>Selected: {selectionModel.length} rows</span>
        )}
        <button onClick={handleFilter}>Filter</button>
        <button onClick={handleExport}>Export</button>
      </div>
    </div>
  );
}