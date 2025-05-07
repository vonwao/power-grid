import React from 'react';
import { Typography, Button } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export interface EmptyStateOverlayProps {
  onFilterClick?: () => void;
}

export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({ 
  onFilterClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <FilterAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6">No Results to Display</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        Apply filters to load data for this grid
      </Typography>
      {onFilterClick && (
        <Button 
          variant="outlined" 
          startIcon={<FilterAltIcon />} 
          onClick={onFilterClick}
          size="small"
        >
          Open Filters
        </Button>
      )}
    </div>
  );
};