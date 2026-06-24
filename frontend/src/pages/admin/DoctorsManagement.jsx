import React, { useState } from 'react';
import { useGetDoctorsQuery, useCreateDoctorMutation, useUpdateDoctorProfileMutation, useDeleteDoctorMutation, useToggleDoctorStatusMutation } from '../../services/doctorApi';
import { useGetDepartmentsQuery } from '../../services/departmentApi';
import {
  Box,
  Typography,
  Button,
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
  InputAdornment
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const DoctorsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Fetch doctors and departments
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery({
    search: searchTerm,
    departmentId: selectedDeptFilter
  });
  const { data: deptsData } = useGetDepartmentsQuery();

  const [createDoctor, { isLoading: createLoading }] = useCreateDoctorMutation();
  const [updateDoctor, { isLoading: updateLoading }] = useUpdateDoctorProfileMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [toggleStatus] = useToggleDoctorStatusMutation();

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null); // base user ID

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    departmentId: ''
  });

  const doctorsList = doctorsData?.data?.doctors || [];
  const departmentsList = deptsData?.data?.departments || [];

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedDoctorId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      qualification: '',
      experience: '',
      consultationFee: '',
      departmentId: departmentsList[0]?._id || ''
    });
    setErrorMsg('');
    setOpenModal(true);
  };

  const handleOpenEdit = (doc) => {
    setEditMode(true);
    setSelectedDoctorId(doc.userId._id);
    setFormData({
      name: doc.userId.name,
      email: doc.userId.email,
      password: '', // blank on edit
      phone: doc.userId.phone,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      departmentId: doc.departmentId?._id || ''
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
      if (editMode) {
        // Update Doctor details
        await updateDoctor({
          id: selectedDoctorId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: Number(formData.experience),
          consultationFee: Number(formData.consultationFee),
          departmentId: formData.departmentId
        }).unwrap();
      } else {
        // Create Doctor details
        await createDoctor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: Number(formData.experience),
          consultationFee: Number(formData.consultationFee),
          departmentId: formData.departmentId
        }).unwrap();
      }
      setOpenModal(false);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Error occurred while saving doctor profile.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      await deleteDoctor(userId);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await toggleStatus({ id: userId, status: nextStatus });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Doctor Management</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Register Doctor
        </Button>
      </Box>

      {/* Filters & Search */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            placeholder="Search by doctor name..."
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
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departmentsList.map((d) => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Grid List */}
      {doctorsLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor Details</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Consultation Fee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctorsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No doctors found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                doctorsList.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{doc.userId?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{doc.userId?.email}</Typography>
                        <Typography variant="body2" color="text.secondary">Ph: {doc.userId?.phone}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doc.departmentId?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 500 }}>{doc.specialization}</Typography>
                        <Typography variant="body2" color="text.secondary">{doc.qualification}</Typography>
                        <Typography variant="body2" color="text.secondary">{doc.experience} Years Exp.</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${doc.consultationFee}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.userId?.status === 'active' ? 'Active' : 'Inactive'}
                        color={doc.userId?.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Switch
                        checked={doc.userId?.status === 'active'}
                        onChange={() => handleStatusToggle(doc.userId?._id, doc.userId?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(doc)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(doc.userId?._id)}>
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

      {/* Creation / Editing Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? 'Edit Doctor Profile' : 'Register New Doctor'}
        </DialogTitle>
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
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              {!editMode && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              )}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  required
                >
                  {departmentsList.map((d) => (
                    <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Qualifications"
                  name="qualification"
                  placeholder="e.g. MBBS, MD"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Consultation Fee ($)"
                  name="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={createLoading || updateLoading}
            >
              {(createLoading || updateLoading) ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DoctorsManagement;
