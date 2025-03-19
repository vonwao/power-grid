import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { FieldTypeConfig, EditCellProps } from './types';
import { ValidationRule } from '../validation/types';

interface SelectOption {
  [key: string]: any;
}

interface SelectFieldTypeOptions<T = any> {
  options: SelectOption[];
  valueKey: string;
  labelKey: string;
  getOptionLabel?: (option: SelectOption) => string;
  isOptionEqualToValue?: (option: SelectOption, value: SelectOption) => boolean;
}

export class SelectFieldType<T = any> implements FieldTypeConfig<T> {
  name = 'select';
  type = 'select';
  private options: SelectOption[];
  private valueKey: string;
  private labelKey: string;
  private getOptionLabelFn: (option: SelectOption) => string;
  private isOptionEqualToValueFn: (option: SelectOption, value: SelectOption) => boolean;
  
  constructor(config: SelectFieldTypeOptions<T>) {
      this.options = config.options;
      this.valueKey = config.valueKey || 'value';
      this.labelKey = config.labelKey || 'label';
      
      this.getOptionLabelFn = config.getOptionLabel ||
        ((option) => option[this.labelKey] || '');
        
      this.isOptionEqualToValueFn = config.isOptionEqualToValue ||
        ((option, value) => option[this.valueKey] === value[this.valueKey]);
    }
  
  renderViewMode(value: T | null, row: any) {
    if (value === null || value === undefined) return <span></span>;
    
    const option = this.options.find(opt => opt[this.valueKey] === value);
    return <span>{option ? option[this.labelKey] : String(value)}</span>;
  }
  
  renderEditMode(props: EditCellProps<T>) {
    const { value, onChange, onBlur, autoFocus, error, helperText, id } = props;
    
    // Find the option object that matches the current value
    const selectedOption = value !== null && value !== undefined
      ? this.options.find(opt => opt[this.valueKey] === value)
      : null;
    
    return (
      <Autocomplete
        id={id}
        options={this.options}
        value={selectedOption}
        onChange={(_, newValue) => {
          onChange(newValue ? newValue[this.valueKey] : null);
        }}
        getOptionLabel={this.getOptionLabelFn}
        isOptionEqualToValue={this.isOptionEqualToValueFn}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={helperText}
            variant="outlined"
            size="small"
            fullWidth
            onBlur={onBlur}
          />
        )}
        autoFocus={autoFocus}
        fullWidth
        disablePortal
      />
    );
  }
  
  parseValue(value: any): T | null {
    if (value === null || value === undefined) return null;
    return value;
  }
  
  formatValue(value: T | null): string {
    if (value === null || value === undefined) return '';
    
    const option = this.options.find(opt => opt[this.valueKey] === value);
    return option ? option[this.labelKey] : String(value);
  }
  
  getDefaultValue(): T | null {
    return null;
  }
  
  isValidType(value: any): boolean {
    if (value === null || value === undefined) return true;
    return this.options.some(opt => opt[this.valueKey] === value);
  }
  
  getDefaultValidationRules(): ValidationRule<T>[] {
    return [];
  }
}
