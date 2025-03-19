# SelectField Implementation Fix Plan

## Problem Statement

There's an issue with the SelectField implementation in the DataGrid component. When the page loads, the table is showing numbers (keys) instead of the labels for those keys in the Department column.

## Current Implementation Analysis

Looking at the code flow:

1. In `EnhancedDataGridDemo.tsx`, we have a column configuration for the department field:
```typescript
{ 
  field: 'departmentId', 
  headerName: 'Department',
  fieldConfig: {
    type: 'select' as const,
    options: departments.map(dept => ({
      value: dept.id,
      label: dept.label
    }))
  }
}
```

2. In `CellRenderer.tsx`, the rendering logic is:
```typescript
let content: React.ReactNode;
if (column.fieldConfig?.renderViewMode) {
  content = column.fieldConfig.renderViewMode(value, row);
} else if (column.fieldType?.renderViewMode) {
  content = column.fieldType.renderViewMode(value, row);
} else {
  // Default rendering
  content = value != null ? String(value) : '';
}
```

3. In `SelectField.tsx`, we have a class that implements rendering logic:
```typescript
renderViewMode(value: T | null, row: any) {
  if (value === null || value === undefined) return <span></span>;
  
  const option = this.options.find(opt => opt[this.valueKey] === value);
  return <span>{option ? option[this.labelKey] : String(value)}</span>;
}
```

## Root Cause

The issue is that the `SelectFieldType` class is never being instantiated and attached to the column configuration. The `fieldConfig` object in the column definition doesn't have a `renderViewMode` method, and the `fieldType` property isn't being set to an instance of `SelectFieldType`.

As a result, the renderer falls back to the default rendering logic: `content = value != null ? String(value) : ''`, which just converts the numeric department ID to a string.

## Proposed Solutions

### Solution 1: Add a renderViewMode to fieldConfig

Modify the `EnhancedDataGridDemo.tsx` file to include a custom `renderViewMode` method in the `fieldConfig` for the select field:

```typescript
fieldConfig: {
  type: 'select' as const,
  options: departments.map(dept => ({
    value: dept.id,
    label: dept.label
  })),
  renderViewMode: (value: any) => {
    const option = departments.find(dept => dept.id === value);
    return <span>{option ? option.label : String(value)}</span>;
  }
}
```

### Solution 2: Create and attach a SelectFieldType instance

Modify the `EnhancedDataGrid.tsx` file to create and attach a `SelectFieldType` instance to the column configuration for select fields:

```typescript
// In EnhancedDataGrid.tsx, before creating gridColumns
import { SelectFieldType } from './fieldTypes/SelectField';

// Inside the EnhancedDataGrid function, before mapping columns to gridColumns
columns.forEach(column => {
  if (column.fieldConfig?.type === 'select' && !column.fieldType) {
    column.fieldType = new SelectFieldType({
      options: column.fieldConfig.options || [],
      valueKey: 'value',
      labelKey: 'label'
    });
  }
});
```

### Solution 3: Modify the CellRenderer

Modify the `CellRenderer.tsx` file to handle select fields specially:

```typescript
if (column.fieldConfig?.type === 'select' && value != null) {
  const options = column.fieldConfig.options || [];
  const option = options.find(opt => opt.value === value);
  content = option ? option.label : String(value);
} else if (column.fieldConfig?.renderViewMode) {
  content = column.fieldConfig.renderViewMode(value, row);
} else if (column.fieldType?.renderViewMode) {
  content = column.fieldType.renderViewMode(value, row);
} else {
  content = value != null ? String(value) : '';
}
```

## Recommendation

Solution 2 is the most elegant and reusable approach. It leverages the existing `SelectFieldType` class without requiring changes to every select field definition or modifying the core rendering logic.

## Implementation Steps

1. Import the `SelectFieldType` class in `EnhancedDataGrid.tsx`
2. Add code to instantiate the `SelectFieldType` for select fields before mapping columns to gridColumns
3. Test the implementation to ensure that the labels are displayed correctly

## Potential Challenges

- Ensuring that the `SelectFieldType` class is correctly instantiated with the right options
- Handling cases where the options might have different property names than 'value' and 'label'
- Ensuring that the `SelectFieldType` class is only instantiated once per column