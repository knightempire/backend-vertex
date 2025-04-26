// controllers/login.contollers.js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const Token = require('../models/token');
const {createToken} = require('../middleware/auth/tokencreation'); 
const {sendregisterEmail,sendforgotEmail} = require('../middleware/mail/mail'); 
const moment = require('moment-timezone'); 


const verifyToken = (req, res) => {
    try {
  
      res.status(200).json({
        status: 200,
        message: 'Token is valid verify',
        user: {
          username: req.body.username,
          userId: req.body.userId,
          name:req.body.name,
        },
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({
        message: 'Invalid or expired token',
      });
    }
  };


// Function to log in a user
const loginUser = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findOne({ username }).populate('product_access.product_id'); 
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      console.log('User found:', user);
      console.log('User active:', user.isActive);
  
    
      if (!user.isActive) {
        return res.status(400).json({ message: 'User is inactive. Please contact support.' });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Create user data with product details populated
      const userData = {
        id: user._id,
        username: user.username,
        name: user.name,
        isActive: user.isActive,
        role:user.role,
        product_access: user.product_access.map(access => ({
          product_id: access.product_id._id, 
          product_name: access.product_id.name, 
          accessGranted: access.accessGranted,
        })),
      };
  
      console.log("login",userData)
  
      const token = await createToken(userData);  
  
      delete userData.secret_key;
      delete userData.id; 
  
      // Send response to the client
      res.status(200).json({
        message: 'Login successful',
        token,
        user: userData,  // Send the user data without the secret_key
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Verifying the main token
const verifyMainToken = async (req, res) => {
  try {
    // Step 1: Extract the data from the request body
    const { username, userId, name, product_access  } = req.body;

    // Debug: Log incoming data
    console.log('Incoming request body:', req.body);

    // Step 2: Find the user from the database using userId
    const user = await User.findOne({ _id: userId });

    // Debug: Log the retrieved user from the database
    console.log('Fetched user from database:', user);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    // Step 3: Check if the user is active
    if (user.isActive === 0) {
      return res.status(403).json({
        message: 'User is inactive',
      });
    }

    // Debug: Log active user status
    console.log('User is active:', user.isActive);

    // Ensure that product_access is an array, and is not null or undefined
    const validatedProductAccess = Array.isArray(product_access) ? product_access : [];

    // Debug: Log validated product access
    console.log('Validated product access:', validatedProductAccess);

    let isMatching = true;
    let mismatchDetails = [];

    // Step 4: Check if product access matches (based on product_id and accessGranted)
    for (let product of validatedProductAccess) {
      const productAccessInDb = user.product_access.find(
        (dbProduct) => dbProduct.product_id.toString() === product.product_id.toString()
      );

      // Debug: Log comparison between product in request and product in DB
      console.log('Comparing product in request with product in DB:', {
        requestedProduct: product,
        dbProduct: productAccessInDb,
      });

      if (!productAccessInDb) {
        isMatching = false;
        mismatchDetails.push({
          product_id: product.product_id,
          message: 'Product not found in user\'s access list',
        });
      } else {
        // Compare the accessGranted field
        if (productAccessInDb.accessGranted !== product.accessGranted) {
          isMatching = false;
          mismatchDetails.push({
            product_id: product.product_id,
            message: 'accessGranted mismatch',
            dbAccessGranted: productAccessInDb.accessGranted,
            requestedAccessGranted: product.accessGranted,
          });

          // Debug: Log if there’s an accessGranted mismatch
          console.log('accessGranted mismatch for product:', {
            product_id: product.product_id,
            dbAccessGranted: productAccessInDb.accessGranted,
            requestedAccessGranted: product.accessGranted,
          });
        }
      }
    }

    // Step 5: If access is not matching, generate a new token
    if (!isMatching) {
      const userData = {
        id: user._id,
        username: user.username,
        name: user.name,
        isActive: user.isActive,
        role:user.role,
        product_access: user.product_access, // Send product_access from DB
      };

      // Generate a new token
      const newToken = await createToken(userData);

      // Send response with new token and mismatch details
      return res.status(201).json({
        status: 201,
        message: 'Product access mismatch found. New token generated.',
        token: newToken,
        user: {
          username: username,
          userId: userId,
          name: name,
          role:user.role,
          isActive: user.isActive,
          product_access: user.product_access, // Send product_access from DB
          isMatching: isMatching, // false as there was a mismatch
          mismatchDetails: mismatchDetails, // Show mismatch details
        },
      });
    }

    // Step 6: If access is valid, return the response with matching result
    return res.status(200).json({
      status: 200,
      message: 'Token is valid',
      user: {
        username: username,
        userId: userId,
        name: name,
        isActive: user.isActive,
        role:user.role,
        product_access: user.product_access, // Send product_access from DB
        isMatching: true, // true as everything matched
      },
    });

  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

// Function to register and send mail
const registerUser = async (req, res) => {
    try {
      const { username, name } = req.body;
      const type = "user";
      console.log('Username received:', username);
  
      // Check if both fields are provided
      if (!username || !name) {
        console.log('Missing username or name');
        return res.status(400).json({ message: 'Username and name are required' });
      }
  
      // Check if username already exists
      console.log('Checking if username already exists');
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log('Username already exists:', username);
        return res.status(400).json({ message: 'Username already exists' });
      }
  

      console.log('Creating new user instance with username:', username);
      await sendregisterEmail(username, name, type);
  

      res.status(200).json({
        status: 200,
        message: 'Username printed to console and email sent',
        username,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  // Function to user set the password
  const createuserandPassword = async (req, res) => {
    try {
      
      const {password} = req.body;
      const { username ,name} = req.body;
  
      console.log('Received username:', username,name);
      console.log('Received password:', password);
  
  
      // Check if both fields are provided
      if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: 'Username and password are required' });
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log('Username already exists:', username);
        return res.status(400).json({ message: 'Username already exists' });
      }
  
  
      // Create a new user instance
      console.log('Creating new user with username:', username);
      const newUser = new User({ username, password , name ,main_username});
  
      // Save the user to the database
      console.log('Saving new user to the database');
      await newUser.save();
      console.log('User saved successfully:', newUser);
  
      // Send success response
      return res.status(201).json({
        status: 200,
        message: 'User created successfully',
        user: {
          username: newUser.username,
          name: newUser.name,
        }
      });
    } catch (error) {
      console.error('Error in addUser:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to forgot password and send mail
  const forgotPassword = async (req, res) => {
    try {
      const { username } = req.body;
  
      console.log('Username received:', username);
  
      // Check if the username is provided
      if (!username) {
        console.log('Missing username');
        return res.status(400).json({ message: 'Username is required' });
      }
  
      // Find the user by username
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        console.log('Username does not exist');
        return res.status(400).json({ message: 'Username does not exist' });
      }
  
      // Get the user's name
      const { name } = existingUser;
  
      console.log('Sending email to:', username, 'with name:', name);
      
      // Call the sendEmail function and pass the username and name
      await sendforgotEmail(username, name);
  
      // Respond with a success message
      res.status(200).json({
        status: 200,
        message: 'Username printed to console and email sent',
        username,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  // Function to reset password 
  const resetPassword = async (req, res) => {
    try {
      const { password, username } = req.body;
  
      console.log('Received username:', username);
      console.log('Received password:', password);
  
      // Check if both fields are provided
      if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: 'Username and password are required' });
      }
  
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        console.log('Username does not exist');
        return res.status(400).json({ message: 'Username does not exist' });
      }
  
   
      existingUser.password = password; // Just assign the new password, the hashing will be handled by the middleware
      await existingUser.save();
      console.log('Password updated successfully:', existingUser);
  
      return res.status(200).json({
        status: 200,
        message: 'Password updated successfully',
        user: {
          username: existingUser.username,
          name: existingUser.name,
        }
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  


module.exports = { loginUser, verifyToken , registerUser,createuserandPassword ,forgotPassword,resetPassword, verifyMainToken };