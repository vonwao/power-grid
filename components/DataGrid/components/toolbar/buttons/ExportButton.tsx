import React from 'react';
import { Button, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface ExportButtonProps {
  onExport?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled,
  className,
}) => {
  const handleClick = () => {
    if (!disabled && onExport) {
      onExport();
    }
  };

  return (
    <Tooltip title="Export data">
      <span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
          sx={{ 
            minWidth: 0, 
            px: 1
          }}
        >
          Export
        </Button>
      </span>
    </Tooltip>
  );
};
