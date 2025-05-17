import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Chip,
  Rating,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import TheatersIcon from '@mui/icons-material/Theaters';
import moviesData from '../data/movies.json';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    // Simulate API call to fetch movie
    const timer = setTimeout(() => {
      const foundMovie = moviesData.find(m => m.id === Number(id));
      if (foundMovie) {
        setMovie(foundMovie);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#6a5acd' }} />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Movie Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The movie you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/movies')}
            sx={{
              bgcolor: '#6a5acd',
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            Browse Movies
          </Button>
        </Paper>
      </Container>
    );
  }

  // Generate fake showtimes
  const generateShowtimes = () => {
    const times = ['10:30 AM', '1:15 PM', '4:00 PM', '6:45 PM', '9:30 PM'];
    return times;
  };

  const showtimes = generateShowtimes();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Movie Poster */}
          <Box sx={{ flex: { xs: '1', md: '0 0 33.333%' } }}>
            <Box
              component="img"
              src={movie.posterUrl}
              alt={movie.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                maxHeight: 500,
                objectFit: 'cover'
              }}
            />
          </Box>

          {/* Movie Details */}
          <Box sx={{ flex: { xs: '1', md: '0 0 66.666%' } }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                {movie.title}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  label={movie.genre}
                  size="small"
                  sx={{ bgcolor: '#e0daf7', color: '#6a5acd' }}
                />
                <Chip
                  label={movie.rating}
                  size="small"
                  sx={{ bgcolor: '#e0daf7', color: '#6a5acd' }}
                />
              </Stack>

              <Rating value={3.5} readOnly precision={0.5} sx={{ mb: 2 }} />

              <Typography variant="body1" paragraph>
                {movie.description}
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    Duration: {movie.duration} minutes
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    Release Date: {movie.releaseDate}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    Director: {movie.director}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
                  Today's Showtimes in Canada
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  flexWrap="wrap"
                  sx={{ mb: 3 }}
                >
                  {showtimes.map((time, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      sx={{
                        color: '#6a5acd',
                        borderColor: '#6a5acd',
                        '&:hover': {
                          borderColor: '#5b4cbb',
                          bgcolor: 'rgba(106, 90, 205, 0.04)'
                        }
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<TheatersIcon />}
                  fullWidth={isMobile}
                  sx={{
                    mt: 2,
                    bgcolor: '#6a5acd',
                    '&:hover': {
                      bgcolor: '#5b4cbb'
                    },
                    px: 4
                  }}
                >
                  Book Tickets
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MovieDetail; 