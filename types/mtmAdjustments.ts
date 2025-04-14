// Type definitions for MTM Adjustments

// MTM Adjustment record type
export interface MTMAdjustment {
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

// Filter input type for GraphQL queries
export interface MTMAdjustmentFilterInput {
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

// Sort input type for GraphQL queries
export interface SortInput {
  field: string;
  direction: 'asc' | 'desc';
}