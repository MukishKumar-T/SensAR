import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Rating,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useTheme,
  ListItemIcon,
  Divider,
  Grid
} from '@mui/material';
import {
  Menu as MenuIcon,
  Star as StarIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Movie as MovieIcon,
  ShoppingBag as ProductIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';
import { alpha } from '@mui/material/styles';
import { AuthContext, AuthProvider } from './context/AuthContext';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import MovieReviews from './components/MovieReviews';
import ProductReviews from './components/ProductReviews';
import Dashboard from './components/Dashboard';
import AllReviews from './components/AllReviews';
import MyReviews from './components/MyReviews';

const API_URL = 'http://localhost:5000/api';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(0, 9, 43, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  '& .MuiTypography-root': {
    color: '#ffffff',
  },
  '& .MuiIconButton-root': {
    color: '#ffffff',
  },
  '& .MuiButton-root': {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  '& .MuiSvgIcon-root': {
    color: '#ffffff',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    background: theme.palette.background.default,
    borderRight: '1px solid rgba(0, 0, 0, 0.05)',
  },
}));

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
  backdropFilter: 'blur(10px)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const App = () => {
  const theme = useTheme();
  const [review, setReview] = useState('');
  const [type, setType] = useState('product');
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const fetchRecentReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setRecentReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleLoginSuccess = (userData) => {
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/analyze`, { text: review, type, rating });
      setResult(response.data);
      await fetchRecentReviews();
      setReview('');
      setRating(0);
    } catch (error) {
      console.error('Error analyzing review:', error);
    }
    setLoading(false);
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

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😮';
      case 'fearful': return '😨';
      default: return '😐';
    }
  };

  const Home = () => (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          zIndex: -1,
        }}
      />
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              color: '#ffffff', // <-- Set your desired color here
              mb: 2,
            }}
          >
            Sense'AR
          </Typography>
          {/* <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 2,
            }}
          >
            Sense'AR
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Analyze Reviews
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            <br/>
            Unlock the power of AI to analyze sentiments in movie and product reviews with advanced natural language processing
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              component={Link}
              to="/movie-reviews"
              variant="contained"
              size="large"
              startIcon={<MovieIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
              }}
            >
              Analyze Movie Reviews
            </Button>
            <Button
              component={Link}
              to="/product-reviews"
              variant="outlined"
              size="large"
              startIcon={<ProductIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
              }}
            >
              Analyze Product Reviews
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(0, 9, 43, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <SentimentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Sentiment Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get detailed insights into the emotional tone of reviews using advanced AI algorithms
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(0, 9, 43, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <HistoryIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Review History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and analyze your review history with comprehensive analytics and trends
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(0, 9, 43, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <DashboardIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Interactive Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualize sentiment patterns and trends with our intuitive dashboard
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <StyledAppBar position="fixed">
          <Toolbar>
            <IconButton
              color="primary"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'text.primary',
                fontWeight: 600,
                letterSpacing: '-0.5px'
              }}
            >
              Sentiment Analyzer
            </Typography>
            {isAuthenticated ? (
              <Stack direction="row" spacing={1}>
                <Button
                  color="primary"
                  component={Link}
                  to="/dashboard"
                  startIcon={<DashboardIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Dashboard
                </Button>
                <Button
                  color="primary"
                  component={Link}
                  to="/my-reviews"
                  startIcon={<HistoryIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  My Reviews
                </Button>
                <Button
                  color="primary"
                  component={Link}
                  to="/all-reviews"
                  startIcon={<HistoryIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Community Reviews
                </Button>
                <Button
                  color="primary"
                  component={Link}
                  to="/movie-reviews"
                  startIcon={<MovieIcon />}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Movies
                </Button>
                <Button
                  color="primary"
                  component={Link}
                  to="/product-reviews"
                  startIcon={<ProductIcon />}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Products
                </Button>
                <IconButton
                  color="primary"
                  component={Link}
                  to="/profile"
                  size="large"
                >
                  <PersonIcon />
                </IconButton>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  color="primary"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  startIcon={<RegisterIcon />}
                >
                  Sign Up
                </Button>
              </Stack>
            )}
          </Toolbar>
        </StyledAppBar>
        <StyledDrawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <DrawerHeader>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <MenuIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem button component={Link} to="/" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            {isAuthenticated ? (
              <>
                <ListItem button component={Link} to="/dashboard" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <DashboardIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/my-reviews" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="My Reviews" />
                </ListItem>
                <ListItem button component={Link} to="/all-reviews" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Community Reviews" />
                </ListItem>
                <ListItem button component={Link} to="/movie-reviews" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <MovieIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Movie Reviews" />
                </ListItem>
                <ListItem button component={Link} to="/product-reviews" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <ProductIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Product Reviews" />
                </ListItem>
                <ListItem button component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <LoginIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={Link} to="/register" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <RegisterIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Sign Up" />
                </ListItem>
              </>
            )}
          </List>
        </StyledDrawer>
        <ContentWrapper>
          <DrawerHeader />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                isAuthenticated ? <Profile /> : <Navigate to="/login" />
              } />
              <Route path="/movie-reviews" element={
                isAuthenticated ? <MovieReviews /> : <Navigate to="/login" />
              } />
              <Route path="/product-reviews" element={
                isAuthenticated ? <ProductReviews /> : <Navigate to="/login" />
              } />
              <Route path="/all-reviews" element={
                isAuthenticated ? <AllReviews /> : <Navigate to="/login" />
              } />
              <Route path="/my-reviews" element={
                isAuthenticated ? <MyReviews /> : <Navigate to="/login" />
              } />
              <Route path="/dashboard" element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              } />
            </Routes>
          </Container>
        </ContentWrapper>
      </Box>
    </Router>
  );
};

export default App;
