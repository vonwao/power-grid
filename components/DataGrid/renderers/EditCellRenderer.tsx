import React, { useCallback } from 'react';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { FieldTypeConfig } from '../fieldTypes/types';
import { useGridEditing } from '../context/GridEditingContext';

interface EditCellRendererProps {
  params: GridRenderEditCellParams;
  fieldType: FieldTypeConfig;
}

export const EditCellRenderer: React.FC<EditCellRendererProps> = ({
  params,
  fieldType,
}) => {
  const { id, field, value, api, colDef } = params;
  const { getValidationState, updateValue } = useGridEditing();
  
  // Get validation state for this cell
  const validationResult = getValidationState(id, field);
  
  // Handle value change
  const handleChange = useCallback((newValue: any) => {
    // Update the value in the editing context
    updateValue(id, field, newValue);
    
    // Also update the DataGrid's value
    api.setEditCellValue({ id, field, value: newValue });
  }, [api, field, id, updateValue]);
  
  // Handle blur event
  const handleBlur = useCallback(() => {
    // Optionally commit the value on blur
    if (colDef.commitOnBlur !== false) {
      api.commitCellChange({ id, field });
      api.setCellMode(id, field, 'view');
    }
  }, [api, colDef.commitOnBlur, field, id]);
  
  // Render the edit component using the field type's renderEditMode
  return fieldType.renderEditMode({
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    autoFocus: true,
    error: validationResult ? !validationResult.valid : false,
    helperText: validationResult?.valid ? undefined : validationResult?.message,
    id: `edit-${field}-${id}`,
    row: params.row,
  });
};
