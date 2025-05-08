import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GridFilterModel, GridSortModel, GridRowId, GridPaginationModel } from '@mui/x-data-grid';
import { useGraphQLData } from './useRelayGraphQLData';
import { useSelectionModel } from './useSelectionModel';
import { usePagination } from './usePagination';
import { EnhancedColumnConfig } from '../types/columnConfig';

/**
 * Options for the useEnhancedDataGrid hook
 */
export interface EnhancedDataGridHookOptions<T = any> {
  // Base props
  columns: EnhancedColumnConfig[];
  rows: T[];
  
  // GraphQL options
  useGraphQL?: boolean;
  forceClientSide?: boolean;
  query?: any;
  variables?: Record<string, any>;
  paginationStyle?: 'cursor' | 'offset' | 'key';
  
  // New feature: conditional loading
  onlyLoadWithFilters?: boolean;
  
  // Pagination options
  pageSize?: number;
  initialPage?: number;
  paginationMode?: 'client' | 'server';
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  
  // Sorting and filtering options
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'client' | 'server';
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  filterMode?: 'client' | 'server';
  
  // Selection options
  selectionModel?: GridRowId[];
  onSelectionModelChange?: (selectionModel: GridRowId[]) => void;
  
  // Other options
  loading?: boolean;
}

/**
 * Result of the useEnhancedDataGrid hook
 */
export interface EnhancedDataGridHookResult<T = any> {
  // Grid configuration
  columns: EnhancedColumnConfig[];
  rows: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
  
  // State tracking
  filtersApplied: boolean;
  
  // Event handlers
  handleFilterModelChange: (model: GridFilterModel) => void;
  handleSortModelChange: (model: GridSortModel) => void;
  handlePaginationModelChange: (model: GridPaginationModel) => void;
  
  // Hooks state
  selectionState: any;
  paginationState: any;
  
  // GraphQL utilities
  refetch: () => Promise<any>;
  resetCursors: () => void;
  pageInfo: any;
  
  // Component flags
  isEmpty: boolean;
  isLoadingWithoutFilters: boolean;
}

/**
 * Master hook for the Enhanced Data Grid
 * 
 * This hook combines functionality from other hooks and adds new features
 * like conditional loading and enhanced column menu options.
 */
