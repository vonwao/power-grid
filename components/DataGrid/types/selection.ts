import { GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';

/**
 * Types for row selection
 */

/**
 * Selection model state
 */
export interface SelectionModelState {
  selectionModel: any[];
  onSelectionModelChange: (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => void;
}

/**
 * Selection options
 */
export interface SelectionOptions {
  checkboxSelection?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (selectionModel: any[]) => void;
  disableMultipleSelection?: boolean;
}