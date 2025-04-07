# Migration Guide: UnifiedDataGridToolbar to Modular Toolbar

This guide provides step-by-step instructions for migrating from the current UnifiedDataGridToolbar to the new modular toolbar components.

## Migration Steps

### Step 1: Update Import Statements

**Before:**
```tsx
import { UnifiedDataGridToolbar } from './components/DataGrid/components/UnifiedDataGridToolbar';
```

**After:**
```tsx
import { DataGridToolbar } from './components/DataGrid/components/toolbar';
```

### Step 2: Update Component Usage

**Before:**
```tsx
<UnifiedDataGridToolbar
  onSave={saveChanges}
  onFilter={handleFilter}
  onExport={handleExport}
  onUpload={handleUpload}
  onHelp={handleHelp}
  canEditRows={canEditRows}
  canAddRows={canAddRows}
  canSelectRows={canSelectRows}
/>
```

**After:**
```tsx
<DataGridToolbar
  onFilter={handleFilter}
  onExport={handleExport}
  onUpload={handleUpload}
  onHelp={handleHelp}
  canEditRows={canEditRows}
  canAddRows={canAddRows}
  canSelectRows={canSelectRows}
/>
```

Note: The `onSave` prop is no longer needed as the toolbar now uses the GridModeContext directly.

### Step 3: Customizing the Toolbar

If you need to customize the toolbar, you can use the new modular components:

```tsx
import { 
  DataGridToolbar, 
  DataGridToolbarLeft, 
  DataGridToolbarRight 
} from './components/DataGrid/components/toolbar';

// Hide specific buttons
<DataGridToolbar
  hideAddButton={true}
  hideExportButton={true}
/>

// Or provide custom sections
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

### Step 4: Using Individual Components

If you need even more customization, you can use the individual components:

```tsx
import { 
  AddRowButton, 
  SaveButton, 
  CancelButton,
  FilterButton,
  ExportButton,
  UploadButton,
  HelpButton,
  EditingStatus,
  ValidationSummary,
  SelectionStatus
} from './components/DataGrid/components/toolbar';

// Example: Custom toolbar with specific components
<div className="custom-toolbar">
  <div className="left-section">
    <AddRowButton />
    <EditingStatus />
    <SaveButton />
    <CancelButton />
  </div>
  <div className="right-section">
    <SelectionStatus />
    <FilterButton onClick={handleFilter} />
    <ExportButton onClick={handleExport} />
  </div>
</div>
```

### Step 5: Using the Headless API (Phase 2)

Once Phase 2 is implemented, you can use the headless API for complete customization:

```tsx
import { 
  useDataGridToolbarLeft, 
  useDataGridToolbarRight 
} from './components/DataGrid/hooks/toolbar';

function MyCustomToolbar() {
  const {
    addRow,
    saveChanges,
    cancelChanges,
    isEditing,
    editedRowCount,
    hasValidationErrors
  } = useDataGridToolbarLeft();

  const {
    selectionModel,
    clearSelection,
    handleFilter,
    handleExport
  } = useDataGridToolbarRight({
    onFilter: handleFilter,
    onExport: handleExport
  });

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
```

## Common Migration Scenarios

### Scenario 1: Simple Drop-in Replacement

If you're using the UnifiedDataGridToolbar with default settings, you can simply replace it with the DataGridToolbar:

```tsx
// Before
<UnifiedDataGridToolbar />

// After
<DataGridToolbar />
```

### Scenario 2: Custom Filter Dialog

If you're using a custom filter dialog:

```tsx
// Before
<UnifiedDataGridToolbar
  onFilter={(filters) => {
    // Custom filter handling
    console.log('Filters:', filters);
    applyFilters(filters);
  }}
/>

// After
<DataGridToolbar
  onFilter={(filters) => {
    // Custom filter handling
    console.log('Filters:', filters);
    applyFilters(filters);
  }}
/>
```

### Scenario 3: Hiding Specific Buttons

If you need to hide specific buttons:

```tsx
// Before
// This wasn't directly supported in UnifiedDataGridToolbar

// After
<DataGridToolbar
  hideAddButton={true}
  hideFilterButton={true}
  hideExportButton={true}
/>
```

### Scenario 4: Custom Button Implementations

If you need custom button implementations:

```tsx
// Before
// This wasn't directly supported in UnifiedDataGridToolbar

// After
<DataGridToolbar
  rightSection={
    <DataGridToolbarRight 
      customFilterButton={<MyCustomFilterButton onClick={handleFilter} />}
      customExportButton={<MyCustomExportButton onClick={handleExport} />}
    />
  }
/>
```

## Troubleshooting

### Issue: Toolbar doesn't show editing status

**Solution:** Make sure you're using the GridModeProvider and GridFormProvider correctly:

```tsx
<GridFormProvider columns={columns} initialRows={rows} onSave={onSave}>
  <GridModeProvider totalRows={rows.length} initialMode="none">
    <DataGridToolbar />
    {/* Rest of your grid */}
  </GridModeProvider>
</GridFormProvider>
```

### Issue: Custom buttons don't work

**Solution:** Make sure you're passing the correct props to the custom buttons:

```tsx
const MyCustomFilterButton = ({ onClick }) => (
  <button onClick={onClick}>Custom Filter</button>
);

<DataGridToolbarRight 
  customFilterButton={<MyCustomFilterButton onClick={handleFilter} />}
/>
```

### Issue: Validation errors aren't showing

**Solution:** Make sure you're using the ValidationSummary component:

```tsx
<DataGridToolbarLeft 
  hideValidationSummary={false} // This is the default
/>
```

## Conclusion

This migration guide should help you transition from the UnifiedDataGridToolbar to the new modular toolbar components. The new components provide more flexibility and customization options while maintaining all the functionality of the original toolbar.

If you encounter any issues during migration, please refer to the implementation plan and component documentation for more details.