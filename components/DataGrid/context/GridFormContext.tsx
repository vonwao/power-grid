import React, { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';
import {
  FieldValues,
  FieldError,
  FormState,
  FormMethods
} from '../../../types/form';
import { GridRowId } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';

export interface ValidationHelpers {
  getFieldValue: (field: string) => any;
  setError: (field: string, message: string) => void;
}

// We're now using FormState and FormMethods from our custom types

interface GridFormContextType {
  // Form instances for each row
  getFormMethods: (rowId: GridRowId) => FormMethods | undefined;
  
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
  
  // UI configuration
  isCompact: boolean;
  
  // Pending changes tracking
  getPendingChanges: () => Array<{ rowId: GridRowId, changes: Record<string, any> }>;
  getEditedRowCount: () => number;
  getAllValidationErrors: () => Array<{ rowId: GridRowId, field: string, message: string }>;
  
  // Original data access
  getOriginalRowData: (rowId: GridRowId) => Record<string, any> | undefined;
}

interface GridFormProviderProps {
  children: React.ReactNode;
  columns: EnhancedColumnConfig[];
  initialRows: any[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
  isCompact?: boolean;
}

export const GridFormContext = createContext<GridFormContextType | undefined>(undefined);

// Create a form instance factory
const createFormInstance = (defaultValues: Record<string, any>, columns: EnhancedColumnConfig[]): FormMethods => {
  try {
    // Create a form state
    const formState: FormState = {
      values: { ...defaultValues },
      errors: {},
      dirtyFields: {},
      isDirty: false,
      isValid: true,
    };
    
    // Create the form methods
    const formMethods: FormMethods = {
      formState,
      getValues: () => {
        return { ...formState.values };
      },
      setValue: (name, value, options) => {
        // Check if the value has actually changed
        const currentValue = formState.values[name];
        const valueHasChanged = JSON.stringify(currentValue) !== JSON.stringify(value);
        
        // Set the value
        formState.values[name] = value;
        
        // Update form state - only mark as dirty if the value has actually changed
        if (options?.shouldDirty && valueHasChanged) {
          formState.isDirty = true;
          formState.dirtyFields[name] = true;
        } else if (!valueHasChanged && formState.dirtyFields[name]) {
          // If the value is back to its original state, remove the dirty flag
          delete formState.dirtyFields[name];
          // Check if there are any remaining dirty fields
          formState.isDirty = Object.keys(formState.dirtyFields).length > 0;
        }
        
        // Validate if needed
        if (options?.shouldValidate) {
          // Find the column configuration for this field
          const column = columns.find(col => col.field === name);
          const validation = column?.fieldConfig?.validation;
          
          // Clear previous errors for this field
          delete formState.errors[name];
          
          // Check if required
          if (validation?.required && (value === undefined || value === null || value === '')) {
            const message = typeof validation.required === 'string'
              ? validation.required
              : 'This field is required';
            formState.errors[name] = { type: 'required', message };
          }
          
          // Check pattern validation for string values
          else if (validation?.pattern && typeof value === 'string') {
            const { value: pattern, message } = validation.pattern;
            if (!pattern.test(value)) {
              formState.errors[name] = { type: 'pattern', message };
            }
          }
          
          // Check min validation for number values
          else if (validation?.min && typeof value === 'number') {
            const { value: min, message } = validation.min;
            if (value < min) {
              formState.errors[name] = { type: 'min', message };
            }
          }
          
          // Check max validation for number values
          else if (validation?.max && typeof value === 'number') {
            const { value: max, message } = validation.max;
            if (value > max) {
              formState.errors[name] = { type: 'max', message };
            }
          }
          
          // Check custom validation function if provided
          else if (validation?.validate && typeof validation.validate === 'function') {
            const result = validation.validate(value);
            if (typeof result === 'string') {
              formState.errors[name] = { type: 'validate', message: result };
            } else if (result === false) {
              formState.errors[name] = { type: 'validate', message: 'Invalid value' };
            }
          }
          
          // Update form validity state
          formState.isValid = Object.keys(formState.errors).length === 0;
        }
      },
      setError: (name, error) => {
        formState.errors[name] = error as FieldError;
        formState.isValid = Object.keys(formState.errors).length === 0;
      },
      clearErrors: () => {
        formState.errors = {};
        formState.isValid = true;
      },
      trigger: async () => {
        // Clear all errors first
        formState.errors = {};
        
        // Validate each field
        for (const field in formState.values) {
          const value = formState.values[field];
          const column = columns.find(col => col.field === field);
          const validation = column?.fieldConfig?.validation;
          
          if (!validation) continue;
          
          // Check if required
          if (validation.required && (value === undefined || value === null || value === '')) {
            const message = typeof validation.required === 'string'
              ? validation.required
              : 'This field is required';
            formState.errors[field] = { type: 'required', message };
          }
          
          // Check pattern validation for string values
          else if (validation.pattern && typeof value === 'string') {
            const { value: pattern, message } = validation.pattern;
            if (!pattern.test(value)) {
              formState.errors[field] = { type: 'pattern', message };
            }
          }
          
          // Check min validation for number values
          else if (validation.min && typeof value === 'number') {
            const { value: min, message } = validation.min;
            if (value < min) {
              formState.errors[field] = { type: 'min', message };
            }
          }
          
          // Check max validation for number values
          else if (validation.max && typeof value === 'number') {
            const { value: max, message } = validation.max;
            if (value > max) {
              formState.errors[field] = { type: 'max', message };
            }
          }
          
          // Check custom validation function if provided
          else if (validation.validate && typeof validation.validate === 'function') {
            const result = validation.validate(value);
            if (typeof result === 'string') {
              formState.errors[field] = { type: 'validate', message: result };
            } else if (result === false) {
              formState.errors[field] = { type: 'validate', message: 'Invalid value' };
            }
          }
        }
        
        // Update form validity state
        formState.isValid = Object.keys(formState.errors).length === 0;
        return formState.isValid;
      },
    };
    
    return formMethods;
  } catch (error) {
    console.error('Error creating form instance:', error);
    throw new Error('Failed to create form instance');
  }
};

export function GridFormProvider({
  children,
  columns,
  initialRows,
  onSave,
  validateRow: validateRowProp,
  isCompact = false
}: GridFormProviderProps) {
  const [rows, setRows] = useState(initialRows);
  const [editingRows, setEditingRows] = useState<Set<GridRowId>>(new Set());
  const [currentCell, setCurrentCell] = useState<{ rowId: GridRowId; field: string }>();
  
  // Add state to track pending changes
  const [pendingChanges, setPendingChanges] = useState<Map<GridRowId, Record<string, any>>>(new Map());
  
  // Use a ref to store form instances to avoid re-renders when they change
  const formInstancesRef = useRef<Map<GridRowId, FormMethods>>(new Map());
  
  // Track original data for each row being edited
  const originalDataRef = useRef<Map<GridRowId, any>>(new Map());
  
  // Track rows that were added (not in the original data)
  const addedRowsRef = useRef<Set<GridRowId>>(new Set());
  
  // Update rows when initialRows changes (for server-side data)
  useEffect(() => {
    // Only update if not in the middle of editing
    if (editingRows.size === 0) {
      setRows(initialRows);
      
      // Clear form instances for rows that no longer exist
      const newRowIds = new Set(initialRows.map(row => row.id));
      
      formInstancesRef.current.forEach((_, rowId) => {
        if (!newRowIds.has(rowId) && !addedRowsRef.current.has(rowId)) {
          formInstancesRef.current.delete(rowId);
          originalDataRef.current.delete(rowId);
        }
      });
    }
  }, [initialRows, editingRows]);
  
  // Log pending changes whenever they change
  useEffect(() => {
    console.log('Pending changes:', Array.from(pendingChanges.entries()).map(([rowId, changes]) => ({
      rowId,
      changes
    })));
  }, [pendingChanges]);
  
  // Get form methods for a specific row
  const getFormMethods = useCallback((rowId: GridRowId): FormMethods | undefined => {
    try {
      return formInstancesRef.current.get(rowId);
    } catch (error) {
      console.error(`Error getting form methods for row ${rowId}:`, error);
      return undefined;
    }
  }, []);
  
  // Start editing a row
  const startEditingRow = useCallback((rowId: GridRowId, field: string) => {
    try {
      // If this row isn't already being edited, create a form instance for it
      if (!formInstancesRef.current.has(rowId)) {
        const row = rows.find(r => r.id === rowId);
        if (row) {
          // Store the original data
          originalDataRef.current.set(rowId, { ...row });
          
          // Create a form instance using our factory function
          const formMethods = createFormInstance({ ...row }, columns);
          
          formInstancesRef.current.set(rowId, formMethods);
          
          console.log(`Created form instance for row ${rowId}`);
        } else {
          console.warn(`Row with ID ${rowId} not found`);
          return;
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
    } catch (error) {
      console.error(`Error starting edit for row ${rowId}:`, error);
    }
  }, [rows, columns]);
  
  // Stop editing a row
  const stopEditingRow = useCallback((rowId: GridRowId) => {
    try {
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
    } catch (error) {
      console.error(`Error stopping edit for row ${rowId}:`, error);
    }
  }, [currentCell]);
  
  // Start editing a cell
  const startEditingCell = useCallback((rowId: GridRowId, field: string) => {
    try {
      // If the row isn't being edited yet, start editing it
      if (!editingRows.has(rowId)) {
        startEditingRow(rowId, field);
      } else {
        // Just update the current cell
        setCurrentCell({ rowId, field });
      }
    } catch (error) {
      console.error(`Error starting edit for cell ${rowId}.${field}:`, error);
    }
  }, [editingRows, startEditingRow]);
  
  // Stop editing a cell
  const stopEditingCell = useCallback(() => {
    try {
      setCurrentCell(undefined);
    } catch (error) {
      console.error('Error stopping cell edit:', error);
    }
  }, []);
  
  // Get the current cell
  const getCurrentCell = useCallback(() => {
    return currentCell;
  }, [currentCell]);
  
  // Check if a row is being edited
  const isRowEditing = useCallback((rowId: GridRowId) => {
    try {
      return editingRows.has(rowId);
    } catch (error) {
      console.error(`Error checking if row ${rowId} is being edited:`, error);
      return false;
    }
  }, [editingRows]);
  
  // Check if a row has any dirty fields
  const isRowDirty = useCallback((rowId: GridRowId) => {
    try {
      // Use our explicit pendingChanges tracking
      return pendingChanges.has(rowId);
    } catch (error) {
      console.error(`Error checking if row ${rowId} is dirty:`, error);
      return false;
    }
  }, [pendingChanges]);
  
  // Check if a specific field is dirty
  const isFieldDirty = useCallback((rowId: GridRowId, field: string) => {
    try {
      // Use our explicit pendingChanges tracking
      const rowChanges = pendingChanges.get(rowId);
      return rowChanges ? field in rowChanges : false;
    } catch (error) {
      console.error(`Error checking if field ${rowId}.${field} is dirty:`, error);
      return false;
    }
  }, [pendingChanges]);
  
  // Get errors for a row
  const getRowErrors = useCallback((rowId: GridRowId) => {
    try {
      const form = formInstancesRef.current.get(rowId);
      return form ? form.formState.errors : undefined;
    } catch (error) {
      console.error(`Error getting errors for row ${rowId}:`, error);
      return undefined;
    }
  }, []);
  
  // Validate a row
  const validateRow = useCallback(async (rowId: GridRowId): Promise<boolean> => {
    try {
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
            form.setError(field, { type: 'manual', message })
        };
        
        const errors = await validateRowProp(values, helpers);
        
        // Apply any errors from row validation
        if (errors && Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, message]) => {
            form.setError(field, { type: 'manual', message });
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error validating row ${rowId}:`, error);
      return false;
    }
  }, [validateRowProp]);
  
  // Update a cell value
  const updateCellValue = useCallback((rowId: GridRowId, field: string, value: any) => {
    try {
      const form = formInstancesRef.current.get(rowId);
      if (form) {
        // Get the original value to compare
        const originalData = originalDataRef.current.get(rowId);
        
        // Only mark as dirty if the value has actually changed from the original
        const hasChanged = originalData && 
          JSON.stringify(value) !== JSON.stringify(originalData[field]);
        
        form.setValue(field, value, { 
          shouldDirty: hasChanged,
          shouldValidate: true 
        });
        
        // Track changes explicitly in our pendingChanges state
        setPendingChanges(prev => {
          const newChanges = new Map(prev);
          
          // Get or create row changes
          let rowChanges = newChanges.get(rowId) || {};
          
          // Only track if value has changed from original
          if (originalData && JSON.stringify(value) !== JSON.stringify(originalData[field])) {
            rowChanges = { ...rowChanges, [field]: value };
            newChanges.set(rowId, rowChanges);
          } else {
            // If value is back to original, remove it from changes
            if (field in rowChanges) {
              const { [field]: _, ...rest } = rowChanges;
              
              // If row has no changes, remove it from the map
              if (Object.keys(rest).length === 0) {
                newChanges.delete(rowId);
              } else {
                newChanges.set(rowId, rest);
              }
            }
          }
          
          return newChanges;
        });
        
        // Force a re-render to update the UI
        setTimeout(() => {
          setEditingRows(prev => new Set(prev));
        }, 0);
      }
    } catch (error) {
      console.error(`Error updating cell value ${rowId}.${field}:`, error);
    }
  }, []);
  
  // Save all changes
  const saveChanges = useCallback(() => {
    try {
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
      setPendingChanges(new Map());
      
      // Keep form instances and original data for now
      // They'll be garbage collected when no longer referenced
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }, [editingRows, onSave]);
  
  // Cancel all changes
  const cancelChanges = useCallback(() => {
    try {
      // Revert rows to their original state for edits
      setRows(prev => {
        let newRows = [...prev];
        
        // First handle added rows - remove them
        if (addedRowsRef.current.size > 0) {
          newRows = newRows.filter(row => !addedRowsRef.current.has(row.id));
        }
        
        // Then handle edited rows - revert to original values
        editingRows.forEach(rowId => {
          if (!addedRowsRef.current.has(rowId)) {
            const originalData = originalDataRef.current.get(rowId);
            if (originalData) {
              const index = newRows.findIndex(row => row.id === rowId);
              if (index >= 0) {
                newRows[index] = { ...originalData };
              }
            }
          }
        });
        
        return newRows;
      });
      
      // Reset form instances with original data
      editingRows.forEach(rowId => {
        if (!addedRowsRef.current.has(rowId)) {
          const originalData = originalDataRef.current.get(rowId);
          if (originalData && formInstancesRef.current.has(rowId)) {
            // Create a new form instance with the original data
            const formMethods = createFormInstance({ ...originalData }, columns);
            formInstancesRef.current.set(rowId, formMethods);
          }
        }
      });
      
      // Clear added rows tracking
      addedRowsRef.current.clear();
      
      // Clear editing state
      setEditingRows(new Set());
      setCurrentCell(undefined);
      setPendingChanges(new Map());
    } catch (error) {
      console.error('Error canceling changes:', error);
    }
  }, [editingRows, columns]);
  
  // Add a new row
  const addRow = useCallback(() => {
    try {
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
      
      // Create a form instance for the new row using our factory function
      const formMethods = createFormInstance(newRow, columns);
      
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
      setRows(prev => [newRow, ...prev]);
      
      // Mark all fields as dirty in pendingChanges
      setPendingChanges(prev => {
        const newChanges = new Map(prev);
        const rowChanges: Record<string, any> = {};
        
        // Add all fields to changes
        Object.keys(newRow).forEach(field => {
          if (field !== 'id') {
            rowChanges[field] = newRow[field];
          }
        });
        
        newChanges.set(newId, rowChanges);
        return newChanges;
      });
    } catch (error) {
      console.error('Error adding new row:', error);
    }
  }, [columns, rows]);
  
  // Check if there are any validation errors
  const hasValidationErrors = React.useMemo(() => {
    try {
      for (const rowId of editingRows) {
        const form = formInstancesRef.current.get(rowId);
        if (form && !form.formState.isValid) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking validation errors:', error);
      return false;
    }
  }, [editingRows]);
  
  // Get a serializable version of all pending changes
  const getPendingChanges = useCallback(() => {
    return Array.from(pendingChanges.entries()).map(([rowId, changes]) => ({
      rowId,
      changes
    }));
  }, [pendingChanges]);
  
  // Get the count of rows that have actual changes
  const getEditedRowCount = useCallback(() => {
    return pendingChanges.size;
  }, [pendingChanges]);
  
  // Get all validation errors in a structured format
  const getAllValidationErrors = useCallback(() => {
    const errors: Array<{ rowId: GridRowId, field: string, message: string }> = [];
    
    editingRows.forEach(rowId => {
      const form = formInstancesRef.current.get(rowId);
      if (form && form.formState.errors) {
        Object.entries(form.formState.errors).forEach(([field, error]) => {
          errors.push({
            rowId,
            field,
            message: error.message || 'Invalid value'
          });
        });
      }
    });
    
    return errors;
  }, [editingRows]);

  // Get original data for a row
  const getOriginalRowData = useCallback((rowId: GridRowId): Record<string, any> | undefined => {
    return originalDataRef.current.get(rowId);
  }, []);

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
    columns,
    isCompact,
    getPendingChanges,
    getEditedRowCount,
    getAllValidationErrors,
    getOriginalRowData
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
