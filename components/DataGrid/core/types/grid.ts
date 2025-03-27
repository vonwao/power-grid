import { CoreColumnConfig } from './column';

/**
 * Validation helpers for row-level validation
 */
export interface ValidationHelpers {
  getFieldValue: (field: string) => any;
  setError: (field: string, message: string) => void;
}

/**
 * Core data grid props that are grid-implementation agnostic
 */
export interface CoreDataGridProps<T = any> {
  // Data
  columns: CoreColumnConfig[];
  rows: T[];
  
  // Events
  onSave?: (changes: { edits: any[], additions: any[] }) => void;
  validateRow?: (values: any, helpers: ValidationHelpers) => Record<string, string> | Promise<Record<string, string>>;
  
  // Server-side options
  serverSide?: boolean;
  dataUrl?: string;
  pageSize?: number;
  
  // Selection options
  checkboxSelection?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (selectionModel: any[]) => void;
  disableMultipleSelection?: boolean;
  disableSelectionOnClick?: boolean;
  
  // UI options
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  disableColumnFilter?: boolean;
  disableColumnMenu?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  disableVirtualization?: boolean;
  loading?: boolean;
  rowsPerPageOptions?: number[];
  showCellRightBorder?: boolean;
  showColumnRightBorder?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  hideFooterSelectedRowCount?: boolean;
  rowHeight?: number;
  
  // Additional props
  className?: string;
}

/**
 * Server-side data parameters
 */
export interface ServerSideParams {
  url: string;
  pageSize: number;
  page: number;
  sortModel?: { field: string; sort: 'asc' | 'desc' }[];
  filterModel?: Record<string, any>;
}

/**
 * Server-side data result
 */
export interface ServerSideResult<T> {
  rows: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setSortModel: (sortModel: { field: string; sort: 'asc' | 'desc' }[]) => void;
  setFilterModel: (filterModel: Record<string, any>) => void;
}