import { useState, useCallback } from 'react';
import { GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import { SelectionModelState, SelectionOptions } from '../types/selection';

/**
 * Hook for managing row selection state
 */
export function useSelectionModel({
  selectionModel: externalSelectionModel,
  onSelectionModelChange: externalOnSelectionModelChange,
}: SelectionOptions = {}): SelectionModelState {
  // Only create internal state for uncontrolled mode
  const [internalSelectionModel, setInternalSelectionModel] = useState<any[]>([]);
  
  // Determine if we're in controlled mode
  const isControlled = externalSelectionModel !== undefined;
  
  // Use external model if in controlled mode, otherwise use internal
  const selectionModel = isControlled ? externalSelectionModel : internalSelectionModel;
  
  // Handle selection model change
  const onSelectionModelChange = useCallback(
    (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
      // Convert readonly array to mutable array
      const mutableSelectionModel = [...newSelectionModel];
      
      if (!isControlled) {
        // Only update internal state if we're not in controlled mode
        setInternalSelectionModel(mutableSelectionModel);
      }
      
      // Always call external handler if provided
      if (externalOnSelectionModelChange) {
        externalOnSelectionModelChange(mutableSelectionModel);
      }
    },
    [isControlled, externalOnSelectionModelChange]
  );
  
  return {
    selectionModel,
    onSelectionModelChange,
  };
}