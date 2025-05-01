const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define message schema to be embedded inside the conversation
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  }
}, { _id: false });

// Define conversation schema
const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  messages: [messageSchema],  // Array of message references
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  }
});

// Update the updatedAt before saving the conversation
conversationSchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

// Export the Conversation model
module.exports = mongoose.model('Conversation', conversationSchema);
