import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { useSelectionModel } from '../hooks/useSelectionModel';
import { usePagination } from '../hooks/usePagination';

// Define the toolbar mode type
export type ToolbarMode = 'none' | 'edit' | 'add' | 'select';

// Define the context type
interface ToolbarModeContextType {
  // Mode state
  mode: ToolbarMode;
  setMode: (newMode: ToolbarMode) => void;
  
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
const ToolbarModeContext = createContext<ToolbarModeContextType | undefined>(undefined);

// Provider props
interface ToolbarModeProviderProps {
  children: React.ReactNode;
  totalRows: number;
  initialMode?: ToolbarMode;
  // Form state and actions
  saveChanges: () => void;
  cancelChanges: () => void;
  addRow: () => void;
  hasValidationErrors: boolean;
  isRowEditing?: (rowId: GridRowId) => boolean;
  isRowDirty?: (rowId: GridRowId) => boolean;
}

// Provider component
export const ToolbarModeProvider: React.FC<ToolbarModeProviderProps> = ({
  children,
  totalRows,
  initialMode = 'none',
  // Form state and actions
  saveChanges: formSaveChanges,
  cancelChanges: formCancelChanges,
  addRow: formAddRow,
  hasValidationErrors,
  isRowEditing = () => false,
  isRowDirty = () => false
}) => {
  // State for the current mode
  const [mode, setMode] = useState<ToolbarMode>(initialMode);
  
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
    // This is a simplified approach - in a real implementation, you would
    // need to track this more accurately based on the actual form state
    const newEditingRows = new Set<GridRowId>();
    
    // Check each row in the selection model to see if it's being edited
    selectionModel.forEach(rowId => {
      if (isRowEditing(rowId) || isRowDirty(rowId)) {
        newEditingRows.add(rowId);
      }
    });
    
    setEditingRows(newEditingRows);
  }, [selectionModel, isRowEditing, isRowDirty]);
  
  // Derived state
  const selectedRowCount = selectionModel.length;
  const editingRowCount = editingRows.size;
  
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
  const contextValue: ToolbarModeContextType = {
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
    <ToolbarModeContext.Provider value={contextValue}>
      {children}
    </ToolbarModeContext.Provider>
  );
};

// Hook to use the context
export const useToolbarMode = () => {
  const context = useContext(ToolbarModeContext);
  if (!context) {
    throw new Error('useToolbarMode must be used within a ToolbarModeProvider');
  }
  return context;
};