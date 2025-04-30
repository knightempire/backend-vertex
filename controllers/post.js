const PostCollection = require('../models/PostCollection');  // Import the PostCollection model
const User = require('../models/user');  // Import the User model
const  ReportCollection  = require('../models/report');  // Import the function to get postIds

// Function to insert or remove postId for a user identified by their email
const insertPostIdByEmail = async (req, res) => {
    console.log("Inserting or removing post ID for user");
    console.log("Request body:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }

    const { postId, email } = req.body;  // Destructure email and postId from request body

    console.log("Email:", email);
    console.log("Post ID:", postId);
    
    if (!email || !postId) {
        return res.status(400).json({ message: 'Email and postId are required' });
    }
  
    try {
        // Find if a document already exists for the user by email
        const existingPostCollection = await PostCollection.findOne({ email });

        if (existingPostCollection) {
            // If the user already has a record
            if (existingPostCollection.postIds.includes(postId)) {
                // If postId exists, remove it from the array
                existingPostCollection.postIds = existingPostCollection.postIds.filter(id => id !== postId);
                await existingPostCollection.save();  // Save the updated document
                return res.status(200).json({
                    message: 'Post ID removed successfully from existing user',
                    postCollection: existingPostCollection,
                });
            } else {
                // If postId doesn't exist, add it to the array
                existingPostCollection.postIds.push(postId);
                await existingPostCollection.save();  // Save the updated document
                return res.status(200).json({
                    message: 'Post ID added successfully to existing user',
                    postCollection: existingPostCollection,
                });
            }
        } else {
            // If the user doesn't exist, create a new record
            const newPostCollection = new PostCollection({
                email,
                postIds: [postId],  // Initialize with the provided postId
            });

            await newPostCollection.save();  // Save the new document
            return res.status(201).json({
                message: 'Post ID inserted successfully for new user',
                postCollection: newPostCollection,
            });
        }
    } catch (error) {
        console.error('Error inserting/removing post ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Function to get postIds for a user identified by their email
const getPostIdsByEmail = async (req, res) => {
    console.log("Fetching post IDs for user");
    console.log("Request body:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }

    const { email } = req.body;  // Destructure email from request body

    console.log("Email:", email);
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
        // Find the PostCollection document by email
        const postCollection = await PostCollection.findOne({ email });

        if (postCollection) {
            // If the user has a record, return the postIds
            return res.status(200).json({
                message: 'Post IDs fetched successfully',
                postIds: postCollection.postIds,
            });
        } else {
            // If no document is found for that email
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching post IDs:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
  


  
const insertReportByEmail = async (req, res) => {
    console.log("Inserting or ignoring report for user");
    console.log("Request body:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }

    const { postId, email, reportType } = req.body;  // Destructure email, postId, and reportType from request body

    console.log("Email:", email);
    console.log("Post ID:", postId);
    console.log("Report Type:", reportType);

    if (!email || !postId || !reportType) {
        return res.status(400).json({ message: 'Email, postId, and reportType are required' });
    }

    try {
        // Find if a report collection already exists for the user by email
        const existingReportCollection = await ReportCollection.findOne({ email });

        if (existingReportCollection) {
            // If the user already has a report record
            if (existingReportCollection.reportedPostIds.includes(postId)) {
                // If the postId already exists in the report list, check the report type
                const index = existingReportCollection.reportedPostIds.indexOf(postId);
                if (existingReportCollection.reportTypes[index] === reportType) {
                    // If the report type is the same, ignore it (no need to update or add it again)
                    return res.status(200).json({
                        message: 'This post has already been reported with this report type',
                        reportCollection: existingReportCollection,
                    });
                }
            }

            // If postId doesn't exist in the reported list or report type is different, add it with the reportType
            if (!existingReportCollection.reportedPostIds.includes(postId) || existingReportCollection.reportTypes[existingReportCollection.reportedPostIds.indexOf(postId)] !== reportType) {
                existingReportCollection.reportedPostIds.push(postId);
                existingReportCollection.reportTypes.push(reportType);
                await existingReportCollection.save();  // Save the updated document
                return res.status(200).json({
                    message: 'Post ID and report type added successfully to report list for existing user',
                    reportCollection: existingReportCollection,
                });
            }
        } else {
            // If the user doesn't exist, create a new report record with reportType
            const newReportCollection = new ReportCollection({
                email,
                reportedPostIds: [postId],  // Initialize with the provided postId
                reportTypes: [reportType],   // Initialize with the provided reportType
            });

            await newReportCollection.save();  // Save the new document
            return res.status(201).json({
                message: 'Post ID and report type inserted successfully into report list for new user',
                reportCollection: newReportCollection,
            });
        }
    } catch (error) {
        console.error('Error inserting/removing report:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = { getPostIdsByEmail ,insertPostIdByEmail,insertReportByEmail};
