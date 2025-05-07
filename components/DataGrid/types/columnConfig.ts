import { GridColDef } from '@mui/x-data-grid';
import React from 'react';

/**
 * Enhanced column configuration with additional options for menu customization
 */
export interface EnhancedColumnConfig<T = any> extends Omit<GridColDef, 'renderCell' | 'renderEditCell'> {
  // Field configuration for form integration
  fieldConfig: {
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    options?: Array<{ value: any; label: string }>;
    renderViewMode?: (_value: T | null, _row: any) => React.ReactNode;
    renderEditMode?: (_props: any) => React.ReactNode;
    validation?: any;
    parse?: (_value: any) => T | null;
    format?: (_value: T | null) => string;
  };
  
  // Legacy field type (for backward compatibility)
  fieldType?: any;
  
  // Legacy validation (for backward compatibility)
  required?: boolean;
  validationRules?: any[];
  validator?: any;
  
  // New property for column menu configuration
  menuOptions?: {
    // Which menu items to show (defaults to true if not specified)
    showSortAsc?: boolean;
    showSortDesc?: boolean;
    showFilter?: boolean;
    showColumnSelector?: boolean;
    // Custom menu items
    customItems?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (colDef: GridColDef) => void;
    }>;
  };
}