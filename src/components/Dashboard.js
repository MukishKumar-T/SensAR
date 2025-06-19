import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState({
    sentimentDistribution: [],
    emotionTrends: [],
    reviewsOverTime: [],
    categoryComparison: [],
    topKeywords: []
  });

  const COLORS = ['#00C853', '#4CAF50', '#81C784', '#FF9800', '#FF7043', '#F44336', '#D32F2F'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/reviews');
      const reviews = response.data;
      
      // Process sentiment distribution
      const sentimentCounts = reviews.reduce((acc, review) => {
        acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
        return acc;
      }, {});

      const sentimentDistribution = Object.entries(sentimentCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
      }));

      // Process emotion trends
      const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful'];
      const emotionCounts = emotions.map(emotion => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        count: reviews.filter(review => review.emotions.includes(emotion)).length
      }));

      // Process reviews over time
      const reviewsByDate = reviews.reduce((acc, review) => {
        const date = new Date(review.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const reviewsOverTime = Object.entries(reviewsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Process category comparison
      const movieCount = reviews.filter(review => review.type === 'movie').length;
      const productCount = reviews.filter(review => review.type === 'product').length;
      const categoryComparison = [
        { name: 'Movies', value: movieCount },
        { name: 'Products', value: productCount }
      ];

      // Process top keywords
      const keywordCounts = reviews.reduce((acc, review) => {
        review.keywords.forEach(keyword => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
        return acc;
      }, {});

      const topKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      setAnalytics({
        sentimentDistribution,
        emotionTrends: emotionCounts,
        reviewsOverTime,
        categoryComparison,
        topKeywords
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
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
        Analytics Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
        >
          <Tab label="Overview" />
          <Tab label="Trends" />
          <Tab label="Keywords" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Sentiment Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sentiment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.sentimentDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.sentimentDistribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Category Comparison */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reviews by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Reviews Over Time */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reviews Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.reviewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1976d2" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Emotion Trends */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Emotion Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.emotionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Top Keywords */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Keywords
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analytics.topKeywords}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="keyword" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 