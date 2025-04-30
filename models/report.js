const mongoose = require('mongoose');

const reportCollectionSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true 
    },  // Ensures email is a string, required, trimmed of spaces, and in lowercase
    reportedPostIds: { 
        type: [String],  // Array of strings (post IDs)
        required: true, 
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.every(id => typeof id === 'string'); 
            },
            message: 'reportedPostIds should be an array of strings.'
        },
        default: []  // Default to an empty array if no post IDs are provided
    },
    reportTypes: [{ type: String, required: true }],
});

// Create and export the model
const ReportCollection = mongoose.model('ReportCollection', reportCollectionSchema);
module.exports = ReportCollection;
