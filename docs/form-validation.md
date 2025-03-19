# Form Validation in DataGrid

This document explains our approach to form validation in the DataGrid component after removing the react-hook-form dependency.

## Overview

Our DataGrid component provides built-in form validation for cell editing with a familiar API inspired by react-hook-form. The implementation is tailored specifically for data grid editing scenarios, making it more lightweight and focused than a general-purpose form library.

## Validation Schema

Column definitions include a validation schema that follows a familiar pattern:

```typescript
const columns = [
  { 
    field: 'name', 
    headerName: 'Name',
    fieldConfig: {
      type: 'string',
      validation: {
        required: 'Name is required',
        pattern: {
          value: /^[A-Za-z\s]+$/,
          message: 'Name must contain only letters'
        }
      }
    }
  },
  { 
    field: 'age', 
    headerName: 'Age',
    fieldConfig: {
      type: 'number',
      validation: {
        required: 'Age is required',
        min: {
          value: 18,
          message: 'Age must be at least 18'
        },
        max: {
          value: 100,
          message: 'Age must be at most 100'
        }
      }
    }
  }
]
```

## Supported Validation Rules

Our validation system supports the following rules:

- `required`: Field is required (can be a boolean or a string message)
- `min`: Minimum value for numbers
- `max`: Maximum value for numbers
- `pattern`: RegExp pattern for strings
- `validate`: Custom validation function

## Row-Level Validation

In addition to field-level validation, you can provide row-level validation to implement cross-field validation rules:

```typescript
const validateEmployeeRow = (values) => {
  const errors = {};
  
  // Example: If department is Engineering (id: 1), age must be at least 21
  if (values.departmentId === 1 && values.age < 21) {
    errors.age = 'Engineering department requires age 21+';
  }
  
  return errors;
};

<EnhancedDataGrid
  columns={columns}
  rows={data}
  validateRow={validateEmployeeRow}
/>
```

## Form State Management

Each row being edited has its own form state that tracks:

- Values
- Dirty fields
- Validation errors
- Overall validity

This state is managed internally by the GridFormContext and exposed through hooks and props as needed.

## Visual Feedback

Validation errors are displayed with:

- Red border and background for invalid fields
- Green border and background for valid fields that have been changed
- Tooltips showing error messages

## API Reference

### ValidationOptions

```typescript
interface ValidationOptions {
  required?: string | boolean;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => string | boolean | Promise<string | boolean>;
}
```

### FieldConfig

```typescript
interface FieldConfig<T = any> {
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  options?: Array<{value: any, label: string}>; // For select fields
  validation?: ValidationOptions;
  renderViewMode?: (value: T | null, row: any) => React.ReactNode;
  renderEditMode?: (props: any) => React.ReactNode;
  parse?: (value: any) => T | null;
  format?: (value: T | null) => string;
}
```

### EnhancedDataGridProps

```typescript
interface EnhancedDataGridProps<T = any> {
  columns: EnhancedColumnConfig[];
  rows: T[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any) => Record<string, string> | Promise<Record<string, string>>;
  // ... other props
}
```

## Migration from react-hook-form

If you were previously using react-hook-form with our DataGrid, the migration should be seamless as we've maintained the same validation schema format and API. The only change is that you'll import types from our internal types instead of react-hook-form.
