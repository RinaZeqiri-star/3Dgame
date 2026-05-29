const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  instagram: String,
  coins: {
    type: Number,
    default: 10
  },
  totalEarned: {
    type: Number,
    default: 10
  },
  ownedBackgrounds: {
    type: [String],
    default: []
  },
  currentBackground: {
    type: String,
    default: null
  },
  claimedMilestones: {
    type: [Number],
    default: []
  }
});

module.exports = mongoose.model('User', UserSchema);
