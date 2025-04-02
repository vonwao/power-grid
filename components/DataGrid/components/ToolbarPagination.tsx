import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ToolbarPaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Toolbar Pagination Component - Saved for future reference
 * This component was originally part of UnifiedDataGridToolbar
 * but was removed in favor of using the built-in DataGrid pagination.
 */
export const ToolbarPagination: React.FC<ToolbarPaginationProps> = ({
  page,
  pageSize,
  totalRows,
  setPage,
  setPageSize,
}) => {
  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < Math.ceil(totalRows / pageSize)) {
      setPage(newPage);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">
        Page {page + 1} of {Math.max(1, Math.ceil(totalRows / pageSize))}
      </Typography>
      <IconButton 
        size="small"
        disabled={page === 0} 
        onClick={() => handlePageChange(page - 1)}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
      <IconButton 
        size="small"
        disabled={page >= Math.ceil(totalRows / pageSize) - 1} 
        onClick={() => handlePageChange(page + 1)}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
      <Select
        value={pageSize}
        onChange={handlePageSizeChange}
        size="small"
        sx={{ height: 28, minWidth: 80 }}
      >
        {[10, 25, 50, 100].map((size) => (
          <MenuItem key={size} value={size}>
            {size} rows
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};