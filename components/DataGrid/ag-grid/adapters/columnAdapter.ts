import { ColDef } from 'ag-grid-community';
import { CoreColumnConfig } from '../../core/types';

/**
 * Converts core column definitions to ag-Grid column definitions
 * @param columns Core column definitions
 * @returns ag-Grid column definitions
 */
export function adaptColumnsToAgGrid(columns: CoreColumnConfig[]): ColDef[] {
  return columns.map(column => {
    const colDef: ColDef = {
      field: column.field,
      headerName: column.headerName,
      width: column.width,
      editable: column.editable,
      // We'll use custom cell renderers and editors
      cellRenderer: 'cellRenderer',
      cellEditor: 'cellEditor',
      cellRendererParams: {
        column,
      },
      cellEditorParams: {
        column,
      },
      // Add ag-Grid specific properties
      sortable: true,
      filter: true,
      resizable: true,
    };
    
    return colDef;
  });
}