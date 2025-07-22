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
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Collapse
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import LockIcon from '@mui/icons-material/Lock';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { getUpdatedEvent } from '../utils/fileUpdater';
import { saveTicket } from '../utils/ticketStorage';
import { useAuth } from '../contexts/AuthContext';
import { markSeatsAsBooked } from '../utils/seatBookingManager';
import { markSeatsAsBookedInData } from '../utils/fileUpdater';

interface PaymentFormData {
  // Credit Card
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardName: string;
  
  // PayPal
  paypalEmail: string;
  paypalPassword: string;
  
  // Bank Wire
  bankName: string;
  accountNumber: string;
  transitNumber: string;
  institutionNumber: string;
  accountHolder: string;
}

const PaymentMethods: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [event, setEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('creditcard');
  const [deviceSupportsDigitalWallet, setDeviceSupportsDigitalWallet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardName: '',
    paypalEmail: '',
    paypalPassword: '',
    bankName: '',
    accountNumber: '',
    transitNumber: '',
    institutionNumber: '',
    accountHolder: ''
  });
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  useEffect(() => {
    // Load event data
    const foundEvent = getUpdatedEvent(Number(id));
    if (foundEvent) {
      setEvent(foundEvent);
    }

    // Load selected seats from session storage
    const savedSeats = sessionStorage.getItem('selectedSeats');
    if (savedSeats) {
      try {
        setSelectedSeats(JSON.parse(savedSeats));
      } catch (error) {
        console.error('Error loading selected seats:', error);
      }
    }

    // Detect device capabilities for digital wallets
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('Mac')) {
      setDeviceSupportsDigitalWallet(true);
    } else if (userAgent.includes('Android')) {
      setDeviceSupportsDigitalWallet(true);
    } else if (userAgent.includes('Chrome')) {
      setDeviceSupportsDigitalWallet(true);
    }
  }, [id]);

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateCreditCard = () => {
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Please select expiry month';
    }
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Please select expiry year';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Please enter cardholder name';
    }
    
    return newErrors;
  };

  const validatePayPal = () => {
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!formData.paypalEmail || !/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
      newErrors.paypalEmail = 'Please enter a valid email';
    }
    if (!formData.paypalPassword || formData.paypalPassword.length < 6) {
      newErrors.paypalPassword = 'Please enter your PayPal password';
    }
    
    return newErrors;
  };

  const validateBankWire = () => {
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Please enter bank name';
    }
    if (!formData.accountNumber || formData.accountNumber.length < 7) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }
    if (!formData.transitNumber || formData.transitNumber.length !== 5) {
      newErrors.transitNumber = 'Transit number must be 5 digits';
    }
    if (!formData.institutionNumber || formData.institutionNumber.length !== 3) {
      newErrors.institutionNumber = 'Institution number must be 3 digits';
    }
    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Please enter account holder name';
    }
    
    return newErrors;
  };

  const handlePayment = async () => {
    // Skip validation for placeholder payment methods
    // Only validate if we have actual form fields (currently only digital wallets work)
    let validationErrors: Partial<PaymentFormData> = {};
    
    // For now, skip validation for credit card, paypal, and bank wire
    // since they use placeholder UI without actual form fields
    if (['creditcard', 'paypal', 'bankwire'].includes(selectedMethod)) {
      // No validation needed for placeholder methods
      validationErrors = {};
    } else {
      // Keep validation for any future form implementations
      switch (selectedMethod) {
        case 'creditcard':
          validationErrors = validateCreditCard();
          break;
        case 'paypal':
          validationErrors = validatePayPal();
          break;
        case 'bankwire':
          validationErrors = validateBankWire();
          break;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate unique booking ID
      const bookingId = `BC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Generate transaction ID for digital wallets
      const transactionId = ['applepay', 'googlepay', 'samsungpay'].includes(selectedMethod) 
        ? `${Date.now()}-${selectedMethod.toUpperCase()}`
        : undefined;
      
      // Store booking details in session storage for confirmation page
      const bookingDetails = {
        bookingId,
        paymentMethod: selectedMethod,
        totalAmount,
        selectedSeats,
        timestamp: new Date().toISOString(),
        transactionId
      };
      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

      // Mark seats as booked globally (localStorage tracking)
      if (event) {
        markSeatsAsBooked(event.id, selectedSeats, bookingId, user?.id);
        // Also update the persistent data layer (simulates events.json update)
        markSeatsAsBookedInData(event.id, selectedSeats);
      }

      // Save ticket to persistent storage if user is logged in
      if (user && event) {
        try {
          await saveTicket({
            userId: user.id,
            eventId: event.id,
            bookingId,
            eventTitle: event.title,
            eventDescription: event.description,
            eventImage: event.image,
            venue: event.venue,
            location: event.location,
            date: event.date,
            time: event.time,
            selectedSeats,
            totalAmount,
            paymentMethod: selectedMethod,
            transactionId,
            bookingDate: new Date().toISOString(),
            status: 'active',
            category: event.category
          });
        } catch (error) {
          console.error('Error saving ticket:', error);
          // Continue with flow even if ticket saving fails
        }
      }
      
      // Clear selected seats from session storage now that they're booked
      sessionStorage.removeItem('selectedSeats');
      
      // Navigate to confirmation page
      navigate(`/booking/confirmation/${id}`);
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/checkout/review/${id}`);
  };

  if (!event || selectedSeats.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Invalid Payment Session
          </Typography>
          <Typography variant="body1" paragraph>
            Please start from seat selection to proceed with payment.
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

  const totalAmount = selectedSeats.length * event.price;

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
          Back to Review
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
          Payment Method
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose your preferred payment method to complete your booking.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Order Summary */}
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">{event.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ${event.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${totalAmount.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>
                ${totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd', display: 'flex', alignItems: 'center' }}>
              <PaymentIcon sx={{ mr: 1 }} />
              Select Payment Method
            </Typography>

            <RadioGroup
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="creditcard"
                control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1, color: '#6a5acd' }} />
                    Credit/Debit Card
                  </Box>
                }
              />
              <FormControlLabel
                value="paypal"
                control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PaymentIcon sx={{ mr: 1, color: '#0070ba' }} />
                    PayPal
                  </Box>
                }
              />
              <FormControlLabel
                value="bankwire"
                control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: '#6a5acd' }} />
                    Bank Wire Transfer
                  </Box>
                }
              />
              
              {/* Digital Wallets */}
              {deviceSupportsDigitalWallet && (
                <>
                  <FormControlLabel
                    value="applepay"
                    control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneAndroidIcon sx={{ mr: 1, color: '#000' }} />
                        Apple Pay
                        <Chip label="Touch ID" size="small" sx={{ ml: 1, bgcolor: '#000', color: 'white' }} />
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="googlepay"
                    control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TouchAppIcon sx={{ mr: 1, color: '#4285f4' }} />
                        Google Pay
                        <Chip label="One Touch" size="small" sx={{ ml: 1, bgcolor: '#4285f4', color: 'white' }} />
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="samsungpay"
                    control={<Radio sx={{ color: '#6a5acd', '&.Mui-checked': { color: '#6a5acd' } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneAndroidIcon sx={{ mr: 1, color: '#1428a0' }} />
                        Samsung Pay
                        <Chip label="Secure" size="small" sx={{ ml: 1, bgcolor: '#1428a0', color: 'white' }} />
                      </Box>
                    }
                  />
                </>
              )}
            </RadioGroup>

            {/* Credit Card Form */}
            <Collapse in={selectedMethod === 'creditcard'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Credit Card Information
                </Typography>

                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', border: '1px solid #6a5acd' }}>
                  <>
                      <CreditCardIcon sx={{ fontSize: 60, color: '#000', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Credit Card Information Goes Here
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          Secured
                        </Typography>
                      </Box>
                    </>
                </Paper>
              </Box>
            </Collapse>

            {/* PayPal Form */}
            <Collapse in={selectedMethod === 'paypal'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  PayPal Account
                </Typography>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', border: '1px solid #6a5acd' }}>
                  <>
                      <MonetizationOnIcon sx={{ fontSize: 60, color: '#000', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        PayPal Account Login Information Goes Here
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          Secured
                        </Typography>
                      </Box>
                    </>
                </Paper>
              </Box>
            </Collapse>

            {/* Digital Wallet Forms */}
            <Collapse in={selectedMethod === 'applepay' || selectedMethod === 'googlepay' || selectedMethod === 'samsungpay'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {selectedMethod === 'applepay' && 'Apple Pay'}
                  {selectedMethod === 'googlepay' && 'Google Pay'}
                  {selectedMethod === 'samsungpay' && 'Samsung Pay'}
                  {' '}Authentication
                </Typography>
                
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', border: '1px solid #6a5acd' }}>
                  {selectedMethod === 'applepay' && (
                    <>
                      <PhoneAndroidIcon sx={{ fontSize: 60, color: '#000', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Touch ID or Face ID Required
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Use your fingerprint or face to authenticate this ${totalAmount.toFixed(2)} payment
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          Secured by Apple Pay
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {selectedMethod === 'googlepay' && (
                    <>
                      <TouchAppIcon sx={{ fontSize: 60, color: '#4285f4', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Google Pay Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Confirm your payment of ${totalAmount.toFixed(2)} with your Google account
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#4285f4' }} />
                        <Typography variant="body2" sx={{ color: '#4285f4' }}>
                          Secured by Google
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {selectedMethod === 'samsungpay' && (
                    <>
                      <PhoneAndroidIcon sx={{ fontSize: 60, color: '#1428a0', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Samsung Pay Verification
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Authenticate your ${totalAmount.toFixed(2)} payment using Samsung Knox security
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#1428a0' }} />
                        <Typography variant="body2" sx={{ color: '#1428a0' }}>
                          Samsung Knox Secured
                        </Typography>
                      </Box>
                    </>
                  )}
                </Paper>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Your payment information is encrypted and processed securely through {selectedMethod === 'applepay' ? 'Apple Pay' : selectedMethod === 'googlepay' ? 'Google Pay' : 'Samsung Pay'}. 
                    No card details are stored on this device.
                  </Typography>
                </Alert>
              </Box>
            </Collapse>

            {/* Bank Wire Form */}
            <Collapse in={selectedMethod === 'bankwire'}>
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Bank Wire Transfer
                </Typography>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', border: '1px solid #6a5acd' }}>
                  <>
                      <AccountBalanceIcon sx={{ fontSize: 60, color: '#000', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Bank Wire Transfer Information Goes Here
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LockIcon sx={{ color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          Secured
                        </Typography>
                      </Box>
                    </>
                </Paper>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Security and Compliance Information */}
        <Stack spacing={2}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fffe', border: '1px solid #4caf50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                PCI DSS Compliant & SSL Secured
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 30, color: '#4caf50', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>256-bit SSL</Typography>
                <Typography variant="caption" color="text.secondary">Bank-level encryption</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 30, color: '#4caf50', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>PCI Compliant</Typography>
                <Typography variant="caption" color="text.secondary">Industry standard</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <LockIcon sx={{ fontSize: 30, color: '#4caf50', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Secure Tokens</Typography>
                <Typography variant="caption" color="text.secondary">No data stored</Typography>
              </Box>
            </Box>
          </Paper>
          
          <Alert severity="info" icon={<SecurityIcon />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Demo Application:</strong> This is a demonstration for educational purposes. All payments are simulated. 
              In production, real payment gateways would process transactions securely.
            </Typography>
          </Alert>
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoBack}
            disabled={loading}
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
            Back to Review
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              bgcolor: '#6a5acd',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#5b4cbb'
              },
              minWidth: 200
            }}
          >
            {loading 
              ? 'Processing...' 
              : selectedMethod === 'bankwire' 
                ? 'I Have Made the Payment'
                : selectedMethod === 'applepay'
                  ? 'Pay with Touch ID'
                : selectedMethod === 'googlepay'
                  ? 'Pay with Google Pay'
                : selectedMethod === 'samsungpay'
                  ? 'Pay with Samsung Pay'
                : `Pay $${totalAmount.toFixed(2)}`
            }
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default PaymentMethods; 