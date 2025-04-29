const mongoose = require('mongoose');
const moment = require('moment-timezone');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  loginDates: {
    type: [String],
    default: [] // Default to an empty array
  },
  loginScores: {
    type: [Number], 
    default: [] 
  },
  streak: {
    type: Number,
    default: 0
  }
});

// Middleware to update updatedAt and handle login score
userSchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();

  if (this.isModified('loginDates')) {
    const lastLoginDate = this.loginDates[this.loginDates.length - 1];
    const previousLoginDate = this.loginDates[this.loginDates.length - 2];

    // Check if login is consecutive
    const lastDate = moment(lastLoginDate);
    const prevDate = previousLoginDate ? moment(previousLoginDate) : null;

    if (prevDate) {
      // Check if the days are consecutive
      const isConsecutive = lastDate.diff(prevDate, 'days') === 1;
      
      if (isConsecutive) {
        this.streak += 1;
      } else {
        const breakInStreak = lastDate.diff(prevDate, 'days') - 1; // Days missed before logging in again
        this.streak = 1; // Reset streak

        // Add negative scores for the missed days
        for (let i = 0; i < breakInStreak; i++) {
          this.loginScores.push(-(i + 1)); 
        }
      }
    } else {
      this.streak = 1;
    }

    // Calculate the score based on streak, ensuring it does not go negative
    let score = 0;
    for (let i = 0; i < this.streak; i++) {
      score += (i + 1); 
    }

    this.loginScores.push(score); 


    const totalScore = this.loginScores.reduce((total, score) => total + score, 0);
    this.loginScores = [Math.max(totalScore, 0)]; 
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
