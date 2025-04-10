import React from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from '../types/columnConfig'; // Updated path
import { useGridForm } from '../context/GridFormContext'; // Updated path
import { CellRenderer } from './CellRenderer'; // Updated path

interface FormAwareCellRendererProps { // Renamed interface
  params: GridRenderCellParams;
  column: EnhancedColumnConfig<any>; // Use 'any' for broader compatibility if needed
}

export const FormAwareCellRenderer: React.FC<FormAwareCellRendererProps> = ({ params, column }) => { // Renamed component and used renamed interface
  const { isFieldDirty, getRowErrors, getFormMethods } = useGridForm();
  const isDirty = isFieldDirty(params.id, params.field);
  const errors = getRowErrors(params.id);
  const error = errors?.[params.field];

  // Get the latest value from the form state if available
  const formMethods = getFormMethods(params.id);
  const formValue = formMethods ? formMethods.getValues()[params.field] : undefined;

  // Create a new params object with the updated value from form state
  const updatedParams = {
    ...params,
    value: formValue !== undefined ? formValue : params.value
  };

  return (
    <CellRenderer
      params={updatedParams}
      column={column}
      isDirty={isDirty}
      error={error}
    />
  );
};