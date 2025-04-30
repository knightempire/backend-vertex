const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define message schema
const messageSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the 'User' model (fromUser is the sender)
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the 'User' model (toUser is the receiver)
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true, // Trim whitespace from the message
    },
    timestamp: {
      type: Date,
      default: () => moment().tz('Asia/Kolkata').toDate(), // Set the timestamp to the current date and time
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' fields
);

// Export Message model
module.exports = mongoose.model('Message', messageSchema);
