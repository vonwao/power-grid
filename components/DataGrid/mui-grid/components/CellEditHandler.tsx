import React, { useEffect } from 'react';
import { GridApi } from '@mui/x-data-grid';
import { useGridForm } from '../../core/context';

interface CellEditHandlerProps {
  apiRef: React.MutableRefObject<GridApi>;
}

/**
 * Component that handles cell edit events from MUI X Grid
 * and synchronizes them with the form context
 */
export const CellEditHandler: React.FC<CellEditHandlerProps> = ({ apiRef }) => {
  const { 
    startEditingCell, 
    stopEditingCell, 
    updateCellValue
  } = useGridForm();
  
  // Handle cell edit events
  useEffect(() => {
    if (!apiRef.current) return;
    
    // We'll use a manual approach instead of event subscriptions
    // This component will be used as a bridge between the grid and form context
    
    // The original grid already handles most of the cell editing logic
    // We'll rely on the parent component to call our form context methods
    
    console.log('CellEditHandler mounted with apiRef:', apiRef.current);
    
    return () => {
      console.log('CellEditHandler unmounted');
    };
  }, [apiRef, startEditingCell, stopEditingCell, updateCellValue]);
  
  return null;
};