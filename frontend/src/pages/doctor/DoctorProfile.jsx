import React, { useState, useEffect } from 'react';
import { useGetDoctorProfileQuery, useUpdateDoctorProfileMutation } from '../../services/doctorApi';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

const DoctorProfile = () => {
  const { data, isLoading, refetch } = useGetDoctorProfileQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdateDoctorProfileMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: ''
  });

  const [alert, setAlert] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (data?.data?.doctor) {
      const doc = data.data.doctor;
      setFormData({
        name: doc.userId.name || '',
        email: doc.userId.email || '',
        phone: doc.userId.phone || '',
        specialization: doc.specialization || '',
        qualification: doc.qualification || '',
        experience: doc.experience || '',
        consultationFee: doc.consultationFee || ''
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', msg: '' });

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee)
      }).unwrap();
      setAlert({ type: 'success', msg: 'Profile updated successfully!' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.data?.message || 'Failed to update profile.' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        My Profile Settings
      </Typography>

      {alert.msg && <Alert severity={alert.type} sx={{ mb: 3 }}>{alert.msg}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email (Read Only)"
                name="email"
                value={formData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qualifications"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (Years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee ($)"
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={updateLoading}
              sx={{ px: 4 }}
            >
              {updateLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DoctorProfile;
