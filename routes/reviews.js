const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name');

    // If user is authenticated, include their votes
    const userId = req.user ? req.user.id : null;
    const reviewsWithVotes = reviews.map(review => {
      const reviewObj = review.toObject();
      if (userId) {
        const userVote = review.votes.find(
          vote => vote.userId.toString() === userId
        );
        reviewObj.userVote = userVote ? userVote.voteType : null;
      }
      return reviewObj;
    });

    res.json(reviewsWithVotes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user reviews' });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the user owns this review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const { text, rating, productName, type, productDetails } = req.body;
    
    // Perform sentiment analysis again
    const sentiment = await analyzeSentiment(text);
    
    review.text = text;
    review.rating = rating;
    review.productName = productName;
    review.type = type;
    review.productDetails = productDetails;
    review.sentiment = sentiment.sentiment;
    review.score = sentiment.score;
    review.updatedAt = Date.now();

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Error updating review' });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the user owns this review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.remove();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting review' });
  }
});

// Vote on a review
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { voteType } = req.body;
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user has already voted
    const existingVoteIndex = review.votes.findIndex(
      vote => vote.userId.toString() === req.user.id
    );

    if (existingVoteIndex > -1) {
      const existingVote = review.votes[existingVoteIndex];
      
      // Remove the old vote count
      if (existingVote.voteType === 'up') {
        review.upvotes--;
      } else {
        review.downvotes--;
      }

      // If voting the same way, remove the vote
      if (existingVote.voteType === voteType) {
        review.votes.splice(existingVoteIndex, 1);
      } else {
        // Change vote type
        review.votes[existingVoteIndex].voteType = voteType;
        if (voteType === 'up') {
          review.upvotes++;
        } else {
          review.downvotes++;
        }
      }
    } else {
      // Add new vote
      review.votes.push({
        userId: req.user.id,
        voteType
      });
      if (voteType === 'up') {
        review.upvotes++;
      } else {
        review.downvotes++;
      }
    }

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ error: 'Error processing vote' });
  }
});

// Get a user's vote on a review
router.get('/:id/vote', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userVote = review.votes.find(
      vote => vote.userId.toString() === req.user.id
    );

    res.json({ voteType: userVote ? userVote.voteType : null });
  } catch (error) {
    console.error('Error getting vote:', error);
    res.status(500).json({ error: 'Error getting vote' });
  }
});

module.exports = router; 