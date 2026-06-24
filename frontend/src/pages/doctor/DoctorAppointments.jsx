import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import {
  useGetAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useUpdateConsultationNotesMutation,
  useRescheduleAppointmentMutation
} from '../../services/appointmentApi';
import { useGetDoctorProfileQuery } from '../../services/doctorApi';
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
  Grid,
  Alert
} from '@mui/material';

const DoctorAppointments = () => {
  const user = useSelector(selectCurrentUser);
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: appointmentsData, isLoading, refetch } = useGetAppointmentsQuery({
    doctorId: user.id,
    status: statusFilter
  });
  
  const { data: profileData } = useGetDoctorProfileQuery();

  const [updateStatus] = useUpdateAppointmentStatusMutation();
  const [addNotes, { isLoading: notesLoading }] = useUpdateConsultationNotesMutation();
  const [reschedule, { isLoading: rescheduleLoading }] = useRescheduleAppointmentMutation();

  // Consultation Notes Dialog
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [notesAppId, setNotesAppId] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [notesError, setNotesError] = useState('');

  // Reschedule Dialog
  const [openReschedDialog, setOpenReschedDialog] = useState(false);
  const [reschedAppId, setReschedAppId] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedSlot, setReschedSlot] = useState('');
  const [reschedError, setReschedError] = useState('');

  const appointmentsList = appointmentsData?.data?.appointments || [];
  const doctorProfile = profileData?.data?.doctor || {};
  const activeSlots = doctorProfile.availability?.timeSlots || [];

  const handleStatusChange = async (id, status) => {
    if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
      await updateStatus({ id, status });
      refetch();
    }
  };

  // Notes triggers
  const handleOpenNotes = (app) => {
    setNotesAppId(app._id);
    setConsultationNotes(app.consultationNotes || '');
    setNotesError('');
    setOpenNotesDialog(true);
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    setNotesError('');
    if (!consultationNotes.trim()) {
      setNotesError('Consultation notes cannot be empty.');
      return;
    }

    try {
      await addNotes({ id: notesAppId, consultationNotes }).unwrap();
      setOpenNotesDialog(false);
      refetch();
    } catch (err) {
      setNotesError(err.data?.message || 'Error occurred while saving notes.');
    }
  };

  // Reschedule triggers
  const handleOpenReschedule = (app) => {
    setReschedAppId(app._id);
    setReschedDate(app.appointmentDate ? app.appointmentDate.split('T')[0] : '');
    setReschedSlot(app.timeSlot || '');
    setReschedError('');
    setOpenReschedDialog(true);
  };

  const handleReschedSubmit = async (e) => {
    e.preventDefault();
    setReschedError('');

    if (!reschedDate || !reschedSlot) {
      setReschedError('Please complete all fields.');
      return;
    }

    try {
      await reschedule({ id: reschedAppId, appointmentDate: reschedDate, timeSlot: reschedSlot }).unwrap();
      setOpenReschedDialog(false);
      refetch();
    } catch (err) {
      setReschedError(err.data?.message || 'Failed to reschedule appointment. The slot may be taken.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">My Appointments</Typography>
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
                <TableCell>Appointment Details</TableCell>
                <TableCell>Patient Details</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No appointments scheduled.
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
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{app.patientId?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.patientId?.phone}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{app.reason}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.consultationNotes || 'None'}
                      </Typography>
                    </TableCell>
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
                        {app.status === 'Pending' && (
                          <>
                            <Button variant="contained" color="success" size="small" onClick={() => handleStatusChange(app._id, 'Approved')}>Approve</Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleStatusChange(app._id, 'Rejected')}>Reject</Button>
                          </>
                        )}
                        {app.status === 'Approved' && (
                          <>
                            <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenNotes(app)}>Complete</Button>
                            <Button variant="outlined" color="primary" size="small" onClick={() => handleOpenReschedule(app)}>Reschedule</Button>
                          </>
                        )}
                        {app.status === 'Completed' && (
                          <Button variant="text" size="small" onClick={() => handleOpenNotes(app)}>View Notes</Button>
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

      {/* Consultation Notes Modal */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Consultation clinical notes</DialogTitle>
        <form onSubmit={handleNotesSubmit}>
          <DialogContent dividers>
            {notesError && <Alert severity="error" sx={{ mb: 2 }}>{notesError}</Alert>}
            <TextField
              fullWidth
              label="Enter Consultation Diagnosis & Prescription Notes"
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              multiline
              rows={6}
              required
              placeholder="e.g. Diagnosed with general fever. Prescribed Paracetamol 500mg, rest for 3 days."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenNotesDialog(false)} variant="outlined">Close</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={notesLoading}>
              {notesLoading ? <CircularProgress size={24} /> : 'Save & Mark Complete'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={openReschedDialog} onClose={() => setOpenReschedDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reschedule Appointment</DialogTitle>
        <form onSubmit={handleReschedSubmit}>
          <DialogContent dividers>
            {reschedError && <Alert severity="error" sx={{ mb: 2 }}>{reschedError}</Alert>}
            <TextField
              fullWidth
              label="Appointment Date"
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
              label="Select Available Time Slot"
              value={reschedSlot}
              onChange={(e) => setReschedSlot(e.target.value)}
              required
            >
              {activeSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenReschedDialog(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={rescheduleLoading}>
              {rescheduleLoading ? <CircularProgress size={24} /> : 'Reschedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DoctorAppointments;
