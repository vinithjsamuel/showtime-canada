import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const registerSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required')
});

const Register: React.FC = () => {
  const { register, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activationComplete, setActivationComplete] = useState(false);
  const [showActivationCodeDialog, setShowActivationCodeDialog] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');
  const [registeredUserData, setRegisteredUserData] = useState<any>(null);
  
  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleActivationCodeSubmit = () => {
    if (activationCode.toLowerCase() === 'activate') {
      setShowActivationCodeDialog(false);
      setActivationComplete(true);
      
      // Register the user after successful activation
      setTimeout(() => {
        if (registeredUserData) {
          register(registeredUserData);
        }
      }, 2000);
    } else {
      setActivationError('Invalid activation code. Please try again.');
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      // Store user data for later registration after activation
      setRegisteredUserData({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      });
      
      // Show activation code dialog
      setShowActivationCodeDialog(true);
    }
  });

  if (activationComplete) {
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
              Account Activation
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              Your account has been successfully activated!
            </Alert>
            
            <Typography variant="body2" paragraph>
              You will be redirected to the home page shortly...
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      {/* Activation Code Dialog */}
      <Dialog open={showActivationCodeDialog} onClose={() => setShowActivationCodeDialog(false)}>
        <DialogTitle sx={{ color: '#6a5acd' }}>Enter Activation Code</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            We've sent an activation code to your email address. Please enter the code below to activate your account.
          </DialogContentText>
          <DialogContentText sx={{ mb: 3, fontStyle: 'italic', fontSize: '0.9rem' }}>
            <strong>For demo purposes:</strong> Enter "activate" as the activation code.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Activation Code"
            type="text"
            fullWidth
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            error={!!activationError}
            helperText={activationError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActivationCodeDialog(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button onClick={handleActivationCodeSubmit} sx={{ color: '#6a5acd' }}>
            Activate
          </Button>
        </DialogActions>
      </Dialog>

      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#6a5acd' }}>
            Create Account
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                margin="normal"
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
              <TextField
                margin="normal"
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Stack>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>

            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 