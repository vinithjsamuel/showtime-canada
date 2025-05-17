import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import moviesData from '../data/movies.json';

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);
  const moviesPerPage = 8;

  // Extract unique genres from the movies data
  const uniqueGenres = Array.from(
    new Set(moviesData.map(movie => movie.genre.split('/')[0]))
  );

  // Filter movies based on search term and genre
  const filteredMovies = moviesData.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === '' || movie.genre.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const displayedMovies = filteredMovies.slice(
    (page - 1) * moviesPerPage,
    page * moviesPerPage
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleGenreChange = (event: SelectChangeEvent) => {
    setGenreFilter(event.target.value);
    setPage(1); // Reset to first page when genre filter changes
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ color: '#6a5acd', mb: 4 }}>
        Browse Movies
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search movies by title or description"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="genre-filter-label">Filter by Genre</InputLabel>
            <Select
              labelId="genre-filter-label"
              id="genre-filter"
              value={genreFilter}
              label="Filter by Genre"
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
        </Stack>
      </Box>

      <Box sx={{ mb: 4 }}>
        {displayedMovies.length === 0 ? (
          <Typography textAlign="center" sx={{ my: 8 }}>
            No movies found matching your search criteria.
          </Typography>
        ) : (
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
              {displayedMovies.map(movie => (
                <Card
                  key={movie.id}
                  sx={{
                    height: '100%',
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
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {movie.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {movie.genre} • {movie.duration} min
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {movie.description.substring(0, 80)}...
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Stack>
        )}
      </Box>

      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Stack>
      )}
    </Container>
  );
};

export default Movies; 