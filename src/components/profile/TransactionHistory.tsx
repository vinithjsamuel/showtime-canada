import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  EventSeat as EventSeatIcon,
  LocationOn as LocationOnIcon,
  Payment as PaymentIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CameraAlt as CameraAltIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Transaction, getUserTransactions, getTransactionStats, generateReceiptData } from '../../utils/transactionStorage';
import ReceiptTemplate from '../common/ReceiptTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [downloadingTransaction, setDownloadingTransaction] = useState<Transaction | null>(null);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [userTransactions, userStats] = await Promise.all([
        getUserTransactions(user.id),
        getTransactionStats(user.id)
      ]);
      
      setTransactions(userTransactions);
      setFilteredTransactions(userTransactions);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    // Apply filters
    let filtered = [...transactions];

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filterPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(txn => 
        new Date(txn.purchaseDate) >= cutoffDate
      );
    }

    // Payment method filter
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(txn => 
        txn.paymentMethod === filterPaymentMethod
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterPeriod, filterPaymentMethod, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'refunded': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'refunded': return 'Refunded';
      case 'failed': return 'Failed';
      default: return 'Processing';
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'creditcard': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'applepay': return 'Apple Pay';
      case 'googlepay': return 'Google Pay';
      case 'samsungpay': return 'Samsung Pay';
      case 'bankwire': return 'Bank Transfer';
      default: return method;
    }
  };

  const handleDownloadMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setDownloadMenuAnchor(event.currentTarget);
    setDownloadingTransaction(transaction);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadMenuAnchor(null);
    setDownloadingTransaction(null);
  };

  const handleDownloadTextReceipt = (transaction: Transaction) => {
    const receiptContent = generateReceiptData(transaction);
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const handleDownloadPDF = async () => {
    if (!downloadingTransaction) return;
    
    setIsGeneratingDownload(true);
    handleCloseDownloadMenu();

    try {
      // Wait a moment for menu to close and focus to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a temporary visible container for proper rendering
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
      const ReceiptTemplate = (await import('../common/ReceiptTemplate')).default;
      
      const root = ReactDOM.createRoot(tempContainer);
      
      // Render the receipt with a promise to wait for completion
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(ReceiptTemplate, {
            transaction: downloadingTransaction,
            isDownloadVersion: true,
            ref: (ref: HTMLDivElement) => {
              if (ref) {
                // Wait for fonts to load
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
                    pdf.save(`receipt-${downloadingTransaction.bookingId}.pdf`);
                    
                    resolve();
                  } catch (error) {
                    console.error('Error in PDF generation:', error);
                    resolve();
                  }
                }, 1000); // Wait for fonts to load
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
    if (!downloadingTransaction) return;
    
    setIsGeneratingDownload(true);
    handleCloseDownloadMenu();

    try {
      // Wait a moment for menu to close and focus to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a temporary visible container for proper rendering
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
      const ReceiptTemplate = (await import('../common/ReceiptTemplate')).default;
      
      const root = ReactDOM.createRoot(tempContainer);
      
      // Render the receipt with a promise to wait for completion
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(ReceiptTemplate, {
            transaction: downloadingTransaction,
            isDownloadVersion: true,
            ref: (ref: HTMLDivElement) => {
              if (ref) {
                // Wait for fonts to load
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
                        a.download = `receipt-${downloadingTransaction.bookingId}.png`;
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
                }, 1000); // Wait for fonts to load
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
        💳 Transaction History
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track all your event purchases and download receipts for your records.
      </Typography>

      {/* Statistics Summary */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                ${stats.totalSpent.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
          
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ReceiptIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {stats.totalTransactions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Transactions
              </Typography>
            </CardContent>
          </Card>
          
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <EventSeatIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {stats.totalTickets}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tickets Purchased
              </Typography>
            </CardContent>
          </Card>
          
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PaymentIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                ${stats.averageSpending.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average Spending
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#6a5acd' }}>
            Filter Transactions
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2 
          }}>
            <TextField
              fullWidth
              size="small"
              label="Search events or booking ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Event name, booking ID..."
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                label="Time Period"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="creditcard">Credit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="applepay">Apple Pay</MenuItem>
                <MenuItem value="googlepay">Google Pay</MenuItem>
                <MenuItem value="samsungpay">Samsung Pay</MenuItem>
                <MenuItem value="bankwire">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>No Transactions Found</Typography>
          <Typography>
            {transactions.length === 0 
              ? "You haven't made any purchases yet. Book your first event to see transactions here!"
              : "No transactions match your current filters. Try adjusting your search criteria."
            }
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={3}>
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Event Image */}
                  <Box sx={{ flex: '0 0 120px' }}>
                    <Box
                      component="img"
                      src={transaction.eventImage}
                      alt={transaction.eventTitle}
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 2
                      }}
                    />
                  </Box>
                  
                  {/* Transaction Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6a5acd' }}>
                        {transaction.eventTitle}
                      </Typography>
                      <Chip
                        label={getStatusText(transaction.status)}
                        sx={{
                          bgcolor: getStatusColor(transaction.status),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2, 
                      mb: 2 
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DateRangeIcon sx={{ color: '#6a5acd', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            <strong>Event Date:</strong> {transaction.category === 'movies' && transaction.selectedDate && transaction.selectedTime
                              ? `${formatDate(transaction.selectedDate)} at ${transaction.selectedTime}`
                              : `${formatDate(transaction.eventDate)} at ${transaction.eventTime}`
                            }
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ color: '#6a5acd', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            <strong>Venue:</strong> {transaction.venue}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventSeatIcon sx={{ color: '#6a5acd', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            <strong>Seats:</strong> {transaction.selectedSeats.join(', ')} ({transaction.seatsCount} ticket{transaction.seatsCount !== 1 ? 's' : ''})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PaymentIcon sx={{ color: '#6a5acd', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            <strong>Payment:</strong> {getPaymentMethodDisplay(transaction.paymentMethod)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          ${transaction.totalAmount.toFixed(2)} CAD
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Purchased: {formatDateTime(transaction.purchaseDate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {transaction.bookingId}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          endIcon={<ArrowDropDownIcon />}
                          onClick={(e) => handleDownloadMenu(e, transaction)}
                          disabled={isGeneratingDownload}
                          sx={{
                            borderColor: '#6a5acd',
                            color: '#6a5acd',
                            '&:hover': { borderColor: '#5a4fcf', bgcolor: 'rgba(106, 90, 205, 0.04)' }
                          }}
                        >
                          Download Receipt
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

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
        <MenuItem 
          onClick={() => downloadingTransaction && handleDownloadTextReceipt(downloadingTransaction)} 
          disabled={isGeneratingDownload}
        >
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Download as Text" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TransactionHistory; 