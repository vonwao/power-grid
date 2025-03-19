import React from 'react';
import { TextField } from '@mui/material';
import { FieldTypeConfig, EditCellProps } from './types';
import { ValidationRule } from '../validation/types';

export class StringFieldType implements FieldTypeConfig<string> {
  name = 'string';
  type = 'string';
  
  renderViewMode(value: string | null) {
    return <span>{value || ''}</span>;
  }
  
  renderEditMode(props: EditCellProps<string>) {
    const { value, onChange, onBlur, autoFocus, error, helperText, id } = props;
    
    return (
      <TextField
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus={autoFocus}
        error={error}
        helperText={helperText}
        id={id}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  }
  
  parseValue(value: any): string | null {
    return value === null || value === undefined ? null : String(value);
  }
  
  formatValue(value: string | null): string {
    return value || '';
  }
  
  getDefaultValue(): string | null {
    return '';
  }
  
  isValidType(value: any): boolean {
    return value === null || value === undefined || typeof value === 'string';
  }
  
  getDefaultValidationRules(): ValidationRule<string>[] {
    return []; // No default rules for string
  }
}
