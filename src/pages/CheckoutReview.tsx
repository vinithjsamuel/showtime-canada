import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import eventsData from '../data/events.json';
import eventCategoriesData from '../data/eventCategories.json';

const CheckoutReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    // Load event data
    const timer = setTimeout(() => {
      const foundEvent = eventsData.events.find(e => e.id === Number(id));
      if (foundEvent) {
        setEvent(foundEvent);
      }
      setLoading(false);
    }, 300);

    // Load selected seats from session storage
    const savedSeats = sessionStorage.getItem('selectedSeats');
    if (savedSeats) {
      try {
        setSelectedSeats(JSON.parse(savedSeats));
      } catch (error) {
        console.error('Error loading selected seats:', error);
      }
    }

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

  if (selectedSeats.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Seats Selected
          </Typography>
          <Typography variant="body1" paragraph>
            Please select seats before proceeding to checkout.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/events/${id}`)}
            sx={{
              bgcolor: '#6a5acd',
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            Select Seats
          </Button>
        </Paper>
      </Container>
    );
  }

  const categoryInfo = eventCategoriesData.categories.find(cat => cat.id === event.category);
  const totalPrice = selectedSeats.length * event.price;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleGoBack = () => {
    navigate(`/events/${id}`);
  };

  const handleConfirmAndProceed = () => {
    // For now, just show an alert - this would normally proceed to payment
    alert(`Proceeding to payment for ${selectedSeats.length} seats totaling $${totalPrice.toFixed(2)}`);
    // navigate('/checkout/payment'); // This would be the next step
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            color: '#6a5acd',
            mb: 2,
            '&:hover': {
              bgcolor: 'rgba(106, 90, 205, 0.04)'
            }
          }}
        >
          Back to Seat Selection
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
          Review Your Selection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please review your event and seat selection before proceeding to payment.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Event Details Card */}
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Event Image */}
              <Box sx={{ flex: { xs: '1', md: '0 0 200px' } }}>
                <Box
                  component="img"
                  src={event.image}
                  alt={event.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    maxHeight: 250,
                    objectFit: 'cover'
                  }}
                />
              </Box>

              {/* Event Info */}
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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

                <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                  {event.title}
                </Typography>

                <Typography variant="body1" paragraph color="text.secondary">
                  {event.description}
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ color: '#6a5acd', mr: 1 }} />
                    <Typography variant="body1">
                      {formatDate(event.date)} at {event.time}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ color: '#6a5acd', mr: 1 }} />
                    <Typography variant="body1">
                      {event.venue}, {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ color: '#6a5acd', mr: 1 }} />
                    <Typography variant="body1">
                      ${event.price} per seat
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Selected Seats Card */}
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <EventSeatIcon sx={{ mr: 1 }} />
              Selected Seats ({selectedSeats.length})
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {selectedSeats.map(seatId => (
                <Chip
                  key={seatId}
                  label={seatId}
                  icon={<EventSeatIcon />}
                  sx={{
                    bgcolor: '#2196f3',
                    color: 'white',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Pricing Summary */}
            <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ${event.price}
                  </Typography>
                  <Typography variant="body1">
                    ${(selectedSeats.length * event.price).toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoBack}
            sx={{
              color: '#6a5acd',
              borderColor: '#6a5acd',
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#5b4cbb',
                bgcolor: 'rgba(106, 90, 205, 0.04)'
              }
            }}
          >
            Back to Edit Selection
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleConfirmAndProceed}
            sx={{
              bgcolor: '#6a5acd',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            Confirm and Proceed to Payment
          </Button>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Your seat selection will be held for 15 minutes during the checkout process. 
            Please complete your purchase within this time to secure your seats.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
};

export default CheckoutReview; 