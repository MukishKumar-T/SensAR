const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetToken: String,
  resetTokenExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    dashboardLayout: {
      type: String,
      enum: ['grid', 'list'],
      default: 'grid'
    }
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add method to check if reset token is valid
userSchema.methods.isResetTokenValid = function() {
  return this.resetTokenExpires && this.resetTokenExpires > Date.now();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 