const PostCollection = require('../models/PostCollection');  // Import the PostCollection model
const User = require('../models/user');  // Import the User model
const  ReportCollection  = require('../models/report');  // Import the function to get postIds
const Profile = require('../models/Profile');  // Import the Profile model




// Function to fetch all reports
const viewReports = async (req, res) => {
    try {
        console.log("Fetching all reports...");
        
        // Fetch all reports from the collection
        const reports = await ReportCollection.find({});  // Empty filter to get all reports

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No reports found' });
        }

        // Send the fetched reports as response
        return res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ message: 'Server error while fetching reports' });
    }
};


const viewUsers = async (req, res) => {
    try {
      // Fetch all users
      const users = await User.find({});
  
      // Fetch all profiles
      const profiles = await Profile.find();
  
      // Create a map of profiles by userId
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.userId.toString()] = profile;
        return acc;
      }, {});
  
      // Map over users and replace the name with profile name if available
      const usersWithProfiles = users.map((user) => {
        // Check if there is a profile for this user
        const profile = profileMap[user._id.toString()] || null;
  
        return {
          ...user.toObject(), // Spread the user data
          name: profile ? profile.name : user.name // If profile exists, use profile name; otherwise, use user name
        };
      });
  
      return res.status(200).json(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching users with profiles:', error);
      return res.status(500).json({ message: 'Error fetching users with profiles' });
    }
  };
  
  

module.exports = { viewReports,viewUsers };
