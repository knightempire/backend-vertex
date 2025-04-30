// routes/user.js
const express = require('express');
const user = express.Router();  
const { loginUser, verifyToken,registerUser, createuserandPassword ,resetPassword , forgotPassword,verifyMainToken , newusernamecheck} = require('../controllers/login.contollers');
const {tokenValidator,verifyRegisterToken,verifyForgotToken,readverifyRegisterTokens, readverifyForgotToken} = require('../middleware/auth/tokenvalidate');
const { userprofile,updateProfile,getLoginDates ,addActiveTime,getUsersWithRole} = require('../controllers/profile.controller');
const { getPostIdsByEmail ,insertPostIdByEmail} = require('../controllers/post');

user.post('/login', loginUser);
user.post('/verify-token', tokenValidator, verifyMainToken); // Middleware to validate the token


user.get('/verify-token-forgot',  readverifyForgotToken, verifyToken);
user.get('/verify-token-register',readverifyRegisterTokens , verifyToken);


user.post('/register',registerUser);
user.post('/password', verifyRegisterToken, createuserandPassword);

user.post('/forgotpassword',forgotPassword,)
user.post('/resetpassword', verifyForgotToken, resetPassword);


user.post('/check/username', newusernamecheck);
user.post('/profile', tokenValidator,userprofile);
user.post('/profile/update', tokenValidator,updateProfile);
user.post('/activity', tokenValidator,getLoginDates);


user.post('/time', tokenValidator,addActiveTime);
user.get('/people',getUsersWithRole)


user.get('/view/collection', tokenValidator,getPostIdsByEmail);
user.post('/collect', tokenValidator,insertPostIdByEmail);
module.exports = user;