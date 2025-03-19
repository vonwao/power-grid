import React, { createContext, useCallback, useContext, useState } from 'react';
import { GridRowId, GridValueGetterParams } from '@mui/x-data-grid';
import { ValidationResult } from '../validation/types';
import { createValidatorFromColumnConfig } from '../validation/validators';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';

interface EditingChange<T = any> {
  type: 'add' | 'edit';
  originalData?: T;
  currentData: T;
  validationState: Record<string, ValidationResult>;
}

interface EditingState {
  mode: 'add' | 'edit' | 'none';
  pendingChanges: Map<GridRowId, EditingChange>;
  currentCell?: { rowId: GridRowId; field: string };
}

interface GridEditingContextType {
  // State
  editingState: EditingState;
  columns: EnhancedColumnConfig[];
  
  // Actions
  startEditing: (id: GridRowId, field: string) => void;
  stopEditing: (id: GridRowId, field: string) => void;
  updateValue: (id: GridRowId, field: string, value: any) => void;
  addRow: () => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  
  // Validation
  getValidationState: (id: GridRowId, field: string) => ValidationResult;
  hasValidationErrors: boolean;
}

interface GridEditingProviderProps {
  children: React.ReactNode;
  columns: EnhancedColumnConfig[];
  initialRows: any[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
}

export const GridEditingContext = createContext<GridEditingContextType | undefined>(undefined);

export function GridEditingProvider({ 
  children, 
  columns, 
  initialRows,
  onSave
}: GridEditingProviderProps) {
  const [rows, setRows] = useState(initialRows);
  const [editingState, setEditingState] = useState<EditingState>({
    mode: 'none',
    pendingChanges: new Map(),
  });
  
  // Validation helpers
  const validateField = useCallback((row: any, field: string): ValidationResult => {
    const column = columns.find(col => col.field === field);
    if (!column) return { valid: true };
    
    // Get or create validator
    const validator = column.validator || 
      createValidatorFromColumnConfig(column);
    
    // Get value
    const value = column.valueGetter ? 
      column.valueGetter({ row, field } as GridValueGetterParams) : 
      row[field];
    
    // Validate
    return validator.validate(value);
  }, [columns]);
  
  const validateRow = useCallback((row: any): Record<string, ValidationResult> => {
    const validationState: Record<string, ValidationResult> = {};
    
    columns.forEach(column => {
      validationState[column.field] = validateField(row, column.field);
    });
    
    return validationState;
  }, [columns, validateField]);
  
  // Start editing a cell
  const startEditing = useCallback((id: GridRowId, field: string) => {
    setEditingState(prev => {
      // If this is the first edit for this row, add it to pending changes
      if (!prev.pendingChanges.has(id)) {
        const row = rows.find(r => r.id === id);
        if (row) {
          const newPendingChanges = new Map(prev.pendingChanges);
          newPendingChanges.set(id, {
            type: 'edit',
            originalData: { ...row },
            currentData: { ...row },
            validationState: validateRow(row),
          });
          
          return {
            mode: 'edit',
            pendingChanges: newPendingChanges,
            currentCell: { rowId: id, field },
          };
        }
      } else {
        // Just update the current cell
        return {
          ...prev,
          currentCell: { rowId: id, field },
        };
      }
      
      return prev;
    });
  }, [rows, validateRow]);
  
  // Stop editing a cell
  const stopEditing = useCallback((id: GridRowId, field: string) => {
    setEditingState(prev => ({
      ...prev,
      currentCell: undefined,
    }));
  }, []);
  
  // Update a cell value
  const updateValue = useCallback((id: GridRowId, field: string, value: any) => {
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      const currentChange = newPendingChanges.get(id);
      
      if (currentChange) {
        // Update the current data with the new value
        const updatedData = {
          ...currentChange.currentData,
          [field]: value,
        };
        
        // Validate the updated field
        const validationResult = validateField(updatedData, field);
        
        // Update the change in the map
        newPendingChanges.set(id, {
          ...currentChange,
          currentData: updatedData,
          validationState: {
            ...currentChange.validationState,
            [field]: validationResult,
          },
        });
        
        return {
          ...prev,
          pendingChanges: newPendingChanges,
        };
      }
      
      return prev;
    });
  }, [validateField]);
  
  // Add a new row
  const addRow = useCallback(() => {
    // Generate a new ID
    const maxId = Math.max(...rows.map(row => Number(row.id)), 0);
    const newId = maxId + 1;
    
    // Create a new row with default values
    const newRow: any = { id: newId };
    
    // Add default values for each column
    columns.forEach(column => {
      newRow[column.field] = column.fieldType.getDefaultValue();
    });
    
    // Add the new row to pending changes
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      newPendingChanges.set(newId, {
        type: 'add',
        currentData: newRow,
        validationState: validateRow(newRow),
      });
      
      return {
        mode: 'add',
        pendingChanges: newPendingChanges,
        currentCell: { rowId: newId, field: columns[0].field },
      };
    });
    
    // Add the row to the grid
    setRows(prev => [...prev, newRow]);
  }, [columns, rows, validateRow]);
  
  // Save all pending changes
  const saveChanges = useCallback(() => {
    // Prepare the payload for the API
    const edits: Array<{ id: number, changes: any }> = [];
    const additions: Array<any> = [];
    
    // Process each pending change
    editingState.pendingChanges.forEach((change, id) => {
      if (change.type === 'edit' && change.originalData) {
        // For edits, only include the changed fields
        const changes: any = {};
        let hasChanges = false;
        
        Object.keys(change.currentData).forEach(key => {
          if (JSON.stringify(change.currentData[key]) !== JSON.stringify(change.originalData![key])) {
            changes[key] = change.currentData[key];
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          edits.push({ id: Number(id), changes });
        }
      } else if (change.type === 'add') {
        // For additions, include all fields
        additions.push(change.currentData);
      }
    });
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave({ edits, additions });
    }
    
    // Update the rows state with the changes
    setRows(prev => {
      const newRows = [...prev];
      
      // Apply edits
      edits.forEach(edit => {
        const index = newRows.findIndex(row => row.id === edit.id);
        if (index >= 0) {
          newRows[index] = { ...newRows[index], ...edit.changes };
        }
      });
      
      return newRows;
    });
    
    // Clear the editing state
    setEditingState({
      mode: 'none',
      pendingChanges: new Map(),
    });
  }, [editingState.pendingChanges, onSave]);
  
  // Cancel all pending changes
  const cancelChanges = useCallback(() => {
    // Revert rows to their original state for edits
    setRows(prev => {
      const newRows = [...prev];
      
      editingState.pendingChanges.forEach((change, id) => {
        if (change.type === 'edit' && change.originalData) {
          const index = newRows.findIndex(row => row.id === Number(id));
          if (index >= 0) {
            newRows[index] = { ...change.originalData };
          }
        } else if (change.type === 'add') {
          // Remove added rows
          return newRows.filter(row => row.id !== Number(id));
        }
      });
      
      return newRows;
    });
    
    // Clear the editing state
    setEditingState({
      mode: 'none',
      pendingChanges: new Map(),
    });
  }, [editingState.pendingChanges]);
  
  // Get validation state for a specific cell
  const getValidationState = useCallback((id: GridRowId, field: string): ValidationResult => {
    const change = editingState.pendingChanges.get(id);
    return change?.validationState[field] || { valid: true };
  }, [editingState.pendingChanges]);
  
  // Check if there are any validation errors
  const hasValidationErrors = React.useMemo(() => {
    for (const change of editingState.pendingChanges.values()) {
      for (const result of Object.values(change.validationState)) {
        if (!result.valid) return true;
      }
    }
    return false;
  }, [editingState.pendingChanges]);
  
  // Context value
  const contextValue: GridEditingContextType = {
    editingState,
    columns,
    startEditing,
    stopEditing,
    updateValue,
    addRow,
    saveChanges,
    cancelChanges,
    getValidationState,
    hasValidationErrors,
  };
  
  return (
    <GridEditingContext.Provider value={contextValue}>
      {children}
    </GridEditingContext.Provider>
  );
}

export const useGridEditing = () => {
  const context = useContext(GridEditingContext);
  if (!context) {
    throw new Error('useGridEditing must be used within a GridEditingProvider');
  }
  return context;
};
