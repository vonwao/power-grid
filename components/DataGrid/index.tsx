import React from 'react';
import { MuiEnhancedDataGrid } from './mui-grid';
import { AgGridEnhancedDataGrid } from './ag-grid';
import { CoreDataGridProps } from './core/types';

export type GridImplementation = 'mui' | 'ag-grid';

export interface EnhancedDataGridProps<T = any> extends CoreDataGridProps<T> {
  implementation?: GridImplementation;
}

/**
 * Enhanced Data Grid component that supports both MUI X Grid and ag-Grid implementations
 * @param props Component props including implementation choice
 * @returns EnhancedDataGrid component with the selected implementation
 */
export function EnhancedDataGrid<T extends { id: any }>(props: EnhancedDataGridProps<T>) {
  const { implementation = 'mui', ...restProps } = props;
  
  if (implementation === 'ag-grid') {
    return <AgGridEnhancedDataGrid {...restProps} />;
  }
  
  return <MuiEnhancedDataGrid {...restProps} />;
}

// Export both implementations directly as well
export { MuiEnhancedDataGrid, AgGridEnhancedDataGrid };

// Export types
export * from './core/types';

// Export hooks
export * from './core/hooks';

// Export context (without re-exporting ValidationHelpers)
export { 
  GridFormContext, 
  GridFormProvider, 
  useGridForm 
} from './core/context';