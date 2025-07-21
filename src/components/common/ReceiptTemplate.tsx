import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import { Transaction } from '../../utils/transactionStorage';

interface ReceiptTemplateProps {
  transaction: Transaction;
  isDownloadVersion?: boolean;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ transaction, isDownloadVersion = false }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const containerStyle = {
      width: isDownloadVersion ? '600px' : '100%',
      maxWidth: isDownloadVersion ? '600px' : 'none',
      bgcolor: 'white',
      color: 'black',
      p: isDownloadVersion ? 4 : 3,
      borderRadius: 2,
      border: isDownloadVersion ? '2px solid #6a5acd' : 'none',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    };

    return (
      <Paper
        ref={ref}
        elevation={isDownloadVersion ? 8 : 3}
        sx={containerStyle}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant={isDownloadVersion ? "h3" : "h4"}
            sx={{
              fontWeight: 'bold',
              color: '#6a5acd',
              mb: 1,
              fontSize: isDownloadVersion ? '2.5rem' : '2rem'
            }}
          >
            🧾 SHOWTIME CANADA
          </Typography>
          <Typography
            variant={isDownloadVersion ? "h5" : "h6"}
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: isDownloadVersion ? '1.5rem' : '1.25rem'
            }}
          >
            TRANSACTION RECEIPT
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: '#6a5acd', borderWidth: 1 }} />

        {/* Transaction Details */}
        <Stack spacing={3}>
          {/* Transaction Info */}
          <Box>
            <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold', mb: 2 }}>
              Transaction Information
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Transaction ID:</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{transaction.transactionId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Booking Reference:</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{transaction.bookingId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Purchase Date:</Typography>
                <Typography variant="body2">{formatDateTime(transaction.purchaseDate)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Status:</Typography>
                <Typography variant="body2" sx={{ 
                  color: transaction.status === 'completed' ? '#4caf50' : 
                        transaction.status === 'refunded' ? '#ff9800' : '#f44336',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {transaction.status}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* Event Details */}
          <Box>
            <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold', mb: 2 }}>
              Event Details
            </Typography>
            <Stack spacing={1}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {transaction.eventTitle}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Event Date:</Typography>
                <Typography variant="body2">{formatDate(transaction.eventDate)} at {transaction.eventTime}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Venue:</Typography>
                <Typography variant="body2">{transaction.venue}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Location:</Typography>
                <Typography variant="body2">{transaction.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Category:</Typography>
                <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>{transaction.category}</Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* Ticket Details */}
          <Box>
            <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold', mb: 2 }}>
              Ticket Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Seats:</Typography>
                <Typography variant="body2">{transaction.selectedSeats.join(', ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Quantity:</Typography>
                <Typography variant="body2">{transaction.seatsCount} ticket{transaction.seatsCount !== 1 ? 's' : ''}</Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* Payment Breakdown */}
          <Box>
            <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold', mb: 2 }}>
              Payment Breakdown
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${transaction.receiptData.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Taxes (HST/GST):</Typography>
                <Typography variant="body2">${transaction.receiptData.taxes.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Processing Fees:</Typography>
                <Typography variant="body2">${transaction.receiptData.fees.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 1, borderColor: '#6a5acd' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>TOTAL PAID:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>
                  ${transaction.receiptData.total.toFixed(2)} CAD
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Payment Method:</Typography>
                <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                  {transaction.paymentMethod.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3, borderColor: '#6a5acd', borderWidth: 1 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ⚠️ This receipt serves as proof of purchase. Please retain for your records.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Thank you for choosing Showtime Canada!
          </Typography>
          {isDownloadVersion && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Generated by Showtime Canada • www.showtimecanada.com
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

export default ReceiptTemplate; 