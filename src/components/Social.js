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
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ThumbUp as ThumbUpIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon
} from '@mui/icons-material';
import api from '../utils/api';

const Social = () => {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [savedReviews, setSavedReviews] = useState(new Set());
  const [following, setFollowing] = useState(new Set());

  useEffect(() => {
    fetchReviews();
    loadSavedReviews();
    loadFollowing();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews');
      setReviews(response.data);
      
      // Initialize comments for each review
      const commentsData = {};
      response.data.forEach(review => {
        commentsData[review._id] = [];
      });
      setComments(commentsData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load reviews');
      setLoading(false);
    }
  };

  const loadSavedReviews = () => {
    const saved = localStorage.getItem('savedReviews');
    if (saved) {
      setSavedReviews(new Set(JSON.parse(saved)));
    }
  };

  const loadFollowing = () => {
    const followed = localStorage.getItem('following');
    if (followed) {
      setFollowing(new Set(JSON.parse(followed)));
    }
  };

  const handleCommentSubmit = (reviewId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      user: JSON.parse(localStorage.getItem('user')).username,
      timestamp: new Date().toISOString()
    };

    setComments(prev => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newComment]
    }));

    setCommentText('');
  };

  const handleSaveReview = (reviewId) => {
    const newSaved = new Set(savedReviews);
    if (newSaved.has(reviewId)) {
      newSaved.delete(reviewId);
    } else {
      newSaved.add(reviewId);
    }
    setSavedReviews(newSaved);
    localStorage.setItem('savedReviews', JSON.stringify([...newSaved]));
  };

  const handleFollowUser = (username) => {
    const newFollowing = new Set(following);
    if (newFollowing.has(username)) {
      newFollowing.delete(username);
    } else {
      newFollowing.add(username);
    }
    setFollowing(newFollowing);
    localStorage.setItem('following', JSON.stringify([...newFollowing]));
  };

  const handleShare = (review) => {
    setSelectedReview(review);
    setDialogOpen(true);
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Community Reviews
      </Typography>

      <Grid container spacing={3}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {review.user}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box ml="auto">
                    <Button
                      size="small"
                      onClick={() => handleFollowUser(review.user)}
                      variant={following.has(review.user) ? "contained" : "outlined"}
                    >
                      {following.has(review.user) ? "Following" : "Follow"}
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  {review.text}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
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

                <Divider sx={{ my: 2 }} />

                {/* Comments Section */}
                <List>
                  {comments[review._id]?.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.user}
                        secondary={comment.text}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box display="flex" gap={1} mt={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleCommentSubmit(review._id)}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </CardContent>

              <CardActions>
                <IconButton>
                  <ThumbUpIcon />
                </IconButton>
                <IconButton onClick={() => handleSaveReview(review._id)}>
                  {savedReviews.has(review._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
                <IconButton onClick={() => handleShare(review)}>
                  <ShareIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Share Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Share Review</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share this review with your network:
          </Typography>
          {selectedReview && (
            <TextField
              fullWidth
              variant="outlined"
              value={`Check out this review: "${selectedReview.text}"`}
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Implement sharing functionality
              setDialogOpen(false);
            }}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Social; 