import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { useSelectionModel } from '../hooks/useSelectionModel';
import { usePagination } from '../hooks/usePagination';

/**
 * Grid Mode System
 *
 * This context manages the modal state of the grid, ensuring that only one mode
 * can be active at a time. The available modes are:
 *
 * - none: Default state, grid is in view-only mode
 * - edit: Grid is in editing mode, allowing cell modifications
 * - add: Grid is in add mode, allowing new row creation
 * - select: Grid is in selection mode, allowing row selection
 *
 * The context also manages the interactions between these modes and handles
 * conflicts (e.g., can't select rows while editing).
 */

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
  selectionModel: any[];
  /**
   * Selection model change handler
   * This signature is intentionally flexible to accommodate both:
   * - The MUI X DataGrid's onSelectionModelChange prop (which passes two arguments)
   * - Our internal handlers (which may use one or two arguments)
   */
  onSelectionModelChange: (selectionModel: any[], details?: any) => void;
  
  // Edit state
  editingRowCount: number;
  isAddingRow: boolean;
  hasValidationErrors: boolean;
  
  // Actions
  saveChanges: () => void;
  cancelChanges: () => void;
  addRow: () => void;
  deleteRows: (ids: GridRowId[]) => void; // Function to handle deletion

  
  // Capabilities
  canEditRows: boolean;
  canAddRows: boolean;
  canSelectRows: boolean;
  canDeleteRows: boolean;

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
  canDeleteRows?: boolean;

  // Selection model
  // Action handlers from parent
  onDelete?: (ids: GridRowId[]) => void;

  selectionModel?: any[];
  onSelectionModelChange?: (selectionModel: any[]) => void;
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
  canSelectRows = true,
  canDeleteRows = false, // Default to false
  // Selection model
  selectionModel: externalSelectionModel,
  onSelectionModelChange: externalOnSelectionModelChange,
  // Delete handler
  onDelete: formOnDelete
}) => {
  // State for the current mode
  const [mode, setMode] = useState<GridMode>(initialMode);
  
  // Determine if we're in controlled selection mode
  const isSelectionControlled = externalSelectionModel !== undefined;
  
  // Only use the internal selection hook when in uncontrolled mode
  const {
    selectionModel: internalSelectionModel,
    onSelectionModelChange: internalOnSelectionModelChange
  } = useSelectionModel({
    // Don't pass the external selection model to avoid double-management
    onSelectionModelChange: !isSelectionControlled && externalOnSelectionModelChange ? 
      (newModel) => externalOnSelectionModelChange(newModel) : 
      undefined
  });
  
  // Use the appropriate selection model based on controlled/uncontrolled state
  const selectionModel = isSelectionControlled ? externalSelectionModel : internalSelectionModel;
  
  // Create a wrapper function that adapts between the different types
  const adaptedOnSelectionModelChange = useCallback((newModel: any[], details?: any) => {
    if (isSelectionControlled) {
      // In controlled mode, only call the external handler
      if (externalOnSelectionModelChange) {
        externalOnSelectionModelChange(newModel);
      }
    } else {
      // In uncontrolled mode, update internal state
      internalOnSelectionModelChange(newModel, details || {} as any);
    }
  }, [isSelectionControlled, externalOnSelectionModelChange, internalOnSelectionModelChange]);
  
  // Get pagination
  const {
    page,
    pageSize,
    setPage,
    setPageSize
  } = usePagination();
  
  // Tracking edited rows logic...
  const [editingRows, setEditingRows] = useState<Set<GridRowId>>(new Set());
  
  // Effect for updating editing rows set
  useEffect(() => {
    const newEditingRows = new Set<GridRowId>();
    
    if (isRowDirty) {
      selectionModel.forEach((rowId: GridRowId) => {
        if (isRowEditing(rowId) && isRowDirty(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    } else {
      selectionModel.forEach((rowId: GridRowId) => {
        if (isRowEditing(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    }
    
    setEditingRows(newEditingRows);
  }, [selectionModel, isRowEditing, isRowDirty]);
  
  // Derived state
  const selectedRowCount = selectionModel.length;
  
  const editingRowCount = isRowDirty ?
    Array.from(editingRows).filter(rowId => isRowDirty(rowId)).length :
    editingRows.size;
  
  const isAddingRow = mode === 'add';
  
  // Action Handlers
  const clearSelection = useCallback(() => {
    adaptedOnSelectionModelChange([]);
  }, [adaptedOnSelectionModelChange]);
  
  const saveChanges = useCallback(() => {
    formSaveChanges();
    setMode('none');
  }, [formSaveChanges]);
  
  const cancelChanges = useCallback(() => {
    formCancelChanges();
    setMode('none');
  }, [formCancelChanges]);
  
  const addRow = useCallback(() => {
    formAddRow();
    setMode('add');
  }, [formAddRow]);

  // Delete handler
  const deleteRows = useCallback((ids: GridRowId[]) => {
    if (formOnDelete) {
      formOnDelete(ids);
      // Optionally clear selection or change mode after deletion
      clearSelection();
      // setMode('none'); // Or keep selection mode? Decide based on desired UX
    } else {
      console.warn('onDelete handler not provided to GridModeProvider');
    }
  }, [formOnDelete, clearSelection]);
  
  // Context value
  const contextValue: GridModeContextType = {
    mode,
    setMode,
    selectedRowCount,
    clearSelection,
    selectionModel,
    onSelectionModelChange: adaptedOnSelectionModelChange,
    editingRowCount,
    isAddingRow,
    hasValidationErrors,
    saveChanges,
    cancelChanges,
    addRow,
    deleteRows, // Add delete handler
    // Capabilities
    canEditRows,
    canAddRows,
    canSelectRows,
    canDeleteRows, // Add delete capability flag
    // Pagination
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

/**
 * Custom Hook: useGridMode
 *
 * This hook provides access to the GridModeContext.
 * Components can use this hook to:
 * - Read the current grid mode
 * - Change the grid mode
 * - Access selection state
 * - Perform actions like save, cancel, add
 *
 * It throws an error if used outside of a GridModeProvider.
 */
export const useGridMode = () => {
  const context = useContext(GridModeContext);
  if (!context) {
    throw new Error('useGridMode must be used within a GridModeProvider');
  }
  return context;
};

/**
 * Alias for backward compatibility
 *
 * This allows components that were using the old useToolbarMode hook
 * to continue working without changes.
 */
export const useToolbarMode = useGridMode;
