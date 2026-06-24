import React, { useState } from 'react';
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../../services/appointmentApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Divider
} from '@mui/material';

import {
  CalendarMonth as UpcomingIcon,
  Assignment as HistoryIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';

const PatientDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, refetch } = useGetAppointmentsQuery({ patientId: user.id });
  const [cancelAppointment] = useUpdateAppointmentStatusMutation();

  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedDocName, setSelectedDocName] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const appointments = data?.data?.appointments || [];

  // Group upcoming and history
  const upcoming = appointments.filter(a => ['Pending', 'Approved'].includes(a.status));
  const history = appointments.filter(a => ['Completed', 'Cancelled', 'Rejected'].includes(a.status));

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment({ id, status: 'Cancelled' }).unwrap();
      refetch();
    }
  };

  const handleViewNotes = (app) => {
    setSelectedNotes(app.consultationNotes || 'No notes provided.');
    setSelectedDocName(app.doctorId?.name || 'Doctor');
    setOpenNotesDialog(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Hello, {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Check your upcoming schedules and past consultation reports
      </Typography>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Upcoming Bookings
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {upcoming.length}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex' }}>
                <UpcomingIcon sx={{ fontSize: 36, color: '#3b82f6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Completed Consultations
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {history.filter(h => h.status === 'Completed').length}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex' }}>
                <CompleteIcon sx={{ fontSize: 36, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Total Sessions Logged
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {appointments.length}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(26, 54, 93, 0.1)', display: 'flex' }}>
                <HistoryIcon sx={{ fontSize: 36, color: '#1a365d' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Appointments */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Upcoming Appointments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcoming.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No upcoming appointments.
                  </TableCell>
                </TableRow>
              ) : (
                upcoming.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell sx={{ fontWeight: 600 }}>{app.doctorId?.name}</TableCell>
                    <TableCell>{new Date(app.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{app.timeSlot}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        color={app.status === 'Approved' ? 'primary' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(app._id)}>
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Past Medical History */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Consultation History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Reports</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No historical consultations found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell sx={{ fontWeight: 600 }}>{app.doctorId?.name}</TableCell>
                    <TableCell>{new Date(app.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{app.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        size="small"
                        color={
                          app.status === 'Completed' ? 'success' :
                          app.status === 'Rejected' ? 'error' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {app.status === 'Completed' ? (
                        <Button variant="contained" color="secondary" size="small" onClick={() => handleViewNotes(app)}>
                          View Notes
                        </Button>
                      ) : app.status === 'Rejected' ? (
                        <Typography variant="body2" color="error.main" sx={{ fontSize: '0.8rem' }}>Reason: {app.rejectionReason}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Notes Modal */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Consultation Notes from Dr. {selectedDocName}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, borderLeft: '4px solid #0d9488' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedNotes}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenNotesDialog(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDashboard;
