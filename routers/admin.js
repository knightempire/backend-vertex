// routes/admin.js
const express = require('express');
const admin = express.Router();  

const {adimtokenValidator} = require('../middleware/auth/tokenvalidate');
const { viewReports, viewUsers } = require('../controllers/admin.contollers');

// Route to view all reports
admin.post('/reports', adimtokenValidator ,viewReports);

// Route to view all users
admin.post('/users', adimtokenValidator,  viewUsers);

module.exports = admin;
