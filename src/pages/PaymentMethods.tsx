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
import eventsData from '../data/events.json';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [event, setEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('creditcard');
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
    const foundEvent = eventsData.events.find(e => e.id === Number(id));
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
    const match = matches && matches[0] || '';
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
    let validationErrors: Partial<PaymentFormData> = {};
    
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

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (selectedMethod === 'bankwire') {
        // Bank wire specific success message
        alert(`Bank wire transfer recorded! 
        
Your transfer details have been recorded and will be verified within 6 hours during business hours.

Order Reference: #${event?.id}${selectedSeats.join('')}
Amount: $${totalAmount.toFixed(2)} CAD

You will receive a confirmation email once payment is verified.
Your tickets will be available after payment confirmation.`);
      } else {
        // Regular payment success message
        alert(`Payment successful! Your tickets have been booked.\nMethod: ${selectedMethod}\nTotal: $${totalAmount.toFixed(2)}`);
      }
      
      // Clear selected seats
      sessionStorage.removeItem('selectedSeats');
      
      // Navigate back to events or confirmation page
      navigate('/events');
      
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
            </RadioGroup>

            {/* Credit Card Form */}
            <Collapse in={selectedMethod === 'creditcard'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Credit Card Information
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl error={!!errors.expiryMonth} sx={{ minWidth: 120 }}>
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                        label="Month"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl error={!!errors.expiryYear} sx={{ minWidth: 120 }}>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                        label="Year"
                      >
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <MenuItem key={year} value={String(year)}>
                              {year}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="CVV"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      error={!!errors.cvv}
                      helperText={errors.cvv}
                      inputProps={{ maxLength: 4 }}
                      sx={{ width: 100 }}
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={formData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    error={!!errors.cardName}
                    helperText={errors.cardName}
                  />
                </Stack>
              </Box>
            </Collapse>

            {/* PayPal Form */}
            <Collapse in={selectedMethod === 'paypal'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  PayPal Account
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="PayPal Email"
                    type="email"
                    value={formData.paypalEmail}
                    onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                    error={!!errors.paypalEmail}
                    helperText={errors.paypalEmail}
                  />
                  <TextField
                    fullWidth
                    label="PayPal Password"
                    type="password"
                    value={formData.paypalPassword}
                    onChange={(e) => handleInputChange('paypalPassword', e.target.value)}
                    error={!!errors.paypalPassword}
                    helperText={errors.paypalPassword}
                  />
                </Stack>
              </Box>
            </Collapse>

            {/* Bank Wire Form */}
            <Collapse in={selectedMethod === 'bankwire'}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Bank Wire Transfer Instructions
                </Typography>
                
                {/* Company Bank Information */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #6a5acd' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                    Showtime Canada Bank Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please transfer the total amount to the following account:
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, rowGap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Bank Name:</Typography>
                    <Typography variant="body2">Royal Bank of Canada (RBC)</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Account Name:</Typography>
                    <Typography variant="body2">Showtime Canada Inc.</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Account Number:</Typography>
                    <Typography variant="body2">1234567890</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Transit Number:</Typography>
                    <Typography variant="body2">12345</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Institution Number:</Typography>
                    <Typography variant="body2">003</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>SWIFT Code:</Typography>
                    <Typography variant="body2">ROYCCAT2</Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Transfer Amount:</Typography>
                    <Typography variant="body2" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                      ${totalAmount.toFixed(2)} CAD
                    </Typography>
                  </Box>
                  
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> Please include your order reference number in the transfer description: 
                      <strong> #{event?.id}${selectedSeats.join('')}</strong>
                    </Typography>
                  </Alert>
                </Paper>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Your Banking Information (for verification)
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Your Bank Name"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    error={!!errors.bankName}
                    helperText={errors.bankName}
                  />
                  <TextField
                    fullWidth
                    label="Your Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Transit Number"
                      value={formData.transitNumber}
                      onChange={(e) => handleInputChange('transitNumber', e.target.value.replace(/\D/g, ''))}
                      error={!!errors.transitNumber}
                      helperText={errors.transitNumber}
                      inputProps={{ maxLength: 5 }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Institution Number"
                      value={formData.institutionNumber}
                      onChange={(e) => handleInputChange('institutionNumber', e.target.value.replace(/\D/g, ''))}
                      error={!!errors.institutionNumber}
                      helperText={errors.institutionNumber}
                      inputProps={{ maxLength: 3 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    error={!!errors.accountHolder}
                    helperText={errors.accountHolder}
                  />
                </Stack>

                {/* Processing Time Information */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Processing Time:</strong> Bank wire transfers are processed within 6 hours during business hours. 
                    You will receive a confirmation email once the payment is verified. Your tickets will be sent after payment confirmation.
                  </Typography>
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert severity="info" icon={<SecurityIcon />} sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Secure Payment:</strong> This is a demo application. All payment information is simulated for educational purposes only. 
            Check paymentInformation.md for test credentials.
          </Typography>
        </Alert>

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
                : `Pay $${totalAmount.toFixed(2)}`
            }
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default PaymentMethods; 