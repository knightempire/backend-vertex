// controllers/login.contollers.js
require('dotenv').config();


const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const Profile = require('../models/Profile');
const Token = require('../models/token');
const {createToken} = require('../middleware/auth/tokencreation'); 
const {sendregisterEmail,sendforgotEmail} = require('../middleware/mail/mail'); 
const moment = require('moment-timezone'); 
const user = require('../models/user');


const verifyToken = async (req, res) => {
  try {
    // Ensure email is provided
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Return a successful response with user details
    res.status(200).json({
      status: 200,
      message: 'Token is valid, verified',
      user: {
        email,
        name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      message: 'An error occurred during token verification',
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Log user data for debugging
    console.log('User found:', user);
    console.log('User active:', user.isActive);

    // Check if the user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'User is inactive. Please contact support.' });
    }

    // Check if the password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Get today's date in 'Asia/Kolkata' timezone
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    
    // Check if the login date already exists in the loginDates array
    if (!user.loginDates.includes(today)) {
      // Add today's date to the loginDates array
      user.loginDates.push(today);
      
      // Save the updated user document
      await user.save();
    }

    // Prepare user data to send to the client
    const userData = {
      username: user.username,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      role: user.role, // Include the role here for front-end routing
    };

    console.log("User data prepared:", userData);

    // Create a token for the user
    const token = await createToken(userData);

    // Clean up sensitive user data before sending it to the client
    delete userData.secret_key;
    // You might want to delete the `_id` field if not needed
    // delete userData._id;

    // Send response to the client with user data and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData,  // Send the user data without secret_key or any sensitive info
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  


  const verifyMainToken = async (req, res) => {
    try {
      const { email, username } = req.body;
      console.log('Incoming request body:', req.body);
  
      // Find user by email
      const user = await User.findOne({ email: req.body.email });
      console.log('Fetched user from database:', user);
  
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
        });
      }
  
      if (user.isActive === 0) {
        return res.status(403).json({
          message: 'User is inactive',
        });
      }
  
      // Find the user's profile by userId
      const profile = await Profile.findOne({ userId: user._id });
  
      // If profile exists, send it with the response
      if (profile) {
        console.log('Fetched profile:', profile);
      }
  
      // Return response with user and profile information
      return res.status(200).json({
        status: 200,
        message: 'Token is valid',
        user: {
          email: email,
          name: user.name,
          isActive: user.isActive,
          role: user.role,
          username: username,
          profile: profile ? profile : null, // Include profile if it exists
        },
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({
        message: 'Invalid or expired token',
      });
    }
  };
  ;

// Function to register and send mail
const registerUser = async (req, res) => {
    try {
      const { email, name } = req.body;
      const type = "user";
      console.log('email received:', email);
  
      // Check if both fields are provided
      if (!email || !name) {
        console.log('Missing email or name');
        return res.status(400).json({ message: 'email and name are required' });
      }
  
      // Check if email already exists
      console.log('Checking if email already exists');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('email already exists:', email);
        return res.status(400).json({ message: 'email already exists' });
      }
  

      console.log('Creating new user instance with email:', email);
      await sendregisterEmail(email, name, type);
  

      res.status(200).json({
        status: 200,
        message: 'email printed to console and email sent',
        email,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  // Function to user set the password
  const createuserandPassword = async (req, res) => {
    try {
      const { password, username } = req.body;
      const { email, name } = req.body;
  
      console.log('Received email:', email, name);
      console.log('Received password:', password);
      console.log('Received username:', username);
  
      // Check if both email and password are provided
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already exists:', email);
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Create a new user instance
      console.log('Creating new user with email:', email);
      const newUser = new User({ email, password: hashedPassword, name, username });
  
      // Save the user to the database
      console.log('Saving new user to the database');
      await newUser.save();
      console.log('User saved successfully:', newUser);
  
      // Send success response
      return res.status(201).json({
        status: 200,
        message: 'User created successfully',
        user: {
          email: newUser.email,
          name: newUser.name,
        }
      });
    } catch (error) {
      console.error('Error in createuserandPassword:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to forgot password and send mail
  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      console.log('email received:', email);
  
      // Check if the email is provided
      if (!email) {
        console.log('Missing email');
        return res.status(400).json({ message: 'email is required' });
      }
  
      // Find the user by email
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('email does not exist');
        return res.status(400).json({ message: 'email does not exist' });
      }
  
      // Get the user's name
      const { name } = existingUser;
  
      console.log('Sending email to:', email, 'with name:', name);
      
      // Call the sendEmail function and pass the email and name
      await sendforgotEmail(email, name);
  
      // Respond with a success message
      res.status(200).json({
        status: 200,
        message: 'email printed to console and email sent',
        email,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  // Function to reset user password
  const resetPassword = async (req, res) => {
    try {
      const { password, email } = req.body;
      console.log('resetPassword');
      console.log('Received email:', email);
      console.log('Received password:', password);
  
      // Check if both email and password are provided
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('Email does not exist');
        return res.status(400).json({ message: 'Email does not exist' });
      }
  
      // Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Update the user's password with the hashed version
      existingUser.password = hashedPassword;
  
      // Save the updated user to the database
      await existingUser.save();
      console.log('Password updated successfully:', existingUser);
  
      return res.status(200).json({
        status: 200,
        message: 'Password updated successfully',
        user: {
          email: existingUser.email,
          name: existingUser.name,
        }
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  const newusernamecheck = async (req, res) => {
    try {
      console.log("newusernamecheck");
      const { username } = req.body;
  
      console.log('username received:', username);
  
      // Check if the username is provided
      if (!username) {
        console.log('Missing username');
        return res.status(400).json({ message: 'Username is required' });
      }
  
      // Find the user by username (instead of email)
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log('Username exists');
        return res.status(400).json({ message: 'Username already taken' });
      }
  
      // Respond with a success message
      res.status(200).json({
        status: 200,
        message: 'Username is available',
        username,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

module.exports = { loginUser, verifyToken , registerUser,createuserandPassword ,forgotPassword,resetPassword, verifyMainToken , newusernamecheck };