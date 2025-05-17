import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { openDB } from 'idb';

const emailSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required')
});

const verificationSchema = Yup.object({
  resetCode: Yup.string()
    .required('Reset code is required')
});

const resetSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'Password should be of minimum 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
});

const ForgotPassword: React.FC = () => {
  const { resetPassword, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const steps = ['Enter Email', 'Verify Code', 'Reset Password', 'Complete'];

  // Function to actually update the password in IndexedDB
  const updatePasswordInDB = async (email: string, newPassword: string) => {
    try {
      const DB_NAME = 'cinema-tickets-db';
      const DB_VERSION = 1;
      
      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Get the user with the matching email
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const emailIndex = store.index('email');
      const user = await emailIndex.get(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update password
      user.password = newPassword;
      await store.put(user);
      await tx.done;
      
      return user;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const emailFormik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: emailSchema,
    onSubmit: async (values) => {
      await resetPassword(values.email);
      setUserEmail(values.email);
      setActiveStep(1);
    }
  });

  const verificationFormik = useFormik({
    initialValues: {
      resetCode: ''
    },
    validationSchema: verificationSchema,
    onSubmit: async (values) => {
      // For demo, check if reset code is "reset"
      if (values.resetCode.toLowerCase() === 'reset') {
        setActiveStep(2);
      } else {
        setVerificationError('Invalid reset code. Please try again.');
      }
    }
  });

  const resetFormik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: resetSchema,
    onSubmit: async (values) => {
      try {
        // Actually update the password in the database
        if (!await updatePasswordInDB(userEmail, values.newPassword)) {
          throw new Error('User not found');
        }
        
        setResetComplete(true);
        setActiveStep(3);
        
        // Auto login after 2 seconds
        setTimeout(async () => {
          // Login with new credentials
          await login({
            email: userEmail,
            password: values.newPassword
          });
          
          // Navigate to home page
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Error during password reset:', error);
        // Handle error
      }
    }
  });

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={emailFormik.handleSubmit} sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address to receive a verification code.
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
              helperText={emailFormik.touched.email && emailFormik.errors.email}
            />

            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#6a5acd',
                '&:hover': {
                  bgcolor: '#5b4cbb'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={verificationFormik.handleSubmit} sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the verification code sent to your email address.
            </Typography>
            
            <Typography variant="caption" sx={{ display: 'block', mb: 2, fontStyle: 'italic' }}>
              <strong>For demo purposes:</strong> Enter "reset" as the verification code.
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              id="resetCode"
              label="Reset Code"
              name="resetCode"
              autoFocus
              value={verificationFormik.values.resetCode}
              onChange={verificationFormik.handleChange}
              error={((verificationFormik.touched.resetCode && Boolean(verificationFormik.errors.resetCode))) || !!verificationError}
              helperText={(verificationFormik.touched.resetCode && verificationFormik.errors.resetCode) || verificationError}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#6a5acd',
                '&:hover': {
                  bgcolor: '#5b4cbb'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={resetFormik.handleSubmit} sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create a new password for your account.
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              value={resetFormik.values.newPassword}
              onChange={resetFormik.handleChange}
              error={resetFormik.touched.newPassword && Boolean(resetFormik.errors.newPassword)}
              helperText={resetFormik.touched.newPassword && resetFormik.errors.newPassword}
            />

            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={resetFormik.values.confirmPassword}
              onChange={resetFormik.handleChange}
              error={resetFormik.touched.confirmPassword && Boolean(resetFormik.errors.confirmPassword)}
              helperText={resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#6a5acd',
                '&:hover': {
                  bgcolor: '#5b4cbb'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been successfully reset!
            </Alert>
            <Typography paragraph>
              You will be automatically logged in and redirected to the home page...
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#6a5acd' }}>
            Reset Password
          </Typography>

          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {getStepContent(activeStep)}

          {activeStep !== 3 && (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to login
              </Link>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 