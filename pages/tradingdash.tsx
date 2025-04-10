import React, { useCallback } from 'react';
import {
  GridColDef,
  GridRowId,
  GridRenderCellParams,
  useGridApiRef,
} from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { ValidationHelpers, GridFormProvider } from '../components/DataGrid/context/GridFormContext';
import { GridModeProvider } from '../components/DataGrid/context/GridModeContext';
import { CellEditHandler } from '../components/DataGrid/components';
import { useGridNavigation, useGraphQLData, useSelectionModel } from '../components/DataGrid/hooks';
import { EnhancedColumnConfig } from '../components/DataGrid/types/columnConfig';
import { FormAwareCellRenderer } from '../components/DataGrid/renderers/FormAwareCellRenderer';
import { EditCellRenderer } from '../components/DataGrid/renderers/EditCellRenderer';
import { CoreDataGrid } from '../components/DataGrid/CoreDataGrid';

export default function TradeAdjustmentsGrid() {
  const apiRef = useGridApiRef();

  // Column definitions with generic field names and validation rules
  const columns = [
    {
      field: 'trade_id',
      headerName: 'Trade ID',
      width: 80,
      editable: false,
      fieldConfig: {
        type: 'number' as const
      }
    },
    {
      field: 'transaction_key',
      headerName: 'Transaction Key',
      width: 180,
      editable: false,
      fieldConfig: {
        type: 'number' as const,
        validation: {
          required: 'Transaction Key is required'
        }
      }
    },
    {
      field: 'settlement_period',
      headerName: 'Settlement Period',
      width: 130,
      editable: false,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'contract_symbol',
      headerName: 'Contract Symbol',
      width: 150,
      editable: false,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'contract_id',
      headerName: 'Contract ID',
      width: 140,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'trade_strategy',
      headerName: 'Trade Strategy',
      width: 160,
      editable: true,
      fieldConfig: {
        type: 'string' as const,
        validation: {
          required: 'Strategy is required',
          pattern: {
            value: /^[A-Za-z\s]+$/,
            message: 'Strategy must contain only letters and spaces'
          },
          validate: (value: string) => {
            if (value && value.length < 3) {
              return 'Strategy must be at least 3 characters long';
            }
            if (value && value.length > 50) {
              return 'Strategy must be at most 50 characters long';
            }
            return true;
          },
        },
      }
    },
    {
      field: 'balance_sheet_segment',
      headerName: 'Balance Sheet Segment',
      width: 170,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'group_code',
      headerName: 'Group Code',
      width: 110,
      editable: true,
      fieldConfig: {
        type: 'number' as const,
        validation: {
          required: 'Group Code is required',
          min: {
            value: 1,
            message: 'Group Code must be greater than 0'
          },
          max: {
            value: 999999,
            message: 'Group Code must be at most 999,999'
          }
        }
      }
    },
    {
      field: 'segmentation',
      headerName: 'Segmentation',
      width: 140,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'mtm_label',
      headerName: 'MTM Label',
      width: 130,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'adjustment_flag',
      headerName: 'Adjustment Flag',
      width: 130,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'trade_level',
      headerName: 'Trade Level',
      width: 120,
      editable: true,
      fieldConfig: {
        type: 'number' as const
      }
    },
    {
      field: 'portfolio_name',
      headerName: 'Portfolio Name',
      width: 160,
      editable: true,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'last_modified_by',
      headerName: 'Last Modified By',
      width: 120,
      editable: false,
      fieldConfig: {
        type: 'string' as const
      }
    },
    {
      field: 'last_modified_on',
      headerName: 'Last Modified On',
      width: 180,
      editable: false,
      fieldConfig: {
        type: 'date' as const
      }
    }
  ];

  // Row-level validation for trade data
  const validateTradeRow = (values: any, helpers: ValidationHelpers) => {
    const errors: Record<string, string> = {};
    // Add validation logic as needed
    return errors;
  };

  // Handle save function (e.g., send updates to backend)
  const handleSave = (changes: { edits: any[], additions: any[] }) => {
    console.log('Saving changes:', changes);
    // Submit changes to API
  };

  // Toggle between GraphQL fetching and local data
  const useGraphQLFetching = false;

  const {
    rows: graphQLRows,
    totalRows: graphQLTotalRows,
    loading: graphQLLoading,
    setPage,
    setSortModel,
    setFilterModel,
    error: graphQLError,
  } = useGraphQLData({
    pageSize: 25,
    initialPage: 0,
    initialSortModel: [],
    initialFilterModel: {},
  });

  // Use GraphQL data if enabled, otherwise use local rows
  const displayRows = (useGraphQLFetching ? graphQLRows : rows) as Array<{ id: GridRowId } & Record<string, any>>;
  const totalRows = useGraphQLFetching ? graphQLTotalRows : rows.length;
  const loading = graphQLLoading;

  // Initialize selection model hook
  const { selectionModel, onSelectionModelChange: handleSelectionModelChange } = useSelectionModel({});

  // Navigation handler: switch cell to edit mode on key press
  const handleNavigate = useCallback((id: GridRowId, field: string) => {
    try {
      const cellMode = apiRef.current.getCellMode(id, field);
      if (cellMode === 'view') {
        apiRef.current.startCellEditMode({ id, field });
      }
    } catch (error) {
      console.error('Error navigating to cell:', error);
    }
  }, [apiRef]);

  const { handleKeyDown } = useGridNavigation({
    api: apiRef.current,
    columns,
    rows: displayRows,
    onNavigate: handleNavigate
  });

  // Convert enhanced columns to MUI data grid columns
  const gridColumns: GridColDef[] = columns.map(column => {
    return {
      ...column,
      renderCell: (params: GridRenderCellParams) => (
        <FormAwareCellRenderer
          params={params}
          column={column as EnhancedColumnConfig}
        />
      ),
      renderEditCell: (params: GridRenderCellParams) => (
        <EditCellRenderer
          params={params}
          column={column as EnhancedColumnConfig}
        />
      ),
    };
  });

  return (
    <div className="h-full w-full flex flex-col">
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <GridModeProvider
          totalRows={displayRows.length} // Set totalRows to the length of displayRows
          saveChanges={() => handleSave({ edits: [], additions: [] })}
          cancelChanges={() => console.log('Cancelling changes')}
          addRow={() => console.log('Adding row')}
          hasValidationErrors={false}
          canEditRows={true}
          canAddRows={false}
          canSelectRows={true}
          selectionModel={selectionModel}
          onSelectionModelChange={(newModel) => handleSelectionModelChange(newModel, { api: apiRef.current })}
        >
          <GridFormProvider
            columns={columns as EnhancedColumnConfig[]}
            initialRows={displayRows}
            onSave={handleSave}
            validateRow={validateTradeRow}
          >
            <CellEditHandler apiRef={apiRef} />
            <CoreDataGrid
              apiRef={apiRef}
              displayRows={displayRows}
              gridColumns={gridColumns}
              columns={columns as EnhancedColumnConfig[]}
              density="standard"
              disableSelectionOnClick={true}
              loading={loading}
              pageSize={25}
              rowsPerPageOptions={[10, 25, 50, 100]}
              useGraphQLFetching={useGraphQLFetching}
              totalRows={displayRows.length} // Set totalRows to the length of displayRows
              setPage={setPage}
              setSortModel={setSortModel}
              setFilterModel={setFilterModel}
              checkboxSelection={false}
              canSelectRows={true}
              selectionModel={selectionModel}
              handleSelectionModelChange={handleSelectionModelChange}
              disableMultipleSelection={false}
              canEditRows={true}
              handleKeyDown={handleKeyDown as any}
            />
          </GridFormProvider>
        </GridModeProvider>
      </Paper>
    </div>
  );
}

