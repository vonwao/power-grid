# DataGrid Toolbar Testing Strategy

This document outlines the testing strategy for the refactored DataGrid toolbar components. The goal is to ensure that the refactoring doesn't break existing functionality and that the new components work as expected.

## Testing Approach

We'll use a combination of unit tests, integration tests, and manual testing to ensure the quality of the refactored toolbar components.

### Unit Tests

Unit tests will focus on testing individual components and hooks in isolation. We'll use Jest and React Testing Library for unit testing.

### Integration Tests

Integration tests will focus on testing the interaction between components and with the GridModeContext and GridFormContext. We'll use Jest and React Testing Library for integration testing.

### Manual Testing

Manual testing will focus on testing the toolbar in the context of the EnhancedDataGrid component. We'll use a test application to manually test the toolbar.

## Test Coverage

We'll aim for high test coverage, focusing on the following areas:

- Component rendering
- Component props and state
- Component interactions
- Hook behavior
- Context integration

## Unit Tests

### Component Tests

#### DataGridToolbar

```tsx
describe('DataGridToolbar', () => {
  it('renders without crashing', () => {
    render(<DataGridToolbar />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders left and right sections', () => {
    render(<DataGridToolbar />);
    expect(screen.getByTestId('toolbar-left')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-right')).toBeInTheDocument();
  });

  it('passes props to left and right sections', () => {
    const onFilter = jest.fn();
    const onExport = jest.fn();
    render(
      <DataGridToolbar
        hideAddButton={true}
        hideFilterButton={true}
        onFilter={onFilter}
        onExport={onExport}
      />
    );
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /filter/i })).not.toBeInTheDocument();
  });

  it('renders custom left and right sections', () => {
    render(
      <DataGridToolbar
        leftSection={<div data-testid="custom-left">Custom Left</div>}
        rightSection={<div data-testid="custom-right">Custom Right</div>}
      />
    );
    expect(screen.getByTestId('custom-left')).toBeInTheDocument();
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();
  });
});
```

#### DataGridToolbarLeft

```tsx
describe('DataGridToolbarLeft', () => {
  it('renders without crashing', () => {
    render(<DataGridToolbarLeft />);
    expect(screen.getByTestId('toolbar-left')).toBeInTheDocument();
  });

  it('renders add button when not hidden', () => {
    render(<DataGridToolbarLeft hideAddButton={false} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('hides add button when hidden', () => {
    render(<DataGridToolbarLeft hideAddButton={true} />);
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
  });

  // Similar tests for save button, cancel button, editing status, and validation summary
});
```

#### DataGridToolbarRight

```tsx
describe('DataGridToolbarRight', () => {
  it('renders without crashing', () => {
    render(<DataGridToolbarRight />);
    expect(screen.getByTestId('toolbar-right')).toBeInTheDocument();
  });

  it('renders filter button when not hidden', () => {
    render(<DataGridToolbarRight hideFilterButton={false} />);
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('hides filter button when hidden', () => {
    render(<DataGridToolbarRight hideFilterButton={true} />);
    expect(screen.queryByRole('button', { name: /filter/i })).not.toBeInTheDocument();
  });

  // Similar tests for export button, upload button, help button, and selection status
});
```

#### Button Components

```tsx
describe('AddRowButton', () => {
  it('renders without crashing', () => {
    render(<AddRowButton />);
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<AddRowButton disabled={true} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('calls addRow when clicked', () => {
    const addRow = jest.fn();
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue({
      mode: 'none',
      addRow,
      // ... other context values
    });
    render(<AddRowButton />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(addRow).toHaveBeenCalled();
  });
});

// Similar tests for other button components
```

#### Status Components

```tsx
describe('EditingStatus', () => {
  it('renders without crashing', () => {
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue({
      mode: 'edit',
      editingRowCount: 2,
      // ... other context values
    });
    render(<EditingStatus />);
    expect(screen.getByText(/editing 2 records/i)).toBeInTheDocument();
  });

  it('does not render when mode is none', () => {
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue({
      mode: 'none',
      // ... other context values
    });
    render(<EditingStatus />);
    expect(screen.queryByText(/editing/i)).not.toBeInTheDocument();
  });
});

// Similar tests for other status components
```

