// models/Profile.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const experienceSchema = new mongoose.Schema({
  jobTitle:    String,
  company:     String,
  startDate:   String,
  endDate:     String,
  description: String,
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree:      String,
  institution: String,
  year:        String,
}, { _id: false });

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
  profilePicture: String,
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
profileSchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
