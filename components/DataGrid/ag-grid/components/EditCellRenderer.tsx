import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { 
  TextField, 
  Checkbox, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText 
} from '@mui/material';
import { CoreColumnConfig } from '../../core/types';
import { useGridForm } from '../../core/context';

export interface EditCellRendererProps extends ICellEditorParams {
  columnConfig?: CoreColumnConfig;
}

/**
 * Cell editor component for ag-Grid
 */
export const EditCellRenderer: React.FC<EditCellRendererProps> = (props) => {
  const { value: initialValue, node, colDef, columnConfig, stopEditing, api } = props;
  const rowId = node?.id || '';
  const field = colDef?.field || '';
  
  // Use the column config from params or find it by field
  const { updateCellValue, getFormMethods, getRowErrors, columns } = useGridForm();
  const actualColumnConfig = columnConfig || columns.find(col => col.field === field);
  
  if (!actualColumnConfig) {
    return <div>Invalid column</div>;
  }
  
  // Determine field config
  const fieldConfig = actualColumnConfig.fieldConfig;
  const fieldType = actualColumnConfig.fieldType;
  
  // Initialize state
  const [localValue, setLocalValue] = useState<any>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get form methods and error state
  const formMethods = getFormMethods(rowId);
  const errors = getRowErrors(rowId);
  const error = errors?.[field];
  const isDirty = formMethods?.formState.dirtyFields[field];
  
  // Update local value when form value changes
  useEffect(() => {
    if (formMethods) {
      const values = formMethods.getValues();
      setLocalValue(values[field]);
      
      // Select all text when editing a text field
      if (inputRef.current && 
          (fieldConfig?.type === 'string' || fieldConfig?.type === 'number' || !fieldConfig?.type)) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.select();
          }
        }, 50);
      }
    }
  }, [formMethods, field, fieldConfig?.type]);
  
  // Handle change event
  const handleChange = useCallback((newValue: any) => {
    setLocalValue(newValue);
    updateCellValue(rowId, field, newValue);
  }, [updateCellValue, rowId, field]);
  
  // Handle blur event
  const handleBlur = useCallback(() => {
    if (stopEditing) {
      stopEditing();
    }
  }, [stopEditing]);
  
  // Handle key press events
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    // If user presses Escape, revert to original value
    if (e.key === 'Escape') {
      if (stopEditing) {
        stopEditing();
      }
    }
    // If user presses Enter, save and close
    else if (e.key === 'Enter') {
      if (stopEditing) {
        stopEditing();
      }
    }
  }, [stopEditing]);
  
  // If the field config has a custom renderEditMode, use it
  if (fieldConfig?.renderEditMode && typeof fieldConfig.renderEditMode === 'function') {
    const rendered = fieldConfig.renderEditMode({
      value: localValue,
      onChange: handleChange,
      ref: inputRef,
      onBlur: handleBlur,
      error: !!error,
      helperText: error?.message,
      id: `edit-${field}-${rowId}`,
      row: node?.data,
      isDirty: !!isDirty,
    });
    return rendered as React.ReactElement;
  }
  
  // If the legacy fieldType has a renderEditMode, use it
  if (fieldType?.renderEditMode && typeof fieldType.renderEditMode === 'function') {
    const rendered = fieldType.renderEditMode({
      value: localValue,
      onChange: handleChange,
      onBlur: handleBlur,
      autoFocus: true,
      error: !!error,
      helperText: error?.message,
      id: `edit-${field}-${rowId}`,
      row: node?.data,
      isDirty: !!isDirty,
    });
    return rendered as React.ReactElement;
  }
  
  // Otherwise, use default renderers based on field type
  switch (fieldConfig?.type) {
    case 'string':
      return (
        <TextField
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          size="small"
          fullWidth
          autoFocus
          inputRef={inputRef}
          sx={{ m: 0 }}
        />
      );
      
    case 'number':
      return (
        <TextField
          type="number"
          value={localValue ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value);
            handleChange(val);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          size="small"
          fullWidth
          autoFocus
          inputRef={inputRef}
          sx={{ m: 0 }}
        />
      );
      
    case 'boolean':
      return (
        <Checkbox
          checked={!!localValue}
          onChange={(e) => handleChange(e.target.checked)}
          onBlur={handleBlur}
          inputRef={inputRef}
        />
      );
      
    case 'date':
      return (
        <TextField
          type="date"
          value={localValue ? new Date(localValue).toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const val = e.target.value ? new Date(e.target.value) : null;
            handleChange(val);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          size="small"
          fullWidth
          autoFocus
          inputRef={inputRef}
          sx={{ m: 0 }}
        />
      );
      
    case 'select':
      return (
        <FormControl
          fullWidth
          size="small"
          error={!!error}
          variant="outlined"
          sx={{ m: 0 }}
        >
          <InputLabel>{actualColumnConfig.headerName}</InputLabel>
          <Select
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            label={actualColumnConfig.headerName}
            inputRef={inputRef}
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
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          size="small"
          fullWidth
          autoFocus
          inputRef={inputRef}
          sx={{ m: 0 }}
        />
      );
  }
};