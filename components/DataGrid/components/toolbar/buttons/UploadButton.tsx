import React from 'react';
import { Button, Tooltip } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

interface UploadButtonProps {
  onUpload?: () => void;
  disabled?: boolean;
  className?: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onUpload,
  disabled,
  className,
}) => {
  const handleClick = () => {
    if (!disabled && onUpload) {
      onUpload();
    }
  };

  return (
    <Tooltip title="Upload data">
      <span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadIcon />}
          onClick={handleClick}
          disabled={disabled}
          className={className}
          sx={{ 
            minWidth: 0, 
            px: 1
          }}
        >
          Upload
        </Button>
      </span>
    </Tooltip>
  );
};
