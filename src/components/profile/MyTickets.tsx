import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../../contexts/AuthContext';
import { getUserTickets, UserTicket, updateTicketStatus } from '../../utils/ticketStorage';
import TicketTemplate from '../common/TicketTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [downloadingTicket, setDownloadingTicket] = useState<UserTicket | null>(null);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadMenu = (event: React.MouseEvent<HTMLElement>, ticket: UserTicket) => {
    setDownloadMenuAnchor(event.currentTarget);
    setDownloadingTicket(ticket);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadMenuAnchor(null);
    setDownloadingTicket(null);
  };

  const handleDownloadPDF = async () => {
    if (!downloadingTicket) return;
    
    setIsGeneratingDownload(true);
    handleCloseDownloadMenu();

    try {
      // Wait a moment for menu to close and focus to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a temporary visible container matching mobile dialog size
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 600px;
        height: auto;
        min-height: 800px;
        background: white;
        z-index: 9999;
        padding: 24px;
        box-sizing: border-box;
        overflow: visible;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      `;
      
      document.body.appendChild(tempContainer);
      
      // Create React element and render it
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const TicketTemplate = (await import('../common/TicketTemplate')).default;
      
      const root = ReactDOM.createRoot(tempContainer);
      
      // Render the ticket with a promise to wait for completion
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(TicketTemplate, {
            ticket: downloadingTicket,
            isDownloadVersion: false, // Use mobile screenshot version
            ref: (ref: HTMLDivElement) => {
              if (ref) {
                // Wait for images and fonts to load
                setTimeout(async () => {
                  try {
                    const canvas = await html2canvas(ref, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                      logging: false,
                      height: ref.scrollHeight,
                      width: ref.scrollWidth
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                      orientation: 'portrait',
                      unit: 'mm',
                      format: [canvas.width * 0.264583, canvas.height * 0.264583] // Convert px to mm
                    });

                    // Add image to fit the PDF dimensions
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`ticket-${downloadingTicket.bookingId}.pdf`);
                    
                    resolve();
                  } catch (error) {
                    console.error('Error in PDF generation:', error);
                    resolve();
                  }
                }, 1000); // Wait for fonts and QR code to load
              }
            }
          })
        );
      });
      
      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!downloadingTicket) return;
    
    setIsGeneratingDownload(true);
    handleCloseDownloadMenu();

    try {
      // Wait a moment for menu to close and focus to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a temporary visible container matching mobile dialog size
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 600px;
        height: auto;
        min-height: 800px;
        background: white;
        z-index: 9999;
        padding: 24px;
        box-sizing: border-box;
        overflow: visible;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      `;
      
      document.body.appendChild(tempContainer);
      
      // Create React element and render it
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const TicketTemplate = (await import('../common/TicketTemplate')).default;
      
      const root = ReactDOM.createRoot(tempContainer);
      
      // Render the ticket with a promise to wait for completion
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(TicketTemplate, {
            ticket: downloadingTicket,
            isDownloadVersion: false, // Use mobile screenshot version
            ref: (ref: HTMLDivElement) => {
              if (ref) {
                // Wait for images and fonts to load
                setTimeout(async () => {
                  try {
                    const canvas = await html2canvas(ref, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                      logging: false,
                      height: ref.scrollHeight,
                      width: ref.scrollWidth
                    });

                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ticket-${downloadingTicket.bookingId}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                      resolve();
                    });
                    
                  } catch (error) {
                    console.error('Error in image generation:', error);
                    resolve();
                  }
                }, 1000); // Wait for fonts and QR code to load
              }
            }
          })
        );
      });
      
      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleScreenshotMode = () => {
    if (!downloadingTicket) return;
    
    setSelectedTicket(downloadingTicket);
    setQrDialogOpen(true);
    handleCloseDownloadMenu();
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
                            {ticket.category === 'movies' && ticket.selectedDate && ticket.selectedTime
                              ? `${formatDate(ticket.selectedDate)} at ${ticket.selectedTime}`
                              : `${formatDate(ticket.date)} at ${ticket.time}`
                            }
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
                          endIcon={<ArrowDropDownIcon />}
                          onClick={(e) => handleDownloadMenu(e, ticket)}
                          disabled={isGeneratingDownload}
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
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(e) => handleDownloadMenu(e, ticket)}
                        disabled={isGeneratingDownload}
                        sx={{ mt: 1, color: '#6a5acd' }}
                        size="small"
                      >
                        Download Ticket
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </TabPanel>

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={handleCloseDownloadMenu}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleDownloadPDF} disabled={isGeneratingDownload}>
          <ListItemIcon>
            <PictureAsPdfIcon />
          </ListItemIcon>
          <ListItemText primary="Download as PDF" />
        </MenuItem>
        <MenuItem onClick={handleDownloadImage} disabled={isGeneratingDownload}>
          <ListItemIcon>
            <CameraAltIcon />
          </ListItemIcon>
          <ListItemText primary="Download as Image" />
        </MenuItem>
        <MenuItem onClick={handleScreenshotMode} disabled={isGeneratingDownload}>
          <ListItemIcon>
            <CameraAltIcon />
          </ListItemIcon>
          <ListItemText primary="Mobile Screenshot View" />
        </MenuItem>
      </Menu>

      {/* Note: Ticket template now rendered dynamically for PDF/Image generation */}

      {/* QR Code Dialog - Mobile Optimized for Screenshots */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: 1 } }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          bgcolor: '#6a5acd', 
          color: 'white',
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          📱 Mobile Ticket View
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedTicket && (
            <TicketTemplate
              ticket={selectedTicket}
              isDownloadVersion={false}
            />
          )}
          
          {/* Screenshot Instructions */}
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📸 How to take a screenshot:
            </Typography>
            <Typography variant="body2" component="div">
              <strong>iPhone/iPad:</strong> Press Home + Power buttons<br />
              <strong>Android:</strong> Press Volume Down + Power buttons<br />
              <strong>Desktop:</strong> Use Snipping Tool or Print Screen
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setQrDialogOpen(false)} sx={{ color: '#6a5acd' }}>
            Close
          </Button>
          {selectedTicket && (
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={() => {
                setQrDialogOpen(false);
                // Take a screenshot or navigate to screenshot view
                alert('Take a screenshot of this screen for your ticket!');
              }}
              sx={{
                bgcolor: '#6a5acd',
                '&:hover': { bgcolor: '#5a4fcf' }
              }}
            >
              Take Screenshot
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTickets; 