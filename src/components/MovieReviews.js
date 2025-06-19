import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Rating,
  Stack,
  Chip,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Collapse,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Autocomplete
} from '@mui/material';
import { 
  Star as StarIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../utils/api';
import ReviewAnalytics from './ReviewAnalytics';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { searchMovies, getMovieDetails, getPopularMovies } from '../services/tmdbService';
import { getImageUrl } from '../utils/tmdbConfig';
import debounce from 'lodash/debounce';

const MovieReviews = () => {
  const [review, setReview] = useState('');
  const [movieName, setMovieName] = useState('');
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState(null);
  const [movieReviews, setMovieReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedMovieForAnalytics, setSelectedMovieForAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchMovieReviews();
    fetchPopularMovies();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!review.trim()) {
      errors.review = 'Review text is required';
    } else if (review.length < 10) {
      errors.review = 'Review must be at least 10 characters long';
    }
    
    if (!movieName.trim()) {
      errors.movieName = 'Movie name is required';
    }
    
    if (!rating) {
      errors.rating = 'Please provide a rating';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchMovieReviews = async () => {
    try {
      const response = await api.get('/reviews');
      const allReviews = response.data.filter(review => review.type === 'movie');
      setMovieReviews(allReviews);
    } catch (error) {
      setError('Failed to fetch movie reviews. Please try again later.');
      console.error('Error fetching movie reviews:', error);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      const movies = await getPopularMovies();
      setPopularMovies(movies);
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    }
  };

  const handleMovieSearch = debounce(async (searchTerm) => {
    if (!searchTerm) {
      setMovieSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchMovies(searchTerm);
      setMovieSuggestions(results);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie);
    setMovieName(movie.title);
    try {
      const details = await getMovieDetails(movie.id);
      setMovieDetails(details);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/analyze', {
        text: review,
        type: 'movie',
        rating: rating,
        movieName: movieName,
        movieDetails: {}
      });
      setResult(response.data);
      setSuccess('Review submitted successfully!');
      await fetchMovieReviews();
      setReview('');
      setMovieName('');
      setRating(0);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit review. Please try again.');
      console.error('Error with review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieName) => {
    if (selectedMovieForAnalytics === movieName) {
      setSelectedMovieForAnalytics(null);
      setShowAnalytics(false);
    } else {
      setSelectedMovieForAnalytics(movieName);
      setShowAnalytics(true);
    }
  };

  const userReviews = movieReviews.filter(review => isAuthenticated && review.userId === user?.id);
  const hasUserReviews = userReviews.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Movie Reviews Analysis
        </Typography>
      </Box>

      {/* Movie Search and Details Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={movieSuggestions}
              getOptionLabel={(option) => option.title}
              loading={isSearching}
              onInputChange={(event, value) => handleMovieSearch(value)}
              onChange={(event, value) => value && handleMovieSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for a movie"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon color="action" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {option.poster_path && (
                      <img
                        src={getImageUrl(option.poster_path, 'w92')}
                        alt={option.title}
                        style={{ width: 50, borderRadius: 4 }}
                      />
                    )}
                    <Stack>
                      <Typography variant="body1">{option.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.release_date?.split('-')[0]}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}
            />
          </Grid>

          {selectedMovie && movieDetails && (
            <Grid item xs={12} md={6}>
              <Card>
                <Grid container>
                  <Grid item xs={4}>
                    <CardMedia
                      component="img"
                      image={getImageUrl(movieDetails.poster_path)}
                      alt={movieDetails.title}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {movieDetails.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {movieDetails.overview}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {movieDetails.genres.map((genre) => (
                          <Chip
                            key={genre.id}
                            label={genre.name}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Rating
                          value={movieDetails.vote_average / 2}
                          precision={0.5}
                          readOnly
                        />
                        <Typography variant="body2">
                          TMDB Rating: {movieDetails.vote_average.toFixed(1)}/10
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Popular Movies Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Popular Movies
        </Typography>
        <Grid container spacing={2}>
          {popularMovies.slice(0, 6).map((movie) => (
            <Grid item xs={6} sm={4} md={2} key={movie.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
                onClick={() => handleMovieSelect(movie)}
              >
                <CardMedia
                  component="img"
                  image={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  sx={{ height: 225 }}
                />
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="body2" noWrap>
                    {movie.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Analytics Panel - Only shown when a movie is selected */}
        <Collapse in={showAnalytics} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
          <Grid item xs={12} sx={{ mb: 3 }}>
            {selectedMovieForAnalytics && (
              <Paper elevation={3} sx={{ p: 4 }}>
                {movieReviews.some(review => review.movieName === selectedMovieForAnalytics) ? (
                  <ReviewAnalytics 
                    type="movie" 
                    name={selectedMovieForAnalytics} 
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No reviews available for "{selectedMovieForAnalytics}"
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>
        </Collapse>

        {/* Review Form and List */}
        <Grid item xs={12}>
          {isAuthenticated ? (
            <>
              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Movie Name"
                    value={movieName}
                    onChange={(e) => {
                      setMovieName(e.target.value);
                      setValidationErrors({ ...validationErrors, movieName: '' });
                    }}
                    sx={{ mb: 3 }}
                    required
                    error={!!validationErrors.movieName}
                    helperText={validationErrors.movieName}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Write your movie review"
                    value={review}
                    onChange={(e) => {
                      setReview(e.target.value);
                      setValidationErrors({ ...validationErrors, review: '' });
                    }}
                    sx={{ mb: 3 }}
                    placeholder="Share your thoughts about the movie..."
                    required
                    error={!!validationErrors.review}
                    helperText={validationErrors.review}
                  />
                  
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      name="rating"
                      value={rating}
                      onChange={(e, newValue) => {
                        setRating(newValue);
                        setValidationErrors({ ...validationErrors, rating: '' });
                      }}
                      precision={0.5}
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      size="large"
                      required
                    />
                    <Typography 
                      variant="body2" 
                      color={validationErrors.rating ? "error.main" : "text.secondary"}
                    >
                      {rating > 0 ? `${rating} stars` : validationErrors.rating || 'No rating'}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Review'}
                  </Button>
                </form>
              </Paper>

              {result && (
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                  <Typography variant="h5" gutterBottom>Analysis Result</Typography>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={result.sentiment.toUpperCase().replace('_', ' ')}
                        sx={{ 
                          backgroundColor: getSentimentColor(result.sentiment), 
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          py: 1
                        }}
                      />
                      <Typography variant="h6">Score: {result.score.toFixed(2)}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">Rating:</Typography>
                        <Rating value={result.rating} readOnly precision={0.5} size="large" />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              )}

              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>Your Movie Reviews</Typography>
                <List>
                  {hasUserReviews ? (
                    userReviews.map((review) => (
                      <ListItem 
                        key={review._id} 
                        divider 
                        sx={{ 
                          flexDirection: 'column', 
                          alignItems: 'flex-start', 
                          py: 2,
                          backgroundColor: selectedMovieForAnalytics === review.movieName ? 'action.selected' : 'inherit',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography 
                            variant="subtitle1" 
                            color="primary" 
                            gutterBottom 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={() => handleMovieClick(review.movieName)}
                          >
                            {review.movieName}
                          </Typography>
                        </Box>
                        <Typography variant="body1" gutterBottom>{review.text}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Rating value={review.rating} readOnly size="small" precision={0.5} />
                          <Chip
                            label={review.sentiment.toUpperCase().replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              backgroundColor: getSentimentColor(review.sentiment),
                              color: 'white'
                            }}
                          />
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                      You haven't written any movie reviews yet
                    </Typography>
                  )}
                </List>
              </Paper>
            </>
          ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Please log in to write and manage your reviews
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Log In
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
      >
        <Alert 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
          onClose={() => {
            setError('');
            setSuccess('');
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'strongly_positive': return '#00c853';
    case 'positive': return '#4caf50';
    case 'slightly_positive': return '#81c784';
    case 'neutral': return '#ff9800';
    case 'slightly_negative': return '#ff7043';
    case 'negative': return '#f44336';
    case 'strongly_negative': return '#d32f2f';
    default: return '#ff9800';
  }
};

export default MovieReviews; 