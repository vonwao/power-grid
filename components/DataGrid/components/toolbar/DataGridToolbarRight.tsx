import React from 'react';
import { Stack } from '@mui/material';
import { FilterButton } from './buttons/FilterButton';
import { ExportButton } from './buttons/ExportButton';
import { UploadButton } from './buttons/UploadButton';
import { HelpButton } from './buttons/HelpButton';
import { FilterValues } from '../../components/GlobalFilterDialog';

interface DataGridToolbarRightProps {
  onFilter?: (filters: FilterValues) => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
  hideFilterButton?: boolean;
  hideExportButton?: boolean;
  hideUploadButton?: boolean;
  hideHelpButton?: boolean;
  customFilterButton?: React.ReactNode;
  customExportButton?: React.ReactNode;
  customUploadButton?: React.ReactNode;
  customHelpButton?: React.ReactNode;
  className?: string;
}

export const DataGridToolbarRight: React.FC<DataGridToolbarRightProps> = ({
  onFilter,
  onExport,
  onUpload,
  onHelp,
  hideFilterButton,
  hideExportButton,
  hideUploadButton,
  hideHelpButton,
  customFilterButton,
  customExportButton,
  customUploadButton,
  customHelpButton,
  className,
}) => {
  return (
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      className={className}
    >
      {!hideFilterButton && (
        customFilterButton || <FilterButton onFilter={onFilter} />
      )}
      {!hideExportButton && (
        customExportButton || <ExportButton onExport={onExport} />
      )}
      {!hideUploadButton && (
        customUploadButton || <UploadButton onUpload={onUpload} />
      )}
      {!hideHelpButton && (
        customHelpButton || <HelpButton onHelp={onHelp} />
      )}
    </Stack>
  );
};
