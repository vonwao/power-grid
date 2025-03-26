import React, { useState, useRef, ChangeEvent } from 'react';
import { Button, TextField, Box, Typography, Paper, Divider, Alert } from '@mui/material';
import { readCSVFile } from '../utils/csvParser';

interface CSVInputProps {
  onCSVData: (csvData: string) => void;
}

export default function CSVInput({ onCSVData }: CSVInputProps) {
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCsvText(event.target.value);
    setError(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileName(file.name);
      const content = await readCSVFile(file);
      setCsvText(content);
      setError(null);
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      setError('Please enter or upload CSV data');
      return;
    }

    try {
      onCSVData(csvText);
    } catch (err) {
      setError(`Error importing CSV: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const sampleCSV = `name,email,age,active
John Doe,john@example.com,32,true
Jane Smith,jane@example.com,28,false`;

  return (
    <Paper elevation={2} className="p-4 mb-4">
      <Typography variant="h6" className="mb-2">
        Import CSV Data
      </Typography>
      
      <Box className="mb-4">
        <TextField
          label="Paste CSV data here"
          multiline
          rows={6}
          fullWidth
          value={csvText}
          onChange={handleTextChange}
          placeholder={sampleCSV}
          variant="outlined"
          className="mb-2"
        />
        
        <Box className="flex items-center mt-2">
          <Typography variant="body2" className="text-gray-600 mr-2">
            {fileName ? `File: ${fileName}` : 'Or upload a CSV file:'}
          </Typography>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleBrowseClick}
          >
            Browse...
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Divider className="my-3" />
      
      <Box className="flex justify-between items-center">
        <Typography variant="body2" className="text-gray-600">
          First row should contain column headers
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleImport}
          disabled={!csvText.trim()}
        >
          Import Data
        </Button>
      </Box>
    </Paper>
  );
}