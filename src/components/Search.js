import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../utils/api';

const Search = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    sentiment: 'all',
    dateRange: {
      start: null,
      end: null
    },
    scoreRange: [0, 10],
    emotions: []
  });

  useEffect(() => {
    fetchReviews();
    loadSearchHistory();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchQuery, filters]);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews');
      setReviews(response.data);
      setFilteredReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load reviews');
      setLoading(false);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(review => review.type === filters.category);
    }

    // Sentiment filter
    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(review => review.sentiment === filters.sentiment);
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate >= filters.dateRange.start && 
               reviewDate <= filters.dateRange.end;
      });
    }

    // Score range filter
    filtered = filtered.filter(review =>
      review.score >= filters.scoreRange[0] &&
      review.score <= filters.scoreRange[1]
    );

    // Emotions filter
    if (filters.emotions.length > 0) {
      filtered = filtered.filter(review =>
        filters.emotions.some(emotion => 
          review.emotions.includes(emotion)
        )
      );
    }

    setFilteredReviews(filtered);

    // Save to search history
    if (searchQuery || Object.values(filters).some(v => v !== 'all')) {
      const searchEntry = {
        id: Date.now(),
        query: searchQuery,
        filters: { ...filters },
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [searchEntry, ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    }
  };

  const handleSaveSearch = () => {
    const searchToSave = {
      id: Date.now(),
      name: `Search ${savedSearches.length + 1}`,
      query: searchQuery,
      filters: { ...filters }
    };

    const updatedSavedSearches = [...savedSearches, searchToSave];
    setSavedSearches(updatedSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
  };

  const handleLoadSearch = (search) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    setHistoryDialog(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: 'all',
      sentiment: 'all',
      dateRange: {
        start: null,
        end: null
      },
      scoreRange: [0, 10],
      emotions: []
    });
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
      <Typography variant="h4" gutterBottom>
        Advanced Search
      </Typography>

      {/* Search Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <IconButton onClick={() => setHistoryDialog(true)}>
            <HistoryIcon />
          </IconButton>
          <IconButton onClick={handleSaveSearch}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={handleClearFilters}>
            <ClearIcon />
          </IconButton>
        </Box>

        {/* Filters Section */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="movie">Movies</MenuItem>
                    <MenuItem value="product">Products</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sentiment</InputLabel>
                  <Select
                    value={filters.sentiment}
                    onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
                  >
                    <MenuItem value="all">All Sentiments</MenuItem>
                    <MenuItem value="strongly_positive">Strongly Positive</MenuItem>
                    <MenuItem value="positive">Positive</MenuItem>
                    <MenuItem value="neutral">Neutral</MenuItem>
                    <MenuItem value="negative">Negative</MenuItem>
                    <MenuItem value="strongly_negative">Strongly Negative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box display="flex" gap={2}>
                    <DatePicker
                      label="From"
                      value={filters.dateRange.start}
                      onChange={(date) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: date }
                      })}
                    />
                    <DatePicker
                      label="To"
                      value={filters.dateRange.end}
                      onChange={(date) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: date }
                      })}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Score Range
                </Typography>
                <Slider
                  value={filters.scoreRange}
                  onChange={(e, newValue) => setFilters({
                    ...filters,
                    scoreRange: newValue
                  })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Emotions
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {['happy', 'sad', 'angry', 'surprised', 'neutral'].map((emotion) => (
                    <Chip
                      key={emotion}
                      label={emotion}
                      onClick={() => {
                        const emotions = filters.emotions.includes(emotion)
                          ? filters.emotions.filter(e => e !== emotion)
                          : [...filters.emotions, emotion];
                        setFilters({ ...filters, emotions });
                      }}
                      color={filters.emotions.includes(emotion) ? "primary" : "default"}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Results */}
      <Typography variant="h6" gutterBottom>
        {filteredReviews.length} Results Found
      </Typography>

      <Grid container spacing={3}>
        {filteredReviews.map((review) => (
          <Grid item xs={12} key={review._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                </Typography>
                <Typography variant="body1" paragraph>
                  {review.text}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label={review.sentiment.replace(/_/g, ' ').toUpperCase()}
                    color={review.sentiment.includes('positive') ? 'success' : 'error'}
                    size="small"
                  />
                  {review.emotions.map((emotion, index) => (
                    <Chip
                      key={index}
                      label={emotion}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* History Dialog */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Search History</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Saved Searches
          </Typography>
          <List>
            {savedSearches.map((search) => (
              <React.Fragment key={search.id}>
                <ListItem
                  button
                  onClick={() => handleLoadSearch(search)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => {
                        const updated = savedSearches.filter(s => s.id !== search.id);
                        setSavedSearches(updated);
                        localStorage.setItem('savedSearches', JSON.stringify(updated));
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={search.name}
                    secondary={`Query: ${search.query || 'None'}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Recent Searches
          </Typography>
          <List>
            {searchHistory.map((search) => (
              <React.Fragment key={search.id}>
                <ListItem button onClick={() => handleLoadSearch(search)}>
                  <ListItemText
                    primary={search.query || 'Filter-only search'}
                    secondary={new Date(search.timestamp).toLocaleString()}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Search; 