import React, { useState } from 'react';
import {
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { GridRowId } from '@mui/x-data-grid';

interface TradingActionButtonsProps {
  // Grid state
  isInEditMode: boolean;
  selectionModel: GridRowId[];
  
  // Action handlers
  onFilter?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
}

export const TradingActionButtons: React.FC<TradingActionButtonsProps> = ({
  isInEditMode,
  selectionModel,
  onFilter,
  onExport,
  onUpload,
  onHelp,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle export with loading state
  const handleExport = async () => {
    if (onExport) {
      setIsLoading(true);
      try {
        await onExport();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        bgcolor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end', // Align buttons to the right
          alignItems: 'center',
          p: 1.5,
        }}
      >
        {/* Right section with action buttons - using same icons as original toolbar */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {onFilter && (
            <Tooltip title="Filter">
              <IconButton
                size="small"
                onClick={onFilter}
                disabled={isInEditMode}
                sx={{ opacity: isInEditMode ? 0.5 : 1 }}
              >
                <FilterAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip title="Export data">
              <IconButton
                size="small"
                onClick={handleExport}
                disabled={isInEditMode || isLoading}
                sx={{ opacity: isInEditMode ? 0.5 : 1 }}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <GridOnRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}

          {onUpload && (
            <Tooltip title="Upload data">
              <IconButton
                size="small"
                onClick={onUpload}
                disabled={isInEditMode}
                sx={{ opacity: isInEditMode ? 0.5 : 1 }}
              >
                <UploadRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onHelp && (
            <Tooltip title="Help">
              <IconButton
                size="small"
                onClick={onHelp}
                sx={{ color: 'inherit' }}
              >
                <HelpRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};