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
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import eventsData from '../data/events.json';
import eventCategoriesData from '../data/eventCategories.json';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    // Simulate API call to fetch event
    const timer = setTimeout(() => {
      const foundEvent = eventsData.events.find(e => e.id === Number(id));
      if (foundEvent) {
        setEvent(foundEvent);
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

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Event Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The event you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/events')}
            sx={{
              bgcolor: '#6a5acd',
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            Browse Events
          </Button>
        </Paper>
      </Container>
    );
  }

  const categoryInfo = eventCategoriesData.categories.find(cat => cat.id === event.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
          {/* Event Image */}
          <Box sx={{ flex: { xs: '1', md: '0 0 33.333%' } }}>
            <Box
              component="img"
              src={event.image}
              alt={event.title}
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

          {/* Event Details */}
          <Box sx={{ flex: { xs: '1', md: '0 0 66.666%' } }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                {event.title}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  label={categoryInfo?.name || event.category}
                  size="small"
                  sx={{ bgcolor: categoryInfo?.color + '20', color: categoryInfo?.color || '#6a5acd' }}
                />
                {event.featured && (
                  <Chip
                    label="Featured"
                    size="small"
                    sx={{ bgcolor: '#ff9800', color: 'white' }}
                  />
                )}
              </Stack>

              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    {formatDate(event.date)} at {event.time}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {event.venue}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="a"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.location}, Canada`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: '#6a5acd', 
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {event.location}, Canada
                      <br />
                      📍 View on Google Maps
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ color: '#6a5acd', mr: 1 }} />
                  <Typography variant="body1">
                    ${event.price}
                  </Typography>
                </Box>

                {/* Genre info for movies */}
                {event.category === 'movies' && event.genre && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: '#6a5acd', mr: 1 }} />
                    <Typography variant="body1">
                      {event.genre} • {event.duration} minutes
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Button
                  variant="contained"
                  startIcon={<ConfirmationNumberIcon />}
                  fullWidth={isMobile}
                  sx={{
                    mt: 2,
                    bgcolor: '#6a5acd',
                    '&:hover': {
                      bgcolor: '#5b4cbb'
                    },
                    py: 1.5,
                    px: 4
                  }}
                >
                  Book Tickets
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/events')}
                  fullWidth={isMobile}
                  sx={{
                    mt: 2,
                    ml: isMobile ? 0 : 2,
                    color: '#6a5acd',
                    borderColor: '#6a5acd',
                    '&:hover': {
                      borderColor: '#5b4cbb',
                      bgcolor: 'rgba(106, 90, 205, 0.04)'
                    },
                    py: 1.5,
                    px: 4
                  }}
                >
                  Back to Events
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetail; 