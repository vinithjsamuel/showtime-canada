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
  useTheme,
  Rating,
  Avatar
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import eventsData from '../data/events.json';
import eventCategoriesData from '../data/eventCategories.json';
import SeatingLayout from '../components/common/SeatingLayout';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

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

              {/* Seating Layout Section */}
              {event.seating && (
                <Box sx={{ mb: 4 }}>
                  <SeatingLayout 
                    seating={event.seating}
                    eventId={event.id}
                    venueType={
                      event.category === 'movies' ? 'cinema' :
                      event.category === 'theater' ? 'theater' :
                      event.category === 'music' || event.category === 'sports' ? 'arena' :
                      'cinema'
                    }
                  />
                  <Divider sx={{ my: 3 }} />
                </Box>
              )}

              {/* Reviews Section */}
              {event.userRating && event.reviews && event.reviews.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold', mb: 3 }}>
                    Reviews & Ratings
                  </Typography>
                  
                  {/* Overall Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Rating
                      value={event.userRating}
                      precision={0.1}
                      readOnly
                      size="large"
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                      {event.userRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({event.reviews.length} review{event.reviews.length !== 1 ? 's' : ''})
                    </Typography>
                  </Box>

                  {/* Reviews List */}
                  <Stack spacing={2}>
                    {(showAllReviews ? event.reviews : event.reviews.slice(0, 3)).map((review: any) => (
                      <Paper key={review.id} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#6a5acd', width: 40, height: 40 }}>
                            {review.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {review.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.date).toLocaleDateString('en-CA')}
                              </Typography>
                            </Box>
                            <Rating
                              value={review.rating}
                              readOnly
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {review.comment}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>

                  {/* Load More Button */}
                  {event.reviews.length > 3 && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        sx={{
                          color: '#6a5acd',
                          borderColor: '#6a5acd',
                          '&:hover': {
                            borderColor: '#5b4cbb',
                            bgcolor: 'rgba(106, 90, 205, 0.04)'
                          }
                        }}
                      >
                        {showAllReviews ? 'Show Less' : `Load More (${event.reviews.length - 3} more)`}
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />
                </Box>
              )}

              <Box>
                <Button
                  variant="contained"
                  startIcon={<ConfirmationNumberIcon />}
                  fullWidth={isMobile}
                  onClick={() => {
                    const savedSeats = sessionStorage.getItem('selectedSeats');
                    if (savedSeats && JSON.parse(savedSeats).length > 0) {
                      navigate(`/checkout/review/${event.id}`);
                    } else {
                      alert('Please select seats first before booking tickets.');
                    }
                  }}
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