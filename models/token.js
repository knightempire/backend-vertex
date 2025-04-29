
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: () => moment.tz("Asia/Kolkata").toDate(),
  },
  email: {
    type: String,
    required: true,  // Assuming you want to require the email
  },

});

// Default TTL of 5 minutes (300 seconds)
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });



// Create a Token model using the schema
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;