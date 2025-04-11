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
  SelectChangeEvent, // Keep for Department Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs'; // Import Dayjs type

// Define the structure for the filters passed to onApply - Export it
export interface FilterValues {
  birthdayMonthYear: Dayjs | null; // Store the full Dayjs object or null
  department: string;
  name: string;
}

interface GlobalFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filterValues: FilterValues) => void; // Update onApply signature
  departmentOptions?: string[]; // Example: ['HR', 'Engineering', 'Sales']
}

// No longer need the months array

export const GlobalFilterDialog: React.FC<GlobalFilterDialogProps> = ({
  open,
  onClose,
  onApply,
  departmentOptions = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance'], // Default example options
}) => {
  // State for the DatePicker (month and year)
  const [birthdayMonthYear, setBirthdayMonthYear] = useState<Dayjs | null>(null);
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [birthdayError, setBirthdayError] = useState(false); // State for validation error

  const handleApply = () => {
    // Validation check
    if (!birthdayMonthYear) {
      setBirthdayError(true);
      return; // Prevent submission
    }
    
    // Clear error if validation passes
    setBirthdayError(false); 
    
    // Pass the state directly
    onApply({ birthdayMonthYear, department, name });
    // Optionally reset state after applying if needed
    // setBirthdayMonthYear(null); 
    // setDepartment('');
    // setName('');
  };

  const handleCancel = () => {
    // Reset state on cancel? Or keep values? Let's keep them for now.
    onClose();
  };

  // Handler for the DatePicker change
  const handleBirthdayChange = (newValue: Dayjs | null) => {
    setBirthdayMonthYear(newValue);
    // Clear error when user selects a date
    if (newValue) {
      setBirthdayError(false);
    }
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
        {/* Display validation error message */}
        {birthdayError && (
          <Typography color="error" variant="body2" sx={{ mb: 1, ml: 1 }}>
            Birthday month/year is required.
          </Typography>
        )}
        {/* Wrap content with LocalizationProvider */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
            {/* Birthday Month/Year DatePicker */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">Birthday:</Typography>
              </Grid>
              <Grid item xs={8}>
                <DatePicker
                  label="Select Month & Year"
                  views={['year', 'month']} // Show only year and month views
                  value={birthdayMonthYear}
                  onChange={handleBirthdayChange}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }} // Apply props to the underlying TextField
                />
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
      </LocalizationProvider> {/* Close LocalizationProvider */}
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
