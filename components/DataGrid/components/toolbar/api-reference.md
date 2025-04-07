# DataGrid Toolbar API Reference

This document provides a comprehensive reference for the components and hooks in the refactored DataGrid toolbar.

## Components API

### DataGridToolbar

The main container component that composes the left and right sections of the toolbar.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideAddButton` | `boolean` | `false` | Whether to hide the add button |
| `hideSaveButton` | `boolean` | `false` | Whether to hide the save button |
| `hideCancelButton` | `boolean` | `false` | Whether to hide the cancel button |
| `hideEditingStatus` | `boolean` | `false` | Whether to hide the editing status |
| `hideValidationSummary` | `boolean` | `false` | Whether to hide the validation summary |
| `hideFilterButton` | `boolean` | `false` | Whether to hide the filter button |
| `hideExportButton` | `boolean` | `false` | Whether to hide the export button |
| `hideUploadButton` | `boolean` | `false` | Whether to hide the upload button |
| `hideHelpButton` | `boolean` | `false` | Whether to hide the help button |
| `hideSelectionStatus` | `boolean` | `false` | Whether to hide the selection status |
| `onFilter` | `(filters: FilterValues) => void` | - | Callback when the filter button is clicked |
| `onExport` | `() => void` | - | Callback when the export button is clicked |
| `onUpload` | `() => void` | - | Callback when the upload button is clicked |
| `onHelp` | `() => void` | - | Callback when the help button is clicked |
| `leftSection` | `React.ReactNode` | - | Custom component for the left section |
| `rightSection` | `React.ReactNode` | - | Custom component for the right section |
| `canEditRows` | `boolean` | `true` | Whether rows can be edited |
| `canAddRows` | `boolean` | `true` | Whether rows can be added |
| `canSelectRows` | `boolean` | `true` | Whether rows can be selected |
| `className` | `string` | - | Additional CSS class name |

#### Example

```tsx
<DataGridToolbar
  onFilter={handleFilter}
  onExport={handleExport}
  onUpload={handleUpload}
  onHelp={handleHelp}
  canAddRows={true}
  canEditRows={true}
/>
```

### DataGridToolbarLeft

The left section of the toolbar with editing controls.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideAddButton` | `boolean` | `false` | Whether to hide the add button |
| `hideSaveButton` | `boolean` | `false` | Whether to hide the save button |
| `hideCancelButton` | `boolean` | `false` | Whether to hide the cancel button |
| `hideEditingStatus` | `boolean` | `false` | Whether to hide the editing status |
| `hideValidationSummary` | `boolean` | `false` | Whether to hide the validation summary |
| `className` | `string` | - | Additional CSS class name |
| `onValidationSummaryClick` | `() => void` | - | Callback when the validation summary is clicked |

#### Example

```tsx
<DataGridToolbarLeft
  hideAddButton={true}
  hideSaveButton={false}
  hideCancelButton={false}
  hideEditingStatus={false}
  hideValidationSummary={false}
/>
```

### DataGridToolbarRight

The right section of the toolbar with action buttons.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideFilterButton` | `boolean` | `false` | Whether to hide the filter button |
| `hideExportButton` | `boolean` | `false` | Whether to hide the export button |
| `hideUploadButton` | `boolean` | `false` | Whether to hide the upload button |
| `hideHelpButton` | `boolean` | `false` | Whether to hide the help button |
| `hideSelectionStatus` | `boolean` | `false` | Whether to hide the selection status |
| `onFilter` | `(filters: FilterValues) => void` | - | Callback when the filter button is clicked |
| `onExport` | `() => void` | - | Callback when the export button is clicked |
| `onUpload` | `() => void` | - | Callback when the upload button is clicked |
| `onHelp` | `() => void` | - | Callback when the help button is clicked |
| `customFilterButton` | `React.ReactNode` | - | Custom component for the filter button |
| `customExportButton` | `React.ReactNode` | - | Custom component for the export button |
| `customUploadButton` | `React.ReactNode` | - | Custom component for the upload button |
| `customHelpButton` | `React.ReactNode` | - | Custom component for the help button |
| `className` | `string` | - | Additional CSS class name |

#### Example

```tsx
<DataGridToolbarRight
  hideFilterButton={false}
  hideExportButton={true}
  hideUploadButton={false}
  hideHelpButton={false}
  onFilter={handleFilter}
  onUpload={handleUpload}
  onHelp={handleHelp}
  customFilterButton={<MyCustomFilterButton />}
/>
```

### Button Components

#### AddRowButton

Button to add a new row.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<AddRowButton disabled={false} />
```

#### SaveButton

Button to save changes.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<SaveButton disabled={false} />
```

#### CancelButton

Button to cancel changes.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<CancelButton disabled={false} />
```

#### FilterButton

Button to open the filter dialog.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Callback when the button is clicked |
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<FilterButton onClick={handleFilter} disabled={false} />
```

#### ExportButton

Button to export data.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Callback when the button is clicked |
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<ExportButton onClick={handleExport} disabled={false} />
```

