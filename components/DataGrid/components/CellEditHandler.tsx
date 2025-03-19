import React, { useEffect } from 'react';
import { GridApi } from '@mui/x-data-grid';
import { useGridForm } from '../context/GridFormContext';

interface CellEditHandlerProps {
  apiRef: React.RefObject<GridApi>;
}

export const CellEditHandler: React.FC<CellEditHandlerProps> = ({ apiRef }) => {
  const { startEditingCell, stopEditingCell } = useGridForm();
  
  useEffect(() => {
    // Subscribe to cell edit start event
    const startSubscription = apiRef.current.subscribeEvent(
      'cellEditStart',
      (params: { id: any; field: string }) => {
        const { id, field } = params;
        startEditingCell(id, field);
      }
    );
    
    // Subscribe to cell edit stop event
    const stopSubscription = apiRef.current.subscribeEvent(
      'cellEditStop',
      () => {
        stopEditingCell();
      }
    );
    
    // Cleanup subscriptions on unmount
    return () => {
      startSubscription();
      stopSubscription();
    };
  }, [apiRef, startEditingCell, stopEditingCell]);
  
  // This component doesn't render anything
  return null;
};
