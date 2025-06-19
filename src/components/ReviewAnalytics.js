import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import api from '../utils/api';

const SENTIMENT_SCORES = {
  strongly_positive: 3,
  positive: 2,
  slightly_positive: 1,
  neutral: 0,
  slightly_negative: -1,
  negative: -2,
  strongly_negative: -3
};

const SENTIMENT_COLORS = {
  strongly_positive: '#00c853',
  positive: '#4caf50',
  slightly_positive: '#81c784',
  neutral: '#ff9800',
  slightly_negative: '#ff7043',
  negative: '#f44336',
  strongly_negative: '#d32f2f'
};

const ReviewAnalytics = ({ type, name }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [sentimentDistribution, setSentimentDistribution] = useState([]);
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
  }, [type, name]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch reviews for the specific movie/product
      const response = await api.get('/reviews');
      const reviews = response.data.filter(
        review => review.type === type && 
        (type === 'movie' ? review.movieName === name : review.productName === name)
      );

      if (reviews.length === 0) {
        setError('No reviews found for this item.');
        setLoading(false);
        return;
      }

      // Process sentiment trends over time
      const trendData = processTimeTrends(reviews);
      setSentimentTrends(trendData);

      // Process sentiment distribution
      const distributionData = processSentimentDistribution(reviews);
      setSentimentDistribution(distributionData);

      // Generate summary from the reviews
      const summaryText = generateSummary(reviews);
      setSummary(summaryText);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics. Please try again later.');
      setLoading(false);
    }
  };

  const processTimeTrends = (reviews) => {
    const sortedReviews = [...reviews].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return sortedReviews.map(review => ({
      date: new Date(review.createdAt).toLocaleDateString(),
      sentiment: SENTIMENT_SCORES[review.sentiment] || 0,
      rating: review.rating
    }));
  };

  const processSentimentDistribution = (reviews) => {
    const distribution = reviews.reduce((acc, review) => {
      acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([sentiment, count]) => ({
      name: sentiment.replace(/_/g, ' ').toUpperCase(),
      value: count
    }));
  };

  const generateSummary = (reviews) => {
    const totalReviews = reviews.length;
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
    const sentiments = reviews.reduce((acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const dominantSentiment = Object.entries(sentiments)
      .sort((a, b) => b[1] - a[1])[0][0]
      .replace(/_/g, ' ');

    return `Based on ${totalReviews} reviews, this ${type} has an average rating of ${avgRating} stars. 
    The overall sentiment is predominantly ${dominantSentiment}, indicating ${
      SENTIMENT_SCORES[dominantSentiment.replace(/ /g, '_')] > 0 ? 'positive' : 
      SENTIMENT_SCORES[dominantSentiment.replace(/ /g, '_')] < 0 ? 'negative' : 'neutral'
    } reception from users.`;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} ref={containerRef}>
      <Typography variant="h4" gutterBottom>
        Analytics for {type === 'movie' ? 'Movie' : 'Product'}: {name}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Sentiment Trends" />
          <Tab label="Sentiment Distribution" />
          <Tab label="Review Summary" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sentiment Trends Over Time
          </Typography>
          <Box sx={{ width: '100%', height: isMobile ? 300 : 400 }}>
            <ResponsiveContainer>
              <LineChart
                data={sentimentTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8884d8"
                  name="Sentiment Score"
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#82ca9d"
                  name="Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sentiment Distribution
          </Typography>
          <Box sx={{ width: '100%', height: isMobile ? 300 : 400, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={isMobile ? 100 : 150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SENTIMENT_COLORS[entry.name.toLowerCase().replace(/ /g, '_')] || '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Review Summary
          </Typography>
          <Typography variant="body1">
            {summary}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ReviewAnalytics; 