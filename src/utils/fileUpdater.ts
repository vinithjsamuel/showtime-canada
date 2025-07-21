// Client-side utility to update events.json data persistently
// Since we can't write to files in browser, we'll maintain the updates in localStorage

import eventsData from '../data/events.json';

const EVENTS_UPDATES_KEY = 'showtime_events_updates';

interface EventUpdate {
  eventId: number;
  seatUpdates: Record<string, string>; // seatId -> status
  updatedAt: string;
}

// Get all event updates from localStorage
export const getEventUpdates = (): EventUpdate[] => {
  try {
    const updates = localStorage.getItem(EVENTS_UPDATES_KEY);
    return updates ? JSON.parse(updates) : [];
  } catch (error) {
    console.error('Error reading event updates:', error);
    return [];
  }
};

// Save event updates to localStorage
const saveEventUpdates = (updates: EventUpdate[]): void => {
  try {
    localStorage.setItem(EVENTS_UPDATES_KEY, JSON.stringify(updates));
  } catch (error) {
    console.error('Error saving event updates:', error);
  }
};

// Update seat availability for an event
export const updateEventSeats = (
  eventId: number,
  seatUpdates: Record<string, string>
): void => {
  try {
    const allUpdates = getEventUpdates();
    const existingUpdateIndex = allUpdates.findIndex(update => update.eventId === eventId);
    
    const newUpdate: EventUpdate = {
      eventId,
      seatUpdates: { ...seatUpdates },
      updatedAt: new Date().toISOString()
    };
    
    if (existingUpdateIndex >= 0) {
      // Merge with existing updates
      allUpdates[existingUpdateIndex].seatUpdates = {
        ...allUpdates[existingUpdateIndex].seatUpdates,
        ...seatUpdates
      };
      allUpdates[existingUpdateIndex].updatedAt = newUpdate.updatedAt;
    } else {
      // Add new update
      allUpdates.push(newUpdate);
    }
    
    saveEventUpdates(allUpdates);
    console.log(`Updated seats for event ${eventId}:`, seatUpdates);
  } catch (error) {
    console.error('Error updating event seats:', error);
  }
};

// Get updated events data (original + localStorage updates)
export const getUpdatedEventsData = () => {
  try {
    const originalEvents = eventsData.events;
    const updates = getEventUpdates();
    
    // Apply updates to original data
    const updatedEvents = originalEvents.map(event => {
      const eventUpdate = updates.find(update => update.eventId === event.id);
      
      if (eventUpdate && event.seating?.availability) {
        return {
          ...event,
          seating: {
            ...event.seating,
            availability: {
              ...event.seating.availability,
              ...eventUpdate.seatUpdates
            }
          }
        };
      }
      
      return event;
    });
    
    return { events: updatedEvents };
  } catch (error) {
    console.error('Error getting updated events data:', error);
    return eventsData;
  }
};

// Get specific event with updates applied
export const getUpdatedEvent = (eventId: number) => {
  const updatedData = getUpdatedEventsData();
  return updatedData.events.find(event => event.id === eventId);
};

// Mark seats as booked in persistent storage
export const markSeatsAsBookedInData = (eventId: number, seatIds: string[]): void => {
  const seatUpdates: Record<string, string> = {};
  seatIds.forEach(seatId => {
    seatUpdates[seatId] = 'booked';
  });
  
  updateEventSeats(eventId, seatUpdates);
  console.log(`Marked seats as booked in persistent data: ${seatIds.join(', ')} for event ${eventId}`);
};

// Mark seats as available (for cancellations)
export const markSeatsAsAvailableInData = (eventId: number, seatIds: string[]): void => {
  const seatUpdates: Record<string, string> = {};
  seatIds.forEach(seatId => {
    seatUpdates[seatId] = 'available';
  });
  
  updateEventSeats(eventId, seatUpdates);
  console.log(`Marked seats as available in persistent data: ${seatIds.join(', ')} for event ${eventId}`);
};

// Get seat availability for an event (with updates applied)
export const getSeatAvailabilityWithUpdates = (eventId: number): Record<string, string> | null => {
  const event = getUpdatedEvent(eventId);
  if (!event?.seating?.availability) return null;
  
  // Filter out undefined values and ensure all values are strings
  const availability: Record<string, string> = {};
  Object.entries(event.seating.availability).forEach(([key, value]) => {
    if (value !== undefined && typeof value === 'string') {
      availability[key] = value;
    }
  });
  
  return availability;
};

// Clear all event updates (for testing/reset)
export const clearAllEventUpdates = (): void => {
  localStorage.removeItem(EVENTS_UPDATES_KEY);
  console.log('All event updates cleared');
};

// Get statistics about updates
export const getUpdateStats = () => {
  const updates = getEventUpdates();
  const totalUpdates = updates.reduce((acc, update) => acc + Object.keys(update.seatUpdates).length, 0);
  
  return {
    eventsWithUpdates: updates.length,
    totalSeatUpdates: totalUpdates,
    lastUpdate: updates.length > 0 ? Math.max(...updates.map(u => new Date(u.updatedAt).getTime())) : null
  };
}; 