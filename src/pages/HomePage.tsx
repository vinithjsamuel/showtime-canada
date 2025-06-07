import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Paper,
  Typography,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import moviesData from '../data/movies.json';
import settings from '../data/settings.json';
import { useAuth } from '../contexts/AuthContext';

const featuredMovies = moviesData.slice(0, 3);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://source.unsplash.com/random/1200x600/?cinema)`,
          height: isMobile ? '300px' : '500px',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              py: isMobile ? 3 : 6
            }}
          >
            {isAuthenticated && user && (
              <Typography variant="h6" color="white" gutterBottom>
                Welcome back, {user.firstName}!
              </Typography>
            )}
            <Typography
              component="h1"
              variant={isMobile ? 'h4' : 'h2'}
              color="white"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Showtime Canada Experience
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'} paragraph>
              {settings.features.showMovies 
                ? "Book tickets for the latest movies in Canada's premier cinema locations. Comfortable seating, immersive sound, and unforgettable experiences await."
                : "Your premier entertainment platform in Canada. Discover amazing experiences and stay tuned for exciting new features coming soon."
              }
            </Typography>
            {settings.features.showMovies && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/movies')}
                sx={{
                  mt: 2,
                  bgcolor: '#6a5acd',
                  '&:hover': {
                    bgcolor: '#5b4cbb'
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Browse Movies
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Featured Movies Section - Only show if movies feature is enabled */}
      {settings.features.showMovies && (
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ mb: 4, textAlign: 'center', color: '#6a5acd' }}
          >
            Featured Movies
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {featuredMovies.map(movie => (
              <Card
                key={movie.id}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  },
                  borderRadius: 2
                }}
              >
                <CardActionArea onClick={() => navigate(`/movies/${movie.id}`)}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={movie.posterUrl}
                    alt={movie.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movie.genre} • {movie.duration} min
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {movie.description.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/movies')}
              sx={{
                color: '#6a5acd',
                borderColor: '#6a5acd',
                '&:hover': {
                  borderColor: '#5b4cbb',
                  backgroundColor: 'rgba(106, 90, 205, 0.04)'
                }
              }}
            >
              View All Movies
            </Button>
          </Box>
        </Container>
      )}

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f9f7ff', py: 8, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ mb: 6, textAlign: 'center', color: '#6a5acd' }}
          >
            Why Choose Us
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            <Card sx={{ 
              width: '100%', 
              maxWidth: 345, 
              textAlign: 'center', 
              boxShadow: 3, 
              borderRadius: 2 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LocalMoviesIcon sx={{ fontSize: 60, color: '#6a5acd' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div">
                  Premium Experience
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {settings.features.showMovies 
                    ? "State-of-the-art projection and sound systems in all our theaters for an immersive viewing experience."
                    : "Premium quality entertainment experiences designed for the Canadian audience."
                  }
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              width: '100%', 
              maxWidth: 345, 
              textAlign: 'center', 
              boxShadow: 3, 
              borderRadius: 2 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <EventSeatIcon sx={{ fontSize: 60, color: '#6a5acd' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div">
                  {settings.features.showMovies ? "Comfortable Seating" : "User-Friendly Platform"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {settings.features.showMovies 
                    ? "Enjoy the movie with our plush reclining seats and ample legroom for maximum comfort."
                    : "Easy-to-use interface designed with the user experience in mind for seamless navigation."
                  }
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              width: '100%', 
              maxWidth: 345, 
              textAlign: 'center', 
              boxShadow: 3, 
              borderRadius: 2 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ConfirmationNumberIcon sx={{ fontSize: 60, color: '#6a5acd' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div">
                  {settings.features.showMovies ? "Easy Booking" : "Secure Platform"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {settings.features.showMovies 
                    ? "Reserve your seats online with our simple and convenient booking system. No more waiting in line!"
                    : "Your data and privacy are protected with our secure platform and reliable user management system."
                  }
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#6a5acd', color: 'white', py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            {settings.features.showMovies ? "Ready to Watch?" : "Ready to Get Started?"}
          </Typography>
          <Typography variant="h6" paragraph>
            {settings.features.showMovies 
              ? "Join thousands of movie lovers who trust Showtime Canada for their entertainment needs."
              : "Join thousands of users who trust Showtime Canada for their entertainment needs."
            }
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: '#6a5acd',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                },
                px: 4,
                py: 1.5
              }}
            >
              {settings.features.showMovies ? "Book Your First Movie" : "Get Started Today"}
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 