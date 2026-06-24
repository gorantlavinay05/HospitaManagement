import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../services/authApi';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setResetToken('');

    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();
      setSuccessMsg('Reset token generated. For developer testing, you can use the token below to reset your password:');
      setResetToken(result.data.resetToken);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to request password reset. Check your email address.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Enter your email address to recover your account
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
          {resetToken && (
            <Box
              sx={{
                p: 2,
                bgcolor: '#f1f5f9',
                borderRadius: 2,
                border: '1px dashed #cbd5e1',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
            >
              {resetToken}
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/reset-password" variant="body2" color="secondary.main" sx={{ fontWeight: 700, textDecoration: 'none' }}>
              Proceed to Reset Password &rarr;
            </Link>
          </Box>
        </Box>
      )}

      {!successMsg && (
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

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading}
            sx={{ py: 1.5, mt: 2, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Request Reset Token'}
          </Button>
        </form>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Link component={RouterLink} to="/login" variant="body2" color="secondary.main" sx={{ fontWeight: 600, textDecoration: 'none' }}>
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
