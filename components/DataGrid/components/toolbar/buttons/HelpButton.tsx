import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { DataGridHelpDialog } from '../../../components/DataGridHelpDialog';

interface HelpButtonProps {
  onHelp?: () => void;
  disabled?: boolean;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  onHelp,
  disabled,
  className,
}) => {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      if (onHelp) {
        onHelp();
      } else {
        setIsHelpDialogOpen(true);
      }
    }
  };

  const handleHelpClose = () => {
    setIsHelpDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Help">
        <span>
          <IconButton
            size="small"
            onClick={handleClick}
            disabled={disabled}
            className={className}
            sx={{ 
              opacity: disabled ? 0.5 : 1
            }}
          >
            <HelpIcon />
          </IconButton>
        </span>
      </Tooltip>

      {!onHelp && (
        <DataGridHelpDialog
          open={isHelpDialogOpen}
          onClose={handleHelpClose}
        />
      )}
    </>
  );
};
