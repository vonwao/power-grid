import { useState, useCallback, useMemo } from 'react';
import { GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import { SelectionModelState, SelectionOptions } from '../types/selection';

/**
 * Hook for managing row selection state with optimizations to prevent unnecessary re-renders
 */
export function useSelectionModel({
  selectionModel: externalSelectionModel,
  onSelectionModelChange: externalOnSelectionModelChange,
}: SelectionOptions = {}): SelectionModelState {
  // Only create internal state for uncontrolled mode
  const [internalSelectionModel, setInternalSelectionModel] = useState<any[]>([]);
  
  // Use external model if in controlled mode, otherwise use internal
  const selectionModel = useMemo(() => {
    return externalSelectionModel !== undefined ? externalSelectionModel : internalSelectionModel;
  }, [externalSelectionModel, internalSelectionModel]);
  
  // Memoize the handler to prevent unnecessary re-renders
  const onSelectionModelChange = useCallback(
    (newSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
      // Convert readonly array to mutable array
      const mutableSelectionModel = [...newSelectionModel];
      
      if (externalSelectionModel === undefined) {
        // Only update internal state if we're not in controlled mode
        setInternalSelectionModel(prevSelection => {
          // Only update if the selection has actually changed
          if (JSON.stringify(prevSelection) !== JSON.stringify(mutableSelectionModel)) {
            return mutableSelectionModel;
          }
          return prevSelection;
        });
      }
      
      // Call external handler if provided, but prevent unnecessary calls
      if (externalOnSelectionModelChange) {
        // Use setTimeout to batch updates and prevent UI flicker
        setTimeout(() => {
          externalOnSelectionModelChange(mutableSelectionModel);
        }, 0);
      }
    },
    [externalSelectionModel, externalOnSelectionModelChange]
  );
  
  return {
    selectionModel,
    onSelectionModelChange,
  };
}