import React, { useState } from 'react';
import { useGetDoctorsQuery } from '../../services/doctorApi';
import { useGetDepartmentsQuery } from '../../services/departmentApi';
import { useBookAppointmentMutation } from '../../services/appointmentApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Avatar,
  InputAdornment,
  Paper,
  Divider
} from '@mui/material';

import {
  Search as SearchIcon,
  LocalHospital as DoctorIcon,
  Star as ExperienceIcon,
  AttachMoney as FeeIcon
} from '@mui/icons-material';

const SearchDoctors = () => {
  const user = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Fetch lists
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({
    search: searchTerm,
    departmentId: deptFilter
  });
  const { data: deptsData } = useGetDepartmentsQuery();
  const [bookAppointment, { isLoading: bookingLoading }] = useBookAppointmentMutation();

  const doctorsList = doctorsData?.data?.doctors || [];
  const departmentsList = deptsData?.data?.departments || [];

  // Booking Modal State
  const [openBookModal, setOpenBookModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const handleOpenBooking = (doc) => {
    setSelectedDoc(doc);
    setAppointmentDate('');
    setTimeSlot('');
    setReason('');
    setBookingError('');
    setBookingSuccess('');
    setOpenBookModal(true);
  };

  const handleCloseBooking = () => {
    setOpenBookModal(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!appointmentDate || !timeSlot || !reason) {
      setBookingError('Please complete all fields');
      return;
    }

    try {
      await bookAppointment({
        doctorId: selectedDoc.userId._id,
        appointmentDate,
        timeSlot,
        reason
      }).unwrap();
      setBookingSuccess('Appointment request submitted successfully! Pending doctor approval.');
      setTimeout(() => {
        setOpenBookModal(false);
      }, 2000);
    } catch (err) {
      setBookingError(err.data?.message || 'Failed to book appointment. The slot may be taken.');
    }
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 4 }}>
        Find a Medical Specialist
      </Typography>

      {/* Directory filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Filter Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departmentsList.map((d) => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Grid listing */}
      {doctorsLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {doctorsList.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No doctors found matching the search criteria.</Typography>
              </Paper>
            </Grid>
          ) : (
            doctorsList.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>
                        {doc.userId?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {doc.userId?.name}
                        </Typography>
                        <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>
                          {doc.specialization}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doc.departmentId?.name || 'General Medicine'}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Qualification:</strong> {doc.qualification}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ExperienceIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        <Typography variant="body2">
                          <strong>Experience:</strong> {doc.experience} Years
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FeeIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography variant="body2">
                          <strong>Consultation Fee:</strong> ${doc.consultationFee}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Working Days:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {doc.availability?.workingDays.map(day => (
                          <Chip key={day} label={day} size="small" variant="outlined" color="primary" />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => handleOpenBooking(doc)}
                    >
                      Book Consultation
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Book Appointment Dialog */}
      <Dialog open={openBookModal} onClose={handleCloseBooking} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Book Appointment
        </DialogTitle>
        <form onSubmit={handleBookingSubmit}>
          <DialogContent dividers>
            {bookingError && <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>}
            {bookingSuccess && <Alert severity="success" sx={{ mb: 2 }}>{bookingSuccess}</Alert>}
            
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Booking with <strong>{selectedDoc?.userId?.name}</strong> ({selectedDoc?.specialization}) at consultation fee <strong>${selectedDoc?.consultationFee}</strong>.
            </Typography>

            <TextField
              fullWidth
              label="Select Consultation Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              select
              label="Select Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
              sx={{ mb: 3 }}
            >
              {selectedDoc?.availability?.timeSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Reason for Visit / Symptoms"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              required
              placeholder="e.g. Chest tightness or heart checkup"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseBooking} variant="outlined" disabled={bookingLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={bookingLoading || !!bookingSuccess}
            >
              {bookingLoading ? <CircularProgress size={24} /> : 'Book Appointment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SearchDoctors;
