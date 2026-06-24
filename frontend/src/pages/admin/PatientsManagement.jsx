import React, { useState } from 'react';
import { useGetPatientsQuery, useUpdatePatientProfileMutation, useDeletePatientMutation, useTogglePatientStatusMutation } from '../../services/patientApi';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
  Alert,
  Chip,
  Button
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const PatientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Patients query
  const { data: patientsData, isLoading: patientsLoading } = useGetPatientsQuery({
    search: searchTerm
  });

  const [updatePatient, { isLoading: updateLoading }] = useUpdatePatientProfileMutation();
  const [deletePatient] = useDeletePatientMutation();
  const [toggleStatus] = useTogglePatientStatusMutation();

  const [openModal, setOpenModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null); // base user ID

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  const patientsList = patientsData?.data?.patients || [];

  const handleOpenEdit = (pat) => {
    setSelectedPatientId(pat.userId._id);
    setFormData({
      name: pat.userId.name,
      phone: pat.userId.phone,
      gender: pat.gender,
      dob: pat.dob ? pat.dob.split('T')[0] : '',
      bloodGroup: pat.bloodGroup,
      address: pat.address,
      emergencyName: pat.emergencyContact?.name || '',
      emergencyPhone: pat.emergencyContact?.phone || '',
      emergencyRelation: pat.emergencyContact?.relation || ''
    });
    setErrorMsg('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMsg('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await updatePatient({
        id: selectedPatientId,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation
        }
      }).unwrap();
      setOpenModal(false);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Error occurred while saving patient profile.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this patient profile?')) {
      await deletePatient(userId);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await toggleStatus({ id: userId, status: nextStatus });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Patient Management</Typography>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <TextField
          fullWidth
          placeholder="Search by patient name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Data Table */}
      {patientsLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Details</TableCell>
                <TableCell>Demographics</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Emergency Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No patients registered.
                  </TableCell>
                </TableRow>
              ) : (
                patientsList.map((pat) => (
                  <TableRow key={pat._id}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{pat.userId?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{pat.userId?.email}</Typography>
                        <Typography variant="body2" color="text.secondary">Ph: {pat.userId?.phone}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>Address: {pat.address}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography>{pat.gender}</Typography>
                        <Typography variant="body2" color="text.secondary">DOB: {new Date(pat.dob).toLocaleDateString()}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={pat.bloodGroup} color="secondary" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {pat.emergencyContact ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{pat.emergencyContact.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Ph: {pat.emergencyContact.phone}</Typography>
                          <Typography variant="body2" color="text.secondary">({pat.emergencyContact.relation})</Typography>
                        </Box>
                      ) : 'None'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pat.userId?.status === 'active' ? 'Active' : 'Inactive'}
                        color={pat.userId?.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Switch
                        checked={pat.userId?.status === 'active'}
                        onChange={() => handleStatusToggle(pat.userId?._id, pat.userId?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(pat)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(pat.userId?._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Editing Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Patient Profile</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  required
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Home Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main" sx={{ mt: 1, mb: 0.5, fontWeight: 700 }}>
                  Emergency Contact Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Relation"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={updateLoading}>
              {updateLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PatientsManagement;
