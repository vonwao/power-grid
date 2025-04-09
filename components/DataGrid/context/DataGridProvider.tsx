import React from 'react';
import { GridModeProvider } from './GridModeContext';
import { GridFormProvider } from './GridFormContext';

interface DataGridProviderProps {
  children: React.ReactNode;
  columns: any[];
  rows: any[];
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
}

export function DataGridProvider({ children, columns, rows, onSave }: DataGridProviderProps) {
  return (
    <GridModeProvider
      totalRows={rows.length}
      saveChanges={() => {}}
      cancelChanges={() => {}}
      addRow={() => {}}
      hasValidationErrors={false}
    >
      <GridFormProvider
        columns={columns}
        initialRows={rows}
        onSave={onSave}
      >
        {children}
      </GridFormProvider>
    </GridModeProvider>
  );
}
