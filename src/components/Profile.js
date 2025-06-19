import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    dashboardLayout: 'grid',
    defaultCategory: 'all',
    theme: 'light',
    showTrends: true
  });
  const [insights, setInsights] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's reviews
        const response = await api.get('/reviews/user');
        setReviews(response.data);
        
        // Generate insights from reviews
        generateInsights(response.data);
        
        // Load saved preferences
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const generateInsights = (reviewsData) => {
    const totalReviews = reviewsData.length;
    const sentimentCounts = reviewsData.reduce((acc, review) => {
      acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const commonEmotions = reviewsData
      .flatMap(review => review.emotions)
      .reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

    const topEmotions = Object.entries(commonEmotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    setInsights({
      totalReviews,
      sentimentDistribution: sentimentCounts,
      topEmotions,
      averageScore: reviewsData.reduce((acc, review) => acc + review.score, 0) / totalReviews
    });
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      {/* Enhanced User Info Card with Quick Actions */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mb: 4, 
        background: 'linear-gradient(to right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
        color: 'text.primary',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={3}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120,
                bgcolor: 'primary.main',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              {user?.username ? user.username[0].toUpperCase() : <PersonIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user?.username || 'User'}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email || 'email@example.com'}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip 
                  label="Premium Member" 
                  color="primary" 
                  size="small"
                  sx={{ 
                    bgcolor: 'primary.dark',
                    '& .MuiChip-label': { color: 'white' }
                  }}
                />
                <Chip 
                  label="Verified" 
                  color="success" 
                  size="small"
                  sx={{ 
                    bgcolor: 'success.dark',
                    '& .MuiChip-label': { color: 'white' }
                  }}
                />
              </Stack>
            </Box>
          </Box>
          
          <Box>
            <Tooltip title="Settings">
              <IconButton 
                onClick={handleMenuClick}
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  '&:hover': { 
                    bgcolor: 'background.default',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <MenuItem onClick={() => {
                setActiveTab(2);
                handleMenuClose();
              }}>
                <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                Edit Preferences
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <NotificationsIcon sx={{ mr: 1 }} fontSize="small" />
                Manage Notifications
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* User Stats Summary */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Paper elevation={1} sx={{ 
            p: 2, 
            flex: 1, 
            bgcolor: 'primary.dark',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <Typography variant="h6">Total Reviews</Typography>
            <Typography variant="h4">{reviews.length}</Typography>
          </Paper>
          <Paper elevation={1} sx={{ 
            p: 2, 
            flex: 1, 
            bgcolor: 'secondary.dark',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <Typography variant="h6">Average Rating</Typography>
            <Typography variant="h4">
              {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0).toFixed(1)}
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ 
            p: 2, 
            flex: 1, 
            bgcolor: 'success.dark',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <Typography variant="h6">Positive Reviews</Typography>
            <Typography variant="h4">
              {reviews.filter(review => 
                ['positive', 'strongly_positive'].includes(review.sentiment)
              ).length}
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<TrendingUpIcon />} label="Insights" />
          <Tab icon={<SettingsIcon />} label="Preferences" />
        </Tabs>
      </Box>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Recent Analysis History
            </Typography>
          </Grid>
          {reviews.map((review, index) => (
            <Grid item xs={12} md={preferences.dashboardLayout === 'grid' ? 6 : 12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {review.text}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={review.sentiment.replace(/_/g, ' ').toUpperCase()}
                      color={review.sentiment.includes('positive') ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`Score: ${review.score.toFixed(2)}`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {review.emotions.map((emotion, i) => (
                      <Chip
                        key={i}
                        label={emotion}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Insights Tab */}
      {activeTab === 1 && insights && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Overview
                </Typography>
                <Typography variant="h3" gutterBottom>
                  {insights.totalReviews}
                </Typography>
                <Typography color="text.secondary">
                  Total Reviews Analyzed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Sentiment Score
                </Typography>
                <Typography variant="h3" gutterBottom>
                  {insights.averageScore.toFixed(2)}
                </Typography>
                <Typography color="text.secondary">
                  Overall Sentiment Trend
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Emotions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {insights.topEmotions.map(([emotion, count], index) => (
                    <Chip
                      key={index}
                      label={`${emotion} (${count})`}
                      color="primary"
                      variant={index === 0 ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Preferences Tab */}
      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Customize Your Experience
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showTrends}
                    onChange={(e) => handlePreferenceChange('showTrends', e.target.checked)}
                  />
                }
                label="Show Trends on Dashboard"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Dashboard Layout
              </Typography>
              <Button
                variant={preferences.dashboardLayout === 'grid' ? 'contained' : 'outlined'}
                onClick={() => handlePreferenceChange('dashboardLayout', 'grid')}
                sx={{ mr: 1 }}
              >
                Grid
              </Button>
              <Button
                variant={preferences.dashboardLayout === 'list' ? 'contained' : 'outlined'}
                onClick={() => handlePreferenceChange('dashboardLayout', 'list')}
              >
                List
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default Profile; 