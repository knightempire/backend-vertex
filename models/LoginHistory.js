// models/LoginHistory.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const loginHistorySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginDates: [{ type: Date }],
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  }
});

// Update updatedAt on save
loginHistorySchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
