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
    // Fetch all profiles
    const profiles = await Profile.find().lean(); // Only fetching profiles now
    
    // Return profiles as the response
    return res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ message: 'Error fetching profiles' });
  }
};



const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params; // Get profileId from URL params
    
    // Fetch profile by its unique ID
    const profile = await Profile.findById(profileId).lean();
    
    // Check if profile exists
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Return the profile data as response
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    return res.status(500).json({ message: 'Error fetching profile by ID' });
  }
};


  

module.exports = { viewReports,viewUsers ,getProfileById };
