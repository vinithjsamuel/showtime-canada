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
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import TheatersIcon from '@mui/icons-material/Theaters';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import eventsData from '../data/events.json';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    // Clear any previous movie session selections when switching movies
    // Clear all movie-specific selections
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('selectedMovieDate_') || key.startsWith('selectedMovieTime_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Reset state
    setSelectedDate('');
    setSelectedTime('');
    setMovie(null);
    setLoading(true);
    
    // Simulate API call to fetch movie
    const timer = setTimeout(() => {
      const foundMovie = eventsData.events.find((event: any) => 
        event.id === Number(id) && event.category === 'movies'
      );
      if (foundMovie) {
        setMovie(foundMovie);
        // Set default date and time
        if (foundMovie.dateList && foundMovie.dateList.length > 0) {
          setSelectedDate(foundMovie.dateList[0]);
        }
        if (foundMovie.timeList && foundMovie.timeList.length > 0) {
          setSelectedTime(foundMovie.timeList[0]);
        }
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleBookTickets = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and showtime before booking.');
      return;
    }

    // Store selected date and time in session storage for the booking process (movie-specific)
    sessionStorage.setItem(`selectedMovieDate_${id}`, selectedDate);
    sessionStorage.setItem(`selectedMovieTime_${id}`, selectedTime);
    
    // Navigate to event detail with the movie ID
    navigate(`/events/${id}`);
  };

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
              src={movie.posterUrl || movie.image}
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

              <Rating value={movie.userRating || 3.5} readOnly precision={0.1} sx={{ mb: 2 }} />

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

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    Location: {movie.venue}, {movie.location}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Date and Time Selection */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
                  Select Date & Showtime
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  {/* Date Selection */}
                  <FormControl fullWidth>
                    <InputLabel>Select Date</InputLabel>
                    <Select
                      value={selectedDate}
                      label="Select Date"
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      {movie.dateList?.map((date: string) => (
                        <MenuItem key={date} value={date}>
                          {formatDate(date)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Time Selection */}
                  <FormControl fullWidth>
                    <InputLabel>Select Showtime</InputLabel>
                    <Select
                      value={selectedTime}
                      label="Select Showtime"
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                    >
                      {movie.timeList?.map((time: string) => (
                        <MenuItem key={time} value={time}>
                          {formatTime(time)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Selected Session Info */}
                {selectedDate && selectedTime && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Selected Session:</strong> {formatDate(selectedDate)} at {formatTime(selectedTime)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price:</strong> ${movie.price} per ticket
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  startIcon={<TheatersIcon />}
                  fullWidth={isMobile}
                  onClick={handleBookTickets}
                  disabled={!selectedDate || !selectedTime}
                  sx={{
                    mt: 2,
                    bgcolor: '#6a5acd',
                    '&:hover': {
                      bgcolor: '#5b4cbb'
                    },
                    '&:disabled': {
                      bgcolor: '#ccc'
                    },
                    px: 4
                  }}
                >
                  Book Tickets - ${movie.price}
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