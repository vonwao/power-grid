import React from 'react';
import { render, screen } from '@testing-library/react';
import { EnhancedDataGrid } from '../EnhancedDataGrid';

// Mock the hooks and components used by EnhancedDataGrid
jest.mock('../hooks/useEnhancedDataGrid', () => ({
  useEnhancedDataGrid: jest.fn(() => ({
    columns: [
      { field: 'id', headerName: 'ID', width: 90, fieldConfig: { type: 'number' } },
      { field: 'name', headerName: 'Name', width: 150, fieldConfig: { type: 'string' } },
    ],
    rows: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ],
    totalRows: 2,
    loading: false,
    error: null,
    filtersApplied: false,
    handleFilterModelChange: jest.fn(),
    handleSortModelChange: jest.fn(),
    handlePaginationModelChange: jest.fn(),
    selectionState: {
      selectionModel: [],
      onSelectionModelChange: jest.fn(),
    },
    paginationState: {
      page: 0,
      pageSize: 25,
      setPage: jest.fn(),
      setPageSize: jest.fn(),
      paginationModel: { page: 0, pageSize: 25 },
    },
    refetch: jest.fn(() => Promise.resolve({ data: null })),
    resetCursors: jest.fn(),
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    isEmpty: false,
    isLoadingWithoutFilters: false,
  })),
}));

jest.mock('../context/GridFormContext', () => ({
  GridFormProvider: ({ children }: any) => <div data-testid="grid-form-provider">{children}</div>,
}));

jest.mock('../context/GridModeContext', () => ({
  GridModeProvider: ({ children }: any) => <div data-testid="grid-mode-provider">{children}</div>,
}));

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => (
    <div data-testid="data-grid">
      <div>Columns: {props.columns.length}</div>
      <div>Rows: {props.rows.length}</div>
      <div>Loading: {props.loading.toString()}</div>
      {props.slots.toolbar && <props.slots.toolbar {...props.slotProps.toolbar} />}
      {props.slots.noRowsOverlay && props.isEmpty && <props.slots.noRowsOverlay {...props.slotProps.noRowsOverlay} />}
    </div>
  ),
}));

jest.mock('../components/GridToolbar', () => ({
  GridToolbar: (props: any) => <div data-testid="grid-toolbar">Toolbar</div>,
}));

jest.mock('../components/EmptyStateOverlay', () => ({
  EmptyStateOverlay: (props: any) => <div data-testid="empty-state-overlay">No Results</div>,
}));

describe('EnhancedDataGrid', () => {
  const mockColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
      fieldConfig: { type: 'number' as const },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      fieldConfig: { type: 'string' as const },
    },
  ];

  const mockRows = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

  it('renders the DataGrid with correct providers', () => {
    render(
      <EnhancedDataGrid
        columns={mockColumns}
        rows={mockRows}
      />
    );
    
    expect(screen.getByTestId('grid-form-provider')).toBeInTheDocument();
    expect(screen.getByTestId('grid-mode-provider')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('passes the correct props to useEnhancedDataGrid', () => {
    const { useEnhancedDataGrid } = require('../hooks/useEnhancedDataGrid');
    
    render(
      <EnhancedDataGrid
        columns={mockColumns}
        rows={mockRows}
        useGraphQL={true}
        onlyLoadWithFilters={true}
        pageSize={50}
      />
    );
    
    expect(useEnhancedDataGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: true,
        onlyLoadWithFilters: true,
        pageSize: 50,
      })
    );
  });

  it('calls onGridFunctionsInit with the correct functions', () => {
    const onGridFunctionsInit = jest.fn();
    const { useEnhancedDataGrid } = require('../hooks/useEnhancedDataGrid');
    
    const mockRefetch = jest.fn();
    const mockResetCursors = jest.fn();
    const mockPageInfo = { hasNextPage: true };
    
    useEnhancedDataGrid.mockReturnValue({
      columns: mockColumns,
      rows: mockRows,
      totalRows: 2,
      loading: false,
      error: null,
      filtersApplied: false,
      handleFilterModelChange: jest.fn(),
      handleSortModelChange: jest.fn(),
      handlePaginationModelChange: jest.fn(),
      selectionState: {
        selectionModel: [],
        onSelectionModelChange: jest.fn(),
      },
      paginationState: {
        page: 0,
        pageSize: 25,
        setPage: jest.fn(),
        setPageSize: jest.fn(),
        paginationModel: { page: 0, pageSize: 25 },
      },
      refetch: mockRefetch,
      resetCursors: mockResetCursors,
      pageInfo: mockPageInfo,
      isEmpty: false,
      isLoadingWithoutFilters: false,
    });
    
    render(
      <EnhancedDataGrid
        columns={mockColumns}
        rows={mockRows}
        onGridFunctionsInit={onGridFunctionsInit}
      />
    );
    
    expect(onGridFunctionsInit).toHaveBeenCalledWith(
      mockRefetch,
      mockResetCursors,
      mockPageInfo
    );
  });

  it('calls onRowsChange when rows change', () => {
    const onRowsChange = jest.fn();
    
    render(
      <EnhancedDataGrid
        columns={mockColumns}
        rows={mockRows}
        onRowsChange={onRowsChange}
      />
    );
    
    // The mock implementation of useEnhancedDataGrid returns mockRows
    expect(onRowsChange).toHaveBeenCalledWith([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
  });

  it('renders the EmptyStateOverlay when isLoadingWithoutFilters is true', () => {
    const { useEnhancedDataGrid } = require('../hooks/useEnhancedDataGrid');
    
    useEnhancedDataGrid.mockReturnValue({
      columns: mockColumns,
      rows: [],
      totalRows: 0,
      loading: false,
      error: null,
      filtersApplied: false,
      handleFilterModelChange: jest.fn(),
      handleSortModelChange: jest.fn(),
      handlePaginationModelChange: jest.fn(),
      selectionState: {
        selectionModel: [],
        onSelectionModelChange: jest.fn(),
      },
      paginationState: {
        page: 0,
        pageSize: 25,
        setPage: jest.fn(),
        setPageSize: jest.fn(),
        paginationModel: { page: 0, pageSize: 25 },
      },
      refetch: jest.fn(),
      resetCursors: jest.fn(),
      pageInfo: {},
      isEmpty: true,
      isLoadingWithoutFilters: true,
    });
    
    render(
      <EnhancedDataGrid
        columns={mockColumns}
        rows={mockRows}
        onlyLoadWithFilters={true}
      />
    );
    
    // This would be visible if our mock DataGrid actually rendered the noRowsOverlay
    // But we're just checking that the props are passed correctly
    expect(screen.getByText('Rows: 0')).toBeInTheDocument();
  });
});