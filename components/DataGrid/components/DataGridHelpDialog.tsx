import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';

interface DataGridHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export const DataGridHelpDialog: React.FC<DataGridHelpDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // Adjusted size for simpler content
      fullWidth
    >
      <DialogTitle>Using the Data Grid</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Editing Data</Typography>
        <Typography paragraph>
          To edit information in a cell, simply **double-click** it. Make your changes, and then click **Save** to keep them or **Cancel** to discard them.
        </Typography>

        <Typography variant="h6" gutterBottom>Adding New Rows</Typography>
        <Typography paragraph>
          Click the **Add** button to create a new row for entering data. Remember to click **Save** when you're done.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Other Actions</Typography>
        <Typography paragraph>
          - **Filter:** Use the filter button (<FilterAltIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />) to search across all columns in the grid.
        </Typography>
        <Typography paragraph>
          - **Export:** Click the export button (<FileDownloadIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />) to download the grid data. You can select specific rows using the checkboxes first if you only want to export those.
        </Typography>
        <Typography paragraph>
          - **Upload:** Use the upload button (<UploadIcon fontSize="inherit" sx={{ verticalAlign: 'middle' }} />) to import data from a file.
        </Typography>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};
