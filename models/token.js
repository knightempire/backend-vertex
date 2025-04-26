const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define the schema for the token
const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,  
  },
  createdAt: {
    type: String,
    default: () => moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss'),  // Date and time format
    expires: 300,
  },
  username: {
    type: String,
    required: true,  // Assuming you want to require the username
  },
});

// Create a Token model using the schema
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
