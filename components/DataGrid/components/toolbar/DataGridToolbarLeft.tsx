import React from 'react';
import { Stack } from '@mui/material';
import { AddRowButton } from './buttons/AddRowButton';
import { SaveButton } from './buttons/SaveButton';
import { CancelButton } from './buttons/CancelButton';
import { EditingStatus } from './status/EditingStatus';
import { ValidationSummary } from './status/ValidationSummary';
import { SelectionStatus } from './status/SelectionStatus';

interface DataGridToolbarLeftProps {
  hideAddButton?: boolean;
  hideSaveButton?: boolean;
  hideCancelButton?: boolean;
  hideEditingStatus?: boolean;
  hideValidationStatus?: boolean;
  hideSelectionStatus?: boolean;
  className?: string;
}

export const DataGridToolbarLeft: React.FC<DataGridToolbarLeftProps> = ({
  hideAddButton,
  hideSaveButton,
  hideCancelButton,
  hideEditingStatus,
  hideValidationStatus,
  hideSelectionStatus,
  className,
}) => {
  return (
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      className={className}
    >
      {!hideAddButton && <AddRowButton />}
      {!hideSaveButton && <SaveButton />}
      {!hideCancelButton && <CancelButton />}
      {!hideEditingStatus && <EditingStatus />}
      {!hideValidationStatus && <ValidationSummary />}
      {!hideSelectionStatus && <SelectionStatus />}
    </Stack>
  );
};