### Hook Tests

#### useDataGridToolbarLeft

```tsx
describe('useDataGridToolbarLeft', () => {
  it('returns the correct values', () => {
    const mockGridMode = {
      mode: 'edit',
      editingRowCount: 2,
      isAddingRow: false,
      hasValidationErrors: false,
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
    };
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue(mockGridMode);
    
    const mockGridForm = {
      getAllValidationErrors: jest.fn().mockReturnValue([]),
    };
    jest.spyOn(GridFormContext, 'useGridForm').mockReturnValue(mockGridForm);
    
    const { result } = renderHook(() => useDataGridToolbarLeft());
    
    expect(result.current.mode).toBe('edit');
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isAddingRow).toBe(false);
    expect(result.current.editingRowCount).toBe(2);
    expect(result.current.hasValidationErrors).toBe(false);
    expect(result.current.canAdd).toBe(false);
    expect(result.current.canSave).toBe(true);
    expect(result.current.canCancel).toBe(true);
  });
});
```

#### useDataGridToolbarRight

```tsx
describe('useDataGridToolbarRight', () => {
  it('returns the correct values', () => {
    const mockGridMode = {
      mode: 'edit',
      selectionModel: [1, 2, 3],
      clearSelection: jest.fn(),
    };
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue(mockGridMode);
    
    const onFilter = jest.fn();
    const onExport = jest.fn();
    
    const { result } = renderHook(() => useDataGridToolbarRight(onFilter, onExport));
    
    expect(result.current.mode).toBe('edit');
    expect(result.current.isInEditOrAddMode).toBe(true);
    expect(result.current.areActionButtonsDisabled).toBe(true);
    expect(result.current.selectionModel).toEqual([1, 2, 3]);
    
    // Test filter dialog
    expect(result.current.filterDialogOpen).toBe(false);
    act(() => {
      result.current.openFilterDialog();
    });
    expect(result.current.filterDialogOpen).toBe(false); // Should still be false because buttons are disabled
    
    // Test with buttons enabled
    jest.spyOn(GridModeContext, 'useGridMode').mockReturnValue({
      ...mockGridMode,
      mode: 'none',
    });
    
    const { result: result2 } = renderHook(() => useDataGridToolbarRight(onFilter, onExport));
    
    expect(result2.current.isInEditOrAddMode).toBe(false);
    expect(result2.current.areActionButtonsDisabled).toBe(false);
    
    act(() => {
      result2.current.openFilterDialog();
    });
    expect(result2.current.filterDialogOpen).toBe(true);
    
    act(() => {
      result2.current.handleFilter({ birthdayMonthYear: null, department: '', name: '' });
    });
    expect(onFilter).toHaveBeenCalled();
    expect(result2.current.filterDialogOpen).toBe(false);
  });
});
```

## Integration Tests

### DataGridToolbar with GridModeContext

```tsx
describe('DataGridToolbar with GridModeContext', () => {
  it('shows editing status when in edit mode', () => {
    render(
      <GridModeProvider
        totalRows={10}
        initialMode="edit"
        saveChanges={jest.fn()}
        cancelChanges={jest.fn()}
        addRow={jest.fn()}
        hasValidationErrors={false}
        editingRowCount={2}
      >
        <DataGridToolbar />
      </GridModeProvider>
    );
    expect(screen.getByText(/editing 2 records/i)).toBeInTheDocument();
  });

  it('disables action buttons when in edit mode', () => {
    render(
      <GridModeProvider
        totalRows={10}
        initialMode="edit"
        saveChanges={jest.fn()}
        cancelChanges={jest.fn()}
        addRow={jest.fn()}
        hasValidationErrors={false}
        editingRowCount={2}
      >
        <DataGridToolbar />
      </GridModeProvider>
    );
    expect(screen.getByRole('button', { name: /filter/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
  });

  it('enables save button when in edit mode without validation errors', () => {
    render(
      <GridModeProvider
        totalRows={10}
        initialMode="edit"
        saveChanges={jest.fn()}
        cancelChanges={jest.fn()}
        addRow={jest.fn()}
        hasValidationErrors={false}
        editingRowCount={2}
      >
        <DataGridToolbar />
      </GridModeProvider>
    );
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
  });

  it('disables save button when in edit mode with validation errors', () => {
    render(
      <GridModeProvider
        totalRows={10}
        initialMode="edit"
        saveChanges={jest.fn()}
        cancelChanges={jest.fn()}
        addRow={jest.fn()}
        hasValidationErrors={true}
        editingRowCount={2}
      >
        <DataGridToolbar />
      </GridModeProvider>
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
```

