import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Tooltip, Divider, Typography, IconButton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HelpIcon from '@mui/icons-material/Help';

// Import individual components from the existing toolbar
import { AddRowButton } from '../../components/DataGrid/components/toolbar/buttons/AddRowButton';
import { SaveButton } from '../../components/DataGrid/components/toolbar/buttons/SaveButton';
import { CancelButton } from '../../components/DataGrid/components/toolbar/buttons/CancelButton';
import { EditingStatus } from '../../components/DataGrid/components/toolbar/status/EditingStatus';
import { ValidationSummary } from '../../components/DataGrid/components/toolbar/status/ValidationSummary';
import { SelectionStatus } from '../../components/DataGrid/components/toolbar/status/SelectionStatus';

// Import hooks for grid state management
import { useGridMode } from '../../components/DataGrid/context/GridModeContext';
import { useGridForm } from '../../components/DataGrid/context/GridFormContext';
import { IssueStatus } from '../types';

// Status change button component
const StatusChangeButton: React.FC = () => {
  const { mode, selectionModel } = useGridMode();
  const { updateCellValue } = useGridForm();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleStatusChange = (status: string) => {
    if (selectionModel.length > 0) {
      // Update the status of all selected rows one by one
      selectionModel.forEach(rowId => {
        updateCellValue(rowId, 'status', status);
      });
    }
    handleClose();
  };
  
  const isDisabled = mode === 'edit' || mode === 'add' || selectionModel.length === 0;
  
  return (
    <>
      <Tooltip title="Change status of selected issues">
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AssignmentIcon />}
            onClick={handleClick}
            disabled={isDisabled}
            sx={{ 
              opacity: isDisabled ? 0.5 : 1,
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Change Status
          </Button>
        </span>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleStatusChange(IssueStatus.OPEN)}>Open</MenuItem>
        <MenuItem onClick={() => handleStatusChange(IssueStatus.IN_PROGRESS)}>In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusChange(IssueStatus.RESOLVED)}>Resolved</MenuItem>
        <MenuItem onClick={() => handleStatusChange(IssueStatus.CLOSED)}>Closed</MenuItem>
      </Menu>
    </>
  );
};

interface IssueTrackerToolbarProps {
  onFilter?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
}

export const IssueTrackerToolbar: React.FC<IssueTrackerToolbarProps> = ({
  onFilter,
  onExport,
  onHelp,
}) => {
  const { mode } = useGridMode();
  const isInEditOrAddMode = mode === 'edit' || mode === 'add';
  
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
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: '#1976d2',
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Issue Tracker
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onHelp && (
            <Tooltip title="Help">
              <IconButton size="small" onClick={onHelp} sx={{ color: 'white' }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Main toolbar area */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1.5,
        }}
      >
        {/* Left section with standard components */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <AddRowButton />
          <SaveButton />
          <CancelButton />
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <EditingStatus />
          <ValidationSummary />
        </Box>
        
        {/* Right section with custom components */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <SelectionStatus />
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <StatusChangeButton />
          
          {onFilter && (
            <Tooltip title="Filter issues">
              <span>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={onFilter}
                  disabled={isInEditOrAddMode}
                  sx={{ 
                    opacity: isInEditOrAddMode ? 0.5 : 1,
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Filter
                </Button>
              </span>
            </Tooltip>
          )}
          
          {onExport && (
            <Tooltip title="Export issues">
              <span>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={onExport}
                  disabled={isInEditOrAddMode}
                  sx={{ 
                    opacity: isInEditOrAddMode ? 0.5 : 1,
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Export
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};
