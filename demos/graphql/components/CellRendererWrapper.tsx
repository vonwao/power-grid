import React from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { EnhancedColumnConfig } from './EnhancedDataGridGraphQL';
import { useGridForm } from '../../../components/DataGrid/context/GridFormContext';
import { CellRenderer } from '../../../components/DataGrid/renderers/CellRenderer';

interface CellRendererWrapperProps {
  params: GridRenderCellParams;
  column: EnhancedColumnConfig<any>; // Use 'any' for broader compatibility if needed
}

export const CellRendererWrapper: React.FC<CellRendererWrapperProps> = ({ params, column }) => {
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
