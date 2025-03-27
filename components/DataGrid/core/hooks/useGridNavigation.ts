import { useCallback } from 'react';
import { CoreColumnConfig } from '../types';

interface UseGridNavigationProps {
  api: any; // Grid API (implementation-specific)
  columns: CoreColumnConfig[];
  rows: any[];
  onNavigate: (id: any, field: string) => void;
}

/**
 * Hook for handling keyboard navigation in the grid
 */
export function useGridNavigation({
  api,
  columns,
  rows,
  onNavigate,
}: UseGridNavigationProps) {
  // Handle key down events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!api) return;
    
    // Get current cell
    const focusedCell = api.getCellFocused?.() || api.getFocusedCell?.();
    if (!focusedCell) return;
    
    const { id, field, rowIndex, colIndex } = focusedCell;
    
    // Handle Tab key
    if (event.key === 'Tab') {
      event.preventDefault();
      
      // Get editable columns
      const editableColumns = columns.filter(col => col.editable !== false);
      
      // Find current column index
      const currentColIndex = editableColumns.findIndex(col => col.field === field);
      
      if (event.shiftKey) {
        // Move to previous cell
        if (currentColIndex > 0) {
          // Previous column in same row
          const prevColumn = editableColumns[currentColIndex - 1];
          onNavigate(id, prevColumn.field);
        } else if (rowIndex > 0) {
          // Last column in previous row
          const prevRowId = rows[rowIndex - 1]?.id;
          if (prevRowId) {
            const lastColumn = editableColumns[editableColumns.length - 1];
            onNavigate(prevRowId, lastColumn.field);
          }
        }
      } else {
        // Move to next cell
        if (currentColIndex < editableColumns.length - 1) {
          // Next column in same row
          const nextColumn = editableColumns[currentColIndex + 1];
          onNavigate(id, nextColumn.field);
        } else if (rowIndex < rows.length - 1) {
          // First column in next row
          const nextRowId = rows[rowIndex + 1]?.id;
          if (nextRowId) {
            const firstColumn = editableColumns[0];
            onNavigate(nextRowId, firstColumn.field);
          }
        }
      }
    }
    
    // Handle Enter key
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      // Move to next row, same column
      if (rowIndex < rows.length - 1) {
        const nextRowId = rows[rowIndex + 1]?.id;
        if (nextRowId) {
          onNavigate(nextRowId, field);
        }
      }
    }
    
    // Handle Shift+Enter key
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      
      // Move to previous row, same column
      if (rowIndex > 0) {
        const prevRowId = rows[rowIndex - 1]?.id;
        if (prevRowId) {
          onNavigate(prevRowId, field);
        }
      }
    }
  }, [api, columns, rows, onNavigate]);
  
  return {
    handleKeyDown,
  };
}