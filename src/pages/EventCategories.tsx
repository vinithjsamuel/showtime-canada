import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme
} from '@mui/material';
import {
  LocalMovies,
  MusicNote,
  TheaterComedy,
  SportsBasketball,
  SentimentSatisfiedAlt,
  FamilyRestroom
} from '@mui/icons-material';
import eventCategoriesData from '../data/eventCategories.json';

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<any> } = {
  LocalMovies,
  MusicNote,
  TheaterComedy,
  SportsBasketball,
  SentimentSatisfiedAlt,
  FamilyRestroom
};

const EventCategories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/events/category/${categoryId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#6a5acd', fontWeight: 'bold' }}>
          Event Categories
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Discover amazing events happening across Canada. Choose a category to explore what interests you most.
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 4 
        }}
      >
        {eventCategoriesData.categories.map((category) => {
          const IconComponent = iconMap[category.icon];
          
          return (
            <Card
              key={category.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                },
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <CardActionArea 
                onClick={() => handleCategoryClick(category.id)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box
                  sx={{
                    bgcolor: category.color,
                    color: 'white',
                    py: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 120
                  }}
                >
                  {IconComponent && <IconComponent sx={{ fontSize: 60 }} />}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {category.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {eventCategoriesData.categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No event categories available at the moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default EventCategories; 