import React, { useState, useEffect } from 'react';
import { useGetPatientProfileQuery, useUpdatePatientProfileMutation } from '../../services/patientApi';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';

const PatientProfile = () => {
  const { data, isLoading, refetch } = useGetPatientProfileQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdatePatientProfileMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  const [alert, setAlert] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (data?.data?.patient) {
      const pat = data.data.patient;
      setFormData({
        name: pat.userId?.name || '',
        email: pat.userId?.email || '',
        phone: pat.userId?.phone || '',
        gender: pat.gender || 'Male',
        dob: pat.dob ? pat.dob.split('T')[0] : '',
        bloodGroup: pat.bloodGroup || 'O+',
        address: pat.address || '',
        emergencyName: pat.emergencyContact?.name || '',
        emergencyPhone: pat.emergencyContact?.phone || '',
        emergencyRelation: pat.emergencyContact?.relation || ''
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
      setAlert({ type: 'success', msg: 'Profile details updated successfully!' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.data?.message || 'Failed to save changes.' });
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
        My Personal Health Record
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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Home Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary.main" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                Emergency Contact Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Name"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Relation"
                name="emergencyRelation"
                value={formData.emergencyRelation}
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

export default PatientProfile;
