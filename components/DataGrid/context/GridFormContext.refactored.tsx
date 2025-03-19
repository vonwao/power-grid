// This is a partial refactored version of GridFormContext.tsx
// focusing on the parts that use react-hook-form types

import React, { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';
// Import from our custom types instead of react-hook-form
import { 
  FieldValues, 
  FieldError, 
  ValidationOptions,
  FieldPath,
  FormState,
  FormMethods
} from '../../../types/form';
import { GridRowId } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';

export interface ValidationHelpers {
  getFieldValue: (field: string) => any;
  setError: (field: string, message: string) => void;
}

// We no longer need SimpleFormState and SimpleFormMethods interfaces
// as we've defined FormState and FormMethods in our types/form.ts

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
}

interface GridFormProviderProps {
  children: React.ReactNode;
  columns: EnhancedColumnConfig[];
  initialRows: any[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
}

export const GridFormContext = createContext<GridFormContextType | undefined>(undefined);

// Create a form instance factory
const createFormInstance = (defaultValues: Record<string, any>): FormMethods => {
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
          // Simple validation - just check if required fields are filled
          // In a real implementation, you would add more validation logic here
          if (value === undefined || value === null || value === '') {
            formState.errors[name] = { type: 'required', message: 'This field is required' };
            formState.isValid = false;
          } else {
            delete formState.errors[name];
            formState.isValid = Object.keys(formState.errors).length === 0;
          }
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
        // In a real implementation, you would add validation logic here
        return formState.isValid;
      },
    };
    
    return formMethods;
  } catch (error) {
    console.error('Error creating form instance:', error);
    throw new Error('Failed to create form instance');
  }
};

// The rest of the component would remain largely the same,
// with updates to any other places that use react-hook-form types
