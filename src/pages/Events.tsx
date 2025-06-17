import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { ArrowBack, Category } from '@mui/icons-material';
import eventCategoriesData from '../data/eventCategories.json';

const Events: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // Find the selected category
  const selectedCategory = categoryId 
    ? eventCategoriesData.categories.find(cat => cat.id === categoryId)
    : null;

  const handleBackToCategories = () => {
    navigate('/events/categories');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToCategories}
          sx={{ mb: 2, color: '#6a5acd' }}
        >
          Back to Categories
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
          {selectedCategory ? `${selectedCategory.name} Events` : 'All Events'}
        </Typography>
        
        {selectedCategory && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {selectedCategory.description}
          </Typography>
        )}
      </Box>

      {/* No events message */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Category sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {selectedCategory 
            ? `No events available in ${selectedCategory.name} category` 
            : 'No events available in this category'
          }
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Events will be coming soon! Check back later for exciting {selectedCategory?.name.toLowerCase() || 'entertainment'} experiences.
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleBackToCategories}
          sx={{
            bgcolor: '#6a5acd',
            '&:hover': {
              bgcolor: '#5b4cbb'
            }
          }}
        >
          Explore Other Categories
        </Button>
      </Box>
    </Container>
  );
};

export default Events; 