// Sample obfuscated row data with generic trading/finance values and a backstory of global trade adjustments
const rows = [
  {
    "settlement_period": "202504",
    "trade_time": "10:30",
    "source": "FUTURES",
    "portfolio_key": "9021",
    "portfolio_name": "Alpha Portfolio",
    "profit_center_key": "310",
    "profit_center": "Trading Ops",
    "business_unit_key": "DIV-XYZ",
    "business_unit": "XYZ Financial Group",
    "legal_entity_key": "9001",
    "legal_entity": "Alpha Holdings, Inc.",
    "enterprise_key": "Global-1",
    "counterparty_key": "34567",
    "counterparty": "Generic Bank",
    "transaction_key": "12345",
    "legacy_deal_type": "OPTION",
    "deal_type": "FUTURE",
    "trade_strategy": "Momentum",
    "contract_symbol": "202504",
    "contract_id": "ABC-TRD-001",
    "adjustment_flag": "Y",
    "cross_asset_flag": "",
    "cross_affiliate_flag": "N",
    "trade_volume": "50000",
    "currency": "USD",
    "market_value": "2500000.00",
    "premium": "",
    "price_type": "",
    "trade_price": "",
    "pricing_model": "Dynamic",
    "mtm_value_amt": "2495000.00",
    "trade_level": "1",
    "trade_type": "PHYSICAL",
    "internal_trade_flag": "",
    "special_flag": "",
    "segmentation": "Primary",
    "prepaid_flag": "",
    "option_type": "",
    "delta_volume": "",
    "product_code": "FIXED.INC",
    "exchange_id": "101",
    "exchange": "NYMEX",
    "product_id": "3001",
    "trade_date": "10:00",
    "settle_date": "10:00",
    "commodity": "COMMODITY",
    "group_code": "852",
    "bucket_strategy": "Swing Trading",
    "reporting_category": "Standard",
    "adjustment_description": "",
    "balance_sheet_segment": "Liability",
    "mtm_label": "",
    "id": "9876543210",
    "create_user": "userA",
    "create_date": "10:15",
    "modify_user": "",
    "modify_date": "",
    "pv_amount": "2500001.00",
    "accrued_interest": "",
    "rate_pay": "0.035",
    "rate_receive": "",
    "credit_rating": "BBB",
    "notional": "100000000",
    "unrealized_category": "",
    "days": "",
    "pay": "",
    "receive": "",
    "segment_payment_date": "",
    "reset_date": "",
    "settlement_rate": "",
    "floating_rate_1": "",
    "floating_rate_2": "",
    "fixed_cash_flow": "",
    "tier_type": "",
    "daily_run": "",
    "notional_value": "0",
    "direction": "Sell",
    "csa_key": "",
    "contract_year": "2025",
    "contract_month": "4",
    "contract_qtr": "1",
    "trade_year": "2024",
    "trade_month": "4",
    "trade_qtr": "1",
    "vintage_year": "",
    "treasury_flag": "Y",
    "sap_partner_center": "8001",
    "open_link_strategy_desc": "AlphaMomentum $2.5M",
    "open_link_deal_list": "111222333",
    "open_link_counterparty_type": "External",
    "fee_type": ""
  },
  {
    "settlement_period": "202505",
    "trade_time": "14:45",
    "source": "OPTIONS",
    "portfolio_key": "3045",
    "portfolio_name": "Beta Portfolio",
    "profit_center_key": "420",
    "profit_center": "Risk Management",
    "business_unit_key": "DIV-ABC",
    "business_unit": "ABC Financial Solutions",
    "legal_entity_key": "9002",
    "legal_entity": "Beta Capital, LLC",
    "enterprise_key": "Global-2",
    "counterparty_key": "45678",
    "counterparty": "Universal Finance",
    "transaction_key": "67890",
    "legacy_deal_type": "SWAP",
    "deal_type": "OPTION",
    "trade_strategy": "Arbitrage",
    "contract_symbol": "202505",
    "contract_id": "DEF-TRD-002",
    "adjustment_flag": "N",
    "cross_asset_flag": "",
    "cross_affiliate_flag": "Y",
    "trade_volume": "75000",
    "currency": "USD",
    "market_value": "3750000.00",
    "premium": "",
    "price_type": "",
    "trade_price": "",
    "pricing_model": "Static",
    "mtm_value_amt": "3745000.00",
    "trade_level": "2",
    "trade_type": "VIRTUAL",
    "internal_trade_flag": "",
    "special_flag": "",
    "segmentation": "Secondary",
    "prepaid_flag": "",
    "option_type": "",
    "delta_volume": "",
    "product_code": "FLOAT.VAR",
    "exchange_id": "202",
    "exchange": "CME",
    "product_id": "4001",
    "trade_date": "14:30",
    "settle_date": "14:30",
    "commodity": "EQUITY",
    "group_code": "963",
    "bucket_strategy": "Hedging",
    "reporting_category": "Enhanced",
    "adjustment_description": "",
    "balance_sheet_segment": "Asset",
    "mtm_label": "",
    "id": "1234567890",
    "create_user": "userB",
    "create_date": "14:50",
    "modify_user": "",
    "modify_date": "",
    "pv_amount": "3750001.00",
    "accrued_interest": "",
    "rate_pay": "",
    "rate_receive": "0.045",
    "credit_rating": "A",
    "notional": "200000000",
    "unrealized_category": "",
    "days": "",
    "pay": "",
    "receive": "",
    "segment_payment_date": "",
    "reset_date": "",
    "settlement_rate": "",
    "floating_rate_1": "",
    "floating_rate_2": "",
    "fixed_cash_flow": "",
    "tier_type": "",
    "daily_run": "",
    "notional_value": "0",
    "direction": "Buy",
    "csa_key": "",
    "contract_year": "2025",
    "contract_month": "5",
    "contract_qtr": "2",
    "trade_year": "2024",
    "trade_month": "5",
    "trade_qtr": "2",
    "vintage_year": "",
    "treasury_flag": "Y",
    "sap_partner_center": "9002",
    "open_link_strategy_desc": "BetaArb $3.75M",
    "open_link_deal_list": "444555666",
    "open_link_counterparty_type": "External",
    "fee_type": ""
  }
];
