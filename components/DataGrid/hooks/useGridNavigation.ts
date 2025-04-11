import { useCallback, useEffect } from 'react';
import { GridApi, GridEventListener, GridRowId, GridColDef } from '@mui/x-data-grid';

export interface UseGridNavigationProps {
  api: GridApi;
  columns?: GridColDef[];
  rows?: Array<{ id: GridRowId }>;
  onNavigate?: (id: GridRowId, field: string) => void;
}

export const useGridNavigation = ({
  api,
  columns = [],
  rows = [],
  onNavigate
}: UseGridNavigationProps) => {
  // Add diagnostic logging
  useEffect(() => {
    console.log('useGridNavigation hook initialized with api:', api);
  }, [api]);

  // Handle keyboard navigation
  const handleKeyDown: GridEventListener<'cellKeyDown'> = useCallback((params, event) => {
    console.log('handleKeyDown called with key:', event.key, 'params:', params);
    const { id, field, cellMode } = params;
    // Get the current column index
    const columnFields = columns.map(col => col.field);
    const currentColIndex = columnFields.indexOf(field);
    
    // Get all row IDs from the rows parameter
    const rowIds = rows.map(row => row.id);
    const currentRowIndex = rowIds.indexOf(id);
    
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        
        // Move to next/previous editable field
        const direction = event.shiftKey ? -1 : 1;
        let nextColIndex = currentColIndex;
        let nextField = field;
        
        // Find the next/previous editable column
        do {
          nextColIndex += direction;
          if (nextColIndex < 0) {
            // Move to previous row, last column
            if (currentRowIndex > 0) {
              const prevRowId = rowIds[currentRowIndex - 1];
              navigateToCell(prevRowId, columnFields[columnFields.length - 1]);
              event.preventDefault();
            }
            return;
          } else if (nextColIndex >= columnFields.length) {
            // Move to next row, first column
            if (currentRowIndex < rowIds.length - 1) {
              const nextRowId = rowIds[currentRowIndex + 1];
              // Find first editable column
              const firstEditableColIndex = columnFields.findIndex(
                colField => colField !== 'id'
              );
              if (firstEditableColIndex >= 0) {
                navigateToCell(nextRowId, columnFields[firstEditableColIndex]);
                event.preventDefault();
              }
            }
            return;
          }
          
          nextField = columnFields[nextColIndex];
        } while (nextField === 'id');
        
        // Navigate to the next cell
        navigateToCell(id, nextField);
        break;
        
      case 'ArrowUp':
        // Move to the same field in the previous row
        if (currentRowIndex > 0) {
          const prevRowId = rowIds[currentRowIndex - 1];
          navigateToCell(prevRowId, field);
          event.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        // Move to the same field in the next row
        if (currentRowIndex < rowIds.length - 1) {
          const nextRowId = rowIds[currentRowIndex + 1];
          navigateToCell(nextRowId, field);
          event.preventDefault();
        }
        break;
    }
  }, [api, columns, rows]);
  
  // Navigate to a specific cell and enter edit mode
  const navigateToCell = useCallback((id: GridRowId, field: string) => {
    console.log('navigateToCell called with id:', id, 'field:', field);
    
    if (onNavigate) {
      // Use the callback provided by the parent component
      onNavigate(id, field);
    } else {
      try {
        // Fallback to using the API directly
        api.startCellEditMode({ id, field });
      } catch (error) {
        console.error('Error navigating to cell:', error);
      }
    }
  }, [api, onNavigate]);
  
  return {
    handleKeyDown,
    navigateToCell,
  };
};
