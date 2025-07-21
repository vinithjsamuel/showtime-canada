// Utility for managing booked seats across events
// Since events.json is static, we use localStorage to track booked seats

export interface BookedSeat {
  eventId: number;
  seatId: string;
  bookingId: string;
  userId?: string;
  bookedAt: string;
}

const BOOKED_SEATS_KEY = 'showtime_booked_seats';

// Get all booked seats from localStorage
export const getAllBookedSeats = (): BookedSeat[] => {
  try {
    const bookedSeats = localStorage.getItem(BOOKED_SEATS_KEY);
    return bookedSeats ? JSON.parse(bookedSeats) : [];
  } catch (error) {
    console.error('Error reading booked seats:', error);
    return [];
  }
};

// Get booked seats for a specific event
export const getBookedSeatsForEvent = (eventId: number): string[] => {
  const allBookedSeats = getAllBookedSeats();
  return allBookedSeats
    .filter(seat => seat.eventId === eventId)
    .map(seat => seat.seatId);
};

// Mark seats as booked for an event
export const markSeatsAsBooked = (
  eventId: number, 
  seatIds: string[], 
  bookingId: string, 
  userId?: string
): void => {
  try {
    const allBookedSeats = getAllBookedSeats();
    const timestamp = new Date().toISOString();
    
    // Create new booked seat entries
    const newBookedSeats: BookedSeat[] = seatIds.map(seatId => ({
      eventId,
      seatId,
      bookingId,
      userId,
      bookedAt: timestamp
    }));
    
    // Remove any existing bookings for these seats (in case of rebooking)
    const filteredSeats = allBookedSeats.filter(seat => 
      !(seat.eventId === eventId && seatIds.includes(seat.seatId))
    );
    
    // Add new bookings
    const updatedSeats = [...filteredSeats, ...newBookedSeats];
    
    localStorage.setItem(BOOKED_SEATS_KEY, JSON.stringify(updatedSeats));
    
    console.log(`Marked seats as booked: ${seatIds.join(', ')} for event ${eventId}`);
  } catch (error) {
    console.error('Error marking seats as booked:', error);
  }
};

// Check if a specific seat is booked
export const isSeatBooked = (eventId: number, seatId: string): boolean => {
  const bookedSeats = getBookedSeatsForEvent(eventId);
  return bookedSeats.includes(seatId);
};

// Get merged seat availability (original + booked seats)
export const getMergedSeatAvailability = (
  eventId: number, 
  originalAvailability: Record<string, string>
): Record<string, string> => {
  const bookedSeats = getBookedSeatsForEvent(eventId);
  const mergedAvailability = { ...originalAvailability };
  
  // Mark dynamically booked seats as 'booked'
  bookedSeats.forEach(seatId => {
    mergedAvailability[seatId] = 'booked';
  });
  
  return mergedAvailability;
};

// Remove booked seats (for cancellation, admin, etc.)
export const removeBookedSeats = (eventId: number, seatIds: string[]): void => {
  try {
    const allBookedSeats = getAllBookedSeats();
    const filteredSeats = allBookedSeats.filter(seat => 
      !(seat.eventId === eventId && seatIds.includes(seat.seatId))
    );
    
    localStorage.setItem(BOOKED_SEATS_KEY, JSON.stringify(filteredSeats));
    console.log(`Removed booked seats: ${seatIds.join(', ')} for event ${eventId}`);
  } catch (error) {
    console.error('Error removing booked seats:', error);
  }
};

// Get booking info for specific seats
export const getBookingInfo = (eventId: number, seatIds: string[]): BookedSeat[] => {
  const allBookedSeats = getAllBookedSeats();
  return allBookedSeats.filter(seat => 
    seat.eventId === eventId && seatIds.includes(seat.seatId)
  );
};

// Clear all booked seats (for testing/demo purposes)
export const clearAllBookedSeats = (): void => {
  localStorage.removeItem(BOOKED_SEATS_KEY);
  console.log('All booked seats cleared');
};

// Get statistics
export const getBookingStats = () => {
  const allBookedSeats = getAllBookedSeats();
  const eventStats: Record<number, number> = {};
  
  allBookedSeats.forEach(seat => {
    eventStats[seat.eventId] = (eventStats[seat.eventId] || 0) + 1;
  });
  
  return {
    totalBookedSeats: allBookedSeats.length,
    eventsWithBookings: Object.keys(eventStats).length,
    eventStats
  };
}; 