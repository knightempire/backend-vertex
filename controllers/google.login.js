const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { createToken } = require('../middleware/auth/tokencreation');
const moment = require('moment-timezone'); // Import moment to handle timezone

const googleLogin = async (req, res) => {
  console.log('➡️ Google callback triggered');
  try {
    const profile = req.user;
    const email = profile?.email;
    const googleId = profile?.id;

    console.log('🔍 User Profile:', profile);
    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    let username = email.split('@')[0];

    // Ensure username is not null or empty
    if (!username) {
      username = `user_${googleId}`;
    }

    const name = profile?.displayName || username;
    console.log("Generated username:", username);

    let isNewUser = false; // Flag to indicate if the user is newly created

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        username,
        password: uuidv4(),
      });

      try {
        await user.save();
        isNewUser = true; // User was newly created
      } catch (error) {
        if (error.code === 11000) {
          console.error('Duplicate username error, trying with a new username');
          username = `user_${uuidv4()}`;
          user.username = username;
          console.log("Retrying with new username:", username);

          await user.save();
          isNewUser = true; // User was newly created with new username
        } else {
          throw error;
        }
      }
    } else {
      console.log("User found:", user);
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

    // Create the token, including userId and isNewUser flag in the payload
    const userPayload = {
      userId: user._id,   // Include userId here
      name: user.name,
      email: user.email,
      username: user.username,
      isNewUser: isNewUser, // Include isNewUser flag
    };
    const token = await createToken(userPayload);

    // Redirect to frontend with token
    res.redirect(`${process.env.STATIC_URL}/login?token=${token}`);
  } catch (err) {
    console.error('Error in googleLogin:', err);
    res.redirect(`${process.env.STATIC_URL}/login?error=auth_failed`);
  }
};

module.exports = googleLogin;
