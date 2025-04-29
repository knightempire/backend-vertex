const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { createToken } = require('../middleware/auth/tokencreation');

const googleLogin = async (req, res) => {
  console.log('➡️ Google callback triggered');
  try {
    const profile = req.user;
    const email = profile?.email;
    const name = profile?.displayName || 'Default Name';
    const googleId = profile?.id;

    console.log('🔍 User Profile:', profile);
    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    let username = email.split('@')[0]; // Username from email's local part

    // Ensure username is not null or empty
    if (!username) {
      // Generate a fallback username
      username = `user_${googleId}`;
    }

    console.log("Generated username:", username);

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        username, // Use the generated or parsed username
        password: uuidv4(), // random UUID as placeholder
      });

      try {
        await user.save();
      } catch (error) {
        if (error.code === 11000) { // MongoDB Duplicate Key Error
          console.error('Duplicate username error, trying with a new username');
          username = `user_${uuidv4()}`; // Generate a new username if there's a conflict

          // Ensure that the user object is updated with the new username
          user.username = username;
          console.log("Retrying with new username:", username);

          // Retry saving the user with the new username
          await user.save(); // Retry saving with the new username
        } else {
          throw error; // Rethrow the error if it's something else
        }
      }
    } else {
      console.log("User found:", user);
    }

    const token = await createToken(user.toObject());

    // Redirect to frontend with token
    res.redirect(`${process.env.STATIC_URL}/login?token=${token}`);
  } catch (err) {
    console.error('Error in googleLogin:', err);
    res.redirect(`${process.env.STATIC_URL}/login?error=auth_failed`);
  }
};

module.exports = googleLogin;
