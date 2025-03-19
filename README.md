# Enhanced Data Grid

A React-based data grid with advanced editing, validation, and form management capabilities.

Overall vision: to be able to edit multiple rows in a very friendly and intuitive way.

## Architecture

### Core Components

- **EnhancedDataGrid.tsx**: Main component that wraps MUI X Data Grid with custom functionality.
- **GridFormContext.tsx**: Context provider that manages form state for all rows being edited.
- **EditCellRenderer.tsx**: Custom cell renderer for edit mode with real-time validation.
- **CellRenderer.tsx**: Custom cell renderer for view mode.
- **StatusPanel.tsx**: Floating panel that appears when editing, showing validation status and save/cancel buttons.

### Key Utilities

- **GridFormProvider**: Custom form management system that replaces React Hook Form.
- **SimpleFormMethods**: Interface that mimics React Hook Form's API for compatibility.
- **CellEditHandler**: Manages cell edit events and synchronizes with the form context.

## Data Flow

### Row/Cell Editing Flow

1. **Cell Click**: When a cell is clicked, `EnhancedDataGrid` calls `api.startCellEditMode()`.
2. **Edit Start**: `CellEditHandler` subscribes to the `cellEditStart` event and calls `startEditingCell()`.
3. **Form Creation**: If no form exists for the row, `startEditingRow()` creates a form instance using `createFormInstance()`.
4. **Render Edit Mode**: `EditCellRenderer` renders the appropriate input based on field type.
5. **Local State Management**: `EditCellRenderer` maintains local state for immediate UI updates while editing.
6. **Value Changes**: Changes are tracked in both local state and form state via `handleChangeWithLocalUpdate()`.
7. **Validation**: Changes trigger validation in the form context.
8. **Status Updates**: `StatusPanel` polls for editing status and shows save/cancel options.

### Tab Navigation

1. When tabbing between cells, the grid automatically calls `stopCellEditMode()` for the current cell.
2. `CellEditHandler` captures this via the `cellEditStop` event and calls `stopEditingCell()`.
3. The grid then calls `startCellEditMode()` for the next cell.
4. The process repeats from step 2 in the editing flow.

### Saving Changes

1. When clicking "Save" in the `StatusPanel`, `saveChanges()` is called.
2. Form values are collected from all edited rows.
3. Changes are compared against original values to create a diff.
4. The `onSave` callback is called with the changes.
5. Row state is updated in the grid.
6. Editing state is cleared.

## Technical Implementation Details

### Custom Form Management

- **SimpleFormMethods**: Interface that provides a subset of React Hook Form's API.
- **createFormInstance**: Factory function that creates form instances without hooks.
- Form instances are stored in a Map using row IDs as keys.
- Original row data is preserved for comparison when saving.

### Hook Rules Compliance

- All React hooks are called at the top level of components.
- `useCallback` hooks for event handlers are defined before any conditional returns.
- State initialization happens early to ensure consistent hook calls between renders.
- `useEffect` hooks handle side effects like form creation and value synchronization.

### Error Handling

- Try/catch blocks around critical operations.
- Fallback UI states for loading and error conditions.
- Detailed error logging with context information.

### Text Selection

- When entering edit mode for text fields, all text is automatically selected.
- This is implemented using a combination of `inputRef` and a `setTimeout` in `EditCellRenderer`.

### Validation

- Field-level validation happens in real-time as values change.
- Row-level validation can be provided via the `validateRow` prop.
- Validation errors are displayed inline and summarized in the `StatusPanel`.

### Change Tracking and Dirty Fields

- **pendingChanges**: A Map in GridFormContext explicitly tracks all modified fields and their values.
- **isFieldDirty/isRowDirty**: Methods use the pendingChanges Map to determine if a field or row has been modified.
- **ValidationIndicator**: Component that wraps fields and applies visual styling (green for valid, red for invalid) to indicate dirty state.
- Changes persist even when clicking away from a cell, ensuring users always know which fields have been modified.

### Status Panel Behavior

- Always visible to provide consistent UI for saving changes.
- Shows the number of rows being modified.
- Displays validation error indicators when needed.
- Save button is only enabled when there are changes to save and no validation errors.
- Uses console log interception to track changes in real-time.

### Data Persistence

- The `updateCellValue` method maintains the pendingChanges state.
- New rows are automatically marked as dirty in pendingChanges.
- The saveChanges and cancelChanges methods clear the pendingChanges state.
- Original values are preserved for comparison to determine if a field has been modified.