#### UploadButton

Button to upload data.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Callback when the button is clicked |
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<UploadButton onClick={handleUpload} disabled={false} />
```

#### HelpButton

Button to open the help dialog.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Callback when the button is clicked |
| `disabled` | `boolean` | - | Whether the button is disabled |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<HelpButton onClick={handleHelp} disabled={false} />
```

### Status Components

#### EditingStatus

Shows the current editing status.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<EditingStatus />
```

#### ValidationSummary

Shows a summary of validation errors.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Callback when the summary is clicked |
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<ValidationSummary onClick={handleValidationSummaryClick} />
```

#### SelectionStatus

Shows the current selection status.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS class name |

##### Example

```tsx
<SelectionStatus />
```

## Hooks API (Phase 2)

### useDataGridToolbar

The main hook that composes all toolbar functionality.

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `leftProps` | `object` | Props for the left section |
| `rightProps` | `object` | Props for the right section |
| `mode` | `GridMode` | Current grid mode |
| `isEditing` | `boolean` | Whether the grid is in edit mode |
| `isAddingRow` | `boolean` | Whether the grid is in add mode |
| `editingRowCount` | `number` | Number of rows being edited |
| `hasValidationErrors` | `boolean` | Whether there are validation errors |
| `selectionModel` | `any[]` | Current selection model |
| `clearSelection` | `() => void` | Function to clear the selection |

#### Example

```tsx
const toolbar = useDataGridToolbar();
```

### useDataGridToolbarLeft

Hook for left section functionality.

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `GridMode` | Current grid mode |
| `isEditing` | `boolean` | Whether the grid is in edit mode |
| `isAddingRow` | `boolean` | Whether the grid is in add mode |
| `editingRowCount` | `number` | Number of rows being edited |
| `hasValidationErrors` | `boolean` | Whether there are validation errors |
| `canAdd` | `boolean` | Whether rows can be added |
| `addRow` | `() => void` | Function to add a row |
| `isAddDisabled` | `boolean` | Whether the add button is disabled |
| `canSave` | `boolean` | Whether changes can be saved |
| `saveChanges` | `() => void` | Function to save changes |
| `isSaveDisabled` | `boolean` | Whether the save button is disabled |
| `canCancel` | `boolean` | Whether changes can be canceled |
| `cancelChanges` | `() => void` | Function to cancel changes |
| `isCancelDisabled` | `boolean` | Whether the cancel button is disabled |
| `validationDialogOpen` | `boolean` | Whether the validation dialog is open |
| `openValidationDialog` | `() => void` | Function to open the validation dialog |
| `closeValidationDialog` | `() => void` | Function to close the validation dialog |
| `validationErrors` | `Array<{ rowId: GridRowId, field: string, message: string }>` | Validation errors |

#### Example

```tsx
const {
  addRow,
  saveChanges,
  cancelChanges,
  isEditing,
  editingRowCount,
  hasValidationErrors
} = useDataGridToolbarLeft();
```

### useDataGridToolbarRight

Hook for right section functionality.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `onFilter` | `(filters: FilterValues) => void` | - | Callback when the filter button is clicked |
| `onExport` | `() => void` | - | Callback when the export button is clicked |
| `onUpload` | `() => void` | - | Callback when the upload button is clicked |
| `onHelp` | `() => void` | - | Callback when the help button is clicked |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `GridMode` | Current grid mode |
| `isInEditOrAddMode` | `boolean` | Whether the grid is in edit or add mode |
| `areActionButtonsDisabled` | `boolean` | Whether action buttons are disabled |
| `selectionModel` | `any[]` | Current selection model |
| `clearSelection` | `() => void` | Function to clear the selection |
| `filterDialogOpen` | `boolean` | Whether the filter dialog is open |
| `openFilterDialog` | `() => void` | Function to open the filter dialog |
| `closeFilterDialog` | `() => void` | Function to close the filter dialog |
| `handleFilter` | `(filters: FilterValues) => void` | Function to handle filter |
| `helpDialogOpen` | `boolean` | Whether the help dialog is open |
| `openHelpDialog` | `() => void` | Function to open the help dialog |
| `closeHelpDialog` | `() => void` | Function to close the help dialog |
| `handleHelp` | `() => void` | Function to handle help |
| `handleExport` | `() => void` | Function to handle export |
| `handleUpload` | `() => void` | Function to handle upload |

#### Example

```tsx
const {
  selectionModel,
  clearSelection,
  handleFilter,
  handleExport,
  handleUpload,
  handleHelp
} = useDataGridToolbarRight({
  onFilter: handleFilter,
  onExport: handleExport,
  onUpload: handleUpload,
  onHelp: handleHelp
});
```

### Individual Hooks

#### useAddRow

Hook for add row functionality.

##### Returns