### DataGridToolbar with GridFormContext

```tsx
describe('DataGridToolbar with GridFormContext', () => {
  it('shows validation summary when there are validation errors', () => {
    const mockValidationErrors = [
      { rowId: 1, field: 'name', message: 'Name is required' },
      { rowId: 2, field: 'email', message: 'Invalid email' },
    ];
    
    render(
      <GridFormProvider
        columns={[]}
        initialRows={[]}
        onSave={jest.fn()}
      >
        <GridModeProvider
          totalRows={10}
          initialMode="edit"
          saveChanges={jest.fn()}
          cancelChanges={jest.fn()}
          addRow={jest.fn()}
          hasValidationErrors={true}
          editingRowCount={2}
        >
          <DataGridToolbar />
        </GridModeProvider>
      </GridFormProvider>
    );
    
    expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
  });
});
```

## Manual Testing Scenarios

### Basic Functionality

1. **Add Row**
   - Click the Add button
   - Verify that a new row is added to the grid
   - Verify that the toolbar shows "Adding new record"
   - Verify that action buttons are disabled

2. **Edit Row**
   - Double-click a cell to enter edit mode
   - Verify that the toolbar shows "Editing 1 record"
   - Verify that action buttons are disabled

3. **Save Changes**
   - Make changes to a row
   - Click the Save button
   - Verify that changes are saved
   - Verify that the toolbar returns to normal state

4. **Cancel Changes**
   - Make changes to a row
   - Click the Cancel button
   - Verify that changes are discarded
   - Verify that the toolbar returns to normal state

5. **Validation Errors**
   - Make invalid changes to a row
   - Verify that the toolbar shows "Validation errors"
   - Verify that the Save button is disabled
   - Click the "Validation errors" chip
   - Verify that the validation errors dialog opens

### Action Buttons

1. **Filter**
   - Click the Filter button
   - Verify that the filter dialog opens
   - Apply filters
   - Verify that the grid is filtered accordingly

2. **Export**
   - Click the Export button
   - Verify that the export function is called

3. **Upload**
   - Click the Upload button
   - Verify that the upload function is called

4. **Help**
   - Click the Help button
   - Verify that the help dialog opens

### Selection

1. **Select Rows**
   - Select multiple rows
   - Verify that the toolbar shows "Selected: X rows"
   - Click the clear selection button (X)
   - Verify that the selection is cleared

### Custom Components

1. **Custom Left Section**
   - Create a custom left section
   - Verify that it renders correctly
   - Verify that it interacts correctly with the grid

2. **Custom Right Section**
   - Create a custom right section
   - Verify that it renders correctly
   - Verify that it interacts correctly with the grid

3. **Custom Buttons**
   - Create custom buttons
   - Verify that they render correctly
   - Verify that they interact correctly with the grid

## Test File Structure

```
components/DataGrid/components/toolbar/__tests__/
├── DataGridToolbar.test.tsx
├── DataGridToolbarLeft.test.tsx
├── DataGridToolbarRight.test.tsx
├── buttons/
│   ├── AddRowButton.test.tsx
│   ├── SaveButton.test.tsx
│   ├── CancelButton.test.tsx
│   ├── FilterButton.test.tsx
│   ├── ExportButton.test.tsx
│   ├── UploadButton.test.tsx
│   └── HelpButton.test.tsx
└── status/
    ├── EditingStatus.test.tsx
    ├── ValidationSummary.test.tsx
    └── SelectionStatus.test.tsx
```

## Conclusion

This testing strategy ensures that the refactored toolbar components work as expected and don't break existing functionality. By combining unit tests, integration tests, and manual testing, we can be confident in the quality of the refactored code.

Remember to run the tests frequently during development to catch issues early. And don't forget to update the tests as the components evolve.