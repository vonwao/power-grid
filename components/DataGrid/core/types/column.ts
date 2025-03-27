import React from 'react';
import { ValidationOptions } from '../../../../types/form';

/**
 * Field configuration for grid integration
 */
export interface FieldConfig<T = any> {
  // Basic properties
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  
  // For select fields
  options?: Array<{value: any, label: string}>;
  
  // Rendering (optional - can use defaults)
  renderViewMode?: (value: T | null, row: any) => React.ReactNode;
  renderEditMode?: (props: any) => React.ReactNode;
  
  // Validation
  validation?: ValidationOptions;
  
  // Transform functions (optional)
  parse?: (value: any) => T | null;
  format?: (value: T | null) => string;
}

/**
 * Core column configuration that's grid-implementation agnostic
 */
export interface CoreColumnConfig<T = any> {
  // Basic properties
  field: string;
  headerName: string;
  width?: number;
  editable?: boolean;
  
  // Field configuration for form integration
  fieldConfig: FieldConfig<T>;
  
  // Legacy field type (for backward compatibility)
  fieldType?: any;
  
  // Legacy validation (for backward compatibility)
  required?: boolean;
  validationRules?: any[];
  validator?: any;
}