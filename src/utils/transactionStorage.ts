import { getUserTickets, UserTicket } from './ticketStorage';

export interface Transaction {
  id: string;
  userId: string;
  transactionId: string;
  eventId: number;
  eventTitle: string;
  eventImage: string;
  venue: string;
  location: string;
  eventDate: string;
  eventTime: string;
  purchaseDate: string;
  totalAmount: number;
  paymentMethod: string;
  bookingId: string;
  seatsCount: number;
  selectedSeats: string[];
  status: 'completed' | 'refunded' | 'failed';
  category: string;
  receiptData: {
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
  };
}

// Convert UserTicket to Transaction format
const ticketToTransaction = (ticket: UserTicket): Transaction => {
  // Calculate breakdown (simplified for demo)
  const subtotal = ticket.totalAmount * 0.85; // ~85% is base price
  const taxes = ticket.totalAmount * 0.13; // ~13% HST/GST
  const fees = ticket.totalAmount * 0.02; // ~2% processing fees
  
  return {
    id: `txn_${ticket.id}`,
    userId: ticket.userId,
    transactionId: ticket.transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    eventId: ticket.eventId,
    eventTitle: ticket.eventTitle,
    eventImage: ticket.eventImage,
    venue: ticket.venue,
    location: ticket.location,
    eventDate: ticket.date,
    eventTime: ticket.time,
    purchaseDate: ticket.bookingDate,
    totalAmount: ticket.totalAmount,
    paymentMethod: ticket.paymentMethod,
    bookingId: ticket.bookingId,
    seatsCount: ticket.selectedSeats.length,
    selectedSeats: ticket.selectedSeats,
    status: ticket.status === 'cancelled' ? 'refunded' : 'completed',
    category: ticket.category,
    receiptData: {
      subtotal: Number(subtotal.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      fees: Number(fees.toFixed(2)),
      total: ticket.totalAmount
    }
  };
};

// Get all transactions for a user
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const tickets = await getUserTickets(userId);
    const transactions = tickets.map(ticketToTransaction);
    
    // Sort by purchase date (newest first)
    return transactions.sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<Transaction[]> => {
  const allTransactions = await getUserTransactions(userId);
  
  return allTransactions.filter(transaction => {
    const purchaseDate = new Date(transaction.purchaseDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return purchaseDate >= start && purchaseDate <= end;
  });
};

// Get transactions by payment method
export const getTransactionsByPaymentMethod = async (
  userId: string, 
  paymentMethod: string
): Promise<Transaction[]> => {
  const allTransactions = await getUserTransactions(userId);
  
  return allTransactions.filter(transaction => 
    transaction.paymentMethod === paymentMethod
  );
};

// Get transaction statistics
export const getTransactionStats = async (userId: string) => {
  const transactions = await getUserTransactions(userId);
  
  const totalSpent = transactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  const totalTransactions = transactions.length;
  const totalTickets = transactions.reduce((sum, txn) => sum + txn.seatsCount, 0);
  
  const paymentMethodBreakdown = transactions.reduce((acc, txn) => {
    acc[txn.paymentMethod] = (acc[txn.paymentMethod] || 0) + txn.totalAmount;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryBreakdown = transactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.totalAmount;
    return acc;
  }, {} as Record<string, number>);
  
  const averageSpending = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
  
  return {
    totalSpent,
    totalTransactions,
    totalTickets,
    averageSpending: Number(averageSpending.toFixed(2)),
    paymentMethodBreakdown,
    categoryBreakdown,
    lastTransactionDate: transactions.length > 0 ? transactions[0].purchaseDate : null
  };
};

// Generate receipt data for download
export const generateReceiptData = (transaction: Transaction): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
SHOWTIME CANADA
TRANSACTION RECEIPT
===============================================

Transaction ID: ${transaction.transactionId}
Booking Reference: ${transaction.bookingId}
Purchase Date: ${formatDate(transaction.purchaseDate)}

EVENT DETAILS
-----------------------------------------------
Event: ${transaction.eventTitle}
Date: ${formatDate(transaction.eventDate)} at ${transaction.eventTime}
Venue: ${transaction.venue}
Location: ${transaction.location}
Category: ${transaction.category.toUpperCase()}

TICKET DETAILS
-----------------------------------------------
Seats: ${transaction.selectedSeats.join(', ')}
Quantity: ${transaction.seatsCount} ticket(s)

PAYMENT BREAKDOWN
-----------------------------------------------
Subtotal:           $${transaction.receiptData.subtotal.toFixed(2)}
Taxes (HST/GST):    $${transaction.receiptData.taxes.toFixed(2)}
Processing Fees:    $${transaction.receiptData.fees.toFixed(2)}
-----------------------------------------------
TOTAL PAID:         $${transaction.receiptData.total.toFixed(2)}

Payment Method: ${transaction.paymentMethod.toUpperCase()}
Status: ${transaction.status.toUpperCase()}

===============================================
Thank you for choosing Showtime Canada!
Visit us at: www.showtimecanada.com

This receipt serves as proof of purchase.
Please retain for your records.
===============================================
  `.trim();
}; 