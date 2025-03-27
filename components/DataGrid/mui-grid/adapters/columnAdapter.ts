import { GridColDef, GridRenderCellParams, GridRenderEditCellParams } from '@mui/x-data-grid';
import { CoreColumnConfig } from '../../core/types';

/**
 * Converts core column definitions to MUI X Grid column definitions
 * @param columns Core column definitions
 * @returns MUI X Grid column definitions
 */
export function adaptColumnsToMuiGrid(columns: CoreColumnConfig[]): GridColDef[] {
  return columns.map(column => {
    const colDef: GridColDef = {
      ...column,
      // We'll use the CellRenderer and EditCellRenderer components directly in the EnhancedDataGrid component
      // This avoids issues with JSX in .ts files
    };
    
    return colDef;
  });
}