import React from 'react';
import { TextField } from '@mui/material';
import { FieldTypeConfig, EditCellProps } from './types';
import { ValidationRule } from '../validation/types';
import { DateTypeRule } from '../validation/rules';

export class DateFieldType implements FieldTypeConfig<Date> {
  name = 'date';
  type = 'date';
  
  renderViewMode(value: Date | null) {
    return (
      <span>
        {value instanceof Date && !isNaN(value.getTime())
          ? value.toLocaleDateString()
          : ''}
      </span>
    );
  }
  
  renderEditMode(props: EditCellProps<Date>) {
    const { value, onChange, onBlur, autoFocus, error, helperText, id } = props;
    
    // Format date for input
    const formatDateForInput = (date: Date | null): string => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
    
    return (
      <TextField
        type="date"
        value={formatDateForInput(value)}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? new Date(val) : null);
        }}
        onBlur={onBlur}
        autoFocus={autoFocus}
        error={error}
        helperText={helperText}
        id={id}
        variant="outlined"
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
    );
  }
  
  parseValue(value: any): Date | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value;
    
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  formatValue(value: Date | null): string {
    if (!value || !(value instanceof Date) || isNaN(value.getTime())) return '';
    return value.toLocaleDateString();
  }
  
  getDefaultValue(): Date | null {
    return new Date();
  }
  
  isValidType(value: any): boolean {
    if (value === null || value === undefined) return true;
    return value instanceof Date && !isNaN(value.getTime());
  }
  
  getDefaultValidationRules(): ValidationRule<Date>[] {
    return [new DateTypeRule()];
  }
}
