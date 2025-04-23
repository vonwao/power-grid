import { GridRowId } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';

// Define the state shape
export interface GridState {
  // Row data
  rows: any[];
  
  // Editing state
  editingRows: Set<GridRowId>;
  currentCell?: { rowId: GridRowId; field: string };
  
  // Changes tracking
  pendingChanges: Map<GridRowId, Record<string, any>>;
  
  // Original data for edited rows
  originalData: Map<GridRowId, any>;
  
  // Added rows tracking
  addedRows: Set<GridRowId>;
  
  // Form instances (not stored in state, but referenced)
  formInstances: Map<GridRowId, any>;
  
  // UI state
  mode: 'none' | 'edit' | 'add' | 'view';
  
  // Filter state
  filterPanelOpen: boolean;
  filterModel: Record<string, any>;
  
  // Selection state
  selectionModel: GridRowId[];
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  
  // Sorting state
  sortModel: Array<{ field: string; sort: 'asc' | 'desc' }>;
  
  // Loading state
  loading: boolean;
}

// Define the initial state
export const initialGridState: GridState = {
  rows: [],
  editingRows: new Set(),
  pendingChanges: new Map(),
  originalData: new Map(),
  addedRows: new Set(),
  formInstances: new Map(),
  mode: 'none',
  filterPanelOpen: false,
  filterModel: {},
  selectionModel: [],
  currentPage: 0,
  pageSize: 25,
  sortModel: [],
  loading: false,
};

