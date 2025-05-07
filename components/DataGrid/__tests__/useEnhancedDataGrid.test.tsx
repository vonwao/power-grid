import { renderHook, act } from '@testing-library/react';
import { useEnhancedDataGrid } from '../hooks/useEnhancedDataGrid';
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid';

// Mock the hooks that useEnhancedDataGrid depends on
jest.mock('../hooks/useSelectionModel', () => ({
  useSelectionModel: jest.fn(() => ({
    selectionModel: [],
    onSelectionModelChange: jest.fn(),
  })),
}));

jest.mock('../hooks/usePagination', () => ({
  usePagination: jest.fn(() => ({
    page: 0,
    pageSize: 25,
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    paginationModel: { page: 0, pageSize: 25 },
  })),
}));

jest.mock('../hooks/useRelayGraphQLData', () => ({
  useGraphQLData: jest.fn(() => ({
    rows: [],
    totalRows: 0,
    loading: false,
    error: null,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    setPage: jest.fn(),
    setSortModel: jest.fn(),
    setFilterModel: jest.fn(),
    refetch: jest.fn(() => Promise.resolve({ data: null })),
    resetCursors: jest.fn(),
  })),
}));

describe('useEnhancedDataGrid', () => {
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
      menuOptions: {
        showSortAsc: true,
        showSortDesc: true,
        showFilter: true,
        customItems: [
          {
            label: 'Custom Action',
            onClick: jest.fn(),
          },
        ],
      },
    },
  ];

  const mockRows = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

  it('should return client-side data when useGraphQL is false', () => {
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: false,
      })
    );

    expect(result.current.rows).toEqual(mockRows);
    expect(result.current.columns.length).toBe(2);
    expect(result.current.totalRows).toBe(2);
    expect(result.current.loading).toBe(false);
  });

  it('should return empty rows when onlyLoadWithFilters is true and no filters applied', () => {
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: true,
        onlyLoadWithFilters: true,
      })
    );

    expect(result.current.rows).toEqual([]);
    expect(result.current.isLoadingWithoutFilters).toBe(true);
  });

  it('should process columns with menu options', () => {
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: false,
      })
    );

    // Check that the column with menu options has been processed
    const processedColumn = result.current.columns[1] as any;
    expect(processedColumn.field).toBe('name');
    expect(typeof processedColumn.columnMenuItems).toBe('function');
  });

  it('should handle filter model changes', () => {
    const onFilterModelChange = jest.fn();
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: false,
        onFilterModelChange,
      })
    );

    const newFilterModel: GridFilterModel = {
      items: [
        {
          field: 'name',
          operator: 'contains',
          value: 'John',
        },
      ],
    };

    act(() => {
      result.current.handleFilterModelChange(newFilterModel);
    });

    expect(onFilterModelChange).toHaveBeenCalledWith(newFilterModel);
    expect(result.current.filtersApplied).toBe(true);
  });

  it('should handle sort model changes', () => {
    const onSortModelChange = jest.fn();
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: false,
        onSortModelChange,
      })
    );

    const newSortModel: GridSortModel = [
      {
        field: 'name',
        sort: 'asc',
      },
    ];

    act(() => {
      result.current.handleSortModelChange(newSortModel);
    });

    expect(onSortModelChange).toHaveBeenCalledWith(newSortModel);
  });

  it('should handle pagination model changes', () => {
    const onPaginationModelChange = jest.fn();
    const { result } = renderHook(() =>
      useEnhancedDataGrid({
        columns: mockColumns,
        rows: mockRows,
        useGraphQL: false,
        onPaginationModelChange,
      })
    );

    const newPaginationModel = {
      page: 1,
      pageSize: 50,
    };

    act(() => {
      result.current.handlePaginationModelChange(newPaginationModel);
    });

    expect(onPaginationModelChange).toHaveBeenCalledWith(newPaginationModel);
  });
});