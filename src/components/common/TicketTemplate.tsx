import React, { forwardRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import QRCode from 'qrcode';
import { UserTicket } from '../../utils/ticketStorage';

interface TicketTemplateProps {
  ticket: UserTicket;
  isDownloadVersion?: boolean;
}

const TicketTemplate = forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ ticket, isDownloadVersion = false }, ref) => {
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

    useEffect(() => {
      // Generate QR code
      const generateQRCode = async () => {
        try {
          const qrData = ticket.qrCode || JSON.stringify({
            ticketId: ticket.id,
            eventId: ticket.eventId,
            bookingId: ticket.bookingId,
            userId: ticket.userId,
            eventTitle: ticket.eventTitle,
            date: ticket.date,
            time: ticket.time,
            seats: ticket.selectedSeats,
            venue: ticket.venue
          });

          const qrCodeURL = await QRCode.toDataURL(qrData, {
            width: isDownloadVersion ? 200 : 150,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataURL(qrCodeURL);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };

      generateQRCode();
    }, [ticket, isDownloadVersion]);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const containerStyle = {
      width: isDownloadVersion ? '800px' : '100%',
      maxWidth: isDownloadVersion ? '800px' : 'none',
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
            🎫 SHOWTIME CANADA
          </Typography>
          <Typography
            variant={isDownloadVersion ? "h5" : "h6"}
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: isDownloadVersion ? '1.5rem' : '1.25rem'
            }}
          >
            ADMISSION TICKET
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: '#6a5acd', borderWidth: 1 }} />

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Side - Event Info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={isDownloadVersion ? "h4" : "h5"}
              sx={{
                fontWeight: 'bold',
                color: '#6a5acd',
                mb: 2,
                fontSize: isDownloadVersion ? '1.8rem' : '1.5rem'
              }}
            >
              {ticket.eventTitle}
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  📅 EVENT DATE & TIME
                </Typography>
                <Typography variant={isDownloadVersion ? "h6" : "body1"} sx={{ fontWeight: 'bold' }}>
                  {formatDate(ticket.date)} at {ticket.time}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  📍 VENUE & LOCATION
                </Typography>
                <Typography variant={isDownloadVersion ? "h6" : "body1"} sx={{ fontWeight: 'bold' }}>
                  {ticket.venue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ticket.location}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  🪑 SEAT(S)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {ticket.selectedSeats.map((seat, index) => (
                    <Chip
                      key={index}
                      label={seat}
                      sx={{
                        bgcolor: '#6a5acd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: isDownloadVersion ? '1rem' : '0.875rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  🎟️ BOOKING REFERENCE
                </Typography>
                <Typography 
                  variant={isDownloadVersion ? "h6" : "body1"} 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    letterSpacing: 1
                  }}
                >
                  {ticket.bookingId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  💳 TOTAL AMOUNT
                </Typography>
                <Typography variant={isDownloadVersion ? "h6" : "body1"} sx={{ fontWeight: 'bold' }}>
                  ${ticket.totalAmount.toFixed(2)} CAD
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right Side - QR Code */}
          <Box
            sx={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              bgcolor: '#f8f8f8',
              borderRadius: 2,
              border: '2px dashed #6a5acd'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: '#6a5acd',
                mb: 2,
                textAlign: 'center'
              }}
            >
              SCAN FOR ENTRY
            </Typography>
            
            {qrCodeDataURL && (
              <Box
                component="img"
                src={qrCodeDataURL}
                alt="QR Code"
                sx={{
                  width: isDownloadVersion ? 200 : 150,
                  height: isDownloadVersion ? 200 : 150,
                  border: '2px solid #6a5acd',
                  borderRadius: 1
                }}
              />
            )}
            
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: isDownloadVersion ? '0.875rem' : '0.75rem'
              }}
            >
              Present this QR code at venue entrance
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: '#6a5acd', borderWidth: 1 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Booking Date: {new Date(ticket.bookingDate).toLocaleDateString('en-CA')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ⚠️ This ticket is non-transferable and non-refundable. Please arrive 30 minutes before the event.
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

TicketTemplate.displayName = 'TicketTemplate';

export default TicketTemplate; 