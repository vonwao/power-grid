import React, { useState } from 'react';
import { Box } from '@mui/material';
import { GridFormProvider, useGridForm, GridModeProvider } from '../components/DataGrid/context'; // Added imports
import { EnhancedDataGridGraphQLCustom } from './components/EnhancedDataGridGraphQLCustom';
import { IssueTrackerToolbar } from './components/IssueTrackerToolbar';
import { issues, users, tags } from './mockData';
import { IssueStatus, IssuePriority, IssueType } from './types';

export default function IssueTrackerDemo() {
  const [useGraphQL, setUseGraphQL] = useState(true);
  const [selectionModel, setSelectionModel] = useState<any[]>([]);
  
  // Determine total rows (assuming client-side for now)
  const totalRows = issues.length;
  // Define capabilities (can be dynamic later)
  const canEditRows = true;
  const canAddRows = true;
  const canSelectRows = true;
  
  /**
   * Column Definitions:
   * Each column has configuration for:
   * - display (field, headerName, width)
   * - editability (editable)
   * - data type and validation (fieldConfig)
   */
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      editable: false,
      fieldConfig: {
        type: 'number' as const
      }
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 250,
      editable: true,
      fieldConfig: {
        type: 'string' as const,
        validation: {
          required: 'Title is required',
          validate: (value: string) => {
            if (value && value.length < 5) {
              return 'Title must be at least 5 characters long';
            }
            if (value && value.length > 100) {
              return 'Title must be at most 100 characters long';
            }
            return true;
          }
        }
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      editable: true,
      fieldConfig: {
        type: 'string' as const,
        validation: {
          validate: (value: string) => {
            if (value && value.length > 1000) {
              return 'Description must be at most 1000 characters long';
            }
            return true;
          }
        }
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: Object.values(IssueStatus).map(status => ({
          value: status,
          label: status
        })),
        validation: {
          required: 'Status is required'
        }
      }
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 120,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: Object.values(IssuePriority).map(priority => ({
          value: priority,
          label: priority
        })),
        validation: {
          required: 'Priority is required'
        }
      }
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 150,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: Object.values(IssueType).map(type => ({
          value: type,
          label: type
        })),
        validation: {
          required: 'Type is required'
        }
      }
    },
    { 
      field: 'assigneeId', 
      headerName: 'Assignee', 
      width: 180,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: [
          { value: undefined, label: 'Unassigned' },
          ...users.map(user => ({
            value: user.id,
            label: user.name
          }))
        ]
      }
    },
    { 
      field: 'reporterId', 
      headerName: 'Reporter', 
      width: 180,
      editable: true,
      fieldConfig: {
        type: 'select' as const,
        options: users.map(user => ({
          value: user.id,
          label: user.name
        })),
        validation: {
          required: 'Reporter is required'
        }
      }
    },
    { 
      field: 'createdDate', 
      headerName: 'Created Date', 
      width: 150,
      editable: false,
      fieldConfig: {
        type: 'date' as const
      }
    },
    { 
      field: 'dueDate', 
      headerName: 'Due Date', 
      width: 150,
      editable: true,
      fieldConfig: {
        type: 'date' as const,
        validation: {
          validate: (value: string) => {
            if (value) {
              const dueDate = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (dueDate < today) {
                return 'Due date must be in the future';
              }
            }
            return true;
          }
        }
      }
    },
    { 
      field: 'resolution', 
      headerName: 'Resolution', 
      width: 250,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    }
  ];

  /**
   * Row-Level Validation:
   * This function validates the entire row after individual field validation.
   * It's used for cross-field validation rules that can't be expressed
   * in individual field validation.
   */
  const validateIssueRow = (values: any) => {
    const errors: Record<string, string> = {};
    
    // Critical priority issues must have an assignee
    if (values.priority === IssuePriority.CRITICAL && !values.assigneeId) {
      errors.assigneeId = 'Critical issues must have an assignee';
    }
    
    // Resolved or Closed issues must have a resolution
    if ([IssueStatus.RESOLVED, IssueStatus.CLOSED].includes(values.status) && !values.resolution) {
      errors.resolution = 'Resolved or closed issues must have a resolution';
    }
    
    // Due dates can't be set for Closed issues
    if (values.status === IssueStatus.CLOSED && values.dueDate) {
      errors.dueDate = 'Closed issues cannot have a due date';
    }
    
    return errors;
  };

  /**
   * Save Handler:
   * Called when changes are saved in the grid.
   */
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // In production: Send to API, handle responses, update state
  };
  
  /**
   * Filter Handler:
   * Called when the filter button is clicked.
   */
  const handleFilter = () => {
    console.log('Filter clicked');
    // In production: Open filter dialog
  };
  
  /**
   * Export Handler:
   * Called when the export button is clicked.
   */
  const handleExport = () => {
    console.log('Export clicked');
    // In production: Export data to CSV/Excel
  };
  
  /**
   * Help Handler:
   * Called when the help button is clicked.
   */
  const handleHelp = () => {
    console.log('Help clicked');
    // In production: Show help dialog
  };
  
  return (
    <GridFormProvider
      columns={columns}
      initialRows={issues} // Pass initial data
      onSave={handleSave}
      validateRow={validateIssueRow}
      // isCompact can be determined here if needed, or passed down
    >
      <IssueTrackerContent
        selectionModel={selectionModel}
        handleSelectionModelChange={setSelectionModel}
        totalRows={totalRows}
        canEditRows={canEditRows}
        canAddRows={canAddRows}
        canSelectRows={canSelectRows}
        // Pass other necessary props if any
        useGraphQL={useGraphQL} // Pass useGraphQL down
        columns={columns} // Pass columns down for GridModeProvider logic if needed
        handleFilter={handleFilter} // Pass handlers down
        handleExport={handleExport}
        handleHelp={handleHelp}
      />
    </GridFormProvider>
  );
}

