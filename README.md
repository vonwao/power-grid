# Dual Grid Implementation Demo

This project demonstrates two different implementations of a data grid component with shared core functionality:

1. **MUI X Grid Implementation**: Using the Material UI X Data Grid component
2. **ag-Grid Implementation**: Using the ag-Grid Community Edition component

## Features

Both implementations share the following features:

- **Form Integration**: Seamless integration with form state management
- **Validation**: Field-level and row-level validation
- **Server-Side Operations**: Support for server-side pagination, sorting, and filtering
- **Multi-Row Selection**: Support for selecting multiple rows
- **Inline Editing**: Cell-based editing with validation
- **Large Dataset Support**: Efficient handling of large datasets (10K+ rows)

## Project Structure

The project is organized to maximize code reuse between the two implementations:

```
my-app/components/DataGrid/
├── core/                           # Shared code between implementations
│   ├── types/                      # Common type definitions
│   ├── hooks/                      # Shared hooks
│   ├── context/                    # Shared context providers
│   ├── utils/                      # Shared utilities
│   └── fieldTypes/                 # Field type definitions
├── mui-grid/                       # MUI X Grid implementation
│   ├── components/                 # MUI-specific components
│   ├── adapters/                   # Adapters for MUI Grid
│   └── EnhancedDataGrid.tsx        # MUI implementation
├── ag-grid/                        # ag-Grid implementation
│   ├── components/                 # ag-Grid-specific components
│   ├── adapters/                   # Adapters for ag-Grid
│   └── EnhancedDataGrid.tsx        # ag-Grid implementation
└── index.tsx                       # Main export with implementation selector
```

## Implementation Selector

The main `EnhancedDataGrid` component accepts an `implementation` prop that allows switching between the two implementations:

```tsx
<EnhancedDataGrid
  implementation="mui" // or "ag-grid"
  columns={columns}
  rows={rows}
  // ... other props
/>
```

## Server-Side Operations

Both implementations support server-side operations through a common interface:

```tsx
<EnhancedDataGrid
  serverSide={true}
  dataUrl="/api/employees"
  pageSize={25}
  // ... other props
/>
```

The server-side API follows a standard format for pagination, sorting, and filtering.

## Form Integration

Both implementations use a shared form context that manages:

- Form state for each row
- Validation state
- Dirty state tracking
- Row-level validation

## Comparison

### MUI X Grid Advantages

- Seamless integration with Material UI
- Simpler API for basic use cases
- Lighter weight

### ag-Grid Advantages

- Better performance with large datasets
- More advanced features (even in the free version)
- Better server-side support
- More customization options

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Pages

- `/`: Home page with links to demos
- `/original-demo`: Original implementation using MUI X Grid
- `/grid-demo`: Dual implementation demo with switcher

## License

This project is licensed under the MIT License.
