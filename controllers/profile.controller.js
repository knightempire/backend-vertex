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
  
      // Step 1: Find the user by email and use .lean() to get a plain JavaScript object
      const user = await User.findOne({ email }).lean(); // Use lean to get a plain object
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Step 2: Log and send back activeTime as a proper array
      console.log('Raw activeTime:', user.activeTime); // This should now log an actual array
  
      // Step 3: Return the loginDates, loginScores, streak, and activeTime
      res.status(200).json({
        message: 'Login data fetched successfully',
        loginDates: user.loginDates,
        loginScores: user.loginScores,
        streak: user.streak,
        activeTime: user.activeTime, // This will be an array now
      });
  
    } catch (error) {
      console.error('Error fetching login data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const addActiveTime = async (req, res) => {
    try {
      console.log("Adding active time");
      console.log("Request body:", req.body);
      const { email, activityTime } = req.body;
  
      if (!email || activityTime === undefined) {
        return res.status(400).json({ message: 'Email and activity time are required' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(201).json({ message: 'Profile not found, skipping.' });
      }
  
      const now = moment().tz('Asia/Kolkata');
      const dayOfWeek = now.day();
  
      const activeTime = [...user.activeTime];
  
      if (activeTime[dayOfWeek] !== undefined) {
        activeTime[dayOfWeek] += activityTime;
      } else {
        activeTime[dayOfWeek] = activityTime;
      }
  
      user.activeTime = activeTime;
      await user.save();
  
      res.status(200).json({
        message: 'Activity time updated successfully',
        activeTime: user.activeTime,
      });
  
    } catch (error) {
      console.error('Error adding active time:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  
  
  const getUsersWithProfile = async (req, res) => {
    try {
      console.log("Fetching users with profile data");
  
      // Step 1: Fetch all profiles with only the 'name' and 'userId' fields
      const profiles = await Profile.find().select('name email userId'); // Select 'name', 'email', and 'userId'
  
      if (!profiles || profiles.length === 0) {
        return res.status(404).json({ message: 'No profiles found' });
      }
  
      // Step 2: Prepare the list of users with their profile data (name, email)
      const usersWithProfile = [];
  
      for (let profile of profiles) {
        // Assuming 'profile.userId' contains the reference to the User model
        const user = await User.findById(profile.userId).select('email'); // Fetch only email from User collection
  
        if (user) {
          // Add the user's email and profile name to the result
          usersWithProfile.push({
            name: profile.name,   // Profile name
            email: profile.email, // Profile email (since it is stored in the Profile schema now)
          });
        }
      }
  
      // Step 3: Send the list of users with their profile data
      res.status(200).json({
        message: 'Users with profile data fetched successfully',
        users: usersWithProfile,  // Send the list of users with their profile name and email
      });
    } catch (error) {
      console.error('Error fetching users with profile data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  

module.exports = { userprofile ,updateProfile, getLoginDates,addActiveTime,getUsersWithProfile};
