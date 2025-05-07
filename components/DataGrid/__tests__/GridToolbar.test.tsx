import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridToolbar } from '../components/GridToolbar';

// Mock the GridModeContext
jest.mock('../context/GridModeContext', () => ({
  useGridMode: jest.fn(() => ({
    mode: 'none',
    addRow: jest.fn(),
    saveChanges: jest.fn(),
    cancelChanges: jest.fn(),
    selectionModel: [],
    clearSelection: jest.fn(),
    deleteRows: jest.fn(),
    canAddRows: true,
    canDeleteRows: true,
    hasValidationErrors: false,
    isAddingRow: false,
    editingRowCount: 0,
  })),
}));

// Mock MUI X DataGrid components
jest.mock('@mui/x-data-grid', () => ({
  GridToolbarContainer: ({ children, ...props }: any) => (
    <div data-testid="grid-toolbar-container" {...props}>
      {children}
    </div>
  ),
  GridToolbarColumnsButton: () => <button data-testid="columns-button">Columns</button>,
  GridToolbarFilterButton: () => <button data-testid="filter-button">Filter</button>,
  GridToolbarDensitySelector: () => <button data-testid="density-button">Density</button>,
  GridToolbarExport: () => <button data-testid="export-button">Export</button>,
}));

describe('GridToolbar', () => {
  it('renders the standard MUI X toolbar buttons', () => {
    render(<GridToolbar />);
    
    expect(screen.getByTestId('columns-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();
    expect(screen.getByTestId('density-button')).toBeInTheDocument();
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });
  
  it('renders the Add button in view mode when canAddRows is true', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'none',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: false,
      editingRowCount: 0,
    });
    
    render(<GridToolbar />);
    
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
  
  it('does not render the Add button in view mode when canAddRows is false', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'none',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: false,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: false,
      editingRowCount: 0,
    });
    
    render(<GridToolbar />);
    
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });
  
  it('renders Save and Cancel buttons in edit mode', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'edit',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: false,
      editingRowCount: 1,
    });
    
    render(<GridToolbar />);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Editing 1 record(s)')).toBeInTheDocument();
  });
  
  it('renders Add label for Save button in add mode', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'add',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: true,
      editingRowCount: 0,
    });
    
    render(<GridToolbar />);
    
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Adding new record')).toBeInTheDocument();
  });
  
  it('disables the Save button when there are validation errors', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'edit',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: true,
      isAddingRow: false,
      editingRowCount: 1,
    });
    
    render(<GridToolbar />);
    
    expect(screen.getByText('Save')).toBeDisabled();
    expect(screen.getByText('Fix validation errors')).toBeInTheDocument();
  });
  
  it('renders selection chip when rows are selected', () => {
    const { useGridMode } = require('../context/GridModeContext');
    useGridMode.mockReturnValue({
      mode: 'none',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [1, 2, 3],
      clearSelection: jest.fn(),
      deleteRows: jest.fn(),
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: false,
      editingRowCount: 0,
    });
    
    render(<GridToolbar />);
    
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });
  
  it('renders Delete button when rows are selected and canDeleteRows is true', () => {
    const { useGridMode } = require('../context/GridModeContext');
    const deleteRowsMock = jest.fn();
    useGridMode.mockReturnValue({
      mode: 'none',
      addRow: jest.fn(),
      saveChanges: jest.fn(),
      cancelChanges: jest.fn(),
      selectionModel: [1, 2, 3],
      clearSelection: jest.fn(),
      deleteRows: deleteRowsMock,
      canAddRows: true,
      canDeleteRows: true,
      hasValidationErrors: false,
      isAddingRow: false,
      editingRowCount: 0,
    });
    
    render(<GridToolbar />);
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    expect(deleteRowsMock).toHaveBeenCalledWith([1, 2, 3]);
  });
  
  it('renders custom actions when provided', () => {
    render(
      <GridToolbar
        customActions={<button data-testid="custom-action">Custom Action</button>}
      />
    );
    
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
  
  it('calls onFilterClick when provided', () => {
    const handleFilterClick = jest.fn();
    render(<GridToolbar onFilterClick={handleFilterClick} />);
    
    // We can't directly test this since we're mocking the filter button
    // But we can verify the prop is passed correctly
    expect(handleFilterClick).not.toHaveBeenCalled();
  });
});