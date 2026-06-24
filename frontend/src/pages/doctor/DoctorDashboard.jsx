import React, { useState } from 'react';
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../../services/appointmentApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
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
  TextField
} from '@mui/material';

import {
  PendingActions as PendingIcon,
  CheckCircle as CompletedIcon,
  CalendarMonth as TotalIcon
} from '@mui/icons-material';

const DoctorDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, refetch } = useGetAppointmentsQuery({ doctorId: user.id });
  const [updateStatus] = useUpdateAppointmentStatusMutation();

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const appointmentsList = data?.data?.appointments || [];

  // Compute Statistics
  const pendingCount = appointmentsList.filter(a => a.status === 'Pending').length;
  const completedCount = appointmentsList.filter(a => a.status === 'Completed').length;
  const approvedCount = appointmentsList.filter(a => a.status === 'Approved').length;
  const totalCount = appointmentsList.length;

  // Filter Today's Appointments
  const todayStr = new Date().toDateString();
  const todayAppointments = appointmentsList.filter(a => {
    return new Date(a.appointmentDate).toDateString() === todayStr;
  });

  const handleApprove = async (id) => {
    await updateStatus({ id, status: 'Approved' });
    refetch();
  };

  const handleOpenReject = (id) => {
    setSelectedAppId(id);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) return;
    await updateStatus({ id: selectedAppId, status: 'Rejected', reason: rejectionReason });
    setOpenRejectDialog(false);
    refetch();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Welcome, {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your schedule and consultations for today
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Pending Requests
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {pendingCount}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center' }}>
                <PendingIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Approved Schedule
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {approvedCount}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center' }}>
                <TotalIcon sx={{ fontSize: 36, color: '#3b82f6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Completed Consultations
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {completedCount}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center' }}>
                <CompletedIcon sx={{ fontSize: 36, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Appointments Table */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Today's Appointments ({new Date().toLocaleDateString()})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No appointments scheduled for today.
                  </TableCell>
                </TableRow>
              ) : (
                todayAppointments.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell sx={{ fontWeight: 600 }}>{app.patientId?.name}</TableCell>
                    <TableCell>{app.timeSlot}</TableCell>
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
                      {app.status === 'Pending' && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(app._id)}>
                            Approve
                          </Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleOpenReject(app._id)}>
                            Reject
                          </Button>
                        </Box>
                      )}
                      {app.status === 'Approved' && (
                        <Typography variant="body2" color="text.secondary">Ready for Consultation</Typography>
                      )}
                      {app.status === 'Completed' && (
                        <Typography variant="body2" color="success.main">Consultation Finished</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Reject Reason dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Appointment</DialogTitle>
        <DialogContent dividers sx={{ width: 400 }}>
          <TextField
            fullWidth
            label="Reason for Rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            required
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error" disabled={!rejectionReason}>
            Submit Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;
