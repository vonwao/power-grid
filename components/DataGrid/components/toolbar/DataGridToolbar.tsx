import React from 'react';
import { Box } from '@mui/material';
import { DataGridToolbarLeft } from './DataGridToolbarLeft';
import { DataGridToolbarRight } from './DataGridToolbarRight';
import { FilterValues } from '../../components/GlobalFilterDialog';

interface DataGridToolbarProps {
  // Left section props
  hideAddButton?: boolean;
  hideSaveButton?: boolean;
  hideCancelButton?: boolean;
  hideEditingStatus?: boolean;
  hideValidationStatus?: boolean;
  hideSelectionStatus?: boolean;
  
  // Right section props
  onFilter?: (filters: FilterValues) => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
  hideFilterButton?: boolean;
  hideExportButton?: boolean;
  hideUploadButton?: boolean;
  hideHelpButton?: boolean;
  
  // Custom sections
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  
  // Custom buttons
  customFilterButton?: React.ReactNode;
  customExportButton?: React.ReactNode;
  customUploadButton?: React.ReactNode;
  customHelpButton?: React.ReactNode;
  
  className?: string;
}

export const DataGridToolbar: React.FC<DataGridToolbarProps> = ({
  // Left section props
  hideAddButton,
  hideSaveButton,
  hideCancelButton,
  hideEditingStatus,
  hideValidationStatus,
  hideSelectionStatus,
  
  // Right section props
  onFilter,
  onExport,
  onUpload,
  onHelp,
  hideFilterButton,
  hideExportButton,
  hideUploadButton,
  hideHelpButton,
  
  // Custom sections
  leftSection,
  rightSection,
  
  // Custom buttons
  customFilterButton,
  customExportButton,
  customUploadButton,
  customHelpButton,
  
  className,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
      className={className}
    >
      {leftSection || (
        <DataGridToolbarLeft
          hideAddButton={hideAddButton}
          hideSaveButton={hideSaveButton}
          hideCancelButton={hideCancelButton}
          hideEditingStatus={hideEditingStatus}
          hideValidationStatus={hideValidationStatus}
          hideSelectionStatus={hideSelectionStatus}
        />
      )}
      
      {rightSection || (
        <DataGridToolbarRight
          onFilter={onFilter}
          onExport={onExport}
          onUpload={onUpload}
          onHelp={onHelp}
          hideFilterButton={hideFilterButton}
          hideExportButton={hideExportButton}
          hideUploadButton={hideUploadButton}
          hideHelpButton={hideHelpButton}
          customFilterButton={customFilterButton}
          customExportButton={customExportButton}
          customUploadButton={customUploadButton}
          customHelpButton={customHelpButton}
        />
      )}
    </Box>
  );
};
