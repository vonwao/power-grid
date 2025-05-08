import { useState, useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import {
  GridRowId,
  GridPaginationModel,
  GridFilterModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { Paper, CircularProgress, Typography } from '@mui/material';
import {
  EnhancedDataGrid,
  EnhancedColumnConfig,
} from '../components/DataGrid'; // Updated import
import { getMTMAdjustmentColumns, LookupOptions } from './MTMHistoryColumns';
import { ActionButtons } from './MTMAdjustmentActionButtons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { FilterValues } from './DealFilter';
import MTMAdjustmentHeader from './MTMAdjustmentHeader';
 
interface MTMAdjustmentRow {
  id: string;
  deal_type: string;
  reporting_month: string;
  contract_month: string;
  adj_description: string;
  commodity: string;
  deal_volume: number;
  deal_number: string;
  contract_number: string;
  counterparty: string;
  strategy: string;
  fas_type: string;
  bucket_strategy: string;
  fas_161_label: string;
  fas_157_curve_rank: number;
  roll_off_classification: string;
  bs_netting_label: string;
  contract_id: number;
  portfolio: string;
  counterparty_type: string;
  contract_netting_flag: string;
  currency: string;
  created_by: string;
  credit_rating: string;
  cross_affiliate_flag: string;
  cross_commodity_flag: string;
  deal_key: string;
  direction: string;
  discounted_market_value: number;
  extraction_id: number;
  group_id: number;
  interface_header_id: number;
  legacy_deal_type: string;
  location: string;
  m2m_value_amt: number;
  modify_user: string;
  notional: number;
  notional_value: number;
  openlink_deal_key: number;
  phoenix_deal_key: string;
  portfolio_key: number;
  prepaid_premium_amount: number;
  product_code: string;
  pv_amount: number;
}
 
const GET_MTM_HISTORY = gql`
  query GetMtmHistory(
    $limit: Int
    $startKey: String
    $filter: MtmHistoryFilterInput
  ) {
    mtmHistory(limit: $limit, startKey: $startKey, filter: $filter) {
      items {
        id: accounting_mtm_history_id
        deal_type
        reporting_month
        contract_month
        contract_netting_flag
        adj_description
        fee_type
        unrealized_category
        legacy_deal_type
        location
        m2m_value_amt
        notional
        deal_key
        notional_value
        openlink_deal_key
        phoenix_deal_key
        counterparty
        counterparty_key
        counterparty_type
        created_by
        interface_header_id
        credit_rating
        cross_affiliate_flag
        cross_commodity_flag
        discounted_market_value
        currency
        commodity
        extraction_id
        deal_volume
        group_id
        direction
        product_code
        pv_amount
        deal_number
        portfolio
        portfolio_key
        prepaid_premium_amount
        strategy_id
        contract_id
        roll_off_classification
        strategy
        fas_157_curve_rank
        contract_number
        fas_type
        bs_netting_label
        bucket_strategy
        fas_161_label
      }
      lastEvaluatedKey
    }
  }
`;
 
const UPDATE_MTM_HISTORY = gql`
  mutation UpdateMtmHistory(
    $key: String!
    $updateExpression: String!
    $expressionAttributeValues: String!
  ) {
    updateMtmHistory(
      key: $key
      updateExpression: $updateExpression
      expressionAttributeValues: $expressionAttributeValues
    ) {
      accounting_mtm_history_id
      bucket_strategy
      bs_netting_label
      fas_161_label
      group_id
      roll_off_classification
      strategy_id
      fas_157_curve_rank
    }
  }
`;
 
// Define the GraphQL query to fetch lookup values
const GET_LOOKUP_VALUES = gql`
  query GetLookupValues($entityName: String!) {
    mtmHistoryByEntityName(entityName: $entityName) {
      sk
      value
    }
  }
`;
 
function useLookupOptions(entityName: string, valueKey: string) {
  const { data, loading, error } = useQuery(GET_LOOKUP_VALUES, {
    variables: { entityName },
  });
 
  return useMemo(() => {
    if (loading || error || !data) {
      return [];
    }
 
    return data.mtmHistoryByEntityName.map((item: any) => {
      const valueObj = JSON.parse(item.value);
      return { value: item.sk, label: valueObj[valueKey] };
    });
  }, [data, loading, error]);
}
 
interface MTMHistoryPageProps {
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
  setQueryData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  filterValues: FilterValues;
  onFilterApply: (newFilterValues: FilterValues) => void;
}
 
const MTMHistoryPage: React.FC<MTMHistoryPageProps> = ({
  setSelectedRows,
  filterValues,
  onFilterApply,
}) => {
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const filterModelRef = useRef<GridFilterModel>(filterModel);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 25,
    page: 0,
  });
  
  // State to track if data is loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rows, setRows] = useState<MTMAdjustmentRow[]>([]);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
 
  // Fetch lookup options using hooks
  const fas157Options = useLookupOptions(
    'fas_157_lookup',
    'fas_157_curve_rank'
  );
  const fas161Options = useLookupOptions('fas_161_lookup', 'fas_161_label');
  const bsNettingLabelOptions = useLookupOptions(
    'balance_sheet_label_lookup',
    'bs_netting_label'
  );
  //const dealTypeOptions = useLookupOptions('deal_type_lookup', 'deal_type');
  const bucketStrategyOptions = useLookupOptions(
    'bucket_strategy_lookup',
    'bucket_strategy'
  );
  const rolloffClassificationOptions = useLookupOptions(
    'rolloff_classification_lookup',
    'roll_off_classification'
  );
  const strategyOptions = useLookupOptions('strategy_lookup', 'strategy');
  const portfolioOptions = useLookupOptions('portfolio_lookup', 'portfolio');
 
  // Memoize the lookupOptions object to stabilize the columns dependency
  const lookupOptions: LookupOptions = useMemo(
    () => ({
      fas157Options,
      fas161Options,
      bsNettingLabelOptions,
      //dealTypeOptions,
      bucketStrategyOptions,
      rolloffClassificationOptions,
      strategyOptions,
      portfolioOptions,
    }),
    [
      fas157Options,
      fas161Options,
      bsNettingLabelOptions,
      //dealTypeOptions,
      bucketStrategyOptions,
      rolloffClassificationOptions,
      strategyOptions,
      portfolioOptions,
    ]
  );
 
  // Define columns - Now depends on the memoized lookupOptions
  const columns = useMemo(
    () => getMTMAdjustmentColumns(lookupOptions),
    [lookupOptions]
  );

  // Function to map GridFilterModel to GraphQL filter
  function mapGridFilterModelToGraphQLFilter(
    filterModel: GridFilterModel,
    sortModel: GridSortModel,
    columns: EnhancedColumnConfig[]
  ): any {
    const filter: any = {};
    const columnMap = new Map(columns.map((col) => [col.field, col]));
 
    filterModel.items.forEach((item) => {
      if (
        !item.field ||
        item.value === undefined ||
        item.value === null ||
        item.value === ''
      ) {
        return;
      }
 
      const apiField =
        item.field === 'id' ? 'accounting_mtm_history_id' : item.field;
      const column = columnMap.get(item.field);
 
      if (!column) {
        console.warn(
          `No column definition found for field: ${item.field}. Skipping filter.`
        );
        return;
      }
 
      const fieldType = column.fieldConfig?.type;
      const filterValue = item.value.toString();
 
      // Specific handling for fields that are 'select' in UI but Int in GraphQL
      if (apiField === 'fas_157_curve_rank') {
        try {
          const intValue = parseInt(filterValue, 10);
          if (!isNaN(intValue)) {
            filter[apiField] = intValue;
          } else {
            console.warn(
              `Failed to parse ${apiField} filter value as integer:`,
              filterValue
            );
          }
        } catch (e) {
          console.warn(`Error processing integer filter for ${apiField}:`, e);
        }
      } else {
        switch (fieldType) {
          case 'string': {
            // Specific handling for fields expecting a direct string match
            if (
              apiField === 'deal_key' ||
              apiField === 'contract_number' ||
              apiField === 'counterparty' ||
              apiField === 'counterparty_type' ||
              apiField === 'direction' ||
              apiField === 'created_by' ||
              apiField === 'discounted_market_value' ||
              apiField === 'credit_rating' ||
              apiField === 'cross_affiliate_flag' ||
              apiField === 'cross_commodity_flag' ||
              apiField === 'currency' ||
              apiField === 'commodity' ||
              apiField === 'contract_netting_flag'
            ) {
              filter[apiField] = filterValue;
            } else {
              filter[apiField] = { contains: filterValue, mode: 'insensitive' };
            }
            break;
          }
          case 'select': {
            filter[apiField] = filterValue;
            break;
          }
 
          case 'number': {
            try {
              const numValue = parseFloat(filterValue);
              if (isNaN(numValue)) {
                console.warn(
                  `Failed to parse ${apiField} filter value as number:`,
                  filterValue
                );
                break;
              }
 
              switch (item.operator) {
                case 'contains':
                case '=':
                  filter[apiField] = numValue;
                  break;
                case '>':
                  filter[apiField] = { gt: numValue };
                  break;
                case '>=':
                  filter[apiField] = { gte: numValue };
                  break;
                case '<':
                  filter[apiField] = { lt: numValue };
                  break;
                case '<=':
                  filter[apiField] = { lte: numValue };
                  break;
                case '!=':
                  filter[apiField] = { not: numValue };
                  break;
                default:
                  console.warn(
                    `Unsupported operator "${item.operator}" for number field ${apiField}. Defaulting to equality.`
                  );
                  filter[apiField] = numValue;
              }
            } catch (e) {
              console.warn(
                `Error processing number filter for ${apiField}:`,
                e
              );
            }
            break;
          }
 
          case 'date': {
            // Specific handling for reporting/contract month which expect YYYYMM integer
            if (
              apiField === 'reporting_month' ||
              apiField === 'contract_month'
            ) {
              try {
                let yearMonthInt: number | undefined;
                const cleanedValue = filterValue.replace(/\D/g, '');
                if (
                  cleanedValue.length === 6 &&
                  !isNaN(parseInt(cleanedValue, 10))
                ) {
                  yearMonthInt = parseInt(cleanedValue, 10);
                } else if (filterValue.match(/^\s*\d{4}-\d{2}/)) {
                  const match = filterValue.match(/^\s*(\d{4})-(\d{2})/);
                  if (match) {
                    const year = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10);
                    if (!isNaN(year) && !isNaN(month)) {
                      yearMonthInt = year * 100 + month;
                    }
                  }
                }
 
                if (yearMonthInt !== undefined && !isNaN(yearMonthInt)) {
                  // Use direct equality for the integer filter
                  filter[apiField] = yearMonthInt;
                } else {
                  console.warn(
                    `Could not parse ${apiField} date filter value to YYYYMM integer:`,
                    filterValue
                  );
                }
              } catch (e) {
                console.warn(
                  `Error processing integer date filter for ${apiField}:`,
                  e
                );
              }
            } else {
              filter[apiField] = { contains: filterValue };
            }
            break;
          }
 
          case 'boolean': {
            try {
              const boolValue =
                filterValue.toLowerCase() === 'true' || filterValue === '1';
              filter[apiField] = boolValue;
            } catch (e) {
              console.warn(
                `Error processing boolean filter for ${apiField}:`,
                e
              );
            }
            break;
          }
 
          default:
            console.warn(
              `Unknown field type "${fieldType}" for field ${apiField}. Treating as string contains.`
            );
            filter[apiField] = { contains: filterValue, mode: 'insensitive' };
        }
      } // End of the 'else' block for normal handling
    });
 
    if (sortModel.length > 0) {
      const sortField =
        sortModel[0].field === 'id'
          ? 'accounting_mtm_history_id'
          : sortModel[0].field;
      filter.sort = {
        field: sortField,
        order: sortModel[0].sort?.toUpperCase(),
      };
    }
    return filter;
  }
 
  function filterValuesToGraphQLFilter(filterValues: FilterValues): any {
    const filter: any = {};
 
    if (filterValues.reportingMonth) {
      // Format as YYYYMM integer
      filter.reporting_month = parseInt(
        filterValues.reportingMonth.format('YYYYMM'),
        10
      );
    }
 
    if (filterValues.contractMonth) {
      // Format as YYYYMM integer
      filter.contract_month = parseInt(
        filterValues.contractMonth.format('YYYYMM'),
        10
      );
    }
 
    if (filterValues.dealNumber) {
      // Parse as Float, handle potential parsing errors
      const dealNum = parseFloat(filterValues.dealNumber);
      if (!isNaN(dealNum)) {
        filter.deal_number = dealNum;
      } else {
        // Optionally handle invalid number input, e.g., log a warning or skip filter
        console.warn(`Invalid deal number input: ${filterValues.dealNumber}`);
      }
    }
 
    if (filterValues.contractNumber) {
      filter.contract_number = filterValues.contractNumber;
    }
 
    if (filterValues.accountingPortfolio) {
      filter.portfolio = filterValues.accountingPortfolio;
    }
 
    if (filterValues.counterparty) {
      filter.counterparty = filterValues.counterparty;
    }
 
    if (filterValues.strategy) {
      filter.strategy = filterValues.strategy;
    }
 
    return filter;
  }

  // Create a combined filter from both grid filters and deal filters
  const combinedFilter = useMemo(() => {
    return {
      ...mapGridFilterModelToGraphQLFilter(filterModel, sortModel, columns),
      ...filterValuesToGraphQLFilter(filterValues),
    };
  }, [filterModel, sortModel, columns, filterValues]);

  // Reference to the refetch function
  const refetchRef = useRef<() => Promise<any>>(() => Promise.resolve());
  
  // Function to set the page
  const setPage = useCallback((page: number) => {
    setPaginationModel(prev => ({
      ...prev,
      page
    }));
  }, []);

  // Store grid functions for external access
  const handleGridFunctionsInit = useCallback((
    refetch: () => Promise<any>,
    resetCursors: () => void,
    pageInfo: any
  ) => {
    refetchRef.current = refetch;
    setPageInfo(pageInfo);
  }, []);
 
  const handleFilterModelChange = useCallback(
    debounce((newFilterModel: GridFilterModel) => {
      setFilterModel(newFilterModel);
      filterModelRef.current = newFilterModel;
    }),
    []
  );
 
  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
  }, []);
 
  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
    },
    []
  );
 
  const [updateMtmHistory] = useMutation(UPDATE_MTM_HISTORY);
 
  const handleSave = useCallback(
    async (changes: { edits: any[]; additions: any[] }) => {
      for (const edit of changes.edits) {
        const { id, changes: rowChanges } = edit;
        const key = { accounting_mtm_history_id: id };
        const updateExpression = '';
        const expressionAttributeValues = JSON.stringify(rowChanges);
 
        try {
          await updateMtmHistory({
            variables: {
              key: JSON.stringify(key),
              updateExpression: updateExpression,
              expressionAttributeValues: expressionAttributeValues,
            },
          });
        } catch (error) {
          console.error(`Error updating row with id ${id}:`, error);
        }
      }
      refetchRef.current();
    },
    [updateMtmHistory]
  );
 
  const handleSelectionChange = useCallback(
    (newSelection: GridRowId[]) => {
      setSelectionModel(newSelection);
      setSelectedRows(newSelection as number[]);
    },
    [setSelectedRows]
  );
 
  const customActionButtons = useMemo(
    () => (
      <ActionButtons
        isInEditMode={false}
        selectionModel={selectionModel}
        hasActiveFilters={filterModel.items.some(
          (item) =>
            item.value !== undefined && item.value !== null && item.value !== ''
        )}
      />
    ),
    [selectionModel, filterModel]
  );
 
  if (loading && !rows.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Typography color="error">
          Error loading data: {error.message}
        </Typography>
      </div>
    );
  }
 
  return (
    <div className="h-full w-full flex flex-col p-4">
      <Paper elevation={0} className="flex-grow w-full overflow-auto">
        <MTMAdjustmentHeader
          selectedRows={selectionModel.map((row) => Number(row))}
          queryData={{
            limit: paginationModel.pageSize,
            page: paginationModel.page,
            filter: combinedFilter,
          }}
          filterValues={filterValues}
          onFilterApply={onFilterApply}
          onRefresh={() => refetchRef.current()}
        />
        
        {/* Using the new EnhancedDataGrid component */}
        <EnhancedDataGrid
          columns={columns}
          rows={[]} // We'll let the component fetch data via GraphQL
          
          // GraphQL options
          useGraphQL={true}
          query={GET_MTM_HISTORY}
          variables={{
            limit: paginationModel.pageSize,
            filter: combinedFilter,
          }}
          
          // New feature: conditional loading
          onlyLoadWithFilters={true}
          
          // Selection options
          checkboxSelection={true}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionChange}
          
          // Pagination options
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode="server"
          
          // Sorting and filtering
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          
          // Grid capabilities
          canEditRows={true}
          canAddRows={false}
          canSelectRows={true}
          
          // UI options
          density="standard"
          disableSelectionOnClick={true}
          disableColumnFilter={false}
          disableColumnMenu={false}
          
          // Custom components
          customToolbarActions={customActionButtons}
          
          // Event handlers
          onSave={handleSave}
          onGridFunctionsInit={handleGridFunctionsInit}
          
          // TODO: These props are not in the new component, consider if they're needed
          // openFilterPanel={true}
          // keepFilterPanelOpen={true}
        />
      </Paper>
    </div>
  );
};
 
export default MTMHistoryPage;