import { openDB } from 'idb';

// Database setup for tickets
const DB_NAME = 'cinema-tickets-db';
const DB_VERSION = 2; // Increment version to add tickets store

export interface UserTicket {
  id: string;
  userId: string;
  eventId: number;
  bookingId: string;
  eventTitle: string;
  eventDescription: string;
  eventImage: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  selectedSeats: string[];
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
  bookingDate: string;
  qrCode?: string;
  status: 'active' | 'used' | 'cancelled';
  category: string;
}

// Initialize database with tickets store
export const initTicketsDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create users store if it doesn't exist (for compatibility)
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
      }
      
      // Create tickets store if it doesn't exist
      if (!db.objectStoreNames.contains('tickets')) {
        const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' });
        ticketStore.createIndex('userId', 'userId', { unique: false });
        ticketStore.createIndex('bookingId', 'bookingId', { unique: true });
        ticketStore.createIndex('eventId', 'eventId', { unique: false });
        ticketStore.createIndex('status', 'status', { unique: false });
      }
    },
  });
  
  return db;
};

// Generate QR code data
export const generateQRCodeData = (ticket: UserTicket): string => {
  const qrData = {
    bookingId: ticket.bookingId,
    eventTitle: ticket.eventTitle,
    venue: ticket.venue,
    date: ticket.date,
    time: ticket.time,
    seats: ticket.selectedSeats.join(', '),
    userId: ticket.userId
  };
  
  // For demo purposes, we'll create a JSON string
  // In a real app, this would be encrypted/signed
  return JSON.stringify(qrData);
};

// Save ticket to IndexedDB
export const saveTicket = async (ticketData: Omit<UserTicket, 'id' | 'qrCode'>): Promise<UserTicket> => {
  const db = await initTicketsDB();
  
  // Generate unique ticket ID
  const ticketId = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const ticket: UserTicket = {
    ...ticketData,
    id: ticketId,
    qrCode: ''
  };
  
  // Generate QR code data
  ticket.qrCode = generateQRCodeData(ticket);
  
  // Save ticket to database
  await db.add('tickets', ticket);
  
  return ticket;
};

// Get all tickets for a user
export const getUserTickets = async (userId: string): Promise<UserTicket[]> => {
  const db = await initTicketsDB();
  
  const tx = db.transaction('tickets', 'readonly');
  const store = tx.objectStore('tickets');
  const index = store.index('userId');
  
  const tickets = await index.getAll(userId);
  
  // Sort by booking date (newest first)
  tickets.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  
  return tickets;
};

// Get ticket by booking ID
export const getTicketByBookingId = async (bookingId: string): Promise<UserTicket | undefined> => {
  const db = await initTicketsDB();
  
  const tx = db.transaction('tickets', 'readonly');
  const store = tx.objectStore('tickets');
  const index = store.index('bookingId');
  
  return await index.get(bookingId);
};

// Update ticket status
export const updateTicketStatus = async (ticketId: string, status: UserTicket['status']): Promise<void> => {
  const db = await initTicketsDB();
  
  const tx = db.transaction('tickets', 'readwrite');
  const store = tx.objectStore('tickets');
  
  const ticket = await store.get(ticketId);
  if (ticket) {
    ticket.status = status;
    await store.put(ticket);
  }
  
  await tx.done;
};

// Delete ticket
export const deleteTicket = async (ticketId: string): Promise<void> => {
  const db = await initTicketsDB();
  
  const tx = db.transaction('tickets', 'readwrite');
  const store = tx.objectStore('tickets');
  
  await store.delete(ticketId);
  await tx.done;
};

// Get tickets by category
export const getTicketsByCategory = async (userId: string, category: string): Promise<UserTicket[]> => {
  const tickets = await getUserTickets(userId);
  return tickets.filter(ticket => ticket.category === category);
};

// Get active tickets (not used or cancelled)
export const getActiveTickets = async (userId: string): Promise<UserTicket[]> => {
  const tickets = await getUserTickets(userId);
  return tickets.filter(ticket => ticket.status === 'active');
};

// Get past tickets (used)
export const getPastTickets = async (userId: string): Promise<UserTicket[]> => {
  const tickets = await getUserTickets(userId);
  return tickets.filter(ticket => ticket.status === 'used');
}; 