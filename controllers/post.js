const PostCollection = require('../models/PostCollection');  // Import the PostCollection model
const User = require('../models/user');  // Import the User model

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
  


  
module.exports = { getPostIdsByEmail ,insertPostIdByEmail};
