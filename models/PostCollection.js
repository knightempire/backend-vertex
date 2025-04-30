const mongoose = require('mongoose');

// Define post collection schema
const postCollectionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      ref: 'User', // References the 'User' model by email
    },
    postIds: {
      type: [String],  // Array of post IDs (can be strings or ObjectId depending on your needs)
      required: true,
    },
  },
  { timestamps: true }  // Automatically add createdAt and updatedAt fields
);

// Export the PostCollection model
module.exports = mongoose.model('PostCollection', postCollectionSchema);
