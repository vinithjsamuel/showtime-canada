import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import eventsData from '../data/events.json';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  image: string;
}

interface BookingDetails {
  bookingId: string;
  paymentMethod: string;
  totalAmount: number;
  selectedSeats: string[];
  timestamp: string;
  transactionId?: string;
}

const BookingConfirmation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Simulate processing time (ensure within 5 seconds)
    const timer = setTimeout(() => {
      setShowConfirmation(true);
      setLoading(false);
    }, 2000); // 2 seconds to ensure within 5 second requirement

    // Load event data
    const foundEvent = eventsData.events.find(e => e.id === Number(id));
    if (foundEvent) {
      setEvent(foundEvent);
    }

    // Load booking details from session storage
    const savedBookingDetails = sessionStorage.getItem('bookingDetails');
    if (savedBookingDetails) {
      try {
        setBookingDetails(JSON.parse(savedBookingDetails));
      } catch (error) {
        console.error('Error loading booking details:', error);
        navigate('/events');
      }
    } else {
      // If no booking details, redirect to events
      navigate('/events');
    }

    return () => clearTimeout(timer);
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackToHome = () => {
    // Clear booking details from session storage
    sessionStorage.removeItem('bookingDetails');
    sessionStorage.removeItem('selectedSeats');
    navigate('/');
  };

  const handleViewEvents = () => {
    // Clear booking details from session storage
    sessionStorage.removeItem('bookingDetails');
    sessionStorage.removeItem('selectedSeats');
    navigate('/events');
  };

  if (loading || !showConfirmation) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#6a5acd', mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Processing your booking confirmation...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This should take just a moment
        </Typography>
      </Container>
    );
  }

  if (!event || !bookingDetails) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Booking confirmation not found. Please contact support if you completed a payment.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Success Header */}
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 3, bgcolor: '#f8fff8', border: '2px solid #4caf50' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your tickets have been successfully booked
        </Typography>
        <Chip 
          label={`Booking ID: ${bookingDetails.bookingId}`}
          size="medium"
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white', 
            fontSize: '1.1rem',
            px: 2,
            py: 1,
            height: 'auto'
          }}
        />
      </Paper>

      {/* Event Details */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EventIcon sx={{ mr: 1, color: '#6a5acd' }} />
            Event Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
              <Box
                component="img"
                src={event.image}
                alt={event.title}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {event.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2">
                    {formatDate(event.date)} at {event.time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2">
                    {event.venue}, {event.location}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ConfirmationNumberIcon sx={{ mr: 1, color: '#6a5acd' }} />
            Booking Summary
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Booking Reference
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {bookingDetails.bookingId}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {bookingDetails.paymentMethod === 'creditcard' ? 'Credit Card' :
                 bookingDetails.paymentMethod === 'paypal' ? 'PayPal' :
                 bookingDetails.paymentMethod === 'applepay' ? 'Apple Pay' :
                 bookingDetails.paymentMethod === 'googlepay' ? 'Google Pay' :
                 bookingDetails.paymentMethod === 'samsungpay' ? 'Samsung Pay' :
                 bookingDetails.paymentMethod === 'bankwire' ? 'Bank Wire Transfer' :
                 bookingDetails.paymentMethod}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Seats
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {bookingDetails.selectedSeats.map((seat) => (
                  <Chip 
                    key={seat} 
                    label={seat} 
                    size="small" 
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 2 }}>
                ${bookingDetails.totalAmount.toFixed(2)} CAD
              </Typography>
            </Box>
            {bookingDetails.transactionId && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {bookingDetails.transactionId}
                </Typography>
              </Box>
            )}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle2" color="text.secondary">
                Booking Date & Time
              </Typography>
              <Typography variant="body2">
                {new Date(bookingDetails.timestamp).toLocaleString('en-CA')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> A confirmation email has been sent to your registered email address with your tickets and booking details.
          Please present your booking reference ({bookingDetails.bookingId}) at the venue.
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          size="large"
          sx={{ 
            bgcolor: '#6a5acd', 
            '&:hover': { bgcolor: '#5a4fcf' },
            flex: 1
          }}
          onClick={() => {
            // Simulate email/download action
            alert('Email confirmation sent! Check your inbox for tickets.');
          }}
        >
          Email Tickets
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReceiptIcon />}
          size="large"
          sx={{ 
            borderColor: '#6a5acd', 
            color: '#6a5acd',
            '&:hover': { borderColor: '#5a4fcf', bgcolor: 'rgba(106, 90, 205, 0.04)' },
            flex: 1
          }}
          onClick={() => {
            // Simulate receipt download
            alert('Receipt downloaded successfully!');
          }}
        >
          Download Receipt
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Navigation Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          size="large"
          onClick={handleBackToHome}
          sx={{ flex: 1 }}
        >
          Back to Home
        </Button>
        <Button
          variant="contained"
          startIcon={<EventIcon />}
          size="large"
          onClick={handleViewEvents}
          sx={{ 
            bgcolor: '#6a5acd', 
            '&:hover': { bgcolor: '#5a4fcf' },
            flex: 1
          }}
        >
          Browse More Events
        </Button>
      </Stack>
    </Container>
  );
};

export default BookingConfirmation; 