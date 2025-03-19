import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridCellModesModel,
  GridCellModes,
  GridCellEditStopReasons,
  GridRenderEditCellParams,
  GridRenderCellParams,
  useGridApiRef,
  GridRowId,
  GridCellParams,
  GridEventListener,
  GridEditCellProps,
} from '@mui/x-data-grid';
import { 
  Autocomplete, 
  TextField, 
  Checkbox, 
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { employees, departments, Employee, getDepartmentLabel } from './data/mockData';

// Icons
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Types for validation
interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validate?: (value: any) => boolean;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface ValidationState {
  [field: string]: ValidationResult;
}

// Types for editing state
interface EditingChange {
  type: 'add' | 'edit';
  originalData?: Employee;
  currentData: Employee;
  validationState: ValidationState;
}

interface EditingState {
  mode: 'add' | 'edit' | 'none';
  pendingChanges: Map<GridRowId, EditingChange>;
  currentCell?: { rowId: GridRowId; field: string };
}

// Validation rules for Employee fields
const validationRules: ValidationRules = {
  name: {
    required: true,
    pattern: /^[A-Za-z\s]+$/,
    message: 'Name is required and must contain only letters',
  },
  age: {
    required: true,
    min: 18,
    max: 100,
    message: 'Age must be between 18 and 100',
  },
  departmentId: {
    required: true,
    message: 'Department is required',
  },
};

// Validation functions
const validateField = (field: string, value: any): ValidationResult => {
  const rules = validationRules[field];
  if (!rules) return { valid: true };

  // Check required
  if (rules.required && (value === null || value === undefined || value === '')) {
    return { valid: false, message: rules.message || 'This field is required' };
  }

  // Check min/max for numbers
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return { valid: false, message: rules.message || `Value must be at least ${rules.min}` };
    }
    if (rules.max !== undefined && value > rules.max) {
      return { valid: false, message: rules.message || `Value must be at most ${rules.max}` };
    }
  }

  // Check pattern for strings
  if (typeof value === 'string' && rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: rules.message || 'Invalid format' };
  }

  // Custom validation
  if (rules.validate && !rules.validate(value)) {
    return { valid: false, message: rules.message || 'Invalid value' };
  }

  return { valid: true };
};

const validateRow = (row: Employee): ValidationState => {
  const validationState: ValidationState = {};
  
  // Validate each field with rules
  Object.keys(validationRules).forEach((field) => {
    validationState[field] = validateField(field, row[field as keyof Employee]);
  });
  
  return validationState;
};

// Custom department cell editor component
function DepartmentEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, api } = props;
  
  const handleChange = (event: any, newValue: { id: number, label: string } | null) => {
    api.setEditCellValue({ id, field, value: newValue?.id || null });
    console.log('Department changed:', { 
      rowId: id, 
      field, 
      oldValue: value, 
      newValue: newValue?.id || null,
      departmentName: newValue?.label || null
    });
  };

  return (
    <Autocomplete
      autoFocus
      disablePortal
      id={`department-select-${id}`}
      options={departments}
      getOptionLabel={(option) => option.label}
      value={departments.find(dept => dept.id === value) || null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
      sx={{ width: '100%' }}
    />
  );
}

// Status panel component
interface EditStatusPanelProps {
  editingState: EditingState;
  onSave: () => void;
  onCancel: () => void;
  hasValidationErrors: boolean;
}

