import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  SelectChangeEvent
} from '@mui/material';
import { 
  ArrowBack, 
  Category, 
  Search, 
  LocationOn, 
  AccessTime,
  AttachMoney
} from '@mui/icons-material';
import eventCategoriesData from '../data/eventCategories.json';
import eventsData from '../data/events.json';

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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [events] = useState<Event[]>(eventsData.events);

  // Load category from URL params or localStorage on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
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
  }, [categoryId, searchParams]);

  // Save category selection to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedEventCategory', selectedCategory);
    }
  }, [selectedCategory]);

  // Find the selected category details
  const categoryDetails = selectedCategory 
    ? eventCategoriesData.categories.find(cat => cat.id === selectedCategory)
    : null;

  // Get movie events for genre filtering
  const movieEvents = events.filter(event => event.category === 'movies');
  const uniqueGenres = Array.from(
    new Set(movieEvents.map(movie => movie.genre?.split('/')[0]).filter(Boolean))
  );

  // Filter events based on category, genre, and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesGenre = !selectedGenre || (event.category === 'movies' && event.genre?.includes(selectedGenre));
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesGenre && matchesSearch;
  });

  const handleBackToCategories = () => {
    navigate('/events/categories');
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    
    if (newCategory) {
      navigate(`/events/category/${newCategory}`);
    } else {
      localStorage.removeItem('selectedEventCategory');
      navigate('/events');
    }
  };

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenre(event.target.value);
  };

  const handleClearFilter = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSelectedGenre('');
    localStorage.removeItem('selectedEventCategory');
    navigate('/events');
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
          {categoryDetails ? `${categoryDetails.name} Events` : 'All Events'}
        </Typography>
        
        {categoryDetails && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {categoryDetails.description}
          </Typography>
        )}
      </Box>

      {/* Filters Section */}
      <Box sx={{ mb: 4 }}>
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
          
          <FormControl sx={{ minWidth: 200 }}>
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
          
          {(selectedCategory || searchTerm || selectedGenre) && (
            <Button
              variant="outlined"
              onClick={handleClearFilter}
              sx={{ color: '#6a5acd', borderColor: '#6a5acd' }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Box>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Category sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {selectedCategory 
              ? `No events available in ${categoryDetails?.name || 'this'} category` 
              : searchTerm 
                ? 'No events found matching your search'
                : 'No events available'
            }
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {selectedCategory 
              ? `Check back later for exciting ${categoryDetails?.name.toLowerCase() || 'entertainment'} experiences.`
              : 'Try adjusting your search criteria or explore different categories.'
            }
          </Typography>
          
          <Button
            variant="contained"
            onClick={selectedCategory ? handleClearFilter : handleBackToCategories}
            sx={{
              bgcolor: '#6a5acd',
              '&:hover': {
                bgcolor: '#5b4cbb'
              }
            }}
          >
            {selectedCategory ? 'Show All Events' : 'Explore Categories'}
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
                  height="200"
                  image={event.image}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
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