import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { useLoginMutation } from '../../services/authApi';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken
      }));

      // Redirect depending on user role
      if (result.data.user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (result.data.user.role === 'Doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        Welcome Back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Please sign in with your hospital credentials
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" color="secondary.main" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isLoading}
          sx={{ py: 1.5, mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have a patient account?{' '}
          <Link component={RouterLink} to="/register" color="secondary.main" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