const EditStatusPanel = ({ 
  editingState, 
  onSave, 
  onCancel,
  hasValidationErrors
}: EditStatusPanelProps) => {
  const { mode, pendingChanges } = editingState;
  const changeCount = pendingChanges.size;
  
  // Only show when there are pending changes
  if (changeCount === 0 || mode === 'none') return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <Paper 
        elevation={3} 
        className={`
          rounded-full px-4 py-2 flex items-center space-x-2
          ${mode === 'add' ? 'bg-green-50' : 'bg-blue-50'}
          hover:shadow-lg transition-shadow
        `}
      >
        {/* Status icon */}
        <div className={`
          rounded-full w-8 h-8 flex items-center justify-center
          ${mode === 'add' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
        `}>
          {mode === 'add' ? <AddIcon /> : <EditIcon />}
        </div>
        
        {/* Status text */}
        <Typography variant="body2" className="font-medium">
          {mode === 'add' 
            ? 'Adding new record' 
            : `Editing ${changeCount} record${changeCount > 1 ? 's' : ''}`}
        </Typography>
        
        {/* Validation warning if needed */}
        {hasValidationErrors && (
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Validation errors
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-1">
          <Tooltip title={hasValidationErrors ? "Fix validation errors before saving" : "Save changes"}>
            <span>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={onSave}
                className="min-w-0 px-3"
                disabled={hasValidationErrors}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <IconButton 
            size="small" 
            onClick={onCancel}
            className="text-gray-500"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
};

// Main component
export default function EnhancedDataGridDemo() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Employee[]>(employees);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [editingState, setEditingState] = useState<EditingState>({
    mode: 'none',
    pendingChanges: new Map(),
  });
  
  // Check if there are any validation errors
  const hasValidationErrors = useMemo(() => {
    for (const change of editingState.pendingChanges.values()) {
      for (const result of Object.values(change.validationState)) {
        if (!result.valid) return true;
      }
    }
    return false;
  }, [editingState.pendingChanges]);

  // Get the next available ID for new records
  const getNextId = useCallback(() => {
    const maxId = Math.max(...rows.map(row => row.id), 0);
    return maxId + 1;
  }, [rows]);

  // Handle cell click to enter edit mode
  const handleCellClick = useCallback((params: GridCellParams) => {
    const { id, field, value } = params;
    
    // Skip editing for non-editable fields
    if (field === 'id') return;
    
    // Set cell to edit mode
    setCellModesModel((prevModel) => ({
      ...prevModel,
      [id]: {
        ...prevModel[id],
        [field]: { mode: GridCellModes.Edit },
      },
    }));
    
    // Update current cell in editing state
    setEditingState(prev => ({
      ...prev,
      currentCell: { rowId: id, field },
      mode: prev.mode === 'none' ? 'edit' : prev.mode,
    }));
    
    // If this is the first edit for this row, add it to pending changes
    if (!editingState.pendingChanges.has(id)) {
      const row = rows.find(r => r.id === id);
      if (row) {
        const newPendingChanges = new Map(editingState.pendingChanges);
        newPendingChanges.set(id, {
          type: 'edit',
          originalData: { ...row },
          currentData: { ...row },
          validationState: validateRow(row),
        });
        
        setEditingState(prev => ({
          ...prev,
          pendingChanges: newPendingChanges,
        }));
        
        console.log('Started editing row:', { 
          rowId: id, 
          field, 
          value,
        });
      }
    }
  }, [rows, editingState.pendingChanges]);

  // Handle cell edit start
  const handleCellEditStart = useCallback((params: GridCellParams) => {
    console.log('Cell edit started:', { 
      rowId: params.id, 
      field: params.field, 
      value: params.value,
    });
  }, []);

  // Handle cell edit stop
  const handleCellEditStop = useCallback((params: any, event: any) => {
    const { id, field, reason } = params;
    
    setCellModesModel((prevModel) => ({
      ...prevModel,
      [id]: {
        ...prevModel[id],
        [field]: { mode: GridCellModes.View },
      },
    }));
    
    if (reason === GridCellEditStopReasons.cellFocusOut) {
      console.log('Cell edit completed (focus out):', { 
        rowId: id, 
        field,
        reason,
      });
    }
  }, []);

  // Handle cell edit commit
  const handleCellEditCommit = useCallback((params: GridEditCellProps) => {
    const { id, field, value } = params;
    
    // Update the pending changes with the new value
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      const currentChange = newPendingChanges.get(id);
      
      if (currentChange) {
        // Update the current data with the new value
        const updatedData = {
          ...currentChange.currentData,
          [field]: value,
        };
        
        // Validate the updated field
        const validationResult = validateField(field, value);
        
        // Update the change in the map
        newPendingChanges.set(id, {
          ...currentChange,
          currentData: updatedData,
          validationState: {
            ...currentChange.validationState,
            [field]: validationResult,
          },
        });
        
        console.log('Cell value changed:', { 
          rowId: id, 
          field, 
          value,
          validationResult,
        });
        
        return {
          ...prev,
          pendingChanges: newPendingChanges,
        };
      }
      
      return prev;
    });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown: GridEventListener<'cellKeyDown'> = useCallback((params, event) => {
    const { id, field, cellMode } = params;
    
    // Only handle navigation in edit mode
    if (cellMode !== 'edit') return;
    
    // Get the current column index
    const columnFields = apiRef.current.getAllColumns().map(col => col.field);
    const currentColIndex = columnFields.indexOf(field);
    
    // Get all row IDs
    const rowIds = apiRef.current.getAllRowIds();
    const currentRowIndex = rowIds.indexOf(id);
    
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        
        // Move to next/previous editable field
        const direction = event.shiftKey ? -1 : 1;
        let nextColIndex = currentColIndex;
        let nextField = field;
        
        // Find the next/previous editable column
        do {
          nextColIndex += direction;
          if (nextColIndex < 0) {
            // Move to previous row, last column
            if (currentRowIndex > 0) {
              const prevRowId = rowIds[currentRowIndex - 1];
              setCellModesModel(prev => ({
                ...prev,
                [prevRowId]: {
                  ...prev[prevRowId],
                  [columnFields[columnFields.length - 1]]: { mode: GridCellModes.Edit },
                },
              }));
              event.preventDefault();
            }
            return;
          } else if (nextColIndex >= columnFields.length) {
            // Move to next row, first column
            if (currentRowIndex < rowIds.length - 1) {
              const nextRowId = rowIds[currentRowIndex + 1];
              // Find first editable column
              const firstEditableColIndex = columnFields.findIndex(
                colField => colField !== 'id'
              );
              if (firstEditableColIndex >= 0) {
                setCellModesModel(prev => ({
                  ...prev,
                  [nextRowId]: {
                    ...prev[nextRowId],
                    [columnFields[firstEditableColIndex]]: { mode: GridCellModes.Edit },
                  },
                }));
                event.preventDefault();
              }
            }
            return;
          }
          
          nextField = columnFields[nextColIndex];
        } while (nextField === 'id');
        
        // Set the next cell to edit mode
        setCellModesModel(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            [nextField]: { mode: GridCellModes.Edit },
          },
        }));
        break;
        
      case 'ArrowUp':
        // Move to the same field in the previous row
        if (currentRowIndex > 0) {
          const prevRowId = rowIds[currentRowIndex - 1];
          setCellModesModel(prev => ({
            ...prev,
            [prevRowId]: {
              ...prev[prevRowId],
              [field]: { mode: GridCellModes.Edit },
            },
          }));
          event.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        // Move to the same field in the next row
        if (currentRowIndex < rowIds.length - 1) {
          const nextRowId = rowIds[currentRowIndex + 1];
          setCellModesModel(prev => ({
            ...prev,
            [nextRowId]: {
              ...prev[nextRowId],
              [field]: { mode: GridCellModes.Edit },
            },
          }));
          event.preventDefault();
        }
        break;
    }
  }, [apiRef, rows]);

  // Add a new row
  const handleAddRow = useCallback(() => {
    const newId = getNextId();
    const newRow: Employee = {
      id: newId,
      name: '',
      age: 25,
      birthday: new Date(),
      active: true,
      departmentId: null,
    };
    
    // Add the new row to pending changes
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      newPendingChanges.set(newId, {
        type: 'add',
        currentData: newRow,
        validationState: validateRow(newRow),
      });
      
      return {
        mode: 'add',
        pendingChanges: newPendingChanges,
        currentCell: { rowId: newId, field: 'name' },
      };
    });
    
    // Add the row to the grid
    setRows(prev => [...prev, newRow]);
    
    // Set the name cell to edit mode
    setTimeout(() => {
      setCellModesModel({
        [newId]: {
          name: { mode: GridCellModes.Edit },
        },
      });
    }, 0);
    
    console.log('Added new row:', { newId });
  }, [getNextId]);

  // Save all pending changes
  const handleSave = useCallback(() => {
    // Prepare the payload for the API
    const edits: Array<{ id: number, changes: Partial<Employee> }> = [];
    const additions: Array<Omit<Employee, 'id'>> = [];
    
    // Process each pending change
    editingState.pendingChanges.forEach((change, id) => {
      if (change.type === 'edit' && change.originalData) {
        // For edits, only include the changed fields
        const changes: Partial<Employee> = {};
        let hasChanges = false;
        
        Object.keys(change.currentData).forEach(key => {
          const field = key as keyof Employee;
          if (JSON.stringify(change.currentData[field]) !== JSON.stringify(change.originalData![field])) {
            changes[field] = change.currentData[field];
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          edits.push({ id: Number(id), changes });
        }
      } else if (change.type === 'add') {
        // For additions, include all fields except id
        const { id, ...rest } = change.currentData;
        // Ensure departmentId is not null for the API payload
        if (rest.departmentId === null) {
          rest.departmentId = 1; // Default to Engineering if not set
        }
        additions.push(rest as Omit<Employee, 'id'>);
      }
    });
    
    // Create the batch save payload
    const payload = {
      action: 'batch',
      changes: {
        edits,
        additions,
      },
    };
    
    // Log the payload (simulating an API call)
    console.log('Batch save payload:', JSON.stringify(payload, null, 2));
    
    // Update the rows state with the changes
    setRows(prev => {
      const newRows = [...prev];
      
      // Apply edits
      edits.forEach(edit => {
        const index = newRows.findIndex(row => row.id === edit.id);
        if (index >= 0) {
          newRows[index] = { ...newRows[index], ...edit.changes };
        }
      });
      
      return newRows;
    });
    
    // Clear the editing state
    setEditingState({
      mode: 'none',
      pendingChanges: new Map(),
    });
    
    // Clear cell modes
    setCellModesModel({});
  }, [editingState.pendingChanges]);

  // Cancel all pending changes
  const handleCancel = useCallback(() => {
    // Revert rows to their original state for edits
    setRows(prev => {
      const newRows = [...prev];
      
      editingState.pendingChanges.forEach((change, id) => {
        if (change.type === 'edit' && change.originalData) {
          const index = newRows.findIndex(row => row.id === Number(id));
          if (index >= 0) {
            newRows[index] = { ...change.originalData };
          }
        } else if (change.type === 'add') {
          // Remove added rows
          return newRows.filter(row => row.id !== Number(id));
        }
      });
      
      return newRows;
    });
    
    // Clear the editing state
    setEditingState({
      mode: 'none',
      pendingChanges: new Map(),
    });
    
    // Clear cell modes
    setCellModesModel({});
    
    console.log('Cancelled all changes');
  }, [editingState.pendingChanges]);

  // Custom cell renderer with validation styling
  const renderCell = (params: GridRenderCellParams) => {
    const { id, field, value } = params;
    
    // Get validation state for this cell
    const change = editingState.pendingChanges.get(id);
    const validationResult = change?.validationState[field];
    
    // Default cell content
    let content;
    
    // Special rendering for department
    if (field === 'departmentId') {
      content = <span>{value === null || value === undefined ? '' : getDepartmentLabel(value as number)}</span>;
    } 
    // Special rendering for boolean values
    else if (field === 'active') {
      content = <Checkbox checked={value as boolean} disabled />;
    }
    // Special rendering for date values
    else if (field === 'birthday') {
      content = <span>{value instanceof Date ? value.toLocaleDateString() : value}</span>;
    }
    // Default rendering for other fields
    else {
      content = <span>{value}</span>;
    }
    
    // Apply validation styling if needed
    if (validationResult) {
      const style: React.CSSProperties = {};
      
      if (!validationResult.valid) {
        // Invalid field styling
        style.border = '1px solid red';
        style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        style.borderStyle = 'dotted';
        style.padding = '4px';
        style.borderRadius = '4px';
      } else if (change) {
        // Valid field styling
        style.border = '1px solid green';
        style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        style.padding = '4px';
        style.borderRadius = '4px';
      }
      
      return (
        <Tooltip title={validationResult.valid ? 'Valid' : validationResult.message || 'Invalid'}>
          <div style={style}>{content}</div>
        </Tooltip>
      );
    }
    
    return content;
  };

  // Column definitions with different data types
  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70, 
      editable: false 
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 180, 
      editable: true,
      type: 'string',
      renderCell: renderCell,
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100, 
      editable: true,
      type: 'number',
      renderCell: renderCell,
    },
    { 
      field: 'birthday', 
      headerName: 'Birthday', 
      width: 150, 
      editable: true,
      type: 'date',
      valueFormatter: (params: any) => {
        if (params.value === null || params.value === undefined) return '';
        return new Date(params.value).toLocaleDateString();
      },
      renderCell: renderCell,
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 120, 
      editable: true,
      type: 'boolean',
      renderCell: renderCell,
    },
    { 
      field: 'departmentId', 
      headerName: 'Department', 
      width: 220, 
      editable: true,
      renderCell: renderCell,
      renderEditCell: (params) => <DepartmentEditCell {...params} />,
    },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Paper elevation={1} className="p-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Typography variant="h5" className="text-center sm:text-left">
            Enhanced Data Grid Demo with Batch Editing
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            className="ml-auto"
          >
            Add New Record
          </Button>
        </div>
        
        <Box className="flex items-center mt-2">
          <Typography variant="body2" className="text-gray-600 mr-2">
            Instructions:
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Click to edit • Tab to navigate • Enter or click outside to save cell
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} className="flex-grow w-full">
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          onCellClick={handleCellClick}
          onCellEditStart={handleCellEditStart}
          onCellEditStop={handleCellEditStop}
          onCellModesModelChange={(model) => setCellModesModel(model)}
          onCellKeyDown={handleKeyDown}
          processRowUpdate={(newRow, oldRow) => {
            const id = newRow.id;
            Object.keys(newRow).forEach(field => {
              if (field !== 'id' && newRow[field as keyof Employee] !== oldRow[field as keyof Employee]) {
                // Type assertion to handle null values
                const value = newRow[field as keyof Employee];
                handleCellEditCommit({ id, field, value: value as any });
              }
            });
            return newRow;
          }}
          cellModesModel={cellModesModel}
          editMode="cell"
          isCellEditable={(params) => params.field !== 'id'}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          sx={{ 
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>
      
      {/* Floating status panel */}
      <EditStatusPanel 
        editingState={editingState}
        onSave={handleSave}
        onCancel={handleCancel}
        hasValidationErrors={hasValidationErrors}
      />
    </div>
  );
}
