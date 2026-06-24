import React, { useState } from 'react';
import { useGetAppointmentsQuery } from '../../services/appointmentApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

const DoctorPatients = () => {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading } = useGetAppointmentsQuery({ doctorId: user.id });

  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const appointments = data?.data?.appointments || [];

  // Group unique patients
  const patientsMap = {};
  appointments.forEach(app => {
    if (app.patientId && !patientsMap[app.patientId._id]) {
      patientsMap[app.patientId._id] = {
        details: app.patientId,
        appointments: []
      };
    }
    if (app.patientId) {
      patientsMap[app.patientId._id].appointments.push(app);
    }
  });

  const uniquePatientsList = Object.values(patientsMap);

  const handleOpenHistory = (patientObj) => {
    setSelectedPatient(patientObj);
    setOpenModal(true);
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 4 }}>
        My Patients
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableRowCell>Patient Name</TableRowCell>
              <TableRowCell>Email Address</TableRowCell>
              <TableRowCell>Phone</TableRowCell>
              <TableRowCell>Total Appointments</TableRowCell>
              <TableRowCell align="right">Actions</TableRowCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniquePatientsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No patients found in your records.
                </TableCell>
              </TableRow>
            ) : (
              uniquePatientsList.map((pat) => (
                <TableRow key={pat.details._id}>
                  <TableCell sx={{ fontWeight: 600 }}>{pat.details.name}</TableCell>
                  <TableCell>{pat.details.email}</TableCell>
                  <TableCell>{pat.details.phone}</TableCell>
                  <TableCell>{pat.appointments.length} Consults</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" color="primary" size="small" onClick={() => handleOpenHistory(pat)}>
                      View Medical History
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Patient Medical History Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Medical History: {selectedPatient?.details.name}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {selectedPatient?.appointments.map((app) => (
              <React.Fragment key={app._id}>
                <ListItem sx={{ py: 2, display: 'block' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Consultation Date: {new Date(app.appointmentDate).toLocaleDateString()}
                    </Typography>
                    <Chip label={app.status} size="small" color={app.status === 'Completed' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Reason: {app.reason}
                  </Typography>
                  {app.consultationNotes && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, borderLeft: '3px solid #0d9488' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'secondary.main', display: 'block', mb: 0.5 }}>
                        DIAGNOSIS & CLINICAL NOTES
                      </Typography>
                      <Typography variant="body2">{app.consultationNotes}</Typography>
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Simple wrapper to fix headings in nested Tables
const TableRowCell = ({ children, align }) => (
  <TableCell sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} align={align}>
    {children}
  </TableCell>
);

export default DoctorPatients;
