import { useCallback } from 'react';
import { GridApi, GridCellParams, GridEditCellProps, GridRowId } from '@mui/x-data-grid';
import { useGridEditing as useGridEditingContext } from '../context/GridEditingContext';

export interface UseGridEditingProps {
  api: GridApi;
}

export const useGridEditing = ({ api }: UseGridEditingProps) => {
  const {
    startEditing,
    stopEditing,
    updateValue,
    getValidationState,
  } = useGridEditingContext();
  
  // Handle cell click to enter edit mode
  const handleCellClick = useCallback((params: GridCellParams) => {
    const { id, field, value } = params;
    
    // Skip editing for non-editable fields
    if (field === 'id') return;
    
    // Start editing in the context
    startEditing(id, field);
    
    // Set cell to edit mode in the grid
    api.startCellEditMode({ id, field });
  }, [api, startEditing]);
  
  // Handle cell edit start
  const handleCellEditStart = useCallback((params: GridCellParams) => {
    const { id, field } = params;
    startEditing(id, field);
  }, [startEditing]);
  
  // Handle cell edit stop
  const handleCellEditStop = useCallback((params: any) => {
    const { id, field, reason } = params;
    stopEditing(id, field);
  }, [stopEditing]);
  
  // Handle cell edit commit
  const handleCellEditCommit = useCallback((params: GridEditCellProps) => {
    const { id, field, value } = params;
    updateValue(id, field, value);
  }, [updateValue]);
  
  return {
    handleCellClick,
    handleCellEditStart,
    handleCellEditStop,
    handleCellEditCommit,
    getValidationState,
  };
};
