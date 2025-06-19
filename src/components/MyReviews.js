import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Rating,
  Chip,
  List,
  ListItem,
  Stack,
  Avatar,
  Tooltip,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Movie as MovieIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const MyReviews = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/user');
      setReviews(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setError('Failed to fetch your reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReviews();
    }
  }, [isAuthenticated]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'strongly_positive': return '#00c853';
      case 'positive': return '#4caf50';
      case 'slightly_positive': return '#81c784';
      case 'slightly_negative': return '#ff7043';
      case 'negative': return '#f44336';
      case 'strongly_negative': return '#d32f2f';
      default: return '#ff9800';
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your reviews
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
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        My Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            You haven't written any reviews yet
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button
              component={Link}
              to="/movie-reviews"
              variant="contained"
              startIcon={<MovieIcon />}
            >
              Write Movie Review
            </Button>
            <Button
              component={Link}
              to="/product-reviews"
              variant="contained"
              startIcon={<ShoppingBagIcon />}
            >
              Write Product Review
            </Button>
          </Stack>
        </Paper>
      ) : (
        <List>
          {reviews.map((review) => (
            <ListItem
              key={review._id}
              sx={{
                mb: 2,
                display: 'block',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: review.type === 'movie' ? 'primary.main' : 'secondary.main' }}>
                      {review.type === 'movie' ? <MovieIcon /> : <ShoppingBagIcon />}
                    </Avatar>
                    <Typography variant="h6">
                      {review.type === 'movie' ? review.movieName : review.productName}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  {review.text}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Rating value={review.rating} readOnly precision={0.5} />
                  <Chip
                    label={review.sentiment}
                    sx={{
                      bgcolor: getSentimentColor(review.sentiment),
                      color: 'white',
                    }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MyReviews; 