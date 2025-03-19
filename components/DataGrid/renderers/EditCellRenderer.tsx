import React, { useCallback } from 'react';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { Controller } from 'react-hook-form';
import { TextField, Checkbox, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { EnhancedColumnConfig } from '../EnhancedDataGrid';
import { useGridForm } from '../context/GridFormContext';

export interface EditCellRendererProps {
  params: GridRenderEditCellParams;
  column: EnhancedColumnConfig;
}

export const EditCellRenderer: React.FC<EditCellRendererProps> = ({
  params,
  column,
}) => {
  const { id, field, api, colDef } = params;
  const { getFormMethods, updateCellValue, startEditingRow } = useGridForm();
  
  // If we don't have a form for this row yet, create one
  React.useEffect(() => {
    const formMethods = getFormMethods(id);
    if (!formMethods) {
      startEditingRow(id, field);
    }
  }, [id, field, getFormMethods, startEditingRow]);
  
  const formMethods = getFormMethods(id);
  if (!formMethods) {
    return <div>Initializing form...</div>;
  }
  
  // Handle blur event
  const handleBlur = useCallback(() => {
    // Stop editing this cell
    api.stopCellEditMode({ id, field });
  }, [api, field, id]);
  
  // Determine which renderer to use based on field config
  const fieldConfig = column.fieldConfig;
  const fieldType = column.fieldType;
  
  // If the field config has a custom renderEditMode, use it
  if (fieldConfig?.renderEditMode && typeof fieldConfig.renderEditMode === 'function') {
    return (
      <Controller
        control={formMethods.control}
        name={field}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
          const rendered = fieldConfig.renderEditMode!({
            value,
            onChange,
            ref,
            onBlur: handleBlur,
            error: !!error,
            helperText: error?.message,
            id: `edit-${field}-${id}`,
            row: params.row,
          });
          return rendered as React.ReactElement;
        }}
      />
    );
  }
  
  // If the legacy fieldType has a renderEditMode, use it
  if (fieldType?.renderEditMode && typeof fieldType.renderEditMode === 'function') {
    return (
      <Controller
        control={formMethods.control}
        name={field}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
          const rendered = fieldType.renderEditMode!({
            value,
            onChange,
            onBlur: handleBlur,
            autoFocus: true,
            error: !!error,
            helperText: error?.message,
            id: `edit-${field}-${id}`,
            row: params.row,
          });
          return rendered as React.ReactElement;
        }}
      />
    );
  }
  
  // Otherwise, use default renderers based on field type
  return (
    <Controller
      control={formMethods.control}
      name={field}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        // Determine which component to render based on field type
        switch (fieldConfig?.type) {
          case 'string':
            return (
              <TextField
                value={value || ''}
                onChange={onChange}
                onBlur={handleBlur}
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                size="small"
                fullWidth
                autoFocus
                inputRef={ref}
              />
            );
            
          case 'number':
            return (
              <TextField
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  onChange(val);
                }}
                onBlur={handleBlur}
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                size="small"
                fullWidth
                autoFocus
                inputRef={ref}
              />
            );
            
          case 'boolean':
            return (
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={handleBlur}
                inputRef={ref}
              />
            );
            
          case 'date':
            return (
              <TextField
                type="date"
                value={value ? new Date(value).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value) : null;
                  onChange(val);
                }}
                onBlur={handleBlur}
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                size="small"
                fullWidth
                autoFocus
                inputRef={ref}
              />
            );
            
          case 'select':
            return (
              <FormControl 
                fullWidth 
                size="small" 
                error={!!error}
                variant="outlined"
              >
                <InputLabel>{column.headerName}</InputLabel>
                <Select
                  value={value || ''}
                  onChange={onChange}
                  onBlur={handleBlur}
                  label={column.headerName}
                  inputRef={ref}
                >
                  {fieldConfig.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error.message}</FormHelperText>}
              </FormControl>
            );
            
          default:
            // Default to text input
            return (
              <TextField
                value={value || ''}
                onChange={onChange}
                onBlur={handleBlur}
                error={!!error}
                helperText={error?.message}
                variant="outlined"
                size="small"
                fullWidth
                autoFocus
                inputRef={ref}
              />
            );
        }
      }}
    />
  );
};
