// routes/admin.js
const express = require('express');
const admin = express.Router();  

const { viewReports, viewUsers } = require('../controllers/admin.contollers');

// Route to view all reports
admin.post('/reports', viewReports);

// Route to view all users
admin.post('/users', viewUsers);

module.exports = admin;