// Inner component to correctly scope useGridForm hook
const IssueTrackerContent = ({
  selectionModel,
  handleSelectionModelChange,
  totalRows,
  canEditRows,
  canAddRows,
  canSelectRows,
  useGraphQL,
  columns, // Receive columns
  handleFilter, // Receive handlers
  handleExport,
  handleHelp,
}: any) => { // Use 'any' for simplicity, refine props interface later
  const {
    saveChanges,
    cancelChanges,
    addRow,
    hasValidationErrors,
    isRowEditing,
    isRowDirty,
    // Get initialRows from context if needed, or assume it's handled internally
  } = useGridForm();

  return (
    <GridModeProvider
      totalRows={totalRows}
      initialMode="none" // Start in 'none' (view) mode
      saveChanges={saveChanges}
      cancelChanges={cancelChanges}
      addRow={addRow}
      hasValidationErrors={hasValidationErrors}
      isRowEditing={isRowEditing}
      isRowDirty={isRowDirty}
      canEditRows={canEditRows}
      canAddRows={canAddRows}
      canSelectRows={canSelectRows}
      selectionModel={selectionModel}
      onSelectionModelChange={handleSelectionModelChange}
    >
      <Box sx={{ width: '100%', height: '100%', p: 2 }}> {/* Removed flex layout for now */}
        {/* Custom toolbar */}
        <IssueTrackerToolbar
          onFilter={handleFilter}
          onExport={handleExport}
          onHelp={handleHelp}
          // Pass context-derived state/functions if toolbar needs them (e.g., mode, saveChanges)
        />
        
        {/* Data grid - remove props handled by GridFormProvider */}
        <Box sx={{ height: '80vh', mt: 2 }}> {/* Temporary fixed height for grid container */}
          <EnhancedDataGridGraphQLCustom
            columns={columns} // Pass columns
            rows={issues} // Pass rows (or let grid fetch if useGraphQL is true)
            // onSave and validateRow are handled by GridFormProvider
            useGraphQL={useGraphQL}
            checkboxSelection={true}
            selectionModel={selectionModel}
            onSelectionModelChange={handleSelectionModelChange}
            canAddRows={canAddRows} // Pass capability props
            canEditRows={canEditRows}
            canSelectRows={canSelectRows}
            rowHeight={40}
            pageSize={25}
            // totalRows is calculated internally by EnhancedDataGridGraphQLCustom
          />
        </Box>
        {/* Removed extra closing Box tag */}
      </Box> {/* Closing outer Box */}
    </GridModeProvider>
  );
}
