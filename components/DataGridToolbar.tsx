import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';

// Save icons
import SaveIcon from '@mui/icons-material/Save';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SaveAsIcon from '@mui/icons-material/SaveAs';

// Filter icons
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TuneIcon from '@mui/icons-material/Tune';

// Refresh icons
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import CachedIcon from '@mui/icons-material/Cached';

// Export icons
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DownloadIcon from '@mui/icons-material/Download';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';

// Upload icons
import UploadIcon from '@mui/icons-material/Upload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BackupIcon from '@mui/icons-material/Backup';
import PublishIcon from '@mui/icons-material/Publish';
import DriveFileUploadIcon from '@mui/icons-material/DriveFileUpload';

// Help icons
import HelpIcon from '@mui/icons-material/Help';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';

interface DataGridToolbarProps {
  onSave?: () => void;
  onFilter?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
  onHelp?: () => void;
}

export const DataGridToolbar: React.FC<DataGridToolbarProps> = ({
  onSave,
  onFilter,
  onRefresh,
  onExport,
  onUpload,
  onHelp
}) => {
  // You can change which icon variation you want to use by commenting/uncommenting
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-end',
      padding: 1,
      gap: 1
    }}>
      {/* Save Options */}
      <Tooltip title="Save">
        <IconButton onClick={onSave}>
          <SaveIcon />
          {/* Alternative icons:
          <SaveAltIcon />
          <SaveAsIcon /> */}
        </IconButton>
      </Tooltip>

      {/* Filter Options */}
      <Tooltip title="Filter">
        <IconButton onClick={onFilter}>
          <FilterListIcon />
          {/* Alternative icons:
          <FilterAltIcon />
          <TuneIcon /> */}
        </IconButton>
      </Tooltip>

      {/* Refresh Options */}
      <Tooltip title="Refresh">
        <IconButton onClick={onRefresh}>  
          <RefreshIcon />
          {/* Alternative icons:
          <SyncIcon />
          <CachedIcon /> */}
        </IconButton>
      </Tooltip>

      {/* Export Options */}
      <Tooltip title="Export">
        <IconButton onClick={onExport}>
          <FileDownloadIcon />
          {/* Alternative icons:
          <DownloadIcon />
          <ImportExportIcon />
          <SystemUpdateAltIcon />
          <FileUploadIcon /> */}
        </IconButton>
      </Tooltip>

      {/* Upload Options */}
      <Tooltip title="Upload">
        <IconButton onClick={onUpload}>
          <UploadIcon />
          {/* Alternative icons:
          <CloudUploadIcon />
          <BackupIcon />
          <PublishIcon />
          <DriveFileUploadIcon /> */}
        </IconButton>
      </Tooltip>

      {/* Help Options */}
      <Tooltip title="Help">
        <IconButton onClick={onHelp}>
          <HelpIcon />
          {/* Alternative icons:
          <HelpOutlineIcon />
          <InfoIcon /> */}
        </IconButton>
      </Tooltip>
    </Box>
  );
};