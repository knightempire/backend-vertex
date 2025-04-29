// models/User.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  }
});

// Middleware to update updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

module.exports = mongoose.model('User', userSchema);