export function useEnhancedDataGrid<T extends { id: GridRowId }>({
  // Base props
  columns,
  rows,
  // GraphQL options
  useGraphQL = true,
  forceClientSide = false,
  query,
  variables,
  paginationStyle = 'cursor',
  // New feature: conditional loading
  onlyLoadWithFilters = false,
  // Pagination options
  pageSize = 25,
  initialPage = 0,
  paginationMode = 'server',
  paginationModel: externalPaginationModel,
  onPaginationModelChange: externalOnPaginationModelChange,
  // Sorting and filtering options
  sortModel: initialSortModel,
  onSortModelChange: externalOnSortModelChange,
  sortingMode = 'server',
  filterModel: initialFilterModel,
  onFilterModelChange: externalOnFilterModelChange,
  filterMode = 'server',
  // Selection options
  selectionModel: initialSelectionModel,
  onSelectionModelChange,
  // Other options
  loading: externalLoading = false,
}: EnhancedDataGridHookOptions<T>): EnhancedDataGridHookResult<T> {
  // Only log in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('[useEnhancedDataGrid] Initializing with:', {
      columnsCount: columns?.length,
      rowsCount: rows?.length,
      useGraphQL,
      onlyLoadWithFilters
    });
  }
  
  // State for tracking if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Determine if GraphQL fetching should be used
  const useGraphQLFetching = useMemo(
    () => useGraphQL && !forceClientSide,
    [useGraphQL, forceClientSide]
  );
  
  // Setup filter and sort models with proper state tracking
  const [internalFilterModel, setInternalFilterModel] = useState<GridFilterModel>(
    initialFilterModel || { items: [] }
  );
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>(
    initialSortModel || []
  );
  
  // Use appropriate hooks based on configuration
  const selectionState = useSelectionModel({
    selectionModel: initialSelectionModel,
    onSelectionModelChange,
  });
  
  const paginationState = usePagination({
    initialPage,
    initialPageSize: pageSize,
  });
  
  // Create pagination model for MUI X DataGrid
  const paginationModelToUse = useMemo(() => {
    return externalPaginationModel || {
      page: paginationState.page,
      pageSize: paginationState.pageSize
    };
  }, [externalPaginationModel, paginationState.page, paginationState.pageSize]);
  
  // Stable reference to useGraphQLFetching
  const useGraphQLFetchingRef = useRef(useGraphQLFetching);
  useEffect(() => {
    useGraphQLFetchingRef.current = useGraphQLFetching;
  }, [useGraphQLFetching]);
  
  // Stable reference to onlyLoadWithFilters
  const onlyLoadWithFiltersRef = useRef(onlyLoadWithFilters);
  useEffect(() => {
    onlyLoadWithFiltersRef.current = onlyLoadWithFilters;
  }, [onlyLoadWithFilters]);
  
  // Stable reference to filtersApplied
  const filtersAppliedRef = useRef(filtersApplied);
  useEffect(() => {
    filtersAppliedRef.current = filtersApplied;
  }, [filtersApplied]);
  
  // Determine if data should be fetched with stable references
  const shouldFetchData = useMemo(() => {
    if (!useGraphQLFetchingRef.current) return false;
    if (!onlyLoadWithFiltersRef.current) return true;
    return filtersAppliedRef.current;
  }, [/* No dependencies to reduce re-renders */]);
  
  // Setup GraphQL data with conditional fetching
  const graphQLResult = useMemo(() => {
    if (!shouldFetchData) {
      // Only log in development mode and only once
      if (process.env.NODE_ENV !== 'production') {
        console.log('[useEnhancedDataGrid] Skipping GraphQL fetch - conditions not met');
      }
      return {
        rows: [],
        totalRows: 0,
        loading: false,
        error: null,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false, 
          startCursor: null,
          endCursor: null
        },
        setPage: () => {},
        setSortModel: () => {},
        setFilterModel: () => {},
        refetch: () => Promise.resolve({ data: null }),
        resetCursors: () => {}
      };
    }
    
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('[useEnhancedDataGrid] Initiating GraphQL fetch');
    }
    try {
      // Convert filter model to the format expected by useGraphQLData
      const filterObj: Record<string, any> = {};
      if (internalFilterModel.items && internalFilterModel.items.length > 0) {
        internalFilterModel.items.forEach(item => {
          if (item.field && item.value !== undefined) {
            filterObj[item.field] = {
              value: item.value,
              operator: item.operator || 'contains'
            };
          }
        });
      }
      
      // Convert sort model to the format expected by useGraphQLData
      const sortItems = internalSortModel.length > 0 ? 
        internalSortModel.map(item => ({
          field: item.field,
          sort: item.sort as 'asc' | 'desc'
        })) : 
        [];
      
      return useGraphQLData<T>({
        pageSize: paginationState.pageSize,
        initialPage: paginationState.page,
        query,
        variables,
        initialFilterModel: filterObj,
        initialSortModel: sortItems,
      });
    } catch (error) {
      console.error('[useEnhancedDataGrid] Error setting up GraphQL data:', error);
      // Return empty/default state on error
      return {
        rows: [],
        totalRows: 0,
        loading: false,
        error,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false, 
          startCursor: null,
          endCursor: null
        },
        setPage: () => {},
        setSortModel: () => {},
        setFilterModel: () => {},
        refetch: () => Promise.resolve({ data: null }),
        resetCursors: () => {}
      };
    }
  }, [
    shouldFetchData,
    // Use stable references for these values
    // paginationState.pageSize and paginationState.page are stable
    query,
    // Use JSON.stringify for deep comparison of objects
    JSON.stringify(variables),
    // Only depend on the relevant parts of filter/sort models
    JSON.stringify(internalFilterModel.items),
    JSON.stringify(internalSortModel)
  ]);
  
  // Process columns to add custom menu options
  const processedColumns = useMemo(() => {
    return columns.map((column: EnhancedColumnConfig) => {
      // Base column configuration
      const baseColumn = {
        ...column,
        // Existing transformations
      };
      
      // Add custom menu options if provided
      if (column.menuOptions) {
        // Cast to any to bypass TypeScript limitations
        (baseColumn as any).columnMenuItems = (colDef: any) => {
          const items: any[] = [];
          
          // Add standard items if enabled (default to showing them)
          if (column.menuOptions?.showSortAsc !== false) items.push('columnMenuSortAsc');
          if (column.menuOptions?.showSortDesc !== false) items.push('columnMenuSortDesc');
          if (column.menuOptions?.showFilter !== false) items.push('columnMenuFilterItem');
          if (column.menuOptions?.showColumnSelector !== false) items.push('columnMenuColumnsItem');
          
          // Add custom items
          column.menuOptions?.customItems?.forEach(item => {
            items.push({
              label: item.label,
              icon: item.icon,
              onClick: () => {
                try {
                  item.onClick(colDef);
                } catch (error) {
                  console.error(`[useEnhancedDataGrid] Error in custom menu item click handler:`, error);
                }
              }
            });
          });
          
          return items;
        };
      }
      
      return baseColumn;
    });
  }, [columns]);
  
  // Create stable references for rows
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  
  // Create stable references for graphQLResult.rows
  const graphQLRowsRef = useRef(graphQLResult.rows);
  useEffect(() => {
    graphQLRowsRef.current = graphQLResult.rows;
  }, [graphQLResult.rows]);
  
  // Determine displayed rows based on configuration with stable references
  const displayRows = useMemo(() => {
    if (useGraphQLFetchingRef.current) {
      if (onlyLoadWithFiltersRef.current && !filtersAppliedRef.current) {
        // Only log in development mode
        if (process.env.NODE_ENV !== 'production') {
          console.log('[useEnhancedDataGrid] Returning empty rows - filters not applied');
        }
        return [];
      }
      return graphQLRowsRef.current || [];
    }
    return rowsRef.current || [];
  }, [/* No dependencies to reduce re-renders */]);
  
  // Enhanced filter handler that tracks filter application
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('[useEnhancedDataGrid] Filter model changed:', newModel);
    }
    
    // Update internal state
    setInternalFilterModel(newModel);
    
    // Track if filters have been applied
    setFiltersApplied(newModel.items && newModel.items.length > 0);
    
    // If using GraphQL with server-side filtering - use refs for stable comparison
    if (useGraphQLFetchingRef.current && shouldFetchData) {
      try {
        // Pass filter to GraphQL hook
        const filterObj: Record<string, any> = {};
        newModel.items.forEach(item => {
          if (item.field && item.value !== undefined) {
            filterObj[item.field] = {
              value: item.value,
              operator: item.operator || 'contains'
            };
          }
        });
        
        graphQLResult.setFilterModel?.(filterObj);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying filter:', error);
      }
    }
    
    // Call external handler if provided
    if (externalOnFilterModelChange) {
      externalOnFilterModelChange(newModel);
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setFilterModel, 
    externalOnFilterModelChange
  ]);
  
  // Enhanced sort handler
  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('[useEnhancedDataGrid] Sort model changed:', newModel);
    }
    
    // Update internal state
    setInternalSortModel(newModel);
    
    // If using GraphQL with server-side sorting - use refs for stable comparison
    if (useGraphQLFetchingRef.current && shouldFetchData) {
      try {
        // Pass sort to GraphQL hook
        const sortItems = newModel.map(item => ({
          field: item.field,
          sort: item.sort as 'asc' | 'desc'
        }));
        
        graphQLResult.setSortModel?.(sortItems);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying sort:', error);
      }
    }
    
    // Call external handler if provided
    if (externalOnSortModelChange) {
      externalOnSortModelChange(newModel);
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setSortModel, 
    externalOnSortModelChange
  ]);
  
  // Enhanced pagination handler
  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('[useEnhancedDataGrid] Pagination model changed:', newModel);
    }
    
    // Update internal state
    paginationState.setPage(newModel.page);
    paginationState.setPageSize(newModel.pageSize);
    
    // If using GraphQL with server-side pagination - use refs for stable comparison
    if (useGraphQLFetchingRef.current && shouldFetchData) {
      try {
        // Pass page to GraphQL hook
        graphQLResult.setPage?.(newModel.page);
      } catch (error) {
        console.error('[useEnhancedDataGrid] Error applying pagination:', error);
      }
    }
    
    // Call external handler if provided
    if (externalOnPaginationModelChange) {
      externalOnPaginationModelChange(newModel);
    }
  }, [
    useGraphQLFetching, 
    shouldFetchData, 
    graphQLResult.setPage, 
    paginationState,
    externalOnPaginationModelChange
  ]);
  
  // Calculate total rows
  const totalRows = useMemo(() => {
    if (useGraphQLFetching) {
      return graphQLResult.totalRows || 0;
    }
    return rows?.length || 0;
  }, [useGraphQLFetching, graphQLResult.totalRows, rows?.length]);
  
  // Combine loading states
  const loading = useMemo(() => {
    return externalLoading || graphQLResult.loading;
  }, [externalLoading, graphQLResult.loading]);
  
  // Return everything the component needs
  return {
    // Grid configuration
    columns: processedColumns,
    rows: displayRows,
    totalRows,
    loading,
    error: graphQLResult.error as Error | null,
    
    // State tracking
    filtersApplied,
    
    // Event handlers
    handleFilterModelChange,
    handleSortModelChange,
    handlePaginationModelChange,
    
    // Hooks state
    selectionState,
    paginationState: {
      ...paginationState,
      paginationModel: paginationModelToUse
    },
    
    // GraphQL utilities
    refetch: graphQLResult.refetch || (() => Promise.resolve({ data: null })),
    resetCursors: graphQLResult.resetCursors || (() => {}),
    pageInfo: graphQLResult.pageInfo,
    
    // Component flags
    isEmpty: displayRows.length === 0,
    isLoadingWithoutFilters: onlyLoadWithFilters && !filtersApplied
  };
}