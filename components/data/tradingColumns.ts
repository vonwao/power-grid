import { EnhancedColumnConfig } from '../DataGrid/EnhancedDataGridGraphQL';

// Column definitions with generic field names and validation rules
export const tradingColumns: EnhancedColumnConfig[] = [
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