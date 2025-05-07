import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

/**
 * EmptyStateOverlay component
 * 
 * Displays a message when no data is available due to conditional loading
 * with a button to open the filter panel
 */
interface EmptyStateOverlayProps {
  onFilterClick?: () => void;
}

export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({ 
  onFilterClick 
}) => {
  return (
    <Box 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
      }}
    >
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
    </Box>
  );
};