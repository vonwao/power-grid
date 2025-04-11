import React, { useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { EnhancedColumnConfig } from './DataGrid/EnhancedDataGridGraphQL';
import { EnhancedDataGridGraphQL as EnhancedDataGrid } from './DataGrid/EnhancedDataGridGraphQL';
import CSVInput from './CSVInput';
import { parseCSV } from '../utils/csvParser';

export default function CSVImportDataGridDemo() {
  const [columns, setColumns] = useState<EnhancedColumnConfig[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  const handleCSVData = (csvData: string) => {
    try {
      const result = parseCSV(csvData);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.columns.length === 0 || result.rows.length === 0) {
        setError('No valid data found in CSV');
        return;
      }
      
      setColumns(result.columns);
      setRows(result.rows);
      setError(null);
      setIsDataLoaded(true);
    } catch (err) {
      setError(`Error processing CSV data: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle save
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // In a real application, you might want to update the state or send to an API
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Paper elevation={1} className="p-3 shadow-sm">
        <Typography variant="h5">
          CSV Import Data Grid
        </Typography>
        
        <Box className="flex items-center mt-2">
          <Typography variant="body2" className="text-gray-600">
            Import CSV data to populate the grid
          </Typography>
        </Box>
      </Paper>

      <Box className="p-4">
        <CSVInput onCSVData={handleCSVData} />
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        {isDataLoaded && columns.length > 0 && rows.length > 0 ? (
          <Paper elevation={0} className="flex-grow w-full">
            <EnhancedDataGrid
              columns={columns}
              rows={rows}
              onSave={handleSave}
              autoHeight
            />
          </Paper>
        ) : !error && (
          <Paper elevation={0} className="p-8 text-center">
            <Typography variant="body1" color="textSecondary">
              Import CSV data to see it in the grid
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mt-2">
              The first row should contain column headers
            </Typography>
          </Paper>
        )}
      </Box>
    </div>
  );
}