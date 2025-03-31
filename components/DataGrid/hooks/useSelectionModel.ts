import { useState, useCallback } from 'react';
import { GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import { SelectionModelState, SelectionOptions } from '../types/selection';

/**
 * Hook for managing row selection state
 */
export function useSelectionModel({
  selectionModel: initialSelectionModel = [],
  onSelectionModelChange: externalOnSelectionModelChange,
}: SelectionOptions = {}): SelectionModelState {
  // Initialize selection model state
  const [internalSelectionModel, setInternalSelectionModel] = useState<any[]>(initialSelectionModel);
  
  // Use external selection model if provided, otherwise use internal
  const selectionModel = initialSelectionModel || internalSelectionModel;
  
  // Handle selection model change
  const onSelectionModelChange = useCallback(
    (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
      // Convert readonly array to mutable array
      const mutableSelectionModel = [...newSelectionModel];
      
      // Update internal state
      setInternalSelectionModel(mutableSelectionModel);
      
      // Call external handler if provided
      if (externalOnSelectionModelChange) {
        externalOnSelectionModelChange(mutableSelectionModel);
      }
    },
    [externalOnSelectionModelChange]
  );
  
  return {
    selectionModel,
    onSelectionModelChange,
  };
}