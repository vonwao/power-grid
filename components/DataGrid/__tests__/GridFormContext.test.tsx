import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GridFormProvider, useGridForm } from '../context/GridFormContext';

// Test component that uses the GridFormContext
const TestComponent = () => {
  const { 
    getFormMethods, 
    startEditingRow, 
    isRowEditing, 
    isRowDirty,
    updateCellValue
  } = useGridForm();
  
  // Start editing row 1 when the component mounts
  React.useEffect(() => {
    startEditingRow('1', 'name');
  }, [startEditingRow]);
  // We don't need to store the form reference
  const _form = getFormMethods('1');
  
  // Update a cell value
  const handleUpdateCell = () => {
    updateCellValue('1', 'name', 'New Name');
  };
  
  return (
    <div>
      <div data-testid="editing-status">
        {isRowEditing('1') ? 'Editing' : 'Not Editing'}
      </div>
      <div data-testid="dirty-status">
        {isRowDirty('1') ? 'Dirty' : 'Not Dirty'}
      </div>
      <button data-testid="update-button" onClick={handleUpdateCell}>
        Update Cell
      </button>
    </div>
  );
};

describe('GridFormContext', () => {
  const mockColumns = [
    { 
      field: 'id', 
      headerName: 'ID',
      fieldConfig: { type: 'number' as const }
    },
    { 
      field: 'name', 
      headerName: 'Name',
      fieldConfig: { type: 'string' as const }
    }
  ];
  
  const mockRows = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' }
  ];
  
  it('should initialize form and track editing state', async () => {
    render(
      <GridFormProvider 
        columns={mockColumns} 
        initialRows={mockRows}
      >
        <TestComponent />
      </GridFormProvider>
    );
    
    // Check that the row is being edited
    expect(screen.getByTestId('editing-status')).toHaveTextContent('Editing');
    
    // Initially the form should not be dirty
    expect(screen.getByTestId('dirty-status')).toHaveTextContent('Not Dirty');
    
    // Update a cell value
    fireEvent.click(screen.getByTestId('update-button'));
    
    // Now the form should be dirty
    await waitFor(() => {
      expect(screen.getByTestId('dirty-status')).toHaveTextContent('Dirty');
    });
  });
});
