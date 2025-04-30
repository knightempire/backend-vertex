const PostCollection = require('../models/PostCollection');  // Import the PostCollection model
const User = require('../models/user');  // Import the User model
const  ReportCollection  = require('../models/report');  // Import the function to get postIds





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
        console.log("Fetching all users...");
        
        // Fetch all users from the collection
        const users = await User.find({});  // Empty filter to get all users

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Send the fetched users as a response
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: 'Server error while fetching users' });
    }
};

module.exports = { viewReports,viewUsers };
