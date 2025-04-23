import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';
import { EditCellRenderer } from '../renderers/EditCellRenderer';
import { GridFormContext } from '../context/GridFormContext';

// Interface for the dialog props
interface AddRowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rowData: any) => void;
  columns: EnhancedColumnConfig[];
  validateRow?: (values: any) => Record<string, string>;
}

/**
 * AddRowDialog component
 * Creates a dialog for adding a new row to the grid
 * Uses the existing EditCellRenderer component for consistency
 */
export const AddRowDialog: React.FC<AddRowDialogProps> = ({
  open,
  onClose,
  onSave,
  columns,
  validateRow
}) => {
  // State for form data
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
      
      // Focus first editable field
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
    }
  };
  
  // Create mock form methods for EditCellRenderer
  const createMockFormMethods = (field: string) => {
    return {
      formState: {
        values: formData,
        errors,
        dirtyFields,
        isDirty: Object.keys(dirtyFields).length > 0,
        isValid: Object.keys(errors).length === 0
      },
      getValues: () => formData,
      setValue: (name: string, value: any, options?: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (options?.shouldDirty) {
          setDirtyFields(prev => ({ ...prev, [name]: true }));
        }
        
        if (options?.shouldValidate) {
          validateField(name, value);
        }
      },
      setError: (name: string, error: any) => {
        setErrors(prev => ({ ...prev, [name]: error }));
      },
      clearErrors: () => {
        setErrors({});
      },
      trigger: async () => {
        return await validateForm();
      }
    };
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
            .map(column => {
              // Current field value
              const value = formData[column.field];
              const error = errors[column.field];
              
              // Create mock params for EditCellRenderer
              const mockParams: GridRenderEditCellParams = {
                id: 'new-row',
                field: column.field,
                value,
                formattedValue: value,
                row: formData,
                colDef: column as any,
                api: {
                  getCellMode: () => 'edit',
                  setCellMode: () => {},
                  stopCellEditMode: () => {},
                  forceUpdate: () => {}
                } as any,
                hasFocus: currentField === column.field,
                tabIndex: 0,
                getValue: () => value,
              };
              
              return (
                <Box key={column.field} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {column.headerName}
                  </Typography>
                  
                  {/* Render field using EditCellRenderer with GridFormContext */}
                  <GridFormContext.Provider 
                    value={{
                      getFormMethods: () => createMockFormMethods(column.field),
                      updateCellValue: (id: string, field: string, value: any) => {
                        updateFieldValue(field, value);
                      },
                      startEditingRow: () => {},
                      isCompact: false
                    }}
                  >
                    <EditCellRenderer 
                      params={mockParams}
                      column={column}
                    />
                  </GridFormContext.Provider>
                  
                  {error && (
                    <FormHelperText error sx={{ ml: 1, mt: 0.5 }}>
                      {error.message}
                    </FormHelperText>
                  )}
                </Box>
              );
            })}
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

// Fix for the GridFormContext issue - you may need to modify this based on your actual implementation
(AddRowDialog as any).contextType = GridFormContext;