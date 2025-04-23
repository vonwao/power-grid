import React, { useState, useEffect } from 'react';
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
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';
import { ValidationResult, FieldValidator } from '../validation/types';

// Interface for form field errors
interface FormErrors {
  [key: string]: string;
}

// Interface for the dialog props
interface AddRowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rowData: any) => void;
  columns: EnhancedColumnConfig[];
  validateRow?: (values: any) => Record<string, string>;
}

// Main Dialog Component
export const AddRowDialog: React.FC<AddRowDialogProps> = ({
  open,
  onClose,
  onSave,
  columns,
  validateRow
}) => {
  // Initialize form state based on columns
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      const initialTouched: Record<string, boolean> = {};
      
      // Generate default values for each field based on column config
      columns.forEach(column => {
        if (column.field !== 'id' && column.field !== 'accounting_mtm_history_id') {
          // Use fieldType's getDefaultValue if available, otherwise use fieldConfig
          if (column.fieldType && typeof column.fieldType.getDefaultValue === 'function') {
            initialData[column.field] = column.fieldType.getDefaultValue();
          } else if (column.fieldConfig) {
            // Use simpler default value logic based on fieldConfig
            initialData[column.field] = getDefaultValueFromConfig(column.fieldConfig);
          } else {
            // Fallback to empty string
            initialData[column.field] = '';
          }
          
          // Initialize all fields as untouched
          initialTouched[column.field] = false;
        }
      });
      
      setFormData(initialData);
      setTouched(initialTouched);
      setErrors({});
    }
  }, [open, columns]);
  
  // Helper function to get default value from fieldConfig
  const getDefaultValueFromConfig = (fieldConfig: any) => {
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
  
  // Handle field change
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    if (!touched[field]) {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    }
    
    // Validate field on change
    validateField(field, value);
  };
  
  // Validate a single field
  const validateField = (field: string, value: any) => {
    const column = columns.find(col => col.field === field);
    if (!column) return;
    
    let error: string | undefined = undefined;
    
    // Use fieldType's validator if available
    if (column.fieldType && column.validator) {
      const validator = column.validator as FieldValidator;
      const result: ValidationResult = validator.validate(value);
      
      if (!result.valid) {
        error = result.message;
      }
    } 
    // Otherwise use fieldConfig validation
    else if (column.fieldConfig?.validation) {
      const validation = column.fieldConfig.validation;
      
      // Required validation
      if (validation.required && (value === undefined || value === null || value === '')) {
        error = typeof validation.required === 'string' 
          ? validation.required 
          : `${column.headerName} is required`;
      }
      
      // Pattern validation for strings
      else if (validation.pattern && typeof value === 'string') {
        const { value: pattern, message } = validation.pattern;
        if (!pattern.test(value)) {
          error = message;
        }
      }
      
      // Min validation for numbers
      else if (validation.min && typeof value === 'number') {
        const { value: min, message } = validation.min;
        if (value < min) {
          error = message;
        }
      }
      
      // Max validation for numbers
      else if (validation.max && typeof value === 'number') {
        const { value: max, message } = validation.max;
        if (value > max) {
          error = message;
        }
      }
      
      // Custom validation function
      else if (validation.validate && typeof validation.validate === 'function') {
        const result = validation.validate(value);
        if (typeof result === 'string') {
          error = result;
        } else if (result === false) {
          error = 'Invalid value';
        }
      }
    }
    
    // Update errors state
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
    });
  };
  
  // Validate form before saving
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Validate each field
    columns.forEach(column => {
      if (column.field !== 'id' && column.field !== 'accounting_mtm_history_id') {
        const value = formData[column.field];
        
        // Use fieldType's validator if available
        if (column.fieldType && column.validator) {
          const validator = column.validator as FieldValidator;
          const result: ValidationResult = validator.validate(value);
          
          if (!result.valid) {
            newErrors[column.field] = result.message || 'Invalid value';
          }
        } 
        // Otherwise use fieldConfig validation
        else if (column.fieldConfig?.validation) {
          validateField(column.field, value);
          if (errors[column.field]) {
            newErrors[column.field] = errors[column.field];
          }
        }
      }
    });
    
    // Row-level validation if provided
    if (validateRow) {
      const rowErrors = validateRow(formData);
      Object.assign(newErrors, rowErrors);
    }
    
    // Update error state
    setErrors(newErrors);
    
    // Form is valid if there are no errors
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save button click
  const handleSave = () => {
    if (validateForm()) {
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
      
      // Create the row data with generated ID and parsed values
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
              // Get current value and error for this field
              const value = formData[column.field];
              const error = touched[column.field] ? errors[column.field] : undefined;
              
              // Render field using fieldType's renderEditMode if available
              if (column.fieldType && typeof column.fieldType.renderEditMode === 'function') {
                return (
                  <Box key={column.field} sx={{ my: 2 }}>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      {column.headerName}
                    </Typography>
                    {column.fieldType.renderEditMode({
                      value,
                      onChange: (newValue) => handleFieldChange(column.field, newValue),
                      onBlur: () => {
                        setTouched(prev => ({ ...prev, [column.field]: true }));
                        validateField(column.field, value);
                      },
                      autoFocus: false,
                      error: !!error,
                      helperText: error,
                      id: `add-dialog-${column.field}`,
                      row: formData
                    })}
                    {error && (
                      <FormHelperText error>{error}</FormHelperText>
                    )}
                  </Box>
                );
              }
              
              // Otherwise use fieldConfig-based rendering from the original component
              else if (column.fieldConfig) {
                // Import the FieldRenderer component or inline its logic here
                // Since this is part of an artifact, I'll implement a simplified version
                return (
                  <Box key={column.field} sx={{ my: 2 }}>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      {column.headerName}
                    </Typography>
                    
                    {/* This is a placeholder for the actual field rendering */}
                    {/* In a real implementation, you would render different input types based on fieldConfig.type */}
                    <div style={{ color: error ? 'red' : 'inherit' }}>
                      {/* This is where your existing field rendering logic would go */}
                      <div>Field renderer for {column.headerName} ({column.fieldConfig.type})</div>
                      {error && <div style={{ color: 'red' }}>{error}</div>}
                    </div>
                  </Box>
                );
              }
              
              // Fallback for columns without fieldType or fieldConfig
              return (
                <Box key={column.field} sx={{ my: 2 }}>
                  <Typography>
                    {column.headerName} (No renderer available)
                  </Typography>
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