| Property | Type | Description |
|----------|------|-------------|
| `canAdd` | `boolean` | Whether rows can be added |
| `addRow` | `() => void` | Function to add a row |
| `isDisabled` | `boolean` | Whether the add button is disabled |

##### Example

```tsx
const { canAdd, addRow, isDisabled } = useAddRow();
```

#### useSaveChanges

Hook for save changes functionality.

##### Returns

| Property | Type | Description |
|----------|------|-------------|
| `canSave` | `boolean` | Whether changes can be saved |
| `saveChanges` | `() => void` | Function to save changes |
| `isDisabled` | `boolean` | Whether the save button is disabled |
| `hasValidationErrors` | `boolean` | Whether there are validation errors |

##### Example

```tsx
const { canSave, saveChanges, isDisabled, hasValidationErrors } = useSaveChanges();
```

#### useCancelChanges

Hook for cancel changes functionality.

##### Returns

| Property | Type | Description |
|----------|------|-------------|
| `canCancel` | `boolean` | Whether changes can be canceled |
| `cancelChanges` | `() => void` | Function to cancel changes |
| `isDisabled` | `boolean` | Whether the cancel button is disabled |

##### Example

```tsx
const { canCancel, cancelChanges, isDisabled } = useCancelChanges();
```

## Types

### GridMode

```tsx
type GridMode = 'none' | 'edit' | 'add' | 'select';
```

### FilterValues

```tsx
interface FilterValues {
  birthdayMonthYear: Dayjs | null;
  department: string;
  name: string;
}
```

## Context Integration

The components and hooks integrate with the following contexts:

### GridModeContext

Provides access to the grid mode and related functionality.

#### Properties and Methods

| Name | Type | Description |
|------|------|-------------|
| `mode` | `GridMode` | Current grid mode |
| `setMode` | `(mode: GridMode) => void` | Function to set the grid mode |
| `selectedRowCount` | `number` | Number of selected rows |
| `clearSelection` | `() => void` | Function to clear the selection |
| `selectionModel` | `any[]` | Current selection model |
| `onSelectionModelChange` | `(selectionModel: any[], details?: any) => void` | Function to handle selection model changes |
| `editingRowCount` | `number` | Number of rows being edited |
| `isAddingRow` | `boolean` | Whether the grid is in add mode |
| `hasValidationErrors` | `boolean` | Whether there are validation errors |
| `saveChanges` | `() => void` | Function to save changes |
| `cancelChanges` | `() => void` | Function to cancel changes |
| `addRow` | `() => void` | Function to add a row |
| `page` | `number` | Current page |
| `pageSize` | `number` | Current page size |
| `totalRows` | `number` | Total number of rows |
| `setPage` | `(page: number) => void` | Function to set the page |
| `setPageSize` | `(pageSize: number) => void` | Function to set the page size |

### GridFormContext

Provides access to the form state and related functionality.

#### Properties and Methods

| Name | Type | Description |
|------|------|-------------|
| `getFormMethods` | `(rowId: GridRowId) => FormMethods \| undefined` | Function to get form methods for a row |
| `startEditingRow` | `(rowId: GridRowId, field: string) => void` | Function to start editing a row |
| `stopEditingRow` | `(rowId: GridRowId) => void` | Function to stop editing a row |
| `startEditingCell` | `(rowId: GridRowId, field: string) => void` | Function to start editing a cell |
| `stopEditingCell` | `() => void` | Function to stop editing a cell |
| `getCurrentCell` | `() => { rowId: GridRowId; field: string } \| undefined` | Function to get the current cell |
| `isRowEditing` | `(rowId: GridRowId) => boolean` | Function to check if a row is being edited |
| `isRowDirty` | `(rowId: GridRowId) => boolean` | Function to check if a row is dirty |
| `isFieldDirty` | `(rowId: GridRowId, field: string) => boolean` | Function to check if a field is dirty |
| `getRowErrors` | `(rowId: GridRowId) => Record<string, FieldError> \| undefined` | Function to get errors for a row |
| `validateRow` | `(rowId: GridRowId) => Promise<boolean>` | Function to validate a row |
| `updateCellValue` | `(rowId: GridRowId, field: string, value: any) => void` | Function to update a cell value |
| `saveChanges` | `() => void` | Function to save changes |
| `cancelChanges` | `() => void` | Function to cancel changes |
| `addRow` | `() => void` | Function to add a row |
| `hasValidationErrors` | `boolean` | Whether there are validation errors |
| `columns` | `EnhancedColumnConfig[]` | Column configurations |
| `isCompact` | `boolean` | Whether the grid is in compact mode |
| `getPendingChanges` | `() => Array<{ rowId: GridRowId, changes: Record<string, any> }>` | Function to get pending changes |
| `getEditedRowCount` | `() => number` | Function to get the number of edited rows |
| `getAllValidationErrors` | `() => Array<{ rowId: GridRowId, field: string, message: string }>` | Function to get all validation errors |
| `getOriginalRowData` | `(rowId: GridRowId) => Record<string, any> \| undefined` | Function to get original row data |