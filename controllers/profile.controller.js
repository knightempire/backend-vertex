const moment = require('moment-timezone');

const User = require('../models/user'); 
const Profile = require('../models/Profile');

const userprofile = async (req, res) => {
    try {
      console.log("Fetching user profile");
      console.log("Request body:", req.body);
  
      const { email } = req.body;
  
      if (!email) {
        console.log('Missing email');
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Step 1: Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Step 2: Try finding the profile by userId
      const profile = await Profile.findOne({ userId: user._id });
  
      // Step 3: Merge user + profile data
      const mergedProfile = {
        name: profile?.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        phone: profile?.phone || '', // Fallback if profile is null
        bio: profile?.bio || '', // Fallback if profile is null
        jobTitle: profile?.jobTitle || '', // Fallback if profile is null
        location: profile?.location || '', // Fallback if profile is null
        skills: profile?.skills || [], // Fallback if profile is null
        experience: profile?.experience || [], // Fallback if profile is null
        education: profile?.education || [], // Fallback if profile is null
        profilePicture: profile?.profilePicture || '', // Fallback if profile is null
        updatedAt: profile?.updatedAt || user.updatedAt, // Fallback if profile is null
      };
  
      res.status(200).json({
        status: 200,
        message: 'User profile fetched successfully',
        profile: mergedProfile,
      });
  
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


  const updateProfile = async (req, res) => {
    try {
        console.log("Updating user profile");
        console.log("Request body:", req.body);

        const { email, name, phone, bio, jobTitle, location, skills, experience, education, profilePicture } = req.body;

        if (!email) {
            console.log('Missing email');
            return res.status(400).json({ message: 'Email is required' });
        }

        // Step 1: Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Step 2: Update the user’s name and other details in the User model
        user.name = name || user.name; // Only update if name is provided, otherwise keep the existing one
        user.updatedAt = moment().tz('Asia/Kolkata').toDate(); // Update the `updatedAt` field

        // Save updated user data
        await user.save();

        // Step 3: Update the profile (if profile exists)
        let profile = await Profile.findOne({ userId: user._id });

        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        // Update profile details
        profile.phone = phone || profile.phone;
        profile.bio = bio || profile.bio;
        profile.jobTitle = jobTitle || profile.jobTitle;
        profile.location = location || profile.location;
        profile.skills = skills || profile.skills;
        profile.experience = experience || profile.experience;
        profile.education = education || profile.education;
        profile.profilePicture = profilePicture || profile.profilePicture;

        // Save updated profile data
        await profile.save();

        res.status(200).json({
            status: 200,
            message: 'User profile updated successfully',
            profile: { ...user.toObject(), ...profile.toObject() }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getLoginDates = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Step 1: Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Step 2: Return the loginDates, loginScores, and streak associated with that user
      res.status(200).json({
        message: 'Login data fetched successfully',
        loginDates: user.loginDates,   // Send the loginDates from the User model
        loginScores: user.loginScores, // Send the loginScores from the User model
        streak: user.streak,           // Send the streak from the User model
      });
  
    } catch (error) {
      console.error('Error fetching login data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  


module.exports = { userprofile ,updateProfile, getLoginDates};
