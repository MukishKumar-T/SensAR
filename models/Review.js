const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['movie', 'product'], 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 0, 
    max: 5, 
    required: true 
  },
  sentiment: { 
    type: String, 
    enum: ['strongly_positive', 'positive', 'slightly_positive', 'neutral', 'slightly_negative', 'negative', 'strongly_negative'], 
    required: true 
  },
  emotions: [{
    type: String,
    enum: ['happy', 'sad', 'angry', 'surprised', 'fearful']
  }],
  keywords: [String],
  score: { 
    type: Number, 
    required: true 
  },
  movieName: String,
  movieDetails: {
    releaseDate: { type: Date },
    posterPath: { type: String }
  },
  productName: String,
  productDetails: {
    price: { type: Number },
    category: { type: String },
    imageUrl: { type: String }
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['up', 'down']
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema); 