import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormHelperText
} from '@mui/material';
import { EditCellRenderer } from '../renderers/EditCellRenderer';
import { EnhancedColumnConfig } from '..//EnhancedDataGridGraphQL';
// import { ValidationIndicator } from '../components/DataGrid/components/ValidationIndicator';

// Mock FormMethods interface - should match your actual interface
interface FormMethods {
  formState: {
    values: Record<string, any>;
    errors: Record<string, any>;
    dirtyFields: Record<string, boolean>;
    isDirty: boolean;
    isValid: boolean;
  };
  getValues: () => Record<string, any>;
  setValue: (name: string, value: any, options?: any) => void;
  setError: (name: string, error: any) => void;
  clearErrors: () => void;
  trigger: () => Promise<boolean>;
}

// Interface for the dialog props
interface AddRowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rowData: any) => void;
  columns: EnhancedColumnConfig[];
  validateRow?: (values: any) => Record<string, string>;
}

// AddRowDialog component
export const AddRowDialog: React.FC<AddRowDialogProps> = ({
  open,
  onClose,
  onSave,
  columns,
  validateRow
}) => {
  // State to manage form data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [currentField, setCurrentField] = useState<string | null>(null);
  
  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      
      // Generate default values for each field based on column config
      columns.forEach(column => {
        if (column.field !== 'id' && column.field !== 'accounting_mtm_history_id') {
          initialData[column.field] = getDefaultValue(column);
        }
      });
      
      setFormData(initialData);
      setErrors({});
      setDirtyFields({});
      
      // Set focus to the first editable field
      const firstEditableField = columns.find(col => 
        col.field !== 'id' && 
        col.field !== 'accounting_mtm_history_id' && 
        col.editable !== false
      )?.field;
      
      if (firstEditableField) {
        setCurrentField(firstEditableField);
      }
    }
  }, [open, columns]);
  
  // Helper to get default value based on column config
  const getDefaultValue = (column: EnhancedColumnConfig) => {
    // Use fieldType's getDefaultValue if available
    if (column.fieldType && typeof column.fieldType.getDefaultValue === 'function') {
      return column.fieldType.getDefaultValue();
    }
    
    // Otherwise use fieldConfig type
    const fieldConfig = column.fieldConfig;
    if (!fieldConfig) return '';
    
    switch (fieldConfig.type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return new Date();
      case 'select':
        return fieldConfig.options && fieldConfig.options.length > 0
          ? fieldConfig.options[0].value
          : '';
      default:
        return '';
    }
  };
  
  // Mock a form methods object for EditCellRenderer
  const createFormMethods = useCallback((field: string): FormMethods => {
    return {
      formState: {
        values: formData,
        errors,
        dirtyFields,
        isDirty: Object.keys(dirtyFields).length > 0,
        isValid: Object.keys(errors).length === 0
      },
      getValues: () => formData,
      setValue: (name, value, options) => {
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        
        // Mark field as dirty
        if (options?.shouldDirty) {
          setDirtyFields(prev => ({ ...prev, [name]: true }));
        }
        
        // Validate if needed
        if (options?.shouldValidate) {
          validateField(name, value);
        }
      },
      setError: (name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
      },
      clearErrors: () => {
        setErrors({});
      },
      trigger: async () => {
        // Validate all fields
        let isValid = true;
        
        for (const field in formData) {
          const column = columns.find(col => col.field === field);
          if (column) {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) isValid = false;
          }
        }
        
        // Run row-level validation if provided
        if (validateRow && isValid) {
          const rowErrors = validateRow(formData);
          if (Object.keys(rowErrors).length > 0) {
            for (const [field, message] of Object.entries(rowErrors)) {
              setErrors(prev => ({ ...prev, [field]: { type: 'manual', message } }));
            }
            isValid = false;
          }
        }
        
        return isValid;
      }
    };
  }, [formData, errors, dirtyFields, columns, validateRow]);
  
  // Validate a single field
  const validateField = (field: string, value: any): boolean => {
    const column = columns.find(col => col.field === field);
    if (!column) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Use fieldType's validator if available
    if (column.fieldType && column.validator) {
      try {
        const result = column.validator.validate(value);
        if (!result.valid) {
          isValid = false;
          errorMessage = result.message || 'Invalid value';
        }
      } catch (err) {
        console.error(`Error validating field ${field}:`, err);
        isValid = false;
        errorMessage = 'Validation error';
      }
    } 
    // Otherwise use fieldConfig validation
    else if (column.fieldConfig?.validation) {
      const validation = column.fieldConfig.validation;
      
      // Required validation
      if (validation.required && (value === undefined || value === null || value === '')) {
        isValid = false;
        errorMessage = typeof validation.required === 'string' 
          ? validation.required 
          : `${column.headerName} is required`;
      }
      
      // Pattern validation for strings
      else if (validation.pattern && typeof value === 'string') {
        const { value: pattern, message } = validation.pattern;
        if (!pattern.test(value)) {
          isValid = false;
          errorMessage = message;
        }
      }
      
      // Min validation for numbers
      else if (validation.min && typeof value === 'number') {
        const { value: min, message } = validation.min;
        if (value < min) {
          isValid = false;
          errorMessage = message;
        }
      }
      
      // Max validation for numbers
      else if (validation.max && typeof value === 'number') {
        const { value: max, message } = validation.max;
        if (value > max) {
          isValid = false;
          errorMessage = message;
        }
      }
    }
    
    // Update errors state
    if (!isValid) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: { 
          type: 'validation', 
          message: errorMessage 
        } 
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    return isValid;
  };
  
  // Update a field value
  const updateFieldValue = useCallback((field: string, value: any) => {
    setFormData(prev => {
      // Check if value has actually changed
      if (JSON.stringify(prev[field]) === JSON.stringify(value)) {
        return prev;
      }
      
      const newFormData = { ...prev, [field]: value };
      
      // Mark as dirty
      setDirtyFields(prevDirty => ({ ...prevDirty, [field]: true }));
      
      // Validate the field
      validateField(field, value);
      
      return newFormData;
    });
  }, []);
  
  // Validate the entire form
  const validateForm = async (): Promise<boolean> => {
    let isValid = true;
    
    // Validate each field
    for (const field in formData) {
      const column = columns.find(col => col.field === field);
      if (column) {
        const fieldValid = validateField(field, formData[field]);
        if (!fieldValid) isValid = false;
      }
    }
    
    // Run row-level validation if provided
    if (validateRow && isValid) {
      const rowErrors = validateRow(formData);
      if (Object.keys(rowErrors).length > 0) {
        for (const [field, message] of Object.entries(rowErrors)) {
          setErrors(prev => ({ ...prev, [field]: { type: 'manual', message } }));
        }
        isValid = false;
      }
    }
    
    return isValid;
  };
  
  // Handle save button click
  const handleSave = async () => {
    const isValid = await validateForm();
    if (isValid) {
      // Generate a new ID
      const newId = `new-${Date.now()}`;
      
      // Parse values using fieldType parsers if available
      const parsedData: Record<string, any> = {};
      
      Object.entries(formData).forEach(([field, value]) => {
        const column = columns.find(col => col.field === field);
        
        if (column && column.fieldType && typeof column.fieldType.parseValue === 'function') {
          parsedData[field] = column.fieldType.parseValue(value);
        } else {
          parsedData[field] = value;
        }
      });
      
      // Create the row data with generated ID
      const rowData = {
        id: newId,
        accounting_mtm_history_id: newId,
        ...parsedData
      };
      
      // Call the onSave callback
      onSave(rowData);
      
      // Close the dialog
      onClose();
    }
  };
  
  // Mock the grid API for EditCellRenderer
  const mockGridApi = {
    getCellMode: () => 'edit',
    setCellMode: () => {},
    stopCellEditMode: () => {},
    forceUpdate: () => {}
  };
  
  // Mock the GridForm context functions
  const mockGridFormFunctions = {
    getFormMethods: (id: string) => createFormMethods(currentField || ''),
    updateCellValue: updateFieldValue,
    startEditingRow: () => {},
    isCompact: false
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Record</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {columns
            .filter(column => 
              column.field !== 'id' && 
              column.field !== 'accounting_mtm_history_id' &&
              column.editable !== false
            )
            .map(column => (
              <Box key={column.field} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {column.headerName}
                </Typography>
                
                {/* Use EditCellRenderer with mock context */}
                <EditCellRendererAdapter
                  column={column}
                  value={formData[column.field]}
                  onChange={(newValue) => updateFieldValue(column.field, newValue)}
                  formMethods={createFormMethods(column.field)}
                  updateCellValue={updateFieldValue}
                  id={`new-row`}
                  field={column.field}
                  isCompact={false}
                />
                
                {errors[column.field] && (
                  <FormHelperText error>
                    {errors[column.field].message}
                  </FormHelperText>
                )}
              </Box>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Adapter component to bridge between dialog state and EditCellRenderer
interface EditCellRendererAdapterProps {
  column: EnhancedColumnConfig;
  value: any;
  onChange: (value: any) => void;
  formMethods: FormMethods;
  updateCellValue: (field: string, value: any) => void;
  id: string;
  field: string;
  isCompact: boolean;
}

const EditCellRendererAdapter: React.FC<EditCellRendererAdapterProps> = ({
  column,
  value,
  onChange,
  formMethods,
  updateCellValue,
  id,
  field,
  isCompact
}) => {
  // Create mock GridForm context with the functions EditCellRenderer expects
  const GridFormContext = React.createContext<any>(null);
  
  // Create mock params that EditCellRenderer expects
  const mockParams = {
    id,
    field,
    value,
    row: { [field]: value },
    api: {
      getCellMode: () => 'edit',
      setCellMode: () => {},
      stopCellEditMode: () => {},
      forceUpdate: () => {}
    },
    colDef: column
  };
  
  return (
    <GridFormContext.Provider
      value={{
        getFormMethods: () => formMethods,
        updateCellValue: (id: string, field: string, value: any) => {
          onChange(value);
        },
        startEditingRow: () => {},
        isCompact
      }}
    >
      <EditCellRenderer
        params={mockParams as any}
        column={column}
      />
    </GridFormContext.Provider>
  );
};