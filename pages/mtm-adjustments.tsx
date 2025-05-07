import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { Paper, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { gql } from '@apollo/client';
import { EnhancedDataGrid } from '../components/DataGrid';
import { ValidationHelpers } from '../components/DataGrid/context/GridFormContext';

// Define types directly in this file
interface MTMAdjustment {
  id: number;
  deal_key: number;
  reporting_month: string;
  contract_month: string;
  contract_number: string;
  bucket_strategy: string;
  bs_netting_label: string;
  group_id: number;
  rolloff_classification: string;
  fas_161_label: string;
  strategy: string;
  fas_157_curve_rank: number;
  portfolio: string;
  modified_by: string;
  modified_on: string;
}

interface MTMAdjustmentFilterInput {
  deal_key?: number | { eq?: number; lt?: number; gt?: number };
  reporting_month?: string | { contains?: string };
  contract_month?: string | { contains?: string };
  contract_number?: string | { contains?: string };
  bucket_strategy?: string | { contains?: string };
  bs_netting_label?: string | { contains?: string };
  group_id?: number | { eq?: number; lt?: number; gt?: number };
  rolloff_classification?: string | { contains?: string };
  fas_161_label?: string | { contains?: string };
  strategy?: string | { contains?: string };
  fas_157_curve_rank?: number | { eq?: number; lt?: number; gt?: number };
  portfolio?: string | { contains?: string };
  modified_by?: string | { contains?: string };
  modified_on?: string | { lt?: string; gt?: string };
}

interface SortInput {
  field: string;
  direction: 'asc' | 'desc';
}

// GraphQL query for fetching MTMAdjustments with pagination, sorting, and filtering
const GET_MTM_ADJUSTMENTS = gql`
  query GetMTMAdjustments(
    $page: Int
    $pageSize: Int
    $sort: SortInput
    $filter: MTMAdjustmentFilterInput
  ) {
    mtmAdjustments(
      page: $page
      pageSize: $pageSize
      sort: $sort
      filter: $filter
    ) {
      rows {
        id
        deal_key
        reporting_month
        contract_month
        contract_number
        bucket_strategy
        bs_netting_label
        group_id
        rolloff_classification
        fas_161_label
        strategy
        fas_157_curve_rank
        portfolio
        modified_by
        modified_on
      }
      totalRows
    }
  }
`;

// Define columns for MTM Adjustments
const mtmAdjustmentColumns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'deal_key',
    headerName: 'Deal Key',
    width: 120,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'reporting_month',
    headerName: 'Reporting Month',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'contract_month',
    headerName: 'Contract Month',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'contract_number',
    headerName: 'Contract Number',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'bucket_strategy',
    headerName: 'Bucket Strategy',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'bs_netting_label',
    headerName: 'BS Netting Label',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'group_id',
    headerName: 'Group ID',
    width: 120,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'rolloff_classification',
    headerName: 'Rolloff Classification',
    width: 180,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'fas_161_label',
    headerName: 'FAS 161 Label',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'strategy',
    headerName: 'Strategy',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'fas_157_curve_rank',
    headerName: 'FAS 157 Curve Rank',
    width: 180,
    fieldConfig: { type: 'number' as const },
  },
  {
    field: 'portfolio',
    headerName: 'Portfolio',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'modified_by',
    headerName: 'Modified By',
    width: 150,
    fieldConfig: { type: 'string' as const },
  },
  {
    field: 'modified_on',
    headerName: 'Modified On',
    width: 180,
    fieldConfig: { type: 'string' as const },
  },
];

// Sample data for client-side fallback
const sampleMTMAdjustments: MTMAdjustment[] = [
  {
    id: 1,
    deal_key: 12345,
    reporting_month: '2023-01',
    contract_month: '2023-02',
    contract_number: 'CN-001',
    bucket_strategy: 'Strategy A',
    bs_netting_label: 'Label 1',
    group_id: 100,
    rolloff_classification: 'Class A',
    fas_161_label: 'Label X',
    strategy: 'Hedge',
    fas_157_curve_rank: 2,
    portfolio: 'Portfolio A',
    modified_by: 'John Doe',
    modified_on: '2023-01-15',
  },
  {
    id: 2,
    deal_key: 67890,
    reporting_month: '2023-01',
    contract_month: '2023-03',
    contract_number: 'CN-002',
    bucket_strategy: 'Strategy B',
    bs_netting_label: 'Label 2',
    group_id: 200,
    rolloff_classification: 'Class B',
    fas_161_label: 'Label Y',
    strategy: 'Speculative',
    fas_157_curve_rank: 1,
    portfolio: 'Portfolio B',
    modified_by: 'Jane Smith',
    modified_on: '2023-01-20',
  },
];

// Custom toolbar actions
const CustomActions = () => {
  const handleAnalyticsClick = () => {
    console.log('Show analytics for current data');
    // Analytics logic
  };
  
  return (
    <Button
      startIcon={<BarChartIcon />}
      onClick={handleAnalyticsClick}
      size="small"
    >
      Analytics
    </Button>
  );
};

export default function MTMAdjustmentsPage() {
  // State for grid
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [useGraphQLFetching, setUseGraphQLFetching] = useState(true);
  
  // Row-level validation for MTM Adjustment data
  const validateMTMAdjustmentRow = (values: any, helpers: ValidationHelpers) => {
    const errors: Record<string, string> = {};
    // Add validation logic as needed
    return errors;
  };

  // Handle save function
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Submit changes to API
  };
  
  // Handler for selection changes
  const handleSelectionChange = (newSelection: GridRowId[]) => {
    setSelectionModel(newSelection);
  };

  // Custom variables for the GraphQL query
  const variables = {
    // Any additional variables needed for the query
  };

  return (
    <div className="h-full w-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">MTM Adjustments</h1>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useGraphQLFetching}
            onChange={(e) => setUseGraphQLFetching(e.target.checked)}
            className="mr-2"
          />
          Use GraphQL Fetching
        </label>
      </div>
      
      {/* Data Grid */}
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <EnhancedDataGrid
          columns={mtmAdjustmentColumns}
          rows={sampleMTMAdjustments} // Used as fallback when not using GraphQL
          onSave={handleSave}
          validateRow={validateMTMAdjustmentRow}
          
          // GraphQL options
          useGraphQL={useGraphQLFetching}
          query={GET_MTM_ADJUSTMENTS} // Pass the GraphQL query
          variables={variables} // Pass variables for the query
          
          // New features
          onlyLoadWithFilters={true}
          customToolbarActions={<CustomActions />}
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Grid capabilities
          canEditRows={true}
          canAddRows={true}
          canSelectRows={true}
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </div>
  );
}