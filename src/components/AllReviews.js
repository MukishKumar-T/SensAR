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
  IconButton,
  Stack,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Collapse,
  Badge,
  Alert
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
  ShoppingBag as ProductIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import ReviewAnalytics from './ReviewAnalytics';

const AllReviews = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [tabValue, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      let filteredReviews = response.data;

      // Filter by type if not 'all'
      if (tabValue !== 'all') {
        filteredReviews = filteredReviews.filter(review => review.type === tabValue);
      }

      // Filter by rating if not 'all'
      if (filterRating !== 'all') {
        filteredReviews = filteredReviews.filter(review => 
          Math.floor(review.rating) === parseInt(filterRating)
        );
      }

      // Filter by search term
      if (searchTerm) {
        filteredReviews = filteredReviews.filter(review =>
          review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.movieName && review.movieName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (review.productName && review.productName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Sort reviews
      filteredReviews.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'mostVoted':
            return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
          case 'highestRated':
            return b.rating - a.rating;
          case 'lowestRated':
            return a.rating - b.rating;
          default:
            return 0;
        }
      });

      setReviews(filteredReviews);
    } catch (error) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!isAuthenticated) {
      setError('Please login to vote');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/vote`, { voteType });
      await fetchReviews();
    } catch (error) {
      setError('Failed to submit vote');
      console.error('Error voting:', error);
    }
  };

  const handleItemClick = (review) => {
    const itemName = review.type === 'movie' ? review.movieName : review.productName;
    if (selectedItem === itemName) {
      setSelectedItem(null);
      setShowAnalytics(false);
    } else {
      setSelectedItem(itemName);
      setShowAnalytics(true);
    }
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

  const getReviewType = (review) => {
    return review?.type || 'unknown';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Community Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              aria-label="review type tabs"
            >
              <Tab label="All Reviews" value="all" />
              <Tab label="Movie Reviews" value="movie" />
              <Tab label="Product Reviews" value="product" />
            </Tabs>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="mostVoted">Most Voted</MenuItem>
                <MenuItem value="highestRated">Highest Rated</MenuItem>
                <MenuItem value="lowestRated">Lowest Rated</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Filter by Rating</InputLabel>
              <Select
                value={filterRating}
                label="Filter by Rating"
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <MenuItem value="all">All Ratings</MenuItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <MenuItem key={rating} value={rating}>
                    {rating} Stars
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Search Reviews"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Analytics Panel */}
      <Collapse in={showAnalytics} timeout="auto" unmountOnExit>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {selectedItem && reviews.length > 0 && (
            <ReviewAnalytics
              type={getReviewType(reviews.find(r => 
                r.type === 'movie' ? r.movieName === selectedItem : r.productName === selectedItem
              ))}
              name={selectedItem}
            />
          )}
        </Paper>
      </Collapse>

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No reviews found
          </Typography>
        </Paper>
      ) : (
        <List>
          {reviews.map((review) => (
            <Paper
              key={review._id}
              elevation={3}
              sx={{ 
                mb: 2, 
                overflow: 'hidden',
                bgcolor: selectedItem === (review.type === 'movie' ? review.movieName : review.productName) 
                  ? 'action.selected' 
                  : 'background.paper'
              }}
            >
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        review.type === 'movie' ? 
                          <MovieIcon fontSize="small" color="primary" /> : 
                          <ProductIcon fontSize="small" color="secondary" />
                      }
                    >
                      <Avatar sx={{ bgcolor: review.userId === user?.id ? 'primary.main' : 'grey.400' }}>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => handleItemClick(review)}
                      >
                        {review.type === 'movie' ? review.movieName : review.productName}
                      </Typography>
                      <Typography variant="body2" color={review.userId === user?.id ? 'primary' : 'text.secondary'}>
                        by {review.userName || 'Anonymous User'}
                        {review.userId === user?.id && ' (You)'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Time posted">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Stack>
                    </Tooltip>
                  </Stack>
                </Box>

                <Typography variant="body1" paragraph>
                  {review.text}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Rating value={review.rating} readOnly precision={0.5} size="small" />
                    <Chip
                      label={review.sentiment.toUpperCase().replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        backgroundColor: getSentimentColor(review.sentiment),
                        color: 'white'
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title={isAuthenticated ? "Upvote" : "Login to vote"}>
                      <span>
                        <IconButton
                          color={review.userVote === 'up' ? 'primary' : 'default'}
                          onClick={() => handleVote(review._id, 'up')}
                          disabled={!isAuthenticated}
                        >
                          <ThumbUpIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center', lineHeight: '40px' }}>
                      {(review.upvotes || 0) - (review.downvotes || 0)}
                    </Typography>
                    <Tooltip title={isAuthenticated ? "Downvote" : "Login to vote"}>
                      <span>
                        <IconButton
                          color={review.userVote === 'down' ? 'error' : 'default'}
                          onClick={() => handleVote(review._id, 'down')}
                          disabled={!isAuthenticated}
                        >
                          <ThumbDownIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default AllReviews; 