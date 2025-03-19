
## When trying to edit number field

Unhandled Runtime Error


Error: MUI X: The cell with id=3 and field=age is not in view mode.

components/DataGrid/EnhancedDataGrid.tsx (178:34) @ Object.onCellClick [as current]


  176 |                 const column = columns.find(col => col.field === field);
  177 |                 if (column?.editable !== false) {
> 178 |                   apiRef.current.startCellEditMode({ id, field });
      |                                  ^
  179 |                 }
  180 |               }
  181 |             }}
Call Stack
13

Hide 12 ignore-listed frame(s)
useGridCellEditing.useCallback[throwIfNotInMode]
node_modules/@mui/x-data-grid/hooks/features/editing/useGridCellEditing.js (41:13)
useGridCellEditing.useCallback[startCellEditMode] [as startCellEditMode]
node_modules/@mui/x-data-grid/hooks/features/editing/useGridCellEditing.js (239:5)