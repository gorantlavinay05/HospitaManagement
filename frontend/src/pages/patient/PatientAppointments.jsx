import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import {
  useGetAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useRescheduleAppointmentMutation
} from '../../services/appointmentApi';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';

const PatientAppointments = () => {
  const user = useSelector(selectCurrentUser);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: appointmentsData, isLoading, refetch } = useGetAppointmentsQuery({
    patientId: user.id,
    status: statusFilter
  });

  const [cancelAppointment] = useUpdateAppointmentStatusMutation();
  const [reschedule, { isLoading: rescheduleLoading }] = useRescheduleAppointmentMutation();

  // Reschedule State
  const [openReschedDialog, setOpenReschedDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedSlot, setReschedSlot] = useState('');
  const [reschedError, setReschedError] = useState('');

  const appointmentsList = appointmentsData?.data?.appointments || [];

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment({ id, status: 'Cancelled' }).unwrap();
      refetch();
    }
  };

  const handleOpenReschedule = (app) => {
    setSelectedApp(app);
    setReschedDate(app.appointmentDate ? app.appointmentDate.split('T')[0] : '');
    setReschedSlot(app.timeSlot || '');
    setReschedError('');
    setOpenReschedDialog(true);
  };

  const handleReschedSubmit = async (e) => {
    e.preventDefault();
    setReschedError('');

    if (!reschedDate || !reschedSlot) {
      setReschedError('Please select both date and time slot.');
      return;
    }

    try {
      await reschedule({
        id: selectedApp._id,
        appointmentDate: reschedDate,
        timeSlot: reschedSlot
      }).unwrap();
      setOpenReschedDialog(false);
      refetch();
    } catch (err) {
      setReschedError(err.data?.message || 'Failed to reschedule. The slot may be taken.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">My Appointment Bookings</Typography>
        <TextField
          select
          label="Filter Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 180 }}
          size="small"
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appointment Date</TableCell>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                appointmentsList.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{new Date(app.appointmentDate).toLocaleDateString()}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.timeSlot}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{app.doctorId?.name}</TableCell>
                    <TableCell>{app.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        color={
                          app.status === 'Completed' ? 'success' :
                          app.status === 'Approved' ? 'primary' :
                          app.status === 'Pending' ? 'warning' :
                          'error'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {['Pending', 'Approved'].includes(app.status) && (
                          <>
                            <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenReschedule(app)}>
                              Reschedule
                            </Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(app._id)}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {app.status === 'Completed' && (
                          <Typography variant="body2" color="success.main">Finished</Typography>
                        )}
                        {app.status === 'Cancelled' && (
                          <Typography variant="body2" color="text.secondary">Cancelled</Typography>
                        )}
                        {app.status === 'Rejected' && (
                          <Typography variant="body2" color="error.main">Rejected</Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reschedule Modal */}
      <Dialog open={openReschedDialog} onClose={() => setOpenReschedDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reschedule Appointment</DialogTitle>
        <form onSubmit={handleReschedSubmit}>
          <DialogContent dividers>
            {reschedError && <Alert severity="error" sx={{ mb: 2 }}>{reschedError}</Alert>}
            <TextField
              fullWidth
              label="Consultation Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={reschedDate}
              onChange={(e) => setReschedDate(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              select
              label="Select Time Slot"
              value={reschedSlot}
              onChange={(e) => setReschedSlot(e.target.value)}
              required
            >
              {/* Load doctors slots */}
              {selectedApp?.doctorId?.availability?.timeSlots?.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              )) || [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM'
              ].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenReschedDialog(false)} variant="outlined">Close</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={rescheduleLoading}>
              {rescheduleLoading ? <CircularProgress size={24} /> : 'Reschedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PatientAppointments;
