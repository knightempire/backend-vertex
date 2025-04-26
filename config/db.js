// db/db.js
require('dotenv').config(); 
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let db;

const connectToDb = async () => {
  try {
    // Connect to MongoDB with Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    });
    console.log('Connected to MongoDB with Mongoose');
    db = mongoose.connection;  // Access the connection directly
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = { connectToDb, getDb };