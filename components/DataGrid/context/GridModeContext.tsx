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
  // Selection model
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
  // Selection model
  selectionModel: externalSelectionModel,
  onSelectionModelChange: externalOnSelectionModelChange
}) => {
  // State for the current mode
  const [mode, setMode] = useState<GridMode>(initialMode);
  
  /**
   * Selection Model Management
   *
   * This component handles two possible sources of selection state:
   * 1. External selection model passed via props (controlled mode)
   * 2. Internal selection model managed by the useSelectionModel hook (uncontrolled mode)
   *
   * The logic prioritizes the external selection model if provided, otherwise
   * falls back to the internal hook-based selection model.
   */
  
  // Get selection model from hook, but configure it with external values if provided
  const {
    selectionModel: hookSelectionModel,
    onSelectionModelChange: hookOnSelectionModelChange
  } = useSelectionModel({
    selectionModel: externalSelectionModel,
    onSelectionModelChange: externalOnSelectionModelChange ?
      (newModel) => externalOnSelectionModelChange(newModel) :
      undefined
  });
  
  /**
   * Selection Change Adapter
   *
   * This function adapts between different selection change handler signatures:
   * - The external handler might expect just the new selection model
   * - The hook handler expects both the model and additional details
   *
   * This adapter ensures that the correct parameters are passed to each handler.
   */
  // Create a wrapper function that adapts between the different types
  const adaptedOnSelectionModelChange = useCallback((newModel: any[], details?: any) => {
    if (externalOnSelectionModelChange) {
      externalOnSelectionModelChange(newModel);
    } else {
      hookOnSelectionModelChange(newModel, details || {} as any);
    }
  }, [externalOnSelectionModelChange, hookOnSelectionModelChange]);
  
  // Use external selection model if provided, otherwise use hook-managed model
  const selectionModel = externalSelectionModel !== undefined ? externalSelectionModel : hookSelectionModel;
  
  // Get pagination
  const {
    page,
    pageSize,
    setPage,
    setPageSize
  } = usePagination();
  
  /**
   * Editing Rows Tracking
   *
   * This state and effect track which rows are currently being edited.
   * A row is considered "being edited" if:
   * 1. It's in edit mode (isRowEditing returns true)
   * 2. It has actual changes (isRowDirty returns true) - if available
   *
   * This tracking is used to:
   * - Display UI indicators for edited rows
   * - Determine if save/cancel actions should be enabled
   * - Count how many rows are being edited for the toolbar display
   */
  const [editingRows, setEditingRows] = useState<Set<GridRowId>>(new Set());
  
  /**
   * Effect: Update Editing Rows Set
   *
   * This effect runs whenever:
   * - The selection model changes
   * - The row editing state changes
   * - The row dirty state changes
   *
   * It rebuilds the set of rows that are currently being edited with actual changes.
   * Two approaches are used based on available functions:
   * 1. Preferred: Only count rows that are both being edited AND have actual changes
   * 2. Fallback: Count all rows that are being edited regardless of changes
   */
  // Use a ref to track the previous state to avoid unnecessary updates
  const prevStateRef = React.useRef<{
    selectionModel: any[];
    editingRowsCount: number;
  }>({ selectionModel: [], editingRowsCount: 0 });

  useEffect(() => {
    // Skip the effect if the selection model hasn't actually changed
    // This prevents infinite loops by avoiding unnecessary state updates
    if (JSON.stringify(prevStateRef.current.selectionModel) === JSON.stringify(selectionModel)) {
      return;
    }
    
    // Update the ref with current values
    prevStateRef.current.selectionModel = [...selectionModel];
    
    const newEditingRows = new Set<GridRowId>();
    
    // If we can check for dirty state (actual field changes)
    if (isRowDirty) {
      // Only count rows that are both being edited AND have actual changes
      selectionModel.forEach((rowId: GridRowId) => {
        if (isRowEditing(rowId) && isRowDirty(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    } else {
      // Fallback: count all rows being edited regardless of changes
      selectionModel.forEach((rowId: GridRowId) => {
        if (isRowEditing(rowId)) {
          newEditingRows.add(rowId);
        }
      });
    }
    
    // Only update state if the editing rows have actually changed
    const newEditingRowsCount = newEditingRows.size;
    if (prevStateRef.current.editingRowsCount !== newEditingRowsCount) {
      prevStateRef.current.editingRowsCount = newEditingRowsCount;
      setEditingRows(newEditingRows);
    }
  }, [selectionModel, isRowEditing, isRowDirty]);
  
  /**
   * Derived State
   *
   * These values are computed from other state and don't need their own useState.
   * They're recalculated whenever their dependencies change.
   */
  
  // Count of selected rows - derived from selectionModel
  const selectedRowCount = selectionModel.length;
  
  /**
   * Count of rows being edited with actual changes
   *
   * Two approaches:
   * 1. If isRowDirty is available: Filter editingRows to only count those with changes
   * 2. Otherwise: Use the total count of rows being edited
   *
   * This ensures the UI accurately reflects how many rows will be affected by a save.
   */
  const editingRowCount = isRowDirty ?
    Array.from(editingRows).filter(rowId => isRowDirty(rowId)).length :
    editingRows.size;
  
  /**
   * Flag indicating if we're in "add row" mode
   *
   * This is a simplified approach based on the current mode.
   * A more robust implementation would track newly added rows specifically.
   */
  const isAddingRow = mode === 'add';
  
  /**
   * Action Handlers
   *
   * These callbacks handle user actions and update state accordingly.
   * They're memoized with useCallback to prevent unnecessary re-renders.
   */
  
  /**
   * Clear Selection
   * Removes all selected rows by passing an empty array to the selection handler
   */
  // Clear selection
  const clearSelection = useCallback(() => {
    // Just pass an empty array to clear the selection
    adaptedOnSelectionModelChange([]);
  }, [adaptedOnSelectionModelChange]);
  
  /**
   * Save Changes
   * 1. Calls the form's save function to persist changes
   * 2. Resets the grid mode to 'none' (view mode)
   */
  const saveChanges = useCallback(() => {
    formSaveChanges();
    setMode('none');
  }, [formSaveChanges]);
  
  /**
   * Cancel Changes
   * 1. Calls the form's cancel function to revert changes
   * 2. Resets the grid mode to 'none' (view mode)
   */
  const cancelChanges = useCallback(() => {
    formCancelChanges();
    setMode('none');
  }, [formCancelChanges]);
  
  /**
   * Add Row
   * 1. Calls the form's add row function to create a new row
   * 2. Sets the grid mode to 'add' to indicate we're adding a row
   */
  const addRow = useCallback(() => {
    formAddRow();
    setMode('add');
  }, [formAddRow]);
  
  /**
   * Context Value
   *
   * This object contains all the state and functions that will be
   * provided to components that consume this context.
   *
   * It includes:
   * - Mode state and setter
   * - Selection state and handlers
   * - Editing state
   * - Action handlers
   * - Pagination state and handlers
   */
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
