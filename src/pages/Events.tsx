import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack, 
  Search, 
  LocationOn, 
  AccessTime,
  AttachMoney
} from '@mui/icons-material';
import eventCategoriesData from '../data/eventCategories.json';
import eventsData from '../data/events.json';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  image: string;
  featured: boolean;
  genre?: string;
  duration?: number;
  rating?: string;
  director?: string;
  releaseDate?: string;
  posterUrl?: string;
}

const Events: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [events] = useState<Event[]>(eventsData.events);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Load filters from URL params or localStorage on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const locationFromUrl = searchParams.get('location');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      localStorage.setItem('selectedEventCategory', categoryFromUrl);
    } else if (categoryId) {
      setSelectedCategory(categoryId);
      localStorage.setItem('selectedEventCategory', categoryId);
    } else {
      const savedCategory = localStorage.getItem('selectedEventCategory');
      if (savedCategory) {
        setSelectedCategory(savedCategory);
      }
    }

    if (locationFromUrl !== null) {
      // URL has explicit location parameter (including empty string for "All Locations")
      setSelectedLocation(locationFromUrl);
      localStorage.setItem('selectedEventLocation', locationFromUrl);
    } else {
      // No location in URL, check saved location or use user's location
      const savedLocation = localStorage.getItem('selectedEventLocation');
      
      if (savedLocation !== null) {
        // Use saved location (including empty string for "All Locations")
        setSelectedLocation(savedLocation);
      } else if (user?.location) {
        // No saved location, use user's location as default
        const userLocation = user.location;
        setSelectedLocation(userLocation);
        localStorage.setItem('selectedEventLocation', userLocation);
      }
    }
  }, [categoryId, searchParams]);

  // Set user location as default only once when everything is loaded
  useEffect(() => {
    if (!hasInitialized && user?.location) {
      const locationFromUrl = searchParams.get('location');
      const savedLocation = localStorage.getItem('selectedEventLocation');
      
      // Set user location as default unless there's an explicit choice in URL or localStorage
      if (locationFromUrl === null && savedLocation === null && !selectedLocation) {
        setSelectedLocation(user.location);
        localStorage.setItem('selectedEventLocation', user.location);
      }
      setHasInitialized(true);
      setIsLocationLoading(false);
    } else if (!hasInitialized && !user?.location) {
      // If no user location available, set to "All Locations"
      const locationFromUrl = searchParams.get('location');
      const savedLocation = localStorage.getItem('selectedEventLocation');
      
      if (locationFromUrl === null && savedLocation === null && !selectedLocation) {
        setSelectedLocation('all');
        localStorage.setItem('selectedEventLocation', 'all');
      }
      setHasInitialized(true);
      setIsLocationLoading(false);
    }
  }, [user?.location, hasInitialized, selectedLocation]);

  // Clear filters when navigating to plain /events, then set default location
  useEffect(() => {
    if (location.pathname === '/events' && !searchParams.get('category') && !searchParams.get('location') && !categoryId) {
      setSelectedCategory('');
      setSearchTerm('');
      setSelectedGenre('');
      setSelectedVenues([]);
      setSelectedDate('');
      setFromTime('');
      setToTime('');
      setMinPrice('');
      setMaxPrice('');
      localStorage.removeItem('selectedEventCategory');
      
      // Set user's location as default when clearing filters
      if (user?.location) {
        setSelectedLocation(user.location);
        localStorage.setItem('selectedEventLocation', user.location);
      } else {
        setSelectedLocation('all');
        localStorage.setItem('selectedEventLocation', 'all');
      }
    }
  }, [location.pathname, searchParams, categoryId, user?.location]);

  // Save filters to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedEventCategory', selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('selectedEventLocation', selectedLocation);
    }
  }, [selectedLocation]);

  // Find the selected category details
  const categoryDetails = selectedCategory 
    ? eventCategoriesData.categories.find(cat => cat.id === selectedCategory)
    : null;

  // Get unique locations from events data
  const uniqueLocations = Array.from(
    new Set(events.map(event => event.location))
  ).sort();

  // Get unique venues from events data
  const uniqueVenues = Array.from(
    new Set(events.map(event => event.venue))
  ).sort();

  // Get movie events for genre filtering
  const movieEvents = events.filter(event => event.category === 'movies');
  const uniqueGenres = Array.from(
    new Set(movieEvents.map(movie => movie.genre?.split('/')[0]).filter(Boolean))
  );

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to format time for display
  const formatTimeForDisplay = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Filter events based on category, location, genre, venue, date, time range, and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesLocation = !selectedLocation || selectedLocation === 'all' || event.location === selectedLocation;
    const matchesGenre = !selectedGenre || (event.category === 'movies' && event.genre?.includes(selectedGenre));
    const matchesVenues = selectedVenues.length === 0 || selectedVenues.includes(event.venue);
    const matchesDate = !selectedDate || event.date === selectedDate;
    
    // Time range filtering
    const matchesTimeRange = () => {
      if (!fromTime && !toTime) return true;
      
      const eventTimeMinutes = timeToMinutes(event.time);
      const fromTimeMinutes = fromTime ? timeToMinutes(fromTime) : 0;
      const toTimeMinutes = toTime ? timeToMinutes(toTime) : 24 * 60;
      
      return eventTimeMinutes >= fromTimeMinutes && eventTimeMinutes <= toTimeMinutes;
    };

    // Price range filtering
    const matchesPriceRange = () => {
      if (!minPrice && !maxPrice) return true;
      
      const eventPrice = event.price;
      const minPriceValue = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceValue = maxPrice ? parseFloat(maxPrice) : Infinity;
      
      return eventPrice >= minPriceValue && eventPrice <= maxPriceValue;
    };
    
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesLocation && matchesGenre && matchesVenues && matchesDate && matchesTimeRange() && matchesPriceRange() && matchesSearch;
  });

  const handleBackToCategories = () => {
    navigate('/events/categories');
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    
    // Clear genre filter when switching away from movies category
    if (newCategory !== 'movies') {
      setSelectedGenre('');
    }
    
    if (newCategory) {
      const searchParams = new URLSearchParams();
      searchParams.set('category', newCategory);
      // Always add location to URL, even if empty (All Locations)
      searchParams.set('location', selectedLocation);
      navigate(`/events?${searchParams.toString()}`);
    } else {
      localStorage.removeItem('selectedEventCategory');
      // Always preserve the current location selection, even if it's "All Locations"
      const searchParams = new URLSearchParams();
      searchParams.set('location', selectedLocation);
      navigate(`/events?${searchParams.toString()}`);
    }
  };

  const handleLocationChange = (event: SelectChangeEvent<string>) => {
    const newLocation = event.target.value;
    
    // Temporarily disable to prevent rapid changes during navigation
    setIsLocationLoading(true);
    
    setSelectedLocation(newLocation);
    
    // Save user's explicit location choice to localStorage
    localStorage.setItem('selectedEventLocation', newLocation);
    
    // Always navigate with both parameters to preserve user's explicit choices
    const searchParams = new URLSearchParams();
    if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }
    searchParams.set('location', newLocation);
    navigate(`/events?${searchParams.toString()}`);
    
    // Re-enable after a short delay to allow navigation to complete
    setTimeout(() => {
      setIsLocationLoading(false);
    }, 300);
  };

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenre(event.target.value);
  };

  const handleVenueChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedVenues(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleFromTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFromTime(event.target.value);
  };

  const handleToTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToTime(event.target.value);
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(event.target.value);
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(event.target.value);
  };

  const handleClearFilter = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedVenues([]);
    setSelectedDate('');
    setFromTime('');
    setToTime('');
    setMinPrice('');
    setMaxPrice('');
    localStorage.removeItem('selectedEventCategory');
    
    // Clear filters should return to user's location as default
    if (user?.location) {
      setSelectedLocation(user.location);
      localStorage.setItem('selectedEventLocation', user.location);
      navigate(`/events?location=${user.location}`);
    } else {
      setSelectedLocation('all');
      localStorage.setItem('selectedEventLocation', 'all');
      navigate('/events?location=all');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Determine the appropriate header text
  const getHeaderText = () => {
    if (selectedCategory && selectedLocation) {
      return `${categoryDetails?.name} Events in ${selectedLocation}`;
    } else if (selectedCategory) {
      return `${categoryDetails?.name} Events`;
    } else if (selectedLocation) {
      return `Events in ${selectedLocation}`;
    }
    return 'All Events';
  };

  // Check if user location is being used as default
  const isUsingUserLocation = user?.location && selectedLocation === user.location && !searchParams.get('location');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToCategories}
          sx={{ mb: 2, color: '#6a5acd' }}
        >
          Back to Categories
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
          {getHeaderText()}
        </Typography>
        
        {isUsingUserLocation && (
          <Typography variant="body2" sx={{ color: '#6a5acd', mb: 2 }}>
            📍 Showing events in your city ({user.location}). You can change this in the filters below.
          </Typography>
        )}
        
        {categoryDetails && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {categoryDetails.description}
          </Typography>
        )}
      </Box>

      {/* Filters Section */}
      <Box sx={{ mb: 4 }}>
        <Stack spacing={2}>
          {/* First Row: Search, Date, Time, Price */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search events by title, venue, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              type="date"
              label="Event Date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ minWidth: 180 }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              type="time"
              label="From Time"
              value={fromTime}
              onChange={handleFromTimeChange}
              sx={{ minWidth: 140 }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              type="time"
              label="To Time"
              value={toTime}
              onChange={handleToTimeChange}
              sx={{ minWidth: 140 }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              type="number"
              label="Min Price ($)"
              value={minPrice}
              onChange={handleMinPriceChange}
              sx={{ minWidth: 120 }}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
            />

            <TextField
              type="number"
              label="Max Price ($)"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              sx={{ minWidth: 120 }}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
            />
          </Stack>

          {/* Second Row: Location, Category, Venues, Genre (if movies), Clear Filters */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 180 }} disabled={isLocationLoading}>
              <InputLabel>{isLocationLoading ? 'Loading...' : 'Location'}</InputLabel>
              <Select
                value={selectedLocation}
                label={isLocationLoading ? 'Loading...' : 'Location'}
                onChange={handleLocationChange}
                disabled={isLocationLoading}
              >
                <MenuItem value="all">All Locations</MenuItem>
                {uniqueLocations.map(location => (
                  <MenuItem key={location} value={location}>
                    {location} {user?.location === location && '(Your City)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {eventCategoriesData.categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Venues</InputLabel>
              <Select
                multiple
                value={selectedVenues}
                label="Venues"
                onChange={handleVenueChange}
                renderValue={(selected) => 
                  selected.length === 0 
                    ? 'All Venues' 
                    : selected.length === 1 
                      ? selected[0] 
                      : `${selected.length} venues selected`
                }
              >
                {uniqueVenues.map(venue => (
                  <MenuItem key={venue} value={venue}>
                    <Checkbox checked={selectedVenues.indexOf(venue) > -1} />
                    <ListItemText primary={venue} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCategory === 'movies' && (
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={selectedGenre}
                  label="Genre"
                  onChange={handleGenreChange}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {uniqueGenres.map(genre => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {(selectedCategory || (selectedLocation && selectedLocation !== 'all') || searchTerm || selectedGenre || selectedVenues.length > 0 || selectedDate || fromTime || toTime || minPrice || maxPrice) && (
              <Button
                variant="outlined"
                onClick={handleClearFilter}
                sx={{ color: '#6a5acd', borderColor: '#6a5acd' }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocationOn sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {(minPrice || maxPrice)
              ? `No events available ${minPrice && maxPrice 
                  ? `between $${minPrice} and $${maxPrice}` 
                  : minPrice 
                    ? `above $${minPrice}` 
                    : `below $${maxPrice}`}`
              : (fromTime || toTime)
                ? `No events available ${fromTime && toTime 
                    ? `between ${formatTimeForDisplay(fromTime)} and ${formatTimeForDisplay(toTime)}` 
                    : fromTime 
                      ? `after ${formatTimeForDisplay(fromTime)}` 
                      : `before ${formatTimeForDisplay(toTime)}`}`
                : selectedDate
                ? `No events available on ${new Date(selectedDate).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                : selectedVenues.length > 0
                  ? `No events available at ${selectedVenues.length === 1 ? selectedVenues[0] : 'selected venues'}`
                  : selectedLocation && selectedLocation !== 'all'
                    ? `No events available in ${selectedLocation}` 
                    : selectedCategory 
                      ? `No events available in ${categoryDetails?.name || 'this'} category` 
                      : searchTerm 
                        ? 'No events found matching your search'
                        : 'No events available'
            }
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {(minPrice || maxPrice)
              ? `Try adjusting your price range or check back later for events ${minPrice && maxPrice 
                  ? `between $${minPrice} and $${maxPrice}` 
                  : minPrice 
                    ? `above $${minPrice}` 
                    : `below $${maxPrice}`}.`
              : (fromTime || toTime)
                ? `Try adjusting your time range or check back later for events ${fromTime && toTime 
                    ? `between ${formatTimeForDisplay(fromTime)} and ${formatTimeForDisplay(toTime)}` 
                    : fromTime 
                      ? `after ${formatTimeForDisplay(fromTime)}` 
                      : `before ${formatTimeForDisplay(toTime)}`}.`
                : selectedDate
                ? `Try selecting a different date or check back later for events on ${new Date(selectedDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}.`
                : selectedVenues.length > 0
                  ? `Try selecting different venues or check back later for new events at ${selectedVenues.length === 1 ? selectedVenues[0] : 'your selected venues'}.`
                  : selectedLocation && selectedLocation !== 'all'
                    ? `Check back later for exciting events in ${selectedLocation}, or explore events in other cities.`
                    : selectedCategory 
                      ? `Check back later for exciting ${categoryDetails?.name.toLowerCase() || 'entertainment'} experiences.`
                      : 'Try adjusting your search criteria or explore different categories.'
            }
          </Typography>
          
          <Button
            variant="contained"
            onClick={(selectedLocation && selectedLocation !== 'all') || selectedCategory || selectedVenues.length > 0 || selectedDate || fromTime || toTime || minPrice || maxPrice ? handleClearFilter : handleBackToCategories}
            sx={{
              bgcolor: '#6a5acd',
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            {(selectedLocation && selectedLocation !== 'all') || selectedCategory || selectedVenues.length > 0 || selectedDate || fromTime || toTime || minPrice || maxPrice ? 'Show All Events' : 'Explore Categories'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {filteredEvents.map(event => (
            <Card
              key={event.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                borderRadius: 2
              }}
            >
              <CardActionArea 
                onClick={() => navigate(`/events/${event.id}`)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={event.image}
                  alt={event.title}
                  sx={{ objectFit: 'cover',objectPosition: 'top' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', flex: 1 }}>
                      {event.title}
                    </Typography>
                    {event.featured && (
                      <Chip 
                        label="Featured" 
                        size="small" 
                        sx={{ bgcolor: '#6a5acd', color: 'white', ml: 1 }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                    {event.description}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}, {event.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)} at {event.time}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ fontSize: 16, color: '#6a5acd', mr: 0.5 }} />
                        <Typography variant="h6" sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
                          ${event.price}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={eventCategoriesData.categories.find(cat => cat.id === event.category)?.name || event.category}
                        size="small"
                        sx={{ 
                          bgcolor: eventCategoriesData.categories.find(cat => cat.id === event.category)?.color || '#6a5acd',
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Events; 