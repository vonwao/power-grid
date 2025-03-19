import React from 'react';
import { ValidationRule } from '../validation/types';

export interface EditCellProps<T = any> {
  value: T | null;
  onChange: (value: T | null) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  id?: string;
  row?: any;
}

export interface FieldTypeConfig<T = any> {
  // Basic properties
  name: string;
  type: string;
  
  // Rendering
  renderViewMode: (value: T | null, row: any) => React.ReactNode;
  renderEditMode: (props: EditCellProps<T>) => React.ReactNode;
  
  // Value handling
  parseValue: (value: any) => T | null;
  formatValue: (value: T | null) => string;
  
  // Default values
  getDefaultValue: () => T | null;
  
  // Type checking
  isValidType: (value: any) => boolean;
  
  // Default validation rules (can be overridden)
  getDefaultValidationRules: () => ValidationRule<T>[];
}
