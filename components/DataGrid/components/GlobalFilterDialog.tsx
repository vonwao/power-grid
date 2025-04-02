import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Grid,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface GlobalFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: { month: string; department: string; name: string }) => void;
  // TODO: Add options for month and department if they are selects
  departmentOptions?: string[]; // Example: ['HR', 'Engineering', 'Sales']
}

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const GlobalFilterDialog: React.FC<GlobalFilterDialogProps> = ({
  open,
  onClose,
  onApply,
  departmentOptions = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance'], // Default example options
}) => {
  const [month, setMonth] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');

  const handleApply = () => {
    onApply({ month, department, name });
    // Optionally reset state after applying if needed
    // setMonth('');
    // setDepartment('');
    // setName('');
  };

  const handleCancel = () => {
    // Reset state on cancel? Or keep values? Let's keep them for now.
    onClose();
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setMonth(event.target.value as string);
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setDepartment(event.target.value as string);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Global Filter
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          {/* Birthday Month */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">Birthday Month:</Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth size="small">
                <InputLabel id="birthday-month-label">Select Month</InputLabel>
                <Select
                  labelId="birthday-month-label"
                  id="birthday-month-select"
                  value={month}
                  label="Select Month"
                  onChange={handleMonthChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Department */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">Department:</Typography>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth size="small">
                <InputLabel id="department-label">Select Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department-select"
                  value={department}
                  label="Select Department"
                  onChange={handleDepartmentChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Name */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">Name:</Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                id="name-filter"
                label="Enter Name"
                value={name}
                onChange={handleNameChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};
