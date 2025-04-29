const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { createToken } = require('../middleware/auth/tokencreation');

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
    let username = email.split('@')[0]; // Username from email's local part

    // Ensure username is not null or empty
    if (!username) {
      // Generate a fallback username
      username = `user_${googleId}`;
    }

    const name = profile?.displayName || username ;
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
        if (error.code === 11000) { 
          console.error('Duplicate username error, trying with a new username');
          username = `user_${uuidv4()}`; 

     
          user.username = username;
          console.log("Retrying with new username:", username);

   
          await user.save(); 
        } else {
          throw error; 
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
