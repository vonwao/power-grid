import { useState, useCallback } from 'react';

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination({
  initialPage = 0,
  initialPageSize = 25,
  onPageChange,
  onPageSizeChange,
}: PaginationOptions = {}): PaginationState {
  // Initialize pagination state
  const [page, setInternalPage] = useState(initialPage);
  const [pageSize, setInternalPageSize] = useState(initialPageSize);
  
  // Handle page change
  const setPage = useCallback((newPage: number) => {
    setInternalPage(newPage);
    
    // Call external handler if provided
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [onPageChange]);
  
  // Handle page size change
  const setPageSize = useCallback((newPageSize: number) => {
    setInternalPageSize(newPageSize);
    
    // Call external handler if provided
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
    
    // Reset to first page when changing page size
    setInternalPage(0);
    if (onPageChange) {
      onPageChange(0);
    }
  }, [onPageChange, onPageSizeChange]);
  
  return {
    page,
    pageSize,
    setPage,
    setPageSize,
  };
}