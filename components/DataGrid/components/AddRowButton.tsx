import React from 'react';
import { Button } from '@mui/material';
import { useGridForm } from '../context/GridFormContext';

// Add icon component
const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const AddRowButton: React.FC = () => {
  const { addRow } = useGridForm();
  
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={addRow}
      className="ml-auto"
    >
      Add New Record
    </Button>
  );
};
