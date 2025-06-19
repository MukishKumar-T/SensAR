import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Divider
} from '@mui/material';
import {
  Movie as MovieIcon,
  ShoppingBag as ProductIcon,
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  Whatshot as TrendingIcon
} from '@mui/icons-material';
import api from '../utils/api';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [recommendations, setRecommendations] = useState({
    movies: [],
    products: [],
    trending: []
  });

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      const response = await api.get('/reviews');
      const reviews = response.data;
      
      // Process movie recommendations based on positive sentiments
      const movieReviews = reviews.filter(review => review.type === 'movie');
      const positiveMovies = movieReviews.filter(review => 
        ['strongly_positive', 'positive'].includes(review.sentiment)
      );

      // Group similar movies based on keywords and emotions
      const movieGroups = groupSimilarItems(positiveMovies);
      
      // Process product recommendations similarly
      const productReviews = reviews.filter(review => review.type === 'product');
      const positiveProducts = productReviews.filter(review =>
        ['strongly_positive', 'positive'].includes(review.sentiment)
      );

      // Group similar products
      const productGroups = groupSimilarItems(positiveProducts);

      // Generate trending items based on recent positive reviews
      const recentReviews = [...reviews]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setRecommendations({
        movies: movieGroups.slice(0, 5),
        products: productGroups.slice(0, 5),
        trending: recentReviews
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load recommendations');
      setLoading(false);
    }
  };

  const groupSimilarItems = (reviews) => {
    // Group items based on common keywords and emotions
    const groups = [];
    const processed = new Set();

    reviews.forEach(review => {
      if (processed.has(review._id)) return;

      const similar = reviews.filter(r => 
        r._id !== review._id &&
        !processed.has(r._id) &&
        (
          hasCommonElements(r.keywords, review.keywords) ||
          hasCommonElements(r.emotions, review.emotions)
        )
      );

      if (similar.length > 0) {
        groups.push({
          main: review,
          similar: similar,
          commonTraits: findCommonTraits(review, similar)
        });

        processed.add(review._id);
        similar.forEach(r => processed.add(r._id));
      }
    });

    return groups;
  };

  const hasCommonElements = (arr1, arr2) => {
    return arr1.some(item => arr2.includes(item));
  };

  const findCommonTraits = (main, similar) => {
    const traits = new Set();
    
    similar.forEach(item => {
      item.keywords.forEach(keyword => {
        if (main.keywords.includes(keyword)) {
          traits.add(keyword);
        }
      });
      item.emotions.forEach(emotion => {
        if (main.emotions.includes(emotion)) {
          traits.add(emotion);
        }
      });
    });

    return Array.from(traits);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Personalized Recommendations
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
        >
          <Tab icon={<MovieIcon />} label="Movies" />
          <Tab icon={<ProductIcon />} label="Products" />
          <Tab icon={<TrendingIcon />} label="Trending" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {recommendations.movies.map((group, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {group.main.text.split(' ').slice(0, 5).join(' ')}...
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Rating value={group.main.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Based on similar positive reviews
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {group.commonTraits.map((trait, i) => (
                    <Chip
                      key={i}
                      label={trait}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Similar Reviews:
                </Typography>
                {group.similar.slice(0, 2).map((review, i) => (
                  <Box key={i} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      "{review.text.split(' ').slice(0, 10).join(' ')}..."
                    </Typography>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {recommendations.products.map((group, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {group.main.text.split(' ').slice(0, 5).join(' ')}...
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Rating value={group.main.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Based on similar positive reviews
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {group.commonTraits.map((trait, i) => (
                    <Chip
                      key={i}
                      label={trait}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Similar Reviews:
                </Typography>
                {group.similar.slice(0, 2).map((review, i) => (
                  <Box key={i} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      "{review.text.split(' ').slice(0, 10).join(' ')}..."
                    </Typography>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {recommendations.trending.map((review, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: review.type === 'movie' ? '#1976d2' : '#dc004e', mr: 2 }}>
                      {review.type === 'movie' ? <MovieIcon /> : <ProductIcon />}
                    </Avatar>
                    <Typography variant="h6">
                      {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    "{review.text.split(' ').slice(0, 15).join(' ')}..."
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Rating value={review.rating} readOnly />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {review.emotions.map((emotion, i) => (
                      <Chip
                        key={i}
                        label={emotion}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ThumbUpIcon />}
                    sx={{ ml: 1 }}
                  >
                    Helpful
                  </Button>
                  <Button
                    size="small"
                    startIcon={<FavoriteIcon />}
                    sx={{ ml: 1 }}
                  >
                    Save
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Recommendations; 