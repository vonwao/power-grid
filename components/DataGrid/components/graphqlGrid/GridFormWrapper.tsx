import React from 'react';
import { GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import { useGridForm } from '../../context/GridFormContext';
import { GridModeProvider } from '../../context/GridModeContext';

interface GridFormWrapperProps {
  children: React.ReactNode;
  totalRows: number;
  canEditRows?: boolean;
  canAddRows?: boolean;
  canSelectRows?: boolean;
  selectionModel: GridRowSelectionModel;
  handleSelectionModelChange: (selectionModel: GridRowSelectionModel, details: GridCallbackDetails) => void;
}

export const GridFormWrapper: React.FC<GridFormWrapperProps> = ({ 
  children,
  totalRows,
  canEditRows,
  canAddRows,
  canSelectRows,
  selectionModel,
  handleSelectionModelChange,
}) => {
  const {
    saveChanges,
    cancelChanges,
    addRow,
    hasValidationErrors,
    isRowEditing,
    isRowDirty
  } = useGridForm();

  return (
    <GridModeProvider
      totalRows={totalRows}
      initialMode="none"
      saveChanges={saveChanges}
      cancelChanges={cancelChanges}
      addRow={addRow}
      hasValidationErrors={hasValidationErrors}
      isRowEditing={isRowEditing}
      isRowDirty={isRowDirty}
      canEditRows={canEditRows}
      canAddRows={canAddRows}
      canSelectRows={canSelectRows}
      selectionModel={selectionModel as any[]} // Cast to any[] to match expected type
      // Use correct prop name 'onSelectionModelChange' and match expected signature
      onSelectionModelChange={(
        newSelectionModel: GridRowSelectionModel
        // details: GridCallbackDetails // Provider might expect only one argument
      ) => handleSelectionModelChange(newSelectionModel, {} as GridCallbackDetails)} // Pass empty details if needed
    >
      {children}
    </GridModeProvider>
  );
};
