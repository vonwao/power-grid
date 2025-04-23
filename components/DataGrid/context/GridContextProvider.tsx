import React, { useReducer, createContext, useContext, useCallback } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { gridReducer, initialGridState, GridState, GridAction } from '../reducers/gridReducer';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';

// Create context
interface GridContextValue {
  state: GridState;
  dispatch: React.Dispatch<GridAction>;
  
  // Helper functions
  addRow: (row?: Record<string, any>) => void;
  startEditingRow: (rowId: GridRowId, field: string) => void;
  stopEditingRow: (rowId: GridRowId) => void;
  startEditingCell: (rowId: GridRowId, field: string) => void;
  stopEditingCell: () => void;
  updateCellValue: (rowId: GridRowId, field: string, value: any) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  setMode: (mode: 'none' | 'edit' | 'add' | 'view') => void;
  setFilterPanelOpen: (open: boolean) => void;
  setFilterModel: (model: Record<string, any>) => void;
  setSelectionModel: (model: GridRowId[]) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortModel: (model: Array<{ field: string; sort: 'asc' | 'desc' }>) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed properties
  isRowEditing: (rowId: GridRowId) => boolean;
  isRowDirty: (rowId: GridRowId) => boolean;
  isFieldDirty: (rowId: GridRowId, field: string) => boolean;
  hasValidationErrors: boolean;
  getEditedRowCount: () => number;
}

const GridContext = createContext<GridContextValue | undefined>(undefined);

interface GridContextProviderProps {
  children: React.ReactNode;
  columns: EnhancedColumnConfig[];
  initialRows: any[];
  onSave?: (changes: { edits: any[]; additions: any[] }) => void;
}

export const GridContextProvider: React.FC<GridContextProviderProps> = ({
  children,
  columns,
  initialRows,
  onSave,
}) => {
  const [state, dispatch] = useReducer(gridReducer, {
    ...initialGridState,
    rows: initialRows,
  });
  
  // Helper functions
  const addRow = useCallback((row: Record<string, any> = {}) => {
    dispatch({ type: 'ADD_ROW', payload: { row, columns } });
  }, [columns]);
  
  const startEditingRow = useCallback((rowId: GridRowId, field: string) => {
    dispatch({ type: 'START_EDITING_ROW', payload: { rowId, field } });
  }, []);
  
  const stopEditingRow = useCallback((rowId: GridRowId) => {
    dispatch({ type: 'STOP_EDITING_ROW', payload: { rowId } });
  }, []);
  
  const startEditingCell = useCallback((rowId: GridRowId, field: string) => {
    dispatch({ type: 'START_EDITING_CELL', payload: { rowId, field } });
  }, []);
  
  const stopEditingCell = useCallback(() => {
    dispatch({ type: 'STOP_EDITING_CELL' });
  }, []);
  
  const updateCellValue = useCallback((rowId: GridRowId, field: string, value: any) => {
    dispatch({ type: 'UPDATE_CELL_VALUE', payload: { rowId, field, value } });
  }, []);
  
  const saveChanges = useCallback(() => {
    dispatch({ type: 'SAVE_CHANGES', payload: { onSave } });
  }, [onSave]);
  
  const cancelChanges = useCallback(() => {
    dispatch({ type: 'CANCEL_CHANGES' });
  }, []);
  
  const setMode = useCallback((mode: 'none' | 'edit' | 'add' | 'view') => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);
  
  const setFilterPanelOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_FILTER_PANEL_OPEN', payload: open });
  }, []);
  
  const setFilterModel = useCallback((model: Record<string, any>) => {
    dispatch({ type: 'SET_FILTER_MODEL', payload: model });
  }, []);
  
  const setSelectionModel = useCallback((model: GridRowId[]) => {
    dispatch({ type: 'SET_SELECTION_MODEL', payload: model });
  }, []);
  
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);
  
  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);
  
  const setSortModel = useCallback((model: Array<{ field: string; sort: 'asc' | 'desc' }>) => {
    dispatch({ type: 'SET_SORT_MODEL', payload: model });
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  // Computed properties
  const isRowEditing = useCallback((rowId: GridRowId) => {
    return state.editingRows.has(rowId);
  }, [state.editingRows]);
  
  const isRowDirty = useCallback((rowId: GridRowId) => {
    return state.pendingChanges.has(rowId);
  }, [state.pendingChanges]);
  
  const isFieldDirty = useCallback((rowId: GridRowId, field: string) => {
    const rowChanges = state.pendingChanges.get(rowId);
    return rowChanges ? field in rowChanges : false;
  }, [state.pendingChanges]);
  
  // Check if there are any validation errors
  const hasValidationErrors = false; // This would need to be implemented with form validation
  
  const getEditedRowCount = useCallback(() => {
    return state.pendingChanges.size;
  }, [state.pendingChanges]);
  
  const contextValue: GridContextValue = {
    state,
    dispatch,
    addRow,
    startEditingRow,
    stopEditingRow,
    startEditingCell,
    stopEditingCell,
    updateCellValue,
    saveChanges,
    cancelChanges,
    setMode,
    setFilterPanelOpen,
    setFilterModel,
    setSelectionModel,
    setPage,
    setPageSize,
    setSortModel,
    setLoading,
    isRowEditing,
    isRowDirty,
    isFieldDirty,
    hasValidationErrors,
    getEditedRowCount,
  };
  
  return (
    <GridContext.Provider value={contextValue}>
      {children}
    </GridContext.Provider>
  );
};

// Hook for using the context
export const useGridContext = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGridContext must be used within a GridContextProvider');
  }
  return context;
};