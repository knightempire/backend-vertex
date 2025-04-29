const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define experience schema
const experienceSchema = new mongoose.Schema({
  jobTitle:    String,
  company:     String,
  startDate:   String,
  endDate:     String,
  description: String,
}, { _id: false });

// Define education schema
const educationSchema = new mongoose.Schema({
  degree:      String,
  institution: String,
  year:        String,
}, { _id: false });

// Define profile schema
const profileSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true },
  phone:          String,
  bio:            String,
  jobTitle:       String,
  location:       String,
  skills:         [String],
  experience:     [experienceSchema],
  education:      [educationSchema],
  profilePicture: { type: String, default: '' }, // Profile image URL (String)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This references the 'User' model to associate the profile with a user
    required: true
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

// Update updatedAt before saving the profile
profileSchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

// Export Profile model
module.exports = mongoose.model('Profile', profileSchema);
