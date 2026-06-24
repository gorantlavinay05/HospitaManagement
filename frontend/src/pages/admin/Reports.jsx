import React, { useState } from 'react';
import { useGetAppointmentsQuery } from '../../services/appointmentApi';
import { useGetDoctorsQuery } from '../../services/doctorApi';
import { useGetPatientsQuery } from '../../services/patientApi';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Button,
  TextField,
  MenuItem
} from '@mui/material';

import {
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const Reports = () => {
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointmentsQuery({
    status: statusFilter
  });
  const { data: doctorsData } = useGetDoctorsQuery();
  const { data: patientsData } = useGetPatientsQuery();

  const appointmentsList = appointmentsData?.data?.appointments || [];
  const doctorsList = doctorsData?.data?.doctors || [];
  const patientsList = patientsData?.data?.patients || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Administrative Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Report</Button>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handlePrint}>Export CSV</Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '6px solid #1a365d', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Doctors Registered</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{doctorsList.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '6px solid #0d9488', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Patient Accounts</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{patientsList.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '6px solid #f59e0b', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Appointments Logged</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{appointmentsList.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Appointment Log with Filters */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Appointment Schedule Log</Typography>
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

        {appointmentsLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Appointment Date & Slot</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointmentsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No appointment logs found.
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
                      <TableCell>{app.patientId?.name || 'Deleted Patient'}</TableCell>
                      <TableCell>{app.doctorId?.name || 'Deleted Doctor'}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Reports;
