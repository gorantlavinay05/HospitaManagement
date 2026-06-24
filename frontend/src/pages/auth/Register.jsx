import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { useRegisterMutation } from '../../services/authApi';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  MenuItem,
  Grid
} from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Construct request payload
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
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
    };

    try {
      const result = await register(payload).unwrap();
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken
      }));
      navigate('/patient/dashboard');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        Create Patient Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Register your profile to book doctor consultations
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
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
              name="dob"
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              name="bloodGroup"
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={handleChange}
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
              name="address"
              label="Home Address"
              value={formData.address}
              onChange={handleChange}
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
              name="emergencyName"
              label="Contact Name"
              value={formData.emergencyName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="emergencyPhone"
              label="Contact Phone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="emergencyRelation"
              label="Relation"
              value={formData.emergencyRelation}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isLoading}
          sx={{ py: 1.5, mt: 3, mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register Account'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" color="secondary.main" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
