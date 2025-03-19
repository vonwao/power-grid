import React, { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';
import { 
  useForm, 
  UseFormReturn, 
  FieldValues, 
  FieldError, 
  RegisterOptions,
  FieldPath
} from 'react-hook-form';
import { GridRowId } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';

export interface ValidationHelpers {
  getFieldValue: (field: string) => any;
  setError: (field: string, message: string) => void;
}

interface GridFormContextType {
  // Form instances for each row
  getFormMethods: <T extends FieldValues>(rowId: GridRowId) => UseFormReturn<T> | undefined;
  
  // Row management
  startEditingRow: (rowId: GridRowId, field: string) => void;
  stopEditingRow: (rowId: GridRowId) => void;
  
  // Cell management
  startEditingCell: (rowId: GridRowId, field: string) => void;
  stopEditingCell: () => void;
  getCurrentCell: () => { rowId: GridRowId; field: string } | undefined;
  
  // Row state
  isRowEditing: (rowId: GridRowId) => boolean;
  isRowDirty: (rowId: GridRowId) => boolean;
  isFieldDirty: (rowId: GridRowId, field: string) => boolean;
  getRowErrors: (rowId: GridRowId) => Record<string, FieldError> | undefined;
  
  // Row-level validation
  validateRow: (rowId: GridRowId) => Promise<boolean>;
  
  // Value updates
  updateCellValue: (rowId: GridRowId, field: string, value: any) => void;
  
  // Save/cancel
  saveChanges: () => void;
  cancelChanges: () => void;
  
  // Add row
  addRow: () => void;
  
  // Validation state
  hasValidationErrors: boolean;
  
  // Columns config
  columns: EnhancedColumnConfig[];
}

interface GridFormProviderProps {
  children: React.ReactNode;
  columns: EnhancedColumnConfig[];
  initialRows: any[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
}

export const GridFormContext = createContext<GridFormContextType | undefined>(undefined);

export function GridFormProvider({ 
  children, 
  columns, 
  initialRows,
  onSave,
  validateRow: validateRowProp
}: GridFormProviderProps) {
  const [rows, setRows] = useState(initialRows);
  const [editingRows, setEditingRows] = useState<Set<GridRowId>>(new Set());
  const [currentCell, setCurrentCell] = useState<{ rowId: GridRowId; field: string }>();
  
  // Use a ref to store form instances to avoid re-renders when they change
  const formInstancesRef = useRef<Map<GridRowId, UseFormReturn>>(new Map());
  
  // Track original data for each row being edited
  const originalDataRef = useRef<Map<GridRowId, any>>(new Map());
  
  // Track rows that were added (not in the original data)
  const addedRowsRef = useRef<Set<GridRowId>>(new Set());
  
  // Get form methods for a specific row
  const getFormMethods = useCallback(<T extends FieldValues>(rowId: GridRowId): UseFormReturn<T> | undefined => {
    return formInstancesRef.current.get(rowId) as UseFormReturn<T> | undefined;
  }, []);
  
  // Start editing a row
  const startEditingRow = useCallback((rowId: GridRowId, field: string) => {
    // If this row isn't already being edited, create a form instance for it
    if (!formInstancesRef.current.has(rowId)) {
      const row = rows.find(r => r.id === rowId);
      if (row) {
        // Store the original data
        originalDataRef.current.set(rowId, { ...row });
        
        // Create a form instance
        const formMethods = useForm({
          defaultValues: { ...row },
          mode: 'onChange'
        });
        
        formInstancesRef.current.set(rowId, formMethods);
      }
    }
    
    // Mark the row as being edited
    setEditingRows(prev => {
      const next = new Set(prev);
      next.add(rowId);
      return next;
    });
    
    // Set the current cell
    setCurrentCell({ rowId, field });
  }, [rows]);
  
  // Stop editing a row
  const stopEditingRow = useCallback((rowId: GridRowId) => {
    // Remove the row from the editing set
    setEditingRows(prev => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    
    // Clear the current cell if it's for this row
    if (currentCell?.rowId === rowId) {
      setCurrentCell(undefined);
    }
    
    // We keep the form instance in case we need it later
  }, [currentCell]);
  
  // Start editing a cell
  const startEditingCell = useCallback((rowId: GridRowId, field: string) => {
    // If the row isn't being edited yet, start editing it
    if (!editingRows.has(rowId)) {
      startEditingRow(rowId, field);
    } else {
      // Just update the current cell
      setCurrentCell({ rowId, field });
    }
  }, [editingRows, startEditingRow]);
  
  // Stop editing a cell
  const stopEditingCell = useCallback(() => {
    setCurrentCell(undefined);
  }, []);
  
  // Get the current cell
  const getCurrentCell = useCallback(() => {
    return currentCell;
  }, [currentCell]);
  
  // Check if a row is being edited
  const isRowEditing = useCallback((rowId: GridRowId) => {
    return editingRows.has(rowId);
  }, [editingRows]);
  
  // Check if a row has any dirty fields
  const isRowDirty = useCallback((rowId: GridRowId) => {
    const form = formInstancesRef.current.get(rowId);
    return form ? form.formState.isDirty : false;
  }, []);
  
  // Check if a specific field is dirty
  const isFieldDirty = useCallback((rowId: GridRowId, field: string) => {
    const form = formInstancesRef.current.get(rowId);
    return form ? !!form.formState.dirtyFields[field] : false;
  }, []);
  
  // Get errors for a row
  const getRowErrors = useCallback((rowId: GridRowId) => {
    const form = formInstancesRef.current.get(rowId);
    return form ? form.formState.errors : undefined;
  }, []);
  
  // Validate a row
  const validateRow = useCallback(async (rowId: GridRowId): Promise<boolean> => {
    const form = formInstancesRef.current.get(rowId);
    if (!form) return true;
    
    // First validate all fields
    const isValid = await form.trigger();
    if (!isValid) return false;
    
    // Then run row-level validation if provided
    if (validateRowProp) {
      const values = form.getValues();
      const helpers: ValidationHelpers = {
        getFieldValue: (field: string) => values[field],
        setError: (field: string, message: string) => 
          form.setError(field as FieldPath<any>, { type: 'manual', message })
      };
      
      const errors = await validateRowProp(values, helpers);
      
      // Apply any errors from row validation
      if (errors && Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as FieldPath<any>, { type: 'manual', message });
        });
        return false;
      }
    }
    
    return true;
  }, [validateRowProp]);
  
  // Update a cell value
  const updateCellValue = useCallback((rowId: GridRowId, field: string, value: any) => {
    const form = formInstancesRef.current.get(rowId);
    if (form) {
      form.setValue(field as FieldPath<any>, value, { 
        shouldDirty: true,
        shouldValidate: true 
      });
    }
  }, []);
  
  // Save all changes
  const saveChanges = useCallback(() => {
    // Prepare the payload for the API
    const edits: Array<{ id: GridRowId, changes: any }> = [];
    const additions: Array<any> = [];
    
    // Process each edited row
    editingRows.forEach(rowId => {
      const form = formInstancesRef.current.get(rowId);
      const originalData = originalDataRef.current.get(rowId);
      
      if (form && originalData) {
        const currentValues = form.getValues();
        
        if (addedRowsRef.current.has(rowId)) {
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
    
    // Clear editing state
    setEditingRows(new Set());
    setCurrentCell(undefined);
    
    // Keep form instances and original data for now
    // They'll be garbage collected when no longer referenced
  }, [editingRows, onSave]);
  
  // Cancel all changes
  const cancelChanges = useCallback(() => {
    // Revert rows to their original state for edits
    setRows(prev => {
      const newRows = [...prev];
      
      editingRows.forEach(rowId => {
        const originalData = originalDataRef.current.get(rowId);
        
        if (originalData) {
          if (addedRowsRef.current.has(rowId)) {
            // Remove added rows
            return newRows.filter(row => row.id !== rowId);
          } else {
            // Revert edited rows
            const index = newRows.findIndex(row => row.id === rowId);
            if (index >= 0) {
              newRows[index] = { ...originalData };
            }
          }
        }
      });
      
      return newRows;
    });
    
    // Clear editing state
    setEditingRows(new Set());
    setCurrentCell(undefined);
    
    // Keep form instances and original data for now
    // They'll be garbage collected when no longer referenced
  }, [editingRows]);
  
  // Add a new row
  const addRow = useCallback(() => {
    // Generate a new ID
    const maxId = Math.max(...rows.map(row => Number(row.id)), 0);
    const newId = maxId + 1;
    
    // Create a new row with default values
    const newRow: any = { id: newId };
    
    // Add default values for each column
    columns.forEach(column => {
      if (column.fieldConfig?.type === 'select' && column.fieldConfig.options && column.fieldConfig.options.length > 0) {
        // For select fields, use the first option as default
        newRow[column.field] = column.fieldConfig.options[0].value;
      } else if (column.fieldConfig?.type === 'boolean') {
        // For boolean fields, default to false
        newRow[column.field] = false;
      } else if (column.fieldConfig?.type === 'number') {
        // For number fields, default to 0
        newRow[column.field] = 0;
      } else if (column.fieldConfig?.type === 'date') {
        // For date fields, default to today
        newRow[column.field] = new Date();
      } else {
        // For other fields, default to empty string
        newRow[column.field] = '';
      }
    });
    
    // Create a form instance for the new row
    const formMethods = useForm({
      defaultValues: newRow,
      mode: 'onChange'
    });
    
    formInstancesRef.current.set(newId, formMethods);
    
    // Mark this as a new row
    addedRowsRef.current.add(newId);
    
    // Add the row to the editing set
    setEditingRows(prev => {
      const next = new Set(prev);
      next.add(newId);
      return next;
    });
    
    // Set the current cell to the first editable column
    const firstEditableField = columns.find(col => col.editable)?.field || columns[0].field;
    setCurrentCell({ rowId: newId, field: firstEditableField });
    
    // Add the row to the grid
    setRows(prev => [...prev, newRow]);
  }, [columns, rows]);
  
  // Check if there are any validation errors
  const hasValidationErrors = React.useMemo(() => {
    for (const rowId of editingRows) {
      const form = formInstancesRef.current.get(rowId);
      if (form && !form.formState.isValid) {
        return true;
      }
    }
    return false;
  }, [editingRows]);
  
  // Context value
  const contextValue: GridFormContextType = {
    getFormMethods,
    startEditingRow,
    stopEditingRow,
    startEditingCell,
    stopEditingCell,
    getCurrentCell,
    isRowEditing,
    isRowDirty,
    isFieldDirty,
    getRowErrors,
    validateRow,
    updateCellValue,
    saveChanges,
    cancelChanges,
    addRow,
    hasValidationErrors,
    columns
  };
  
  return (
    <GridFormContext.Provider value={contextValue}>
      {children}
    </GridFormContext.Provider>
  );
}

export const useGridForm = () => {
  const context = useContext(GridFormContext);
  if (!context) {
    throw new Error('useGridForm must be used within a GridFormProvider');
  }
  return context;
};
