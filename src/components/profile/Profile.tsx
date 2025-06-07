import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { UserPreferences } from '../../types/user';

// Available movie genres
const availableGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

const profileSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
});

const Profile: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      preferences: {
        favoriteGenres: user?.preferences.favoriteGenres || []
      }
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      if (user) {
        await updateProfile({
          ...user,
          firstName: values.firstName,
          lastName: values.lastName,
          preferences: values.preferences as UserPreferences
        });
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    },
    enableReinitialize: true
  });

  const handleGenreAdd = () => {
    if (selectedGenre && !formik.values.preferences.favoriteGenres.includes(selectedGenre)) {
      const updatedGenres = [...formik.values.preferences.favoriteGenres, selectedGenre];
      formik.setFieldValue('preferences.favoriteGenres', updatedGenres);
      setSelectedGenre('');
    }
  };

  const handleGenreDelete = (genreToDelete: string) => {
    const updatedGenres = formik.values.preferences.favoriteGenres.filter(
      (genre) => genre !== genreToDelete
    );
    formik.setFieldValue('preferences.favoriteGenres', updatedGenres);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
          <Typography variant="h5" align="center">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#6a5acd' }}>
            Your Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and preferences.
          </Typography>
        </Box>

        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Stack>
            
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              disabled
              helperText="Email cannot be changed"
            />
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
            Preferences
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Favorite Genres
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formik.values.preferences.favoriteGenres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    onDelete={() => handleGenreDelete(genre)}
                    sx={{ bgcolor: '#e0daf7' }}
                  />
                ))}
                {formik.values.preferences.favoriteGenres.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No favorite genres selected
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="genre-select-label">Add Genre</InputLabel>
                  <Select
                    labelId="genre-select-label"
                    id="genre-select"
                    value={selectedGenre}
                    label="Add Genre"
                    onChange={(e) => setSelectedGenre(e.target.value)}
                  >
                    {availableGenres
                      .filter((genre) => !formik.values.preferences.favoriteGenres.includes(genre))
                      .map((genre) => (
                        <MenuItem key={genre} value={genre}>
                          {genre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={handleGenreAdd}
                  disabled={!selectedGenre}
                  sx={{ mt: 1 }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Stack>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#6a5acd',
                '&:hover': {
                  bgcolor: '#5b4cbb'
                },
                px: 4
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 