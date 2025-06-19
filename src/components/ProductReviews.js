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
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import { 
  Star as StarIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  LocalOffer as PriceIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import api from '../utils/api';
import ReviewAnalytics from './ReviewAnalytics';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { searchProducts, getProductDetails, getProductCategories, getProductsByCategory } from '../services/dummyJsonService';
import { getProductImageUrl } from '../utils/dummyJsonConfig';
import debounce from 'lodash/debounce';

const ProductReviews = () => {
  const [review, setReview] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedProductForAnalytics, setSelectedProductForAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryProducts, setCategoryProducts] = useState([]);

  useEffect(() => {
    fetchProductReviews();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const categories = await getProductCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      const products = await getProductsByCategory(category);
      setCategoryProducts(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
    }
  };

  const handleProductSearch = debounce(async (searchTerm) => {
    if (!searchTerm) {
      setProductSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchProducts(searchTerm);
      setProductSuggestions(results);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setProductName(product.title);
    try {
      const details = await getProductDetails(product.id);
      setProductDetails(details);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!review.trim()) {
      errors.review = 'Review text is required';
    } else if (review.length < 10) {
      errors.review = 'Review must be at least 10 characters long';
    }
    
    if (!productName.trim()) {
      errors.productName = 'Product name is required';
    }
    
    if (!rating) {
      errors.rating = 'Please provide a rating';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchProductReviews = async () => {
    try {
      const response = await api.get('/reviews');
      const allReviews = response.data.filter(review => review.type === 'product');
      setProductReviews(allReviews);
    } catch (error) {
      setError('Failed to fetch product reviews. Please try again later.');
      console.error('Error fetching product reviews:', error);
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
        type: 'product',
        rating: rating,
        productName: productName,
        productDetails: {}
      });
      setResult(response.data);
      setSuccess('Review submitted successfully!');
      await fetchProductReviews();
      setReview('');
      setProductName('');
      setRating(0);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit review. Please try again.');
      console.error('Error with review:', error);
    } finally {
      setLoading(false);
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

  const handleProductClick = (productName) => {
    if (selectedProductForAnalytics === productName) {
      setSelectedProductForAnalytics(null);
      setShowAnalytics(false);
    } else {
      setSelectedProductForAnalytics(productName);
      setShowAnalytics(true);
    }
  };

  const userReviews = productReviews.filter(review => isAuthenticated && review.userId === user?.id);
  const hasUserReviews = userReviews.length > 0;

  const formatCategoryLabel = (category) => {
    if (!category || typeof category !== 'string') return '';
    // Split by hyphen and capitalize each word
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Product Reviews Analysis
        </Typography>
      </Box>

      {/* Product Search and Details Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={productSuggestions}
              getOptionLabel={(option) => option.title}
              loading={isSearching}
              onInputChange={(event, value) => handleProductSearch(value)}
              onChange={(event, value) => value && handleProductSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for a product"
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
                    {option.thumbnail && (
                      <img
                        src={getProductImageUrl(option.thumbnail)}
                        alt={option.title}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                    <Stack>
                      <Typography variant="body1">{option.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${option.price} - {option.brand}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}
            />
          </Grid>

          {selectedProduct && productDetails && (
            <Grid item xs={12} md={6}>
              <Card>
                <Grid container>
                  <Grid item xs={4}>
                    <CardMedia
                      component="img"
                      image={getProductImageUrl(productDetails.thumbnail)}
                      alt={productDetails.title}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {productDetails.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {productDetails.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          icon={<CategoryIcon />}
                          label={productDetails.category}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          icon={<PriceIcon />}
                          label={`$${productDetails.price}`}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          icon={<CartIcon />}
                          label={`Stock: ${productDetails.stock}`}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Rating
                          value={productDetails.rating}
                          precision={0.1}
                          readOnly
                        />
                        <Typography variant="body2">
                          Rating: {productDetails.rating.toFixed(1)}/5
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

      {/* Analytics Panel */}
      <Collapse in={showAnalytics} timeout="auto" unmountOnExit sx={{ width: '100%', mb: 4 }}>
        <Grid item xs={12}>
          {selectedProductForAnalytics && (
            <Paper elevation={3} sx={{ p: 4 }}>
              {productReviews.some(review => review.productName === selectedProductForAnalytics) ? (
                <ReviewAnalytics 
                  type="product" 
                  name={selectedProductForAnalytics} 
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No reviews available for "{selectedProductForAnalytics}"
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Collapse>

      {/* Review Form and List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {isAuthenticated ? (
            <>
              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      setValidationErrors({ ...validationErrors, productName: '' });
                    }}
                    sx={{ mb: 3 }}
                    required
                    error={!!validationErrors.productName}
                    helperText={validationErrors.productName}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Write your product review"
                    value={review}
                    onChange={(e) => {
                      setReview(e.target.value);
                      setValidationErrors({ ...validationErrors, review: '' });
                    }}
                    sx={{ mb: 3 }}
                    placeholder="Share your thoughts about the product..."
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
                <Typography variant="h5" gutterBottom>Your Product Reviews</Typography>
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
                          backgroundColor: selectedProductForAnalytics === review.productName ? 'action.selected' : 'inherit',
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
                            onClick={() => handleProductClick(review.productName)}
                          >
                            {review.productName}
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
                      You haven't written any product reviews yet
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

export default ProductReviews; 