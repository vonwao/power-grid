import React, { useCallback, useRef } from 'react';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { TextField, Checkbox, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';
import { useGridForm } from '../context/GridFormContext';
import { ValidationIndicator } from '../components/ValidationIndicator';

export interface EditCellRendererProps {
  params: GridRenderEditCellParams;
  column: EnhancedColumnConfig;
}

export const EditCellRenderer: React.FC<EditCellRendererProps> = ({
  params,
  column,
}) => {
  const { id, field, api, colDef } = params;
  const { getFormMethods, updateCellValue, startEditingRow, isCompact } = useGridForm();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine field config early
  const fieldConfig = column.fieldConfig;
  const fieldType = column.fieldType;
  
  // Initialize state at the top level, before any conditional returns
  // Use empty string/null as initial value, will be updated in useEffect
  const [localValue, setLocalValue] = React.useState<any>(null);
  
  // Track if this is the first render to handle text selection
  const isFirstRender = React.useRef(true);
  
  // Define callbacks at the top level, before any conditional returns
  // Handle change event
  const handleChange = useCallback((newValue: any) => {
    if (id && field) {
      updateCellValue(id, field, newValue);
      
      // Force a re-render to update the UI immediately
      // This is needed because the form state update might not trigger a re-render
      setTimeout(() => {
        if (api && id && field) {
          try {
            // Force a refresh of the grid to ensure all cells reflect the latest data
            api.forceUpdate();
          } catch (error) {
            console.error('Error forcing update:', error);
          }
        }
      }, 0);
    }
  }, [updateCellValue, id, field, api]);
  
  // Create a wrapped handleChange that updates both the form and local state
  // Define this at the top level too, before any conditional returns
  const handleChangeWithLocalUpdate = React.useCallback((newValue: any) => {
    setLocalValue(newValue);
    handleChange(newValue);
  }, [handleChange, setLocalValue]);
  
  // Handle blur event
  const handleBlur = useCallback(() => {
    // Stop editing this cell
    if (api && id && field) {
      try {
        // Ensure the form value is up to date before stopping edit mode
        const formMethods = getFormMethods(id);
        if (formMethods) {
          const currentValue = formMethods.getValues()[field];
          updateCellValue(id, field, currentValue);
        }
        
        // Stop edit mode and force a refresh to ensure the grid displays the latest value
        api.stopCellEditMode({ id, field });
        setTimeout(() => {
          if (api) {
            api.forceUpdate();
          }
        }, 0);
      } catch (error) {
        console.error('Error stopping cell edit mode:', error);
        // If there's an error, try to force a refresh
        try {
          api.forceUpdate();
        } catch (innerError) {
          console.error('Error forcing update:', innerError);
        }
      }
    }
  }, [api, field, id, getFormMethods, updateCellValue]);
  
  // If we don't have a form for this row yet, create one
  React.useEffect(() => {
    const formMethods = getFormMethods(id);
    if (!formMethods) {
      startEditingRow(id, field);
    }
  }, [id, field, getFormMethods, startEditingRow]);
  
  // Get form methods and handle loading state
  const formMethods = getFormMethods(id);
  
  // Update local value when form value changes or when formMethods becomes available
  React.useEffect(() => {
    if (formMethods) {
      const values = formMethods.getValues();
      setLocalValue(values[field]);
      
      // Always select all text when editing a text field to make it easier to replace
      if (inputRef.current && 
          (fieldConfig?.type === 'string' || fieldConfig?.type === 'number' || !fieldConfig?.type)) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.select();
          }
        }, 50);
      }
      isFirstRender.current = false;
    }
  }, [formMethods, field, fieldConfig?.type]);
  
  // Handle key press events
  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    // If user presses Escape, revert to original value
    if (e.key === 'Escape') {
      const originalData = formMethods?.getValues()[field];
      setLocalValue(originalData);
      handleBlur();
    }
    // If user presses Enter, save and close
    else if (e.key === 'Enter') {
      handleBlur();
    }
  }, [field, formMethods, handleBlur]);
  
  // Early return if formMethods is not available
  if (!formMethods) {
    return <div>Initializing form...</div>;
  }
  
  // Get error state and dirty state
  const error = formMethods.formState.errors[field];
  const isDirty = !!formMethods.formState.dirtyFields[field];
  
  // If the field config has a custom renderEditMode, use it
  if (fieldConfig?.renderEditMode && typeof fieldConfig.renderEditMode === 'function') {
    const rendered = fieldConfig.renderEditMode({
      value: localValue,
      onChange: handleChangeWithLocalUpdate,
      ref: inputRef,
      onBlur: handleBlur,
      error: !!error,
      helperText: error?.message,
      id: `edit-${field}-${id}`,
      row: params.row,
      isDirty: isDirty,
    });
    return (
      <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
        {rendered as React.ReactElement}
      </ValidationIndicator>
    );
  }
  
  // If the legacy fieldType has a renderEditMode, use it
  if (fieldType?.renderEditMode && typeof fieldType.renderEditMode === 'function') {
    const rendered = fieldType.renderEditMode({
      value: localValue,
      onChange: handleChangeWithLocalUpdate,
      onBlur: handleBlur,
      autoFocus: true,
      error: !!error,
      helperText: error?.message,
      id: `edit-${field}-${id}`,
      row: params.row,
      isDirty: isDirty,
    });
    return (
      <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
        {rendered as React.ReactElement}
      </ValidationIndicator>
    );
  }
  
  // Otherwise, use default renderers based on field type
  switch (fieldConfig?.type) {
    case 'string':
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <TextField
            value={localValue || ''}
            onChange={(e) => handleChangeWithLocalUpdate(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyPress}
            error={!!error}
            helperText={error?.message}
            variant="outlined"
            size="small"
            fullWidth
            autoFocus
            inputRef={inputRef}
          />
        </ValidationIndicator>
      );
      
    case 'number':
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <TextField
            type="number"
            value={localValue ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              handleChangeWithLocalUpdate(val);
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
          />
        </ValidationIndicator>
      );
      
    case 'boolean':
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <Checkbox
            checked={!!localValue}
            onChange={(e) => handleChangeWithLocalUpdate(e.target.checked)}
            onBlur={handleBlur}
            inputRef={inputRef}
          />
        </ValidationIndicator>
      );
      
    case 'date':
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <TextField
            type="date"
            value={localValue ? new Date(localValue).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const val = e.target.value ? new Date(e.target.value) : null;
              handleChangeWithLocalUpdate(val);
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
          />
        </ValidationIndicator>
      );
      
    case 'select':
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <FormControl
            fullWidth
            size="small"
            error={!!error}
            variant="outlined"
          >
            <InputLabel>{column.headerName}</InputLabel>
            <Select
              value={localValue || ''}
              onChange={(e) => handleChangeWithLocalUpdate(e.target.value)}
              onBlur={handleBlur}
              label={column.headerName}
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
        </ValidationIndicator>
      );
      
    default:
      // Default to text input
      return (
        <ValidationIndicator error={error} isDirty={isDirty} compact={isCompact}>
          <TextField
            value={localValue || ''}
            onChange={(e) => handleChangeWithLocalUpdate(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyPress}
            error={!!error}
            helperText={error?.message}
            variant="outlined"
            size="small"
            fullWidth
            autoFocus
            inputRef={inputRef}
          />
        </ValidationIndicator>
      );
  }
};
