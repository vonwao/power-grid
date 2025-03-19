import React from 'react';
import { TextField } from '@mui/material';
import { FieldTypeConfig, EditCellProps } from './types';
import { ValidationRule } from '../validation/types';
import { NumberTypeRule } from '../validation/rules';

export class NumberFieldType implements FieldTypeConfig<number> {
  name = 'number';
  type = 'number';
  
  renderViewMode(value: number | null) {
    return <span>{value === null || value === undefined ? '' : value}</span>;
  }
  
  renderEditMode(props: EditCellProps<number>) {
    const { value, onChange, onBlur, autoFocus, error, helperText, id } = props;
    
    return (
      <TextField
        type="number"
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? null : Number(val));
        }}
        onBlur={onBlur}
        autoFocus={autoFocus}
        error={error}
        helperText={helperText}
        id={id}
        variant="outlined"
        size="small"
        fullWidth
        inputProps={{ step: 1 }}
      />
    );
  }
  
  parseValue(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  
  formatValue(value: number | null): string {
    return value === null || value === undefined ? '' : String(value);
  }
  
  getDefaultValue(): number | null {
    return 0;
  }
  
  isValidType(value: any): boolean {
    if (value === null || value === undefined) return true;
    return typeof value === 'number' && !isNaN(value);
  }
  
  getDefaultValidationRules(): ValidationRule<number>[] {
    return [new NumberTypeRule()]; // Ensures value is a number
  }
}
