import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Alert,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  EventSeat as EventSeatIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Close as CloseIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getUserTickets, UserTicket, updateTicketStatus } from '../../utils/ticketStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
  </div>
);

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);

  const loadTickets = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userTickets = await getUserTickets(user.id);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: UserTicket['status']) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'used': return '#9e9e9e';
      case 'cancelled': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getStatusText = (status: UserTicket['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'used': return 'Used';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const isEventInPast = (date: string, time: string) => {
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime < new Date();
  };

  const filterTickets = () => {
    return tickets.filter(ticket => {
      if (selectedTab === 0) return ticket.status === 'active'; // Current tickets
      if (selectedTab === 1) return ticket.status === 'used' || isEventInPast(ticket.date, ticket.time); // Past tickets
      return true;
    });
  };

  const handleShowQRCode = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
  };

  const handleDownloadTicket = (ticket: UserTicket) => {
    // Create a simple text-based ticket for download
    const ticketContent = `
SHOWTIME CANADA - E-TICKET

Booking ID: ${ticket.bookingId}
Event: ${ticket.eventTitle}
Date: ${formatDate(ticket.date)}
Time: ${ticket.time}
Venue: ${ticket.venue}
Location: ${ticket.location}
Seats: ${ticket.selectedSeats.join(', ')}
Total Amount: $${ticket.totalAmount.toFixed(2)} CAD

QR Code Data: ${ticket.qrCode}

Please present this ticket at the venue.
Valid ID may be required.
`;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMarkAsUsed = async (ticket: UserTicket) => {
    try {
      await updateTicketStatus(ticket.id, 'used');
      await loadTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentTickets = filterTickets();
  const pastTickets = tickets.filter(ticket => ticket.status === 'used' || isEventInPast(ticket.date, ticket.time));

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#6a5acd',
              '&.Mui-selected': {
                color: '#6a5acd',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6a5acd'
            }
          }}
        >
          <Tab 
            label={`Current Tickets (${tickets.filter(t => t.status === 'active').length})`}
            icon={<TicketIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Past Tickets (${pastTickets.length})`}
            icon={<EventIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {currentTickets.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No Current Tickets
            </Typography>
            <Typography>
              You don't have any active tickets. Book your next event to see tickets here!
            </Typography>
          </Alert>
        ) : (
          <Stack spacing={3}>
            {currentTickets.map((ticket) => (
              <Card key={ticket.id} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Event Image */}
                    <Box sx={{ flex: '0 0 200px' }}>
                      <Box
                        component="img"
                        src={ticket.eventImage}
                        alt={ticket.eventTitle}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                      />
                    </Box>
                    
                    {/* Ticket Details */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>
                          {ticket.eventTitle}
                        </Typography>
                        <Chip
                          label={getStatusText(ticket.status)}
                          sx={{
                            bgcolor: getStatusColor(ticket.status),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {ticket.eventDescription}
                      </Typography>
                      
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant="body2">
                            {formatDate(ticket.date)} at {ticket.time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant="body2">
                            {ticket.venue}, {ticket.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventSeatIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant="body2">
                            Seats: {ticket.selectedSeats.join(', ')}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 2 }}>
                        Total: ${ticket.totalAmount.toFixed(2)} CAD
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Booking ID: {ticket.bookingId} • Booked on {new Date(ticket.bookingDate).toLocaleDateString()}
                      </Typography>
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="contained"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleShowQRCode(ticket)}
                          sx={{
                            bgcolor: '#6a5acd',
                            '&:hover': { bgcolor: '#5a4fcf' }
                          }}
                        >
                          Show QR Code
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadTicket(ticket)}
                          sx={{
                            borderColor: '#6a5acd',
                            color: '#6a5acd',
                            '&:hover': { borderColor: '#5a4fcf', bgcolor: 'rgba(106, 90, 205, 0.04)' }
                          }}
                        >
                          Download Ticket
                        </Button>
                        {ticket.status === 'active' && isEventInPast(ticket.date, ticket.time) && (
                          <Button
                            variant="outlined"
                            onClick={() => handleMarkAsUsed(ticket)}
                            sx={{ color: '#9e9e9e', borderColor: '#9e9e9e' }}
                          >
                            Mark as Used
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {pastTickets.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No Past Tickets
            </Typography>
            <Typography>
              Your attended events will appear here after completion.
            </Typography>
          </Alert>
        ) : (
          <Stack spacing={3}>
            {pastTickets.map((ticket) => (
              <Card key={ticket.id} elevation={1} sx={{ borderRadius: 2, opacity: 0.8 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: '0 0 150px' }}>
                      <Box
                        component="img"
                        src={ticket.eventImage}
                        alt={ticket.eventTitle}
                        sx={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 2,
                          filter: 'grayscale(20%)'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#666' }}>
                          {ticket.eventTitle}
                        </Typography>
                        <Chip
                          label="Attended"
                          size="small"
                          sx={{ bgcolor: '#9e9e9e', color: 'white' }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {formatDate(ticket.date)} at {ticket.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.venue} • Seats: {ticket.selectedSeats.join(', ')}
                      </Typography>
                      
                      <Button
                        variant="text"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadTicket(ticket)}
                        sx={{ mt: 1, color: '#6a5acd' }}
                        size="small"
                      >
                        Download Receipt
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </TabPanel>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ticket QR Code</Typography>
          <IconButton onClick={() => setQrDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {selectedTicket && (
            <>
              <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
                {selectedTicket.eventTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatDate(selectedTicket.date)} at {selectedTicket.time}
              </Typography>
              
              {/* QR Code Placeholder */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  bgcolor: '#f5f5f5',
                  border: '2px solid #6a5acd',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  my: 3,
                  position: 'relative'
                }}
              >
                <QrCodeIcon sx={{ fontSize: 60, color: '#6a5acd' }} />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    fontSize: '10px',
                    color: '#666',
                    textAlign: 'center',
                    px: 1
                  }}
                >
                  {selectedTicket.bookingId}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Show this QR code at the venue entrance
              </Typography>
              
              <Alert severity="info" sx={{ textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Instructions:</strong>
                  <br />• Arrive 15 minutes before showtime
                  <br />• Have valid ID ready
                  <br />• Keep this QR code accessible on your device
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          {selectedTicket && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleDownloadTicket(selectedTicket);
                setQrDialogOpen(false);
              }}
              sx={{
                bgcolor: '#6a5acd',
                '&:hover': { bgcolor: '#5a4fcf' }
              }}
            >
              Download Ticket
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTickets; 