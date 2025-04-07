import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { GlobalFilterDialog, FilterValues } from '../../../components/GlobalFilterDialog';

interface FilterButtonProps {
  onFilter?: (filters: FilterValues) => void;
  disabled?: boolean;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onFilter,
  disabled,
  className,
}) => {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      setIsFilterDialogOpen(true);
    }
  };

  const handleFilterClose = () => {
    setIsFilterDialogOpen(false);
  };

  const handleFilterApply = (filters: FilterValues) => {
    onFilter?.(filters);
    setIsFilterDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Filter data">
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterAltIcon />}
            onClick={handleClick}
            disabled={disabled}
            className={className}
            sx={{ 
              minWidth: 0, 
              px: 1
            }}
          >
            Filter
          </Button>
        </span>
      </Tooltip>

      <GlobalFilterDialog
        open={isFilterDialogOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
      />
    </>
  );
};
