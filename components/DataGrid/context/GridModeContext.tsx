import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { useSelectionModel } from '../hooks/useSelectionModel';
import { usePagination } from '../hooks/usePagination';

// Define the grid mode type
export type GridMode = 'none' | 'edit' | 'add' | 'select';

// Define the context type
interface GridModeContextType {
  // Mode state
  mode: GridMode;
  setMode: (newMode: GridMode) => void;
  
  // Selection state
  selectedRowCount: number;
  clearSelection: () => void;
  
  // Edit state
  editingRowCount: number;
  isAddingRow: boolean;
  hasValidationErrors: boolean;
  
  // Actions
  saveChanges: () => void;
  cancelChanges: () => void;
  addRow: () => void;
  
  // Pagination
  page: number;
  pageSize: number;
  totalRows: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

// Create the context
const GridModeContext = createContext<GridModeContextType | undefined>(undefined);

// Provider props
interface GridModeProviderProps {
  children: React.ReactNode;
  totalRows: number;
  initialMode?: GridMode;
  // Form state and actions
  saveChanges: () => void;
  cancelChanges: () => void;
  addRow: () => void;
  hasValidationErrors: boolean;
  isRowEditing?: (rowId: GridRowId) => boolean;
  isRowDirty?: (rowId: GridRowId) => boolean;
  // Grid capabilities
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
}

// Provider component
export const GridModeProvider: React.FC<GridModeProviderProps> = ({ 
  children,
  totalRows,
  initialMode = 'none',
  // Form state and actions
  saveChanges: formSaveChanges,
  cancelChanges: formCancelChanges,
  addRow: formAddRow,
  hasValidationErrors,
  isRowEditing = () => false,
  isRowDirty = () => false,
  // Grid capabilities
  canEditRows = true,
  canAddRows = true,
  canSelectRows = true
}) => {
  // State for the current mode
  const [mode, setMode] = useState<GridMode>(initialMode);
  
  // Get selection model
  const { 
    selectionModel,
    onSelectionModelChange
  } = useSelectionModel();
  
  // Get pagination
  const {
    page,
    pageSize,
    setPage,
    setPageSize
  } = usePagination();
  
  // Track editing rows
  const [editingRows, setEditingRows] = useState<Set<GridRowId>>(new Set());
  
  // Update editing rows when form state changes
  useEffect(() => {
    // This is a more accurate approach that only counts rows with actual changes
    const newEditingRows = new Set<GridRowId>();
    
    // Check all rows to see if they're being edited and have actual changes
    if (isRowDirty) {
      // We'll use isRowDirty to determine if a row has actual changes
      // This will only count rows where fields have been modified
      selectionModel.forEach(rowId => {
        if (isRowEditing(rowId) && isRowDirty(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    } else {
      // Fallback to the old approach if isRowDirty is not available
      selectionModel.forEach(rowId => {
        if (isRowEditing(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    }
    
    setEditingRows(newEditingRows);
  }, [selectionModel, isRowEditing, isRowDirty]);
  
  // Derived state
  const selectedRowCount = selectionModel.length;
  
  // Use the form context's getEditedRowCount if available, otherwise fall back to editingRows.size
  // This ensures we only count rows with actual changes
  const editingRowCount = isRowDirty ? 
    Array.from(editingRows).filter(rowId => isRowDirty(rowId)).length : 
    editingRows.size;
  
  // Check if we're adding a new row
  // This is a simplified approach - in a real implementation, you would
  // need to track this more accurately based on how you identify new rows
  const isAddingRow = mode === 'add';
  
  // Clear selection
  const clearSelection = useCallback(() => {
    // Just pass an empty array to clear the selection
    // We don't need to pass the details parameter since it's optional
    onSelectionModelChange([], {} as any);
  }, [onSelectionModelChange]);
  
  // Save changes
  const saveChanges = useCallback(() => {
    formSaveChanges();
    setMode('none');
  }, [formSaveChanges]);
  
  // Cancel changes
  const cancelChanges = useCallback(() => {
    formCancelChanges();
    setMode('none');
  }, [formCancelChanges]);
  
  // Add row
  const addRow = useCallback(() => {
    formAddRow();
    setMode('add');
  }, [formAddRow]);
  
  // Context value
  const contextValue: GridModeContextType = {
    mode,
    setMode,
    selectedRowCount,
    clearSelection,
    editingRowCount,
    isAddingRow,
    hasValidationErrors,
    saveChanges,
    cancelChanges,
    addRow,
    page,
    pageSize,
    totalRows,
    setPage,
    setPageSize
  };
  
  return (
    <GridModeContext.Provider value={contextValue}>
      {children}
    </GridModeContext.Provider>
  );
};

// Hook to use the context
export const useGridMode = () => {
  const context = useContext(GridModeContext);
  if (!context) {
    throw new Error('useGridMode must be used within a GridModeProvider');
  }
  return context;
};

// For backward compatibility
export const useToolbarMode = useGridMode;
