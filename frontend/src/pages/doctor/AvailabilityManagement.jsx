import React, { useState, useEffect } from 'react';
import { useGetDoctorProfileQuery, useUpdateDoctorProfileMutation } from '../../services/doctorApi';
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STANDARD_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM'
];

const AvailabilityManagement = () => {
  const { data, isLoading, refetch } = useGetDoctorProfileQuery();
  const [updateProfile, { isLoading: saveLoading }] = useUpdateDoctorProfileMutation();

  const [workingDays, setWorkingDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [alert, setAlert] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (data?.data?.doctor) {
      const avail = data.data.doctor.availability;
      setWorkingDays(avail?.workingDays || []);
      setTimeSlots(avail?.timeSlots || []);
    }
  }, [data]);

  const handleDayChange = (day) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSlotChange = (slot) => {
    setTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', msg: '' });

    if (workingDays.length === 0) {
      setAlert({ type: 'error', msg: 'Please select at least one working day.' });
      return;
    }
    if (timeSlots.length === 0) {
      setAlert({ type: 'error', msg: 'Please select at least one time slot.' });
      return;
    }

    try {
      await updateProfile({
        availability: { workingDays, timeSlots }
      }).unwrap();
      setAlert({ type: 'success', msg: 'Working schedule updated successfully!' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.data?.message || 'Failed to save availability settings.' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        Availability Management
      </Typography>

      {alert.msg && <Alert severity={alert.type} sx={{ mb: 3 }}>{alert.msg}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Working Days */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                Select Working Days
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormGroup>
                {DAYS_OF_WEEK.map((day) => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={workingDays.includes(day)}
                        onChange={() => handleDayChange(day)}
                        color="secondary"
                      />
                    }
                    label={day}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Time Slots */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                Select Time Slots
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormGroup>
                {STANDARD_SLOTS.map((slot) => (
                  <FormControlLabel
                    key={slot}
                    control={
                      <Checkbox
                        checked={timeSlots.includes(slot)}
                        onChange={() => handleSlotChange(slot)}
                        color="secondary"
                      />
                    }
                    label={slot}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={saveLoading}
              sx={{ px: 4 }}
            >
              {saveLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Availability'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AvailabilityManagement;
