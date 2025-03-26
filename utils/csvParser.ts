import Papa from 'papaparse';
import { GridColDef } from '@mui/x-data-grid';
import { EnhancedColumnConfig, FieldConfig } from '../components/DataGrid/EnhancedDataGrid';

interface ParsedCSVResult {
  columns: EnhancedColumnConfig[];
  rows: any[];
  error?: string;
}

/**
 * Infers the field type based on the value
 */
const inferFieldType = (value: string): 'string' | 'number' | 'boolean' | 'date' => {
  if (value === undefined || value === null || value === '') {
    return 'string';
  }

  // Check if boolean
  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return 'boolean';
  }

  // Check if number
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return 'number';
  }

  // Check if date (simple check for common date formats)
  const dateRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  if (dateRegex.test(value)) {
    return 'date';
  }

  // Default to string
  return 'string';
}

/**
 * Creates a field configuration based on the inferred type
 */
const createFieldConfig = (type: 'string' | 'number' | 'boolean' | 'date'): FieldConfig => {
  return {
    type,
    // Add default validation if needed
  };
}

/**
 * Parses CSV data and returns columns and rows for the grid
 */
export const parseCSV = (csvData: string): ParsedCSVResult => {
  try {
    // Parse CSV data
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors && result.errors.length > 0) {
      return {
        columns: [],
        rows: [],
        error: result.errors[0].message,
      };
    }

    if (!result.data || result.data.length === 0) {
      return {
        columns: [],
        rows: [],
        error: 'No data found in CSV',
      };
    }

    // Get headers from the first row
    const headers = result.meta.fields || [];
    
    if (headers.length === 0) {
      return {
        columns: [],
        rows: [],
        error: 'No headers found in CSV',
      };
    }

    // Sample the first row to infer types
    const firstRow = result.data[0] as Record<string, any>;
    
    // Create column definitions
    const columns: EnhancedColumnConfig[] = headers.map((header, index) => {
      const fieldType = inferFieldType(String(firstRow[header] || ''));
      
      return {
        field: header,
        headerName: header,
        width: 150,
        editable: true,
        fieldConfig: createFieldConfig(fieldType),
      };
    });

    // Add ID field if not present
    if (!headers.includes('id')) {
      // Add ID to each row
      result.data.forEach((row: any, index: number) => {
        row.id = index + 1;
      });
    }

    return {
      columns,
      rows: result.data,
    };
  } catch (error) {
    return {
      columns: [],
      rows: [],
      error: `Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Handles file upload and returns the file content as a string
 */
export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}