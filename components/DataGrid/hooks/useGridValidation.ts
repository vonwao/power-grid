import { useCallback } from 'react';
import { GridRowModel } from '@mui/x-data-grid';
import { ValidationResult } from '../validation/types';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';
import { createValidatorFromColumnConfig } from '../validation/validators';

export interface UseGridValidationProps {
  columns: EnhancedColumnConfig[];
}

export const useGridValidation = ({ columns }: UseGridValidationProps) => {
  // Validate a single field
  const validateField = useCallback((row: GridRowModel, field: string): ValidationResult => {
    const column = columns.find(col => col.field === field);
    if (!column) return { valid: true };
    
    // Get or create validator
    const validator = column.validator || 
      createValidatorFromColumnConfig(column);
    
    // Get value
    const value = column.valueGetter ? 
      column.valueGetter({ row, field }) : 
      row[field];
    
    // Validate
    return validator.validate(value);
  }, [columns]);
  
  // Validate an entire row
  const validateRow = useCallback((row: GridRowModel): Record<string, ValidationResult> => {
    const validationState: Record<string, ValidationResult> = {};
    
    columns.forEach(column => {
      validationState[column.field] = validateField(row, column.field);
    });
    
    return validationState;
  }, [columns, validateField]);
  
  // Check if a row has any validation errors
  const hasRowValidationErrors = useCallback((row: GridRowModel): boolean => {
    const validationState = validateRow(row);
    return Object.values(validationState).some(result => !result.valid);
  }, [validateRow]);
  
  return {
    validateField,
    validateRow,
    hasRowValidationErrors,
  };
};
