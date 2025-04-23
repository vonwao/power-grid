# Grid Reducer Architecture

This document outlines the new reducer-based architecture for the DataGrid component, which addresses several performance and state management issues in the current implementation.

## Overview

The new architecture uses a reducer pattern to manage state in a more predictable and efficient way. This approach offers several advantages:

1. **Centralized State Management**: All grid-related state is managed in a single location, making it easier to track changes and debug issues.
2. **Predictable State Updates**: State changes follow a clear action → reducer → state flow, reducing race conditions and unexpected behavior.
3. **Improved Performance**: By batching updates and preventing unnecessary re-renders, the grid performs better, especially with large datasets.
4. **Better Debugging**: Actions provide a clear history of what happened, making it easier to trace issues.

## Key Components

### 1. GridReducer

The `gridReducer.ts` file defines the state shape, actions, and reducer function for the grid. It handles all state transitions in a pure, predictable way.

```typescript
// Example of dispatching an action
dispatch({ type: 'ADD_ROW', payload: { row, columns } });
```

### 2. GridContextProvider

The `GridContextProvider.tsx` component wraps the reducer with React's context API, making the state and dispatch function available throughout the component tree. It also provides helper functions that abstract away the action dispatching details.

```typescript
// Using the context in a component
const { addRow, saveChanges, state } = useGridContext();
```

## Migration Guide

To migrate from the current context-based implementation to the new reducer architecture, follow these steps:

### Step 1: Replace Context Providers

Replace the existing context providers with the new `GridContextProvider`:

```tsx
// Before
<GridFormProvider columns={columns} initialRows={rows} onSave={handleSave}>
  <GridModeProvider>
    {children}
  </GridModeProvider>
</GridFormProvider>

// After
<GridContextProvider columns={columns} initialRows={rows} onSave={handleSave}>
  {children}
</GridContextProvider>
```

### Step 2: Update Context Consumers

Replace calls to `useGridForm` and `useGridMode` with `useGridContext`:

```tsx
// Before
const { addRow, saveChanges } = useGridForm();
const { mode, setMode } = useGridMode();

// After
const { addRow, saveChanges, state, setMode } = useGridContext();
const mode = state.mode;
```

### Step 3: Update DataGrid Component

Update the DataGrid component to use the new state management:

```tsx
// Before
<DataGrid
  rows={rows}
  checkboxSelection={checkboxSelection}
  rowSelectionModel={selectionModel}
  onRowSelectionModelChange={handleSelectionModelChange}
  // ...
/>

// After
<DataGrid
  rows={state.rows}
  checkboxSelection={checkboxSelection}
  rowSelectionModel={state.selectionModel}
  onRowSelectionModelChange={(newModel) => setSelectionModel(newModel)}
  // ...
/>
```

## Benefits of the New Architecture

### 1. Fixed Add Row Functionality

The new architecture fixes issues with the add row functionality by:
- Using a timestamp-based ID generation for better uniqueness
- Batching state updates to prevent race conditions
- Properly tracking new rows in the state

### 2. Fixed Selection Model

The selection model improvements include:
- Preventing unnecessary re-renders by checking if the selection has actually changed
- Using memoization to optimize performance
- Batching updates to prevent UI flickering

### 3. Fixed Filter UI Issues

The filter UI improvements include:
- Tracking when the filter panel is open to prevent unnecessary updates
- Delaying filter application to prevent UI flickering
- Using a more robust approach to filter model changes

## Performance Optimizations

The new architecture includes several performance optimizations:

1. **Memoized Selectors**: Computed properties are memoized to prevent unnecessary recalculations.
2. **Batched Updates**: State updates are batched to reduce re-renders.
3. **Efficient State Structure**: The state structure is designed to make common operations efficient.

## Future Improvements

Future improvements to the architecture could include:

1. **Middleware Support**: Add middleware for logging, analytics, or other cross-cutting concerns.
2. **Undo/Redo Support**: Implement undo/redo functionality by tracking action history.
3. **Persistence**: Add support for persisting grid state to localStorage or a backend.
4. **Virtual Scrolling Optimization**: Further optimize virtual scrolling for very large datasets.

## Conclusion

The new reducer-based architecture provides a solid foundation for the DataGrid component, addressing current issues and providing a path for future improvements. By centralizing state management and making state transitions more predictable, it improves both developer experience and end-user performance.