import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { FieldTypeConfig, EditCellProps } from './types';
import { ValidationRule } from '../validation/types';

export class BooleanFieldType implements FieldTypeConfig<boolean> {
  name = 'boolean';
  type = 'boolean';
  
  renderViewMode(value: boolean | null) {
    return <Checkbox checked={!!value} disabled />;
  }
  
  renderEditMode(props: EditCellProps<boolean>) {
    const { value, onChange, onBlur, autoFocus, error, id } = props;
    
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            autoFocus={autoFocus}
            id={id}
            color={error ? 'error' : 'primary'}
          />
        }
        label=""
        sx={{ margin: 0 }}
      />
    );
  }
  
  parseValue(value: any): boolean | null {
    if (value === null || value === undefined) return null;
    return Boolean(value);
  }
  
  formatValue(value: boolean | null): string {
    if (value === null || value === undefined) return '';
    return value ? 'Yes' : 'No';
  }
  
  getDefaultValue(): boolean | null {
    return false;
  }
  
  isValidType(value: any): boolean {
    return value === null || value === undefined || typeof value === 'boolean';
  }
  
  getDefaultValidationRules(): ValidationRule<boolean>[] {
    return []; // No default rules for boolean
  }
}
