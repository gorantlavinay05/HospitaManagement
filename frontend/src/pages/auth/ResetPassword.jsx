import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useResetPasswordMutation } from '../../services/authApi';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';

const ResetPassword = () => {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetToken || !newPassword) {
      setErrorMsg('Please complete all fields');
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword }).unwrap();
      setSuccessMsg('Your password has been successfully reset! You can now log in.');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Enter your developer reset token and specify a new password
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMsg}
          </Alert>
          <Button
            fullWidth
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 1.5 }}
          >
            Go to Sign In
          </Button>
        </Box>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Developer Reset Token"
            variant="outlined"
            margin="normal"
            multiline
            rows={2}
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
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

export default ResetPassword;