// Define action types
export type GridAction =
  | { type: 'SET_ROWS'; payload: any[] }
  | { type: 'ADD_ROW'; payload: { row: any; columns: EnhancedColumnConfig[] } }
  | { type: 'START_EDITING_ROW'; payload: { rowId: GridRowId; field: string } }
  | { type: 'STOP_EDITING_ROW'; payload: { rowId: GridRowId } }
  | { type: 'START_EDITING_CELL'; payload: { rowId: GridRowId; field: string } }
  | { type: 'STOP_EDITING_CELL' }
  | { type: 'UPDATE_CELL_VALUE'; payload: { rowId: GridRowId; field: string; value: any } }
  | { type: 'SAVE_CHANGES'; payload?: { onSave?: (changes: { edits: any[]; additions: any[] }) => void } }
  | { type: 'CANCEL_CHANGES' }
  | { type: 'SET_MODE'; payload: 'none' | 'edit' | 'add' | 'view' }
  | { type: 'SET_FILTER_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_FILTER_MODEL'; payload: Record<string, any> }
  | { type: 'SET_SELECTION_MODEL'; payload: GridRowId[] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_SORT_MODEL'; payload: Array<{ field: string; sort: 'asc' | 'desc' }> }
  | { type: 'SET_LOADING'; payload: boolean };

// Helper function to create a form instance (simplified version)
const createFormInstance = (defaultValues: Record<string, any>, columns: EnhancedColumnConfig[]) => {
  return {
    formState: {
      values: { ...defaultValues },
      errors: {},
      dirtyFields: {},
      isDirty: false,
      isValid: true,
    },
    getValues: () => ({ ...defaultValues }),
    setValue: () => {},
    setError: () => {},
    clearErrors: () => {},
    trigger: async () => true,
  };
};

// Define the reducer
export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_ROWS':
      return {
        ...state,
        rows: action.payload,
      };
      
    case 'ADD_ROW': {
      const { row, columns } = action.payload;
      const newId = row.id || `new-${Date.now()}`;
      
      // Create a new row with the provided data or defaults
      const newRow = { id: newId, ...row };
      
      // Create a form instance
      const formInstance = createFormInstance(newRow, columns);
      state.formInstances.set(newId, formInstance);
      
      // Mark as a new row
      const newAddedRows = new Set(state.addedRows);
      newAddedRows.add(newId);
      
      // Add to editing rows
      const newEditingRows = new Set(state.editingRows);
      newEditingRows.add(newId);
      
      // Track changes
      const newPendingChanges = new Map(state.pendingChanges);
      const rowChanges: Record<string, any> = {};
      
      // Add all fields to changes
      Object.keys(newRow).forEach(field => {
        if (field !== 'id') {
          rowChanges[field] = newRow[field];
        }
      });
      
      newPendingChanges.set(newId, rowChanges);
      
      // Find first editable field
      const firstEditableField = columns.find(col => col.editable)?.field || columns[0].field;
      
      return {
        ...state,
        rows: [newRow, ...state.rows],
        editingRows: newEditingRows,
        addedRows: newAddedRows,
        pendingChanges: newPendingChanges,
        currentCell: { rowId: newId, field: firstEditableField },
        mode: 'add',
      };
    }
      
    case 'START_EDITING_ROW': {
      const { rowId, field } = action.payload;
      
      // Find the row
      const row = state.rows.find(r => r.id === rowId);
      if (!row) return state;
      
      // Store original data if not already stored
      const newOriginalData = new Map(state.originalData);
      if (!newOriginalData.has(rowId)) {
        newOriginalData.set(rowId, { ...row });
      }
      
      // Add to editing rows
      const newEditingRows = new Set(state.editingRows);
      newEditingRows.add(rowId);
      
      return {
        ...state,
        editingRows: newEditingRows,
        originalData: newOriginalData,
        currentCell: { rowId, field },
        mode: 'edit',
      };
    }
      
    case 'STOP_EDITING_ROW': {
      const { rowId } = action.payload;
      
      // Remove from editing rows
      const newEditingRows = new Set(state.editingRows);
      newEditingRows.delete(rowId);
      
      // Clear current cell if it's for this row
      let newCurrentCell = state.currentCell;
      if (state.currentCell?.rowId === rowId) {
        newCurrentCell = undefined;
      }
      
      return {
        ...state,
        editingRows: newEditingRows,
        currentCell: newCurrentCell,
      };
    }
      
    case 'START_EDITING_CELL': {
      const { rowId, field } = action.payload;
      
      // If row isn't being edited, start editing it
      if (!state.editingRows.has(rowId)) {
        // Find the row
        const row = state.rows.find(r => r.id === rowId);
        if (!row) return state;
        
        // Store original data
        const newOriginalData = new Map(state.originalData);
        if (!newOriginalData.has(rowId)) {
          newOriginalData.set(rowId, { ...row });
        }
        
        // Add to editing rows
        const newEditingRows = new Set(state.editingRows);
        newEditingRows.add(rowId);
        
        return {
          ...state,
          editingRows: newEditingRows,
          originalData: newOriginalData,
          currentCell: { rowId, field },
          mode: 'edit',
        };
      }
      
      // Just update current cell
      return {
        ...state,
        currentCell: { rowId, field },
      };
    }
      
    case 'STOP_EDITING_CELL':
      return {
        ...state,
        currentCell: undefined,
      };
      
    case 'UPDATE_CELL_VALUE': {
      const { rowId, field, value } = action.payload;
      
      // Get original value to compare
      const originalData = state.originalData.get(rowId);
      const hasChanged = originalData && 
        JSON.stringify(value) !== JSON.stringify(originalData[field]);
      
      // Update pending changes
      const newPendingChanges = new Map(state.pendingChanges);
      
      if (hasChanged) {
        // Get or create row changes
        const rowChanges = { ...(newPendingChanges.get(rowId) || {}) };
        rowChanges[field] = value;
        newPendingChanges.set(rowId, rowChanges);
      } else if (newPendingChanges.has(rowId)) {
        // If value is back to original, remove it from changes
        const rowChanges = { ...(newPendingChanges.get(rowId) || {}) };
        if (field in rowChanges) {
          delete rowChanges[field];
          
          // If row has no changes, remove it from the map
          if (Object.keys(rowChanges).length === 0) {
            newPendingChanges.delete(rowId);
          } else {
            newPendingChanges.set(rowId, rowChanges);
          }
        }
      }
      
      // Update the row in the rows array
      const newRows = state.rows.map(row => {
        if (row.id === rowId) {
          return { ...row, [field]: value };
        }
        return row;
      });
      
      return {
        ...state,
        rows: newRows,
        pendingChanges: newPendingChanges,
      };
    }
      
    case 'SAVE_CHANGES': {
      // Prepare the payload for the API
      const edits: Array<{ id: GridRowId; changes: any }> = [];
      const additions: Array<any> = [];
      
      // Process each edited row
      state.editingRows.forEach(rowId => {
        const formInstance = state.formInstances.get(rowId);
        const originalData = state.originalData.get(rowId);
        
        if (formInstance && originalData) {
          const currentValues = formInstance.getValues();
          
          if (state.addedRows.has(rowId)) {
            // This is a new row
            additions.push(currentValues);
          } else {
            // This is an existing row - only include changed fields
            const changes: any = {};
            let hasChanges = false;
            
            Object.keys(currentValues).forEach(key => {
              if (JSON.stringify(currentValues[key]) !== JSON.stringify(originalData[key])) {
                changes[key] = currentValues[key];
                hasChanges = true;
              }
            });
            
            if (hasChanges) {
              edits.push({ id: rowId, changes });
            }
          }
        }
      });
      
      // Call the onSave callback if provided
      if (action.payload?.onSave) {
        action.payload.onSave({ edits, additions });
      }
      
      // Update rows with changes
      let newRows = [...state.rows];
      
      // Apply edits
      edits.forEach(edit => {
        const index = newRows.findIndex(row => row.id === edit.id);
        if (index >= 0) {
          newRows[index] = { ...newRows[index], ...edit.changes };
        }
      });
      
      return {
        ...state,
        rows: newRows,
        editingRows: new Set(),
        currentCell: undefined,
        pendingChanges: new Map(),
        mode: 'none',
      };
    }
      
    case 'CANCEL_CHANGES': {
      // Revert rows to their original state
      let newRows = [...state.rows];
      
      // First handle added rows - remove them
      if (state.addedRows.size > 0) {
        newRows = newRows.filter(row => !state.addedRows.has(row.id));
      }
      
      // Then handle edited rows - revert to original values
      state.editingRows.forEach(rowId => {
        if (!state.addedRows.has(rowId)) {
          const originalData = state.originalData.get(rowId);
          if (originalData) {
            const index = newRows.findIndex(row => row.id === rowId);
            if (index >= 0) {
              newRows[index] = { ...originalData };
            }
          }
        }
      });
      
      return {
        ...state,
        rows: newRows,
        editingRows: new Set(),
        currentCell: undefined,
        pendingChanges: new Map(),
        addedRows: new Set(),
        mode: 'none',
      };
    }
      
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
      
    case 'SET_FILTER_PANEL_OPEN':
      return {
        ...state,
        filterPanelOpen: action.payload,
      };
      
    case 'SET_FILTER_MODEL':
      return {
        ...state,
        filterModel: action.payload,
      };
      
    case 'SET_SELECTION_MODEL':
      return {
        ...state,
        selectionModel: action.payload,
      };
      
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
      
    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pageSize: action.payload,
      };
      
    case 'SET_SORT_MODEL':
      return {
        ...state,
        sortModel: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
      
    default:
      return state;
  }